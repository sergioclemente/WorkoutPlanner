import {SportType, ObjectFactory, UserProfile, Duration, DistanceUnit, Intensity, ArrayInterval, RepeatInterval, StepBuildInterval, Interval, SimpleInterval, DurationUnit, DurationUnitHelper, IntensityUnitHelper, IntensityUnit, RampBuildInterval, CommentInterval, stringFormat, MyMath, TimeUnitHelper, TimeUnit, PreconditionsCheck, FormatterHelper} from './core';
import {UnparserVisitor, NPVisitor, FTP, VisitorHelper, ZonesVisitor, AbsoluteTimeInterval, AbsoluteTimeIntervalVisitor, WorkoutTextVisitor, MRCCourseDataVisitor, ZwiftDataVisitor, PPSMRXCourseDataVisitor} from './visitor';

module Model {
	var zlib = require('zlib');

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
									(intensities.length == repeatInterval.getRepeatCount()
										|| (DurationUnitHelper.areDurationUnitsSame(durationUnits) && durationValues.length == repeatInterval.getRepeatCount()))) {
									// OK this should not be a RepeatInterval, it should be
									// a StepBuildInterval instead

									// Remove the ArrayInterval from the top and from the parent
									stack.pop();
									stack[stack.length - 1].getIntervals().pop();

									// add the new intervals
									var step_intervals = [];
									for (let k = 0; k < repeatInterval.getRepeatCount(); k++) {
										var durationUnit: DurationUnit = k < durationUnits.length ? durationUnits[k] : durationUnits[0];
										var durationValue: number = k < durationValues.length ? durationValues[k] : durationValues[0];
										var intensity: Intensity = k < intensities.length ? intensities[k] : intensities[0];
										var step_duration: Duration = factory.createDuration(intensity, durationUnit, durationValue);
										step_intervals.push(new SimpleInterval(title.trim(), intensity, step_duration, Duration.ZeroDuration));
									}

									var bsi = new StepBuildInterval(title.trim(), step_intervals);

									// put back to the parent and top of the stack
									stack[stack.length - 1].getIntervals().push(bsi);
									stack.push(bsi);
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

							stack[stack.length - 1].getIntervals().push(interval);
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

	// TSS = [(s x NP x IF) / (FTP x 3600)] x 100
	// TSS = [(s x NP x IF) / (FTP x 36)]
	// IF = AVG_POWER / FTP
	// TSS = [s x NP x (AVG_POWER / FTP)] / (FTP x 36)
	// TSS = [(s x NP x AVG_POWER) / FTP] / (FTP x 36)
	// TSS = (s x NP x AVG_POWER) / (36 * FTP^2)
	// 
	// 
	export class TSSCalculator {
		static compute(interval: Interval): number {
			let np = new NPVisitor();
			VisitorHelper.visitAndFinalize(np, interval);
			let avg = interval.getIntensity().getValue() * FTP;
			let s = interval.getTotalDuration().getSeconds();
			return MyMath.round10((s * np.getIF() * FTP * avg) / (36 * FTP * FTP), -1);
		}
	}

	export class DateHelper {
		public static getDayOfWeek(): string {
			var d = new Date();
			var weekday = new Array(7);
			weekday[0] = "Sunday";
			weekday[1] = "Monday";
			weekday[2] = "Tuesday";
			weekday[3] = "Wednesday";
			weekday[4] = "Thursday";
			weekday[5] = "Friday";
			weekday[6] = "Saturday";

			return weekday[d.getDay()];
		}
	}

	class FileNameHelper {
		private intervals: ArrayInterval;

		constructor(intervals: ArrayInterval) {
			this.intervals = intervals;
		}

		getTimeInZones(sportType: SportType) {
			var zv = new ZonesVisitor(sportType);
			VisitorHelper.visitAndFinalize(zv, this.intervals);
			return zv.getTimeInZones();
		}

		getFileName(): string {
			var mainInterval = null;
			var duration = this.intervals.getTotalDuration().getSeconds();

			var intensity_string = DateHelper.getDayOfWeek() + " - IF" + Math.round(this.intervals.getIntensity().getValue() * 100) + " - ";

			this.intervals.getIntervals().forEach(function (interval) {
				if (interval.getTotalDuration().getSeconds() > duration / 2) {
					mainInterval = interval;
				}
			});

			if (mainInterval != null) {
				var filename = intensity_string + WorkoutTextVisitor.getIntervalTitle(mainInterval);

				// Avoid really long filenames since its not very helpful
				if (filename.length < 50) {
					return filename;
				}
			}

			// TODO: do something here if the main set its too big. Some ideas:
			// 1) Long Ride

			var timeInZones = this.getTimeInZones(SportType.Bike);

			var zoneMaxTime = 0;
			var zoneMaxName = -1;
			for (var id in timeInZones) {
				var zone = timeInZones[id];
				var zoneDuration = zone.duration.getSeconds();
				if (zoneDuration > zoneMaxTime) {
					zoneMaxTime = zoneDuration;
					zoneMaxName = zone.name;
				}
			}

			if (zoneMaxTime != 0) {
				var duration_hr = Math.round(TimeUnitHelper.convertTo(duration, TimeUnit.Seconds, TimeUnit.Hours));
				return intensity_string + duration_hr + "hour-" + zoneMaxName;
			} else {
				return intensity_string;
			}
		}
	}

	class WorkoutFileGenerator {
		private workoutTitle: string;
		private intervals: ArrayInterval;

		constructor(workoutTitle: string, intervals: ArrayInterval) {
			this.workoutTitle = workoutTitle;
			this.intervals = intervals;
		}

		getMRCFile(): string {
			var dataVisitor = new MRCCourseDataVisitor(this.getMRCFileName());
			VisitorHelper.visitAndFinalize(dataVisitor, this.intervals);
			return dataVisitor.getContent();
		}

		getZWOFile(): string {
			var zwift = new ZwiftDataVisitor(this.getBaseFileName());
			VisitorHelper.visitAndFinalize(zwift, this.intervals);
			return zwift.getContent();
		}

		getPPSMRXFile(): string {
			var zwift = new PPSMRXCourseDataVisitor(this.getBaseFileName());
			VisitorHelper.visitAndFinalize(zwift, this.intervals);
			return zwift.getContent();
		}

		getZWOFileName(): string {
			return this.getBaseFileName() + ".zwo";
		}

		getMRCFileName(): string {
			return this.getBaseFileName() + ".mrc";
		}

		getPPSMRXFileName(): string {
			return this.getBaseFileName() + ".ppsmrx";
		}

		getBaseFileName(): string {
			if (typeof (this.workoutTitle) != 'undefined' && this.workoutTitle.length != 0) {
				return this.workoutTitle;
			}
			var fileNameHelper = new FileNameHelper(this.intervals);
			return fileNameHelper.getFileName();
		}
	}

	export class WorkoutBuilder {
		private userProfile: UserProfile;
		private sportType: SportType;
		private outputUnit: IntensityUnit;
		private intervals: ArrayInterval;
		private workoutDefinition: string;
		private workoutTitle: string;

		constructor(userProfile: UserProfile, sportType: SportType, outputUnit: IntensityUnit) {
			PreconditionsCheck.assertIsNumber(sportType, "sportType");
			PreconditionsCheck.assertIsNumber(outputUnit, "outputUnit");

			this.userProfile = userProfile;
			this.sportType = sportType;
			this.outputUnit = outputUnit;
		}

		getInterval(): ArrayInterval {
			return this.intervals;
		}

		getSportType(): SportType {
			return this.sportType;
		}

		getWorkoutTitle(): string {
			return this.workoutTitle;
		}

		getNormalizedWorkoutDefinition(): string {
			let object_factory = new ObjectFactory(this.userProfile, this.sportType);
			return IntervalParser.normalize(object_factory, this.workoutDefinition);
		}

		withDefinition(workoutTitle: string, workoutDefinition: string): WorkoutBuilder {
			let object_factory = new ObjectFactory(this.userProfile, this.sportType);
			this.intervals = IntervalParser.parse(
				object_factory,
				workoutDefinition
			);
			this.workoutTitle = workoutTitle;
			this.workoutDefinition = workoutDefinition;
			return this;
		}

		getIntensityFriendly(intensity: Intensity, roundValues: boolean) {
			var f = new WorkoutTextVisitor(this.userProfile, this.sportType, this.outputUnit, roundValues);
			return f.getIntensityPretty(intensity);
		}

		getTSS2(): number {
			return TSSCalculator.compute(this.intervals);
		}

		getTimePretty(): string {
			return this.intervals.getTotalDuration().toTimeStringLong();
		}

		getIF(): number {
			return MyMath.round10(this.intervals.getIntensity().getValue() * 100, -1);
		}

		getAveragePower(): number {
			return MyMath.round10(this.userProfile.getBikeFTP() * this.intervals.getIntensity().getValue(), -1);
		}

		getIntervalPretty(interval: Interval, roundValues: boolean) {
			return WorkoutTextVisitor.getIntervalTitle(interval, this.userProfile, this.sportType, this.outputUnit, roundValues);
		}

		getEstimatedDistancePretty(): string {
			if (this.sportType == SportType.Swim) {
				return this.intervals.getWorkDuration().toStringDistance(DistanceUnit.Yards);
			} else {
				return this.intervals.getWorkDuration().toStringDistance(DistanceUnit.Miles);
			}
		}

		getAveragePace(): string {
			var minMi = this.userProfile.getPaceMinMi(this.intervals.getIntensity());
			let outputUnit = this.outputUnit;
			if (outputUnit == IntensityUnit.HeartRate) {
				outputUnit = IntensityUnit.MinMi;
			}
			var outputValue = IntensityUnitHelper.convertTo(minMi, IntensityUnit.MinMi, outputUnit);
			if (outputUnit == IntensityUnit.Kmh || outputUnit == IntensityUnit.Mph) {
				return MyMath.round10(outputValue, -1) + IntensityUnitHelper.toString(outputUnit);
			} else {
				return FormatterHelper.formatNumber(outputValue, 60, ":", IntensityUnitHelper.toString(outputUnit));
			}
		}

		getStepsList(new_line: string): string {
			var result = "";

			this.intervals.getIntervals().forEach(function (interval: Interval) {
				result += ("* " + this.getIntervalPretty(interval) + new_line);
			}.bind(this));

			return result;
		}

		getDistanceInMiles(): number {
			var result = 0;

			this.intervals.getIntervals().forEach(function (interval) {
				if (interval.getWorkDuration().getDistanceInMiles() > 0) {
					result += interval.getWorkDuration().getDistanceInMiles();
				}
			}.bind(this));

			return result;
		}

		getPrettyPrint(new_line: string = "\n"): string {
			let workout_text = this.getStepsList(new_line);

			var result = workout_text;
			result += new_line;
			result += new_line;
			result += "web+wp://";
			result += zlib.deflateSync(this.workoutDefinition).toString('base64');

			return result
		}

		getMRCFile(): string {
			let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
			return wfg.getMRCFile();
		}

		getZWOFile(): string {
			let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
			return wfg.getZWOFile();
		}

		getPPSMRXFile(): string {
			let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
			return wfg.getPPSMRXFile();
		}

		getZWOFileName(): string {
			let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
			return wfg.getZWOFileName();
		}
		getMRCFileName(): string {
			let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
			return wfg.getMRCFileName();
		}

		getPPSMRXFileName(): string {
			let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
			return wfg.getPPSMRXFileName();
		}
	};

	export class StopWatch {
		startTimeMillis: number;
		stoppedDurationMillis: number;

		constructor() {
			this.startTimeMillis = null;
			this.stoppedDurationMillis = null;
		}
		start(): void {
			if (this.startTimeMillis === null) {
				this.startTimeMillis = Date.now();
			}
		}
		stop(): void {
			if (this.startTimeMillis !== null) {
				this.stoppedDurationMillis += Date.now() - this.startTimeMillis;
				this.startTimeMillis = null;
			}
		}
		reset(): void {
			this.startTimeMillis = null;
			this.stoppedDurationMillis = 0;
		}
		getIsStarted(): boolean {
			return this.startTimeMillis !== null;
		}
		getElapsedTimeMillis(): number {
			if (this.startTimeMillis !== null) {
				return (Date.now() - this.startTimeMillis) + this.stoppedDurationMillis;
			} else {
				return this.stoppedDurationMillis;
			}
		}
		// Moves the start time so that durationMillis will be 
		// the result of getElapsedTimeMillis.
		moveStartTime(durationMillis: number) {
			if (this.startTimeMillis != null) {
				// now() - start = durationMillis
				// start = now() - durationMillis
				this.startTimeMillis = Date.now() - durationMillis;
			} else {
				// Change stopped so that when we start again
				// elapsed == durationMillis.
				this.stoppedDurationMillis = durationMillis;
			}
		}
	}

	// PlayerHelper is the main helper used on the player.tsx view file.
	export class PlayerHelper {
		private data_: AbsoluteTimeInterval[] = [];
		private durationTotalSeconds_: number = 0;

		constructor(of: ObjectFactory, interval: Interval) {
			// Create the visitor for the AbsoluteTimeInterval.
			var pv = new AbsoluteTimeIntervalVisitor(of);

			VisitorHelper.visitAndFinalize(pv, interval);

			this.data_ = pv.getIntervalArray();
			this.durationTotalSeconds_ = interval.getTotalDuration().getSeconds();
		}

		get(ts: number): AbsoluteTimeInterval {
			// TODO: Can potentially do a binary search here.
			for (let i = 0; i < this.data_.length; i++) {
				let bei = this.data_[i];
				if (ts >= bei.getBeginSeconds() && ts <= bei.getEndSeconds()) {
					return bei;
				}
			}
			return null;
		}

		getNext(ts: number): AbsoluteTimeInterval {
			// TODO: Can potentially do a binary search here.
			for (let i = 0; i < this.data_.length; i++) {
				let bei = this.data_[i];
				if (ts >= bei.getBeginSeconds() && ts <= bei.getEndSeconds()) {
					if (i < this.data_.length - 1) {
						return this.data_[i + 1];
					}
				}
			}
			return null;
		}

		getDurationTotalSeconds(): number {
			return this.durationTotalSeconds_;
		}
	}

	enum ArgType {
		Number,
		String
	};

	// Class that processes the input like #wu and replaces with macros.
	export class TextPreprocessor {
		sport_type: SportType;

		constructor(sport_type: SportType) {
			this.sport_type = sport_type;
		}

		private _randBool(): boolean {
			return this._rand(0, 2) == 1;
		}

		// Generated a number in [min, max)
		private _rand(min: number, max: number): number {
			return Math.floor(Math.random() * (max - min) + min);
		}

		private _randElement(array: any): string {
			if (array.length > 0) {
				return array[this._rand(0, array.length)] + "\n";
			} else {
				return "";
			}
		}

		private _warmup(): string {
			let warmup_text = "";
			let warmup_groups = [];
			if (this.sport_type == SportType.Bike) {
				// Are we going to do the british warmup?
				if (this._randBool()) {
					// Yes.
					warmup_text = `(5min, *, 90rpm - Smooth pedaling)
(2min, *, 95rpm - Smooth pedaling)
(2min, *, 100rpm - Smooth pedaling)
(2min, *, 105rpm - Smooth pedaling)
(1:30min, *, 110rpm - Smooth pedaling)
(30sec, *, 120-130rpm - Maintain form)
(2min, *, 90rpm - Relax and recover)
(6sec, *, Max rev out)
(1min, *, 90rpm - Smooth pedaling)
(6sec, *, Max rev out)
(1min, *, 90rpm - Smooth pedaling)
(6sec, *, Max rev out)
(2:42min, *, 90 rpm - Relax and recover)
`;
				} else {
					// No.
					warmup_groups = [
						// 9 min (warmup)
						[
							"(3min, 55), (3min, 65), (3min, 75)",
							"(9min, 55, 70)",
							"(4min, 55), (3min, 65), (2min, 75)",
						],
						// 4 min (drill)
						[
							"2[(45s, 45, Single leg - left), (15s, 45, both), (45s, 45, Single leg - right), (15s, 45, both)]",
							"8[(15s, 55, Spin ups), (15s, 55)]",
							"[(30s, 55, cadence 80), (30s, 55), (30s, 55, Cadence 90), (30s, 55), (30s, 55, Cadence 100), (30s, 55), (30s, 55, Cadence 110), (30s, 55)]"
						],
						// 4 min (build)
						[
							"4[(15s, *, Sprints), (45s, 55)]",
							"4[(10sec, *, Max sprints), (50sec, 55, easy riding)]",
							"4[(5s, *, MAX), (55s, 55)]",
							"4[(45s, 75, 100), (15s, 55)]",
							"3[(30sec, *, FAST), (1min, 55, easy)]",
							"4[(30s, 85, 90, 95, 100), (30s, 55)]",
							"4[(15s, 100, FTP), (45s, 55)]",
						],
						// static (3min)
						["(3min, 55)"]
					];
					for (let i = 0; i < warmup_groups.length; i++) {
						warmup_text += this._randElement(warmup_groups[i]);
					}
				}
			} else if (this.sport_type == SportType.Run) {
				warmup_groups = [
					[
						"3[(10s, 0, arm swings)]",
						"3[(10s, 0, high knees)]",
						"3[(10s, 0, ham kicks)]",
						"3[(10s, 0, a-skips)]",
						"3[(10s, 0, crossover side to sides)]",
					],
					[
						"3[(10s, 0, 10 lunges - 5 each side)]",
						"3[(10s, 0, 10 reverse lunges - 5 each side)]",
						"3[(10s, 0, 10 lunges with rotation - 5 each side)]",
						"3[(10s, 0, sumo squat)]",
					]
				];
				for (let i = 0; i < warmup_groups.length; i++) {
					warmup_text += this._randElement(warmup_groups[i]);
				}
			} else if (this.sport_type == SportType.Swim) {
				warmup_groups = [
					// Free
					[
						"(300y, +10, free)",
						"(400y, +10, free)",
						"(500y, +10, free)"
					],
					// Kick
					[
						"(200y, kick, +10)",
						"(300yards, as 50 kick w/ board - 50 free)",
						"3[(100y, Butterfly on the back)]",
						"(200y, Butterfly Kick with fins on your back)",
						"6[(50, Streamline kick on left/side)]"
					],
					// Drill
					[
						"8[(50yards, Drill on first 25, free, build on second 50)]",
						"4[(50yards, Swim GOLF - Descend each one), \"10s rest\"]",
						"3[(100y, single arm freestyle right side, free, single arm freestyle left side, free)]",
						"4[(75y, unco left; swim; unco right)]",
						"4[(50yards, scull and free by 25)]",
						"(200y, +10, pull)"
					],
					// Pre-main set
					[
						// TODO: Allow probabilities or weight
						"4[(25yards, sprint)]",
						""
					],
					// Build
					[
						"8[(50y, +0, build 1-4)]",
						"6[(50yards, 100, build)]",
						"4[(50yards, Swim descend 1-4), \"10s rest\"]",
						"4[(100yards, add 25yards of hard swimming on every 100)]",
						"4[(100y, descend 1-4)]"
					]
				];
				for (let i = 0; i < warmup_groups.length; i++) {
					warmup_text += this._randElement(warmup_groups[i]);
				}
			}
			// Remove extra new line.
			console.assert(warmup_text.length > 0);
			return warmup_text.substring(0, warmup_text.length - 1);
		}

		private _single_leg(number_repeats: number, single_leg_duration_secs: number): string {
			console.assert(single_leg_duration_secs >= 0);
			console.assert(single_leg_duration_secs <= 90);
			return number_repeats + "[(" + single_leg_duration_secs + "s,45,Left Leg), (15s,45,Both), (" + single_leg_duration_secs + "s,45,Right Leg), (15s,45,Both)]"
		}

		private _open_intervals(number_repeats: number, work_duration_sec: number): string {
			console.assert(work_duration_sec >= 0);
			console.assert(work_duration_sec <= 60);
			let title = work_duration_sec <= 10 ? "Max efforts" : "Build";
			let rest_duration_sec = work_duration_sec <= 30 ? 60 - work_duration_sec : work_duration_sec;
			return number_repeats + "[(" + work_duration_sec + "s,*," + title + "), (" + rest_duration_sec + "s,55,Relaxed)]"
		}

		private _change_dd(dd_door: number) {
			return stringFormat("(10s, Change to DD{0})", dd_door)
		}

		private _alternate_arm_pull(duration: string) {
			return stringFormat("({0}, Alternate arm pull)", duration)
		}

		private _double_arm_pull(duration: string) {
			return stringFormat("({0}, Double arm pull)", duration)
		}

		private _back_pull(duration: string) {
			return stringFormat("({0}, Back pull)", duration)
		}

		processOne(input: string): string {
			let funcs = [
				{ regex: /#wu/, callback: this._warmup, params: [], description: "Warm up" },
				{ regex: /#sl\((\d*),(\d*)\)/, callback: this._single_leg, params: [ArgType.Number, ArgType.Number], description: "Single Leg Drills." },
				{ regex: /#o\((\d*),(\d*)\)/, callback: this._open_intervals, params: [ArgType.Number, ArgType.Number], description: "Open Power Intervals." },
				// Vasa swim shortcut
				{ regex: /#dd(\d+)/, callback: this._change_dd, params: [ArgType.Number], description: "Change DD configuration." },
				{ regex: /#alt(\d+\w+)/, callback: this._alternate_arm_pull, params: [ArgType.String], description: "Alternate arm pull." },
				{ regex: /#dbl(\d+\w+)/, callback: this._double_arm_pull, params: [ArgType.String], description: "Double arm pull." },
				{ regex: /#back(\d+\w+)/, callback: this._back_pull, params: [ArgType.String], description: "Back pull." },
			];

			for (let i = 0; i < funcs.length; i++) {
				let regex = funcs[i].regex;
				// Try seeing if this function matches the input.
				if (regex.test(input)) {
					var instance_params = input.match(regex);
					// Parse all parameters from the regex.
					var func_params = [];
					if (instance_params.length - 1 != funcs[i].params.length) {
						console.assert("Function call " + input + " is not matching definition.");
					}
					for (let j = 1; j < instance_params.length; j++) {
						let instance_param = instance_params[j];
						if (funcs[i].params[j - 1] == ArgType.Number) {
							func_params.push(parseInt(instance_param));
						} else {
							func_params.push(instance_param);
						}
					}
					return funcs[i].callback.apply(this, func_params);
				} else {
					//console.log("regex " + regex + " failed to match " + input);
				}
			}
			return input;
		}

		process(input: string): string {
			// First filter the main two regexes that will cover
			// macros with paramters like: #sl(4,45) and parameterless 
			// like #wu. 
			let main_regexes = [/(#\w+\(\d*(?:,\d*)*\)())/, /(#\w+)/];
			for (let i = 0; i < main_regexes.length; i++) {
				input = input.replace(new RegExp(main_regexes[i], "g"), this.processOne.bind(this));
			}
			return input;
		}
	}
}

export = Model;