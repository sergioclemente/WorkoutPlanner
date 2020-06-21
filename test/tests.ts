import * as UI from '../ui';
import * as Core from '../core';
import * as Model from '../builder';
import * as User from '../user';
import * as PreProcessor from '../preprocessor';
import * as Parser from '../parser';
import * as Player from '../player';
import * as Visitor from '../visitor';
import {describe, it} from 'mocha';
import * as Assert from 'assert'

// Usage: 
// string_format("Parameter1: {0}, Parameter2: {1}", val1, val2)
function string_format(format, ...args) {
	return format.replace(/{(\d+)}/g, function (match, number) {
		return typeof args[number] != 'undefined'
			? args[number]
			: match
			;
	});
}

function expect_true(condition: boolean, message: string = "Expect true failed") {
	if (!condition) {
		Assert.fail(message);
	}
}

function expect_eq_str(expected: string, actual: string) {
	Assert.equal(actual, expected, string_format("\nexpected: [{0}] \nactual: [{1}]", expected, actual));
}

function expect_eq_nbr(expected: number, actual: number, error: number = 0.01) {
	var delta = Math.abs(expected - actual);
	if (delta > error) {
		expect_true(false, string_format("\nexpected: [{0}] \nactual: [{1}]", JSON.stringify(expected), JSON.stringify(actual)));
	}
}

var intensity_100_pct = new Core.Intensity(1, 1);
var up = new User.UserProfile(310, "6:00min/mi", 100, "1:25/100yards", "foo@bar.com");
up.efficiency_factor = 2;
var of_swim = new User.ObjectFactory(up, Core.SportType.Swim);
var of_bike = new User.ObjectFactory(up, Core.SportType.Bike);
var of_run = new User.ObjectFactory(up, Core.SportType.Run);
var of_other = new User.ObjectFactory(up, Core.SportType.Other);

describe('DistanceUnitHelper', function () {
	it('convert miles to kilometers', function () {
		let res = Core.DistanceUnitHelper.convertTo(1000, Core.DistanceUnit.Miles, Core.DistanceUnit.Kilometers);
		expect_eq_nbr(1609.344, res);
	});
});

describe('TimeUnitHelper', function () {
	it('convert hours to seconds', function () {
		let res = Core.TimeUnitHelper.convertTo(1, Core.TimeUnit.Hours, Core.TimeUnit.Seconds);
		expect_eq_nbr(3600, res);
	});
});

describe('Intensity', function () {
	it('IF Average', function () {
		var i90 = new Core.Intensity(0.90, 0.90);
		var i80 = new Core.Intensity(0.80, 0.80);
		let res = Core.Intensity.combine([i90, i80], [1, 1]).getValue();
		expect_eq_nbr(0.85, res);
	});
	it('hr conversion', function () {
		var hr_visitor = new Visitor.WorkoutTextVisitor(up, Core.SportType.Bike, Core.IntensityUnit.HeartRate, /*roundValues=*/false);
		expect_eq_str("155bpm", hr_visitor.getIntensityPretty(intensity_100_pct));

		var intensity_90_pct = new Core.Intensity(0.9, 0.9);
		expect_eq_str("140bpm", hr_visitor.getIntensityPretty(intensity_90_pct));

		var intensity_85_pct = new Core.Intensity(0.85, 0.85);
		expect_eq_str("132bpm", hr_visitor.getIntensityPretty(intensity_85_pct));
	});
});

describe('Other Sport Type', function () {
	it('1min @ 55%-75%', function () {
		let builder = new Model.WorkoutBuilder(up, of_other.sport_type, Core.IntensityUnit.IF)
		builder.withDefinition("title", "(1min, 55, 75)");
		
		expect_eq_nbr(0.8, Visitor.TSSCalculator.compute(builder.getInterval()));
	});
});

describe('Bugs', function () {
	it('text causes distance to become miles', function () {
		let d1 = new Core.Duration(Core.DistanceUnit.Yards, 400, 60, 0);
		let d2 = new Core.Duration(Core.TimeUnit.Seconds, 0, 0, 0);
		let cd1 = Core.Duration.combine(d1, d2);
		expect_eq_nbr(Core.DistanceUnit.Yards, cd1.getUnit());
		expect_eq_nbr(400, cd1.getValue());
		let cd2 = Core.Duration.combine(d2, d1);
		expect_eq_nbr(Core.DistanceUnit.Yards, cd2.getUnit());
		expect_eq_nbr(400, cd2.getValue());
	});
});

describe('Combine duration', function () {
	it('Combine two distances', function () {
		let dur = Core.Duration.combine(new Core.Duration(Core.DistanceUnit.Yards, 100, 0, 0), new Core.Duration(Core.DistanceUnit.Yards, 200, 0, 0));
		expect_eq_nbr(Core.DistanceUnit.Yards, dur.getUnit());
		expect_eq_nbr(300, dur.getValue());
	});
});

describe('IntervalParser', function () {
	it('Parse double', function () {
		expect_eq_nbr(123, Parser.IntervalParser.parseDouble("123", 0).value);
		expect_eq_nbr(123.456, Parser.IntervalParser.parseDouble("123.456", 0).value);
	});
});

describe('UserProfile', function () {
	it('6min/mi to other paces', function () {
		var up_6tpace = new User.UserProfile(310, "6:00min/mi", 100, "1:10/100yards", "foo@bar.com");
		expect_eq_nbr(6, up_6tpace.getRunningPaceMinMi(new Core.Intensity(1, 1)));
		expect_eq_nbr(7.05, up_6tpace.getRunningPaceMinMi(new Core.Intensity(0.85, 0.85)));
		expect_eq_nbr(8, up_6tpace.getRunningPaceMinMi(new Core.Intensity(0.75, 0.75)));
	});
});


describe('zone visitor', function () {
	it('1', function () {
		expect_eq_nbr(1, Visitor.ZonesVisitor.getZone(Core.SportType.Bike, 0.50));
	});
	it('2', function () {
		expect_eq_nbr(2, Visitor.ZonesVisitor.getZone(Core.SportType.Bike, 0.55));
	});
	it('3', function () {
		expect_eq_nbr(3, Visitor.ZonesVisitor.getZone(Core.SportType.Bike, 0.75));
	});
	it('4', function () {
		expect_eq_nbr(4, Visitor.ZonesVisitor.getZone(Core.SportType.Bike, 0.90));
	});
	it('5', function () {
		expect_eq_nbr(5, Visitor.ZonesVisitor.getZone(Core.SportType.Bike, 1.05));
	});
});

describe('UI field validator', function () {
	it('email', function () {
		expect_true(!UI.FieldValidator.validateEmail(""));
		expect_true(!UI.FieldValidator.validateEmail("invalid"));
		expect_true(!UI.FieldValidator.validateEmail("@bar.com"));
		expect_true(UI.FieldValidator.validateEmail("foo@bar.com"));
	});
	it('number', function () {
		expect_true(!UI.FieldValidator.validateNumber(""));
		expect_true(!UI.FieldValidator.validateNumber("asd123asd"));
		expect_true(UI.FieldValidator.validateNumber("123"));
	});
	it('speed mph', function () {
		expect_eq_nbr(8, Core.SpeedParser.getSpeedInMph("7:30min/mi"))
		expect_eq_nbr(8, Core.SpeedParser.getSpeedInMph("8mi/h"))
		expect_eq_nbr(8.44, Core.SpeedParser.getSpeedInMph("4:25min/km"))
		expect_eq_nbr(9.94, Core.SpeedParser.getSpeedInMph("1:30/400meters"));
	});
});

describe('Formatter', function () {
	it('number formatter', function () {
		expect_eq_str("8:00min/mi", Core.FormatterHelper.formatNumber(8, 60, ":", "min/mi", 0));
		expect_eq_str("8:00min/mi", Core.FormatterHelper.formatNumber(8, 60, ":", "min/mi", 5));

		expect_eq_str("7:30min/mi", Core.FormatterHelper.formatNumber(7.5, 60, ":", "min/mi", 0));
		expect_eq_str("7:30min/mi", Core.FormatterHelper.formatNumber(7.5, 60, ":", "min/mi", 5));

		expect_eq_str("7:08min/mi", Core.FormatterHelper.formatNumber(7.13, 60, ":", "min/mi", 0));
		expect_eq_str("7:05min/mi", Core.FormatterHelper.formatNumber(7.13, 60, ":", "min/mi", 5));

		expect_eq_str("7:46min/mi", Core.FormatterHelper.formatNumber(7.77, 60, ":", "min/mi", 0));
		expect_eq_str("7:45min/mi", Core.FormatterHelper.formatNumber(7.77, 60, ":", "min/mi", 5));

		expect_eq_str("7:14min/mi", Core.FormatterHelper.formatNumber(7.23, 60, ":", "min/mi", 0));
		expect_eq_str("7:10min/mi", Core.FormatterHelper.formatNumber(7.23, 60, ":", "min/mi", 5));
	});
	it('number rounder (up)', function () {
		expect_eq_nbr(240, Core.FormatterHelper.roundNumberUp(240, 5));
		expect_eq_nbr(245, Core.FormatterHelper.roundNumberUp(241, 5));
		expect_eq_nbr(245, Core.FormatterHelper.roundNumberUp(242, 5));
		expect_eq_nbr(245, Core.FormatterHelper.roundNumberUp(243, 5));
		expect_eq_nbr(245, Core.FormatterHelper.roundNumberUp(244, 5));
		expect_eq_nbr(245, Core.FormatterHelper.roundNumberUp(245, 5));
		expect_eq_nbr(250, Core.FormatterHelper.roundNumberUp(246, 5));
	});
	it('number rounder (down)', function () {
		expect_eq_nbr(240, Core.FormatterHelper.roundNumberDown(240, 5));
		expect_eq_nbr(240, Core.FormatterHelper.roundNumberDown(241, 5));
		expect_eq_nbr(240, Core.FormatterHelper.roundNumberDown(242, 5));
		expect_eq_nbr(240, Core.FormatterHelper.roundNumberDown(243, 5));
		expect_eq_nbr(240, Core.FormatterHelper.roundNumberDown(244, 5));
		expect_eq_nbr(245, Core.FormatterHelper.roundNumberDown(245, 5));
		expect_eq_nbr(245, Core.FormatterHelper.roundNumberDown(246, 5));
	});
	it('time', function () {
		expect_eq_str("01:00:30", Core.FormatterHelper.formatTime(3630000));
	});
});

describe('Swim', function () {
	it('speed conversion', function () {
		expect_eq_nbr(2.41, Core.IntensityUnitHelper.convertTo(1.41, Core.IntensityUnit.Per100Yards, Core.IntensityUnit.Mph));
		expect_eq_nbr(1.42, Core.IntensityUnitHelper.convertTo(2.4, Core.IntensityUnit.Mph, Core.IntensityUnit.Per100Yards));
		expect_eq_nbr(2.40, Core.SpeedParser.getSpeedInMph("1:25/100yards"));
		expect_eq_nbr(2.55, Core.SpeedParser.getSpeedInMph("0:20/25yards"));
		expect_eq_nbr(2.63, Core.SpeedParser.getSpeedInMph("1:25/100meters"));

	});
	it('intensity conversion', function () {
		expect_eq_str("1:30/100yards", new Core.Intensity(1, 1.5, Core.IntensityUnit.Per100Yards).toString());
		expect_eq_str("0:20/25yards", new Core.Intensity(1, 0.33333, Core.IntensityUnit.Per25Yards).toString());
		var swim_visitor_mph = new Visitor.WorkoutTextVisitor(up, Core.SportType.Swim, Core.IntensityUnit.Mph, /*roundValues=*/true);
		var swim_visitor_per100 = new Visitor.WorkoutTextVisitor(up, Core.SportType.Swim, Core.IntensityUnit.Per100Yards, /*roundValues=*/true);

		expect_eq_str("2.4mi/h", swim_visitor_mph.getIntensityPretty(intensity_100_pct))
		expect_eq_str("1:25/100yards", swim_visitor_per100.getIntensityPretty(intensity_100_pct))
	});
	it('speed conversion (meters)', function () {
		expect_eq_str("500 warmup on 8'36'' (1:43/100meters)", Visitor.WorkoutTextVisitor.getIntervalTitle(Parser.IntervalParser.parse(of_swim, `(500m, 90, warmup)`), up, Core.SportType.Swim, Core.IntensityUnit.Per100Meters));
		expect_eq_str("100 strong on 1'32''", Visitor.WorkoutTextVisitor.getIntervalTitle(Parser.IntervalParser.parse(of_swim, `(100m, 100, strong)`), up, Core.SportType.Swim, Core.IntensityUnit.Per100Meters));

		expect_eq_nbr(2.48, Core.IntensityUnitHelper.convertTo(1.5, Core.IntensityUnit.Per100Meters, Core.IntensityUnit.Mph));
		expect_eq_nbr(1.5, Core.IntensityUnitHelper.convertTo(2.48, Core.IntensityUnit.Mph, Core.IntensityUnit.Per100Meters));

		expect_eq_str("1:30/100meters", new Core.Intensity(1, 1.5, Core.IntensityUnit.Per100Meters).toString());

		var swim_visitor_mph = new Visitor.WorkoutTextVisitor(up, Core.SportType.Swim, Core.IntensityUnit.Mph, /*roundValues=*/true);
		var swim_visitor_per100 = new Visitor.WorkoutTextVisitor(up, Core.SportType.Swim, Core.IntensityUnit.Per100Meters, /*roundValues=*/true);

		expect_eq_str("2.4mi/h", swim_visitor_mph.getIntensityPretty(intensity_100_pct));
		expect_eq_str("1:33/100meters", swim_visitor_per100.getIntensityPretty(intensity_100_pct));
	});
	it('speed', function () {
		expect_eq_nbr(/* 1:25 */ 60 + 25, new User.ObjectFactory(up, Core.SportType.Swim).createDuration(intensity_100_pct, Core.DistanceUnit.Yards, 100).getSeconds());
	});
	it('speed (meters)', function () {
		expect_eq_nbr(/* 1:32 */ 92.95, new User.ObjectFactory(up, Core.SportType.Swim).createDuration(intensity_100_pct, Core.DistanceUnit.Meters, 100).getSeconds());
	});
});

describe('Player Helper', function () {
	it('Two intervals, 2 boundaries', function () {
		let interval = Parser.IntervalParser.parse(of_swim, "(10min, 55, t1), (20min, 60, t2)");
		let ph = new Player.PlayerHelper(of_other, interval);
		expect_eq_str("t1", ph.get(0).getInterval().getTitle());
		expect_eq_str("t1", ph.get(10 * 60).getInterval().getTitle());
		expect_eq_str("t2", ph.get(20 * 60).getInterval().getTitle());
		expect_eq_str("t2", ph.get(30 * 60).getInterval().getTitle());
		expect_true(null == ph.get(40 * 60));
	});
});

describe('Golden Test', function () {
	it('swim', function () {
		GoldenTestGeneric(of_swim, "swim_test.input", "swim_test.golden", GoldenTestCase);
	});
	it('bike', function () {
		GoldenTestGeneric(of_bike, "bike_test.input", "bike_test.golden", GoldenTestCase);
	});
	it('run', function () {
		GoldenTestGeneric(of_run, "run_test.input", "run_test.golden", GoldenTestCase);
	});
});

function GoldenTestCase(of: User.ObjectFactory, input: string) : string {
	// Skip last one which is a blank.
	// Extract name and output unit
	let lines = input.split("\n");
	let test_case = "";
	let name = "";
	let output_unit: Core.IntensityUnit = Core.IntensityUnit.Unknown;
	// Extract the name and output_unit if any is provided.
	for (let j = 0; j < lines.length; ++j) {
		// If there is any parameter, process them.
		if (lines[j].startsWith("{")) {
			console.assert(lines[j].endsWith("}"));
			let assignment = lines[j].slice(1, lines[j].length - 1).split("=");
			switch (assignment[0]) {
				case "name":
					name = assignment[1];
					break;
				case "output_unit":
					output_unit = Core.IntensityUnitHelper.toIntensityUnit(assignment[1]);
					break;
			}
		} else {
			if (test_case.length > 0) {
				test_case += "\n";
			}
			test_case += lines[j];
		}
	}

	if (test_case.trim().length == 0) {
		return "";
	}
	let builder = new Model.WorkoutBuilder(up, of.sport_type, output_unit)
	builder.withDefinition("title", test_case);

	let interval = builder.getInterval();
	let actual_output = "";
	if (name.length > 0) {
		actual_output += string_format("Name: {0}\n", name);
	}
	actual_output += "Input: \n";
	actual_output += test_case;
	let normalized_text = Parser.IntervalParser.normalize(of, test_case);
	actual_output += "Normalized: \n";
	actual_output += normalized_text;
	actual_output += "\n";
	actual_output += "AST: \n";
	actual_output += Visitor.TreePrinterVisitor.Print(interval);
	actual_output += string_format("IF (Avg): {0}\n", interval.getIntensity().getValue());
	actual_output += string_format("TSS2: {0}\n", builder.getTSS());

	// Get the dominant unit and pretty print.
	let dominant_intensity_unit = Visitor.DominantUnitVisitor.computeIntensity(interval);
	if (dominant_intensity_unit != Core.IntensityUnit.Unknown || output_unit != Core.IntensityUnit.Unknown) {
		let presentation_unit: Core.IntensityUnit;
		if (output_unit != Core.IntensityUnit.Unknown) {
			presentation_unit = output_unit;
			actual_output += string_format("Output Unit: {0}\n", Core.IntensityUnitHelper.toString(output_unit));
		} else {
			presentation_unit = dominant_intensity_unit;
			actual_output += string_format("Dominant Unit: {0}\n", Core.IntensityUnitHelper.toString(dominant_intensity_unit));
		}

		var workout_steps = interval.getIntervals().map(function (interval_1: any, index: number) {
			return "\t* " + Visitor.WorkoutTextVisitor.getIntervalTitle(interval_1, of.user_profile, of.sport_type, presentation_unit, /*round_values=*/false);
		}.bind(this));
		actual_output += "Pretty Print:\n";
		actual_output += workout_steps.join("\n") + "\n";
	}
	let duration_unit = Visitor.DominantUnitVisitor.computeDuration(interval);
	if (duration_unit != Core.DistanceUnit.Unknown) {
		actual_output += string_format("Duration Unit: {0}\n", Core.DurationUnitHelper.toString(duration_unit));
		if (duration_unit == Core.DistanceUnit.Yards) {
			actual_output += string_format("Yards: {0}\n", interval.getTotalDuration().getValueInUnit(Core.DistanceUnit.Yards));
		} else if (duration_unit == Core.DistanceUnit.Meters) {
			actual_output += string_format("Meters: {0}\n", interval.getTotalDuration().getValueInUnit(Core.DistanceUnit.Meters));
		} else if (duration_unit == Core.DistanceUnit.Kilometers) {
			actual_output += string_format("Kilometers: {0}\n", interval.getTotalDuration().getValueInUnit(Core.DistanceUnit.Kilometers));
		} else {
			if (dominant_intensity_unit != null && dominant_intensity_unit != Core.IntensityUnit.Unknown) {
				if (of.sport_type == Core.SportType.Run) {
					if (dominant_intensity_unit == Core.IntensityUnit.Kmh ||
						dominant_intensity_unit == Core.IntensityUnit.MinKm ||
						dominant_intensity_unit == Core.IntensityUnit.Per400Meters) {
						actual_output += string_format("Kilometers: {0}\n", interval.getWorkDuration().toStringDistance(Core.DistanceUnit.Kilometers));
					} else {
						actual_output += string_format("Miles: {0}\n", interval.getWorkDuration().toStringDistance(Core.DistanceUnit.Miles));
					}
				}
			}
		}
	}

	actual_output += string_format("Duration (Sec): {0}\n", interval.getTotalDuration().getSeconds());
	return actual_output;
}

function GoldenTestGeneric(of: any, input_file: string, golden_file: string, callback: ( of: any, input: string ) => string) {
	let fs = require('fs');
	let input: string = fs.readFileSync(`./test/${input_file}`).toString();
	let test_cases = input.toString().split("-- EOT\n");
	let separator = "----------------------------\n";
	let expected_output: string = fs.readFileSync(`./test/${golden_file}`).toString();
	let expected_outputs: string[] = expected_output.split(separator);
	let generate_golden = false;
	let final_output: string = "";
	for (let i = 0; i < test_cases.length; ++i) {
		let input = test_cases[i];
		let actual_output = callback(of, input);

		if (actual_output.length == 0) {
			continue;
		}

		if (!generate_golden) {
			expect_eq_str(expected_outputs[i], actual_output);
		}

		// final_output is used for writing to the golden_file
		final_output += actual_output;
		final_output += separator;
	}
	if (generate_golden) {
		fs.writeFileSync(golden_file, final_output);
	}
}

describe('Golden Test Player', function () {
	it('swim', function () {
		GoldenTestGeneric(of_swim, "swim_player.input", "swim_player.golden", GoldenPlayerTestCase);
	});
});

function GoldenPlayerTestCase(of: User.ObjectFactory, input: string) : string {
	// Skip last one which is a blank.
	// Extract name and output unit
	let lines = input.split("\n");
	let test_case = "";
	// Extract the name and output_unit if any is provided.
	for (let j = 0; j < lines.length; ++j) {
		if (test_case.length > 0) {
			test_case += "\n";
		}
		test_case += lines[j];
	}

	if (test_case.trim().length == 0) {
		return "";
	}
	let interval = Parser.IntervalParser.parse(of, test_case);
	// Create the visitor for the AbsoluteTimeInterval.
	var pv = new Visitor.AbsoluteTimeIntervalVisitor(of_swim);
	Visitor.VisitorHelper.visitAndFinalize(pv, interval);

	let actual_output = "";
	actual_output += "Input: \n";
	actual_output += test_case;
	actual_output += "Titles: \n";
	for (let ati of pv.getIntervalArray()) {
		actual_output += "(" + ati.getBeginSeconds() + ";" + ati.getEndSeconds() + ") "
		actual_output += ati.getTitle() + "\n";
	}

	return actual_output;
}

describe('NumberAndUnitParser', function () {
	it('Per400m', function () {
		let p = new Parser.NumberAndUnitParser();
		p.evaluate("1:30/400m", 0);
		expect_eq_nbr(1.5, p.getValue());
		expect_eq_str("/400m", p.getUnit());
	});
});

function textPreprocessor(input: string, expected: string) {
	let tp = new PreProcessor.TextPreprocessor(new PreProcessor.TextPreprocessorContext(Core.SportType.Bike, /*is_indoor=*/false));
	let actual = tp.process(input);
	expect_eq_str(expected, actual);
}

describe('text processor', function () {
	it('simple', function () {
		// Make sure #wu gets resolved. Its a random output so we cannot
		// check against a static value unless we override the random generator.
		let tp = new PreProcessor.TextPreprocessor(new PreProcessor.TextPreprocessorContext(Core.SportType.Bike, /*is_indoor=*/false));
		let actual = tp.process("#wu");
		console.assert(actual.indexOf("#wu") == -1);

		textPreprocessor("#sl(4,40)", "4[(40s,45,Left Leg), (15s,45,Both), (40s,45,Right Leg), (15s,45,Both)]");
		textPreprocessor("#o(4,40)", "4[(40s,*,Build), (40s,55,Relaxed)]");
		textPreprocessor("#dd2", "(10s, Change to DD2)");
		textPreprocessor("#alt4min", "(4min, Alternate arm pull)");
		textPreprocessor("#dbl90s", "(90s, Double arm pull)");
		textPreprocessor("#dd2", "(10s, Change to DD2)");
		textPreprocessor("#sl(4,40) #o(4,40)", "4[(40s,45,Left Leg), (15s,45,Both), (40s,45,Right Leg), (15s,45,Both)] 4[(40s,*,Build), (40s,55,Relaxed)]");
	});
});

function movingAverage(input: any, window_size: number, expected_average: number): void {
	let ma = new Visitor.MovingAverage(window_size);

	for (let i = 0; i < input.length; i++) {
		ma.insert(input[i]);
	}

	expect_eq_nbr(ma.get_moving_average(), expected_average, string_format("input: {0} window_size: {1}", JSON.stringify(input), window_size));
}

describe('moving average', function () {
	it('simple', function () {
		movingAverage([], 1, null);
		movingAverage([1], 1, 1.0);
		movingAverage([2, 2], 2, 2.0);
		movingAverage([1, 3], 2, 1.5);
		movingAverage([1, 3, 5], 2, 4);
		movingAverage([2, 2], 1, 2.0);
		movingAverage([1, 3], 1, 3.0);
	});
});

describe('File Generation', function () {
	it('Golden Files', function () {
		GoldenTestGeneric(of_bike, "file_generation.input", "file_generation.golden", GoldenFileGenerationTestCase);
	});
});

describe('Data Point Visitor', function () {
	it('Golden Files', function () {
		GoldenTestGeneric(of_swim, "data_point.input", "data_point.golden", DataPointGenerationTestCase);
	});
});

function GoldenFileGenerationTestCase(of: User.ObjectFactory, input: string) : string {
	let interval = Parser.IntervalParser.parse(of, input);

	let result = "";

	result += `Input: ${input}\n`

	{
		result += `Zwift:\n`
		let zwift = new Visitor.ZwiftDataVisitor("untitled");
		Visitor.VisitorHelper.visitAndFinalize(zwift, interval);
		result += zwift.getContent();
		result += "\n";
	}

	{
		result += `MRC:\n`
		let mrc = new Visitor.MRCCourseDataVisitor("untitled");
		Visitor.VisitorHelper.visitAndFinalize(mrc, interval);
		result += mrc.getContent();
		result += "\n";
	}

	{
		result += `PPSMRX:\n`
		let pps = new Visitor.PPSMRXCourseDataVisitor("untitled");
		Visitor.VisitorHelper.visitAndFinalize(pps, interval);
		result += pps.getContent();
		result += "\n";
	}

	return result;
}

function DataPointGenerationTestCase(of: User.ObjectFactory, input: string) : string {
	let interval = Parser.IntervalParser.parse(of, input);

	let result = "";

	result += `Input: ${input}\n`

	{
		let data_point = new Visitor.DataPointVisitor();
		Visitor.VisitorHelper.visitAndFinalize(data_point, interval);
		result += JSON.stringify(data_point.data, undefined, 4);
		result += "\n";
	}

	return result;
}

function computePower(input_workout: string, expected_np: number, expected_avg: number) {
	let np_visitor = new Visitor.NPVisitor();
	var interval = Parser.IntervalParser.parse(of_bike, input_workout);
	Visitor.VisitorHelper.visitAndFinalize(np_visitor, interval);
	expect_eq_nbr(expected_np, up.bike_ftp * np_visitor.getIF());
	let avg_power = interval.getIntensity().getValue() * up.bike_ftp;
	expect_eq_nbr(expected_avg, avg_power);
}

describe('np computation', function () {
	it('simple', function () {
		computePower("(30s, 100)", /*np=*/310, /*avg=*/310);
		computePower("(30s, 100), (30s, 55)", /*np=*/279, /*avg=*/250.17);
	});
});
