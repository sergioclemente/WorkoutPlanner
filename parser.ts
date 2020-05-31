import { ObjectFactory } from "./user";
import { ArrayInterval, DurationUnitHelper, Intensity, DurationUnit, Interval, IntensityUnit, IntensityUnitHelper, RepeatInterval, SimpleInterval, Duration, RampBuildInterval, CommentInterval } from "./core";
import { UnparserVisitor, VisitorHelper } from "./visitor";

export interface Parser {
	// Returns the last valid char.
	// On success: Returns a position higher than |pos|.
	evaluate(input: string, pos: number): number;
}

// TODO: Refactor this to accept time as well.
// For example:
// "10" => 10
// 10:30 => 10.5
// "10.5" => 10.5
export class NumberParser implements Parser {
	private value: number;

	evaluate(input: string, i: number): number {
		this.value = 0;

		for (; i < input.length; i++) {
			var ch = input[i];
			if (IntervalParser.isDigit(ch)) {
				this.value = this.value * 10 + IntervalParser.getCharVal(ch) - IntervalParser.getCharVal("0");
			} else if (ch == ".") {
				i++;
				var base = 10;
				for (; i < input.length; i++) {
					var ch = input[i];
					if (IntervalParser.isDigit(ch)) {
						this.value = this.value + (IntervalParser.getCharVal(ch) - IntervalParser.getCharVal("0")) / base;
						base = base * 10;
					} else {
						break;
					}
				}
				break;
			} else {
				break;
			}
		}
		// Points to the last valid char
		return i - 1;
	}
	getValue(): number {
		return this.value;
	}
}

// Retrieves the next token from the interval.
// For example:
// (10min, 75, free)
// Can return: "10min" or "75" or "free"
export class TokenParser implements Parser {
	private value: string;
	private delimiters: string[];

	constructor(delimiters: string[]) {
		this.delimiters = delimiters;
	}

	evaluate(input: string, i: number): number {
		this.value = "";

		while (input[i] == ',' || input[i] == ' ') {
			i++;
		}

		for (; i < input.length; i++) {
			var ch = input[i];

			if (this.delimiters.indexOf(ch) != -1) {
				break;
			}
			this.value += ch;
		}

		// Points to the last valid char
		return i - 1;
	}

	getValue(): string {
		return this.value;
	}
}

// For a string like: "10min"
// It will set |value| to 10
// and unit to "min"
export class NumberAndUnitParser implements Parser {
	private value: number;
	private unit: string;

	evaluate(input: string, i: number): number {
		var num_parser = new NumberParser();
		i = num_parser.evaluate(input, i);
		this.value = num_parser.getValue();
		let original_i = i;

		// - Check for another number after the current cursor.
		// - Skip any white spaces as well
		// TODO: Move this into number parser
		// Think on how to fix this code. Right now the unparser generates
		// something like 01:30min to avoid writing 1min30sec for this hitting this bug.
		if (i + 1 < input.length && input[i + 1] == ":") {
			i = i + 2; // skip : and go to the next char
			var res_temp = IntervalParser.parseDouble(input, i);
			i = res_temp.i;
			this.value = this.value + res_temp.value / 60;

			// consume any whitespaces
			// i points to the current digit, so let's advance one
			// than reverse one
			i++;
			while (i < input.length && input[i] == ' ') {
				i++;
			}
			i--;
		}

		// - Check the unit. 
		// TODO: Find a better way to represent this or at least write an unit test to match
		// toDurationUnit().
		var unitMap = {
			"w": 1,
			"watts": 1,
			"%": 1,
			"min/mi": 1,
			"mi/hr": 1,
			"mph": 1,
			"km/hr": 1,
			"min/km": 1,
			"/25yards": 1,
			"/100yards": 1,
			"/100meters": 1,
			"/100m": 1,
			"/400meters": 1,
			"/400m": 1,
			"hr": 1,
			"heart rate": 1,
			"bpm": 1,
			"min": 1,
			"m": 1,
			"sec": 1,
			"s": 1,
			"km": 1,
			"meters": 1,
			"miles": 1,
			"yards": 1,
			"yrs": 1,
			"y": 1,
			"mi": 1,
			"": 1,
		};
		// Get the next token
		let nextToken = "";
		for (i++; i < input.length; i++) {
			if (input[i] == ',' || input[i] == ")") {
				break;
			} else {
				// Assuming here if it sees a whitespace it can bail out as its an invalid unit
				if (IntervalParser.isWhitespace(input[i])) {
					nextToken = "<<invalid>>";
					break;
				}
				nextToken += input[i];
			}
		}

		// Validate the token. We want to make sure the unit is valid otherwise
		// we might parse "2% incline" as a intensity unit for instance.

		if (unitMap[nextToken] == undefined) {
			this.value = null;
			this.unit = "";
			i = original_i;
		} else {
			this.unit = nextToken;
		}

		return i - 1;
	}

	getValue(): number {
		return this.value;
	}

	getUnit(): string {
		return this.unit;
	}
}

export class IntervalParser {
	static getCharVal(ch: string): number {
		if (ch.length == 1) {
			return ch.charCodeAt(0);
		} else {
			return 0;
		}
	}
	static isDigit(ch: string): boolean {
		return ch.length == 1 &&
			IntervalParser.getCharVal(ch) >= IntervalParser.getCharVal("0") &&
			IntervalParser.getCharVal(ch) <= IntervalParser.getCharVal("9");
	}
	static isLetter(ch: string): boolean {
		return ch.length == 1 &&
			IntervalParser.getCharVal(ch) >= IntervalParser.getCharVal("a") &&
			IntervalParser.getCharVal(ch) <= IntervalParser.getCharVal("z");
	}

	static parseDouble(input: string, i: number) {
		var p = new NumberParser();
		var pos = p.evaluate(input, i)
		return { i: pos, value: p.getValue() };
	}

	static isWhitespace(ch: string): boolean {
		return ch.length == 1 && (ch == " " || ch == "\t" || ch == "\n");
	}
	static throwParserError(column: number, msg: string): void {
		throw Error("Error while parsing input on column " + column + "-  Error: " + msg);
	}

	static parse(factory: ObjectFactory, input: string): ArrayInterval {
		var result = new ArrayInterval("Workout", []);

		var stack = [];
		stack.push(result);

		// This is a required hack in order to track the StepBuildIntervals so we can
		// interleave rest intervals in between work intervals.
		let step_build_set = new Set<ArrayInterval>();

		for (var i = 0; i < input.length; i++) {
			var ch = input[i];

			if (ch == "(") { // parse simple workout
				i++;
				var nums = {
				};
				var units = {
				};
				var title = "";
				var numIndex = 0;

				for (; i < input.length; i++) {
					ch = input[i];
					if (ch == ")") {
						var interval: Interval;
						var durationValues: number[] = [];
						var durationUnits: DurationUnit[] = [];
						var intensities: Intensity[] = [];

						// (1) Fill the intensity if not provided. Do not do any guessing
						// on the unit based on the value because its confusing.
						for (let ki = 0; ki < Object.keys(units).length; ki++) {
							let k = Object.keys(units)[ki];
							if (nums[k] >= 0 && units[k] == "") {
								units[k] = "%";
							}
						}

						// (2) Create the duration units and intensities
						for (let ki = 0; ki < Object.keys(units).length; ki++) {
							let k = Object.keys(units)[ki];
							if (DurationUnitHelper.isDurationUnit(units[k])) {
								durationUnits.push(DurationUnitHelper.toDurationUnit(units[k]));
								durationValues.push(nums[k]);
							} else {
								// Get the Intensity unit and do some minor massaging for
								// handling free intervals.
								var unit: IntensityUnit = IntensityUnitHelper.toIntensityUnit(units[k]);

								// Unit could be time, so we have to safeguard on valid
								// intensities.
								if (unit != IntensityUnit.Unknown) {
									if (unit == IntensityUnit.FreeRide) {
										intensities.push(factory.createIntensity(0.50, IntensityUnit.FreeRide));
									} else {
										intensities.push(factory.createIntensity(nums[k], unit));
									}
								}
							}
						}

						// (3) Handle repeat interval by peaking at the stack
						if (stack[stack.length - 1] instanceof RepeatInterval) {
							var repeatInterval: RepeatInterval = <RepeatInterval>(stack[stack.length - 1]);
							// There is ambiguity in the following interval:
							// 2[(45s, 75, 100), (15s, 55)]
							// It could be two types of intervals:
							// 1) 2x (Ramp from 75% to 100% with 15s rest)
							// or
							// 2) 2x (45s @ 75% and 100% w/ 15s rest)
							// Will assume the former, since the latter is less common.
							if (repeatInterval.getRepeatCount() > 1 &&
							    intensities.length > 0 && durationValues.length > 0 &&
								(intensities.length == repeatInterval.getRepeatCount() && durationValues.length == 1 ||
								  DurationUnitHelper.areDurationUnitsSame(durationUnits) && durationValues.length == repeatInterval.getRepeatCount() && intensities.length == 1)) {
								// OK this should not be a RepeatInterval, it should be
								// a StepBuildInterval instead.

								// Remove the ArrayInterval from the top and from the parent
								stack.pop();
								stack[stack.length - 1].getIntervals().pop();

								// StepBuildInterval was deprecated, so let's simply inline them
								// as it simplifies the implementation a little bit.
								// When all workouts don't depend on it we can go ahead and remove this
								// parser logic.
								let step_intervals = [];

								if (intensities.length == 1) {
									console.assert(durationValues.length == repeatInterval.getRepeatCount());
									console.assert(durationUnits.length == repeatInterval.getRepeatCount());

									for (let k = 0; k < repeatInterval.getRepeatCount(); k++) {
										var durationUnit: DurationUnit = durationUnits[k];
										var durationValue: number = durationValues[k];
										var intensity: Intensity = intensities[0];
										var step_duration: Duration = factory.createDuration(intensity, durationUnit, durationValue);
										step_intervals.push(new SimpleInterval(title.trim(), intensity, step_duration, Duration.ZeroDuration));
									}
								} else if (durationValues.length == 1) {
									console.assert(intensities.length == repeatInterval.getRepeatCount());

									for (let k = 0; k < repeatInterval.getRepeatCount(); k++) {
										var durationUnit: DurationUnit = durationUnits[0];
										var durationValue: number = durationValues[0];
										var intensity: Intensity = intensities[k];
										var step_duration: Duration = factory.createDuration(intensity, durationUnit, durationValue);
										step_intervals.push(new SimpleInterval(title.trim(), intensity, step_duration, Duration.ZeroDuration));
									}
								} else {
									console.assert(false);
								}

								// put back to the parent and top of the stack
								var bsi = new ArrayInterval(title.trim(), step_intervals);
								stack[stack.length - 1].getIntervals().push(bsi);
								stack.push(bsi);
								step_build_set.add(bsi);
								break;
							}
						}

						console.assert(durationValues.length >= 1);
						console.assert(durationUnits.length >= 1);
						let restDuration = Duration.ZeroDuration;
						let zeroIntensity = Intensity.ZeroIntensity;
						if (intensities.length == 2) {
							// Ramp build interval
							let startIntensity = intensities[0];
							let endIntensity = intensities[1]
							let intensity = RampBuildInterval.computeAverageIntensity(startIntensity, endIntensity);
							let work_duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
							let rest_duration = Duration.ZeroDuration;
							if (durationUnits.length > 1 && durationValues.length > 1) {
								rest_duration = factory.createDuration(intensity, durationUnits[1], durationValues[1]);
							}
							interval = new RampBuildInterval(title.trim(), startIntensity, endIntensity, work_duration, rest_duration);
						} else if (intensities.length == 1) {
							// Simple interval
							let intensity = intensities[0];
							let duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
							if (durationUnits.length == 2 && durationValues.length == 2) {
								restDuration = factory.createDuration(zeroIntensity, durationUnits[1], durationValues[1]);
							}
							interval = new SimpleInterval(title.trim(), intensity, duration, restDuration);
						} else {
							// Whenever there us no intensity is specified, we get
							// the default intensity. There is no rest interval with 0
							// intensity anymore.
							let intensity = Intensity.EasyIntensity;
							let duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
							if (durationUnits.length == 2 && durationValues.length == 2) {
								restDuration = factory.createDuration(zeroIntensity, durationUnits[1], durationValues[1]);
							}
							interval = new SimpleInterval(title.trim(), intensity, duration, restDuration);
						}

						let parent = <ArrayInterval>(stack[stack.length - 1]);
						if (step_build_set.has(parent)) {
							// HACK: We have to interleave the intervals
							let old_intervals = [...parent.getIntervals()];
							parent.getIntervals().length = 0;
							for (let i = 0; i < old_intervals.length; i += 1) {
								parent.getIntervals().push(old_intervals[i]);
								parent.getIntervals().push(interval);
							}
						} else {
							stack[stack.length - 1].getIntervals().push(interval);
						}
						break;
					} else if (ch == ",") {
						numIndex++;
					} else {
						var string_parser = new TokenParser([',', ')']);
						i = string_parser.evaluate(input, i);
						var value = string_parser.getValue();

						// If its a number
						if (IntervalParser.isDigit(value[0])) {
							var intensity_parser = new NumberAndUnitParser();
							intensity_parser.evaluate(value, 0);

							let unit = intensity_parser.getUnit().trim();
							let intensity_value = intensity_parser.getValue();
							// If we have a value from the intensity parser and
							// If there is not unit (implict) or the unit is known
							if (intensity_value != null &&
								(unit.length == 0 || IntensityUnitHelper.isIntensityUnit(unit) || DurationUnitHelper.isDurationUnit(unit))) {
								nums[numIndex] = intensity_value;
								units[numIndex] = unit;
							} else {
								// If we don't recognize, fallback and set as a title
								title = value;
								units[numIndex] = "";
							}
						} else if (value[0] == "+" || value[0] == "-") {
							var integer_parser = new NumberParser();
							integer_parser.evaluate(value, 1);
							nums[numIndex] = integer_parser.getValue();
							if (value[0] == "-") {
								// TODO: This has a bug where -1 would be ambiguous, maybe use
								// a bigger range like 1000 * X ?
								nums[numIndex] = -1 * nums[numIndex];
							}
							// HACK: we want to put the final unit here to avoid creating
							// imaginary units
							units[numIndex] = "offset";
						} else {
							// TODO: Use magic number for identifying free ride for now
							if (value == "*") {
								units[numIndex] = "free-ride";
							} else {
								// Set the value for the title.
								// Do not set the units[numIndex]="";
								// Its ok to have a gap on it.
								title = value;
							}
						}
					}
				}
				// end simple workout
			} else if (ch == "[") {
				var ai = new ArrayInterval("", []);
				stack[stack.length - 1].getIntervals().push(ai);
				stack.push(ai);
			} else if (ch == "]") {
				stack.pop();
			} else if (IntervalParser.isDigit(ch)) {
				var res = IntervalParser.parseDouble(input, i);
				i = res.i;
				var ri = new RepeatInterval("", null, null, res.value);
				stack[stack.length - 1].getIntervals().push(ri);
				stack.push(ri);

				// Repeat interval format is something like
				// 4[(3,90),(3,55)], so let's consume the next bracket 
				// so that it goes into the regular main flow
				while (i < input.length && input[i] != "[") {
					i++;
				}
			} else if (ch == "\"") {
				var scp = new TokenParser(["\""]);

				// it returns the last valid char, so we want to skip that and the quotes
				i = scp.evaluate(input, i + 1) + 2;
				stack[stack.length - 1].getIntervals().push(new CommentInterval(scp.getValue()));
			}
		}

		if (result.getIntervals().length == 0) {
			IntervalParser.throwParserError(0, "Invalid interval");
		}
		return result;
	}

	// Parses the string, converts into the object, then convert back into the
	// default units. For example: if the unit is in min/km it will be converted
	// to IF so that its independent of thresholds.
	static normalize(factory: ObjectFactory, input: string): string {
		let interval = IntervalParser.parse(factory, input);
		let visitor = new UnparserVisitor();
		VisitorHelper.visitAndFinalize(visitor, interval);
		return visitor.output;
	}
}