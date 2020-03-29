import * as UI from './ui';
import * as Model from './model';
import 'mocha';
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

var intensity_100_pct = new Model.Intensity(1, 1);
var up = new Model.UserProfile(310, "6:00min/mi", 100, "1:25/100yards", "foo@bar.com");
up.setEfficiencyFactor(2);
var of_swim = new Model.ObjectFactory(up, Model.SportType.Swim);
var of_bike = new Model.ObjectFactory(up, Model.SportType.Bike);
var of_run = new Model.ObjectFactory(up, Model.SportType.Run);
var of_other = new Model.ObjectFactory(up, Model.SportType.Other);

describe('DistanceUnitHelper', function () {
	it('convert miles to kilometers', function () {
		let res = Model.DistanceUnitHelper.convertTo(1000, Model.DistanceUnit.Miles, Model.DistanceUnit.Kilometers);
		expect_eq_nbr(1609.344, res);
	});
});

describe('TimeUnitHelper', function () {
	it('convert hours to seconds', function () {
		let res = Model.TimeUnitHelper.convertTo(1, Model.TimeUnit.Hours, Model.TimeUnit.Seconds);
		expect_eq_nbr(3600, res);
	});
});

describe('Intensity', function () {
	it('IF Average', function () {
		var i90 = new Model.Intensity(0.90, 0.90);
		var i80 = new Model.Intensity(0.80, 0.80);
		let res = Model.Intensity.combine([i90, i80], [1, 1]).getValue();
		expect_eq_nbr(0.85, res);
	});
	it('hr conversion', function () {
		var hr_visitor = new Model.WorkoutTextVisitor(up, Model.SportType.Bike, Model.IntensityUnit.HeartRate, /*roundValues=*/false);
		expect_eq_str("155bpm", hr_visitor.getIntensityPretty(intensity_100_pct));

		var intensity_90_pct = new Model.Intensity(0.9, 0.9);
		expect_eq_str("140bpm", hr_visitor.getIntensityPretty(intensity_90_pct));

		var intensity_85_pct = new Model.Intensity(0.85, 0.85);
		expect_eq_str("132bpm", hr_visitor.getIntensityPretty(intensity_85_pct));
	});
});

describe('Other Sport Type', function () {
	it('1min @ 55%-75%', function () {
		var buildInterval = Model.IntervalParser.parse(of_other, "(1min, 55, 75)");
		expect_eq_nbr(0.7, buildInterval.getTSS());
		expect_eq_nbr(0.8, Model.TSSCalculator.compute(buildInterval));
	});
});

describe('Bugs', function () {
	it('text causes distance to become miles', function () {
		let d1 = new Model.Duration(Model.DistanceUnit.Yards, 400, 60, 0);
		let d2 = new Model.Duration(Model.TimeUnit.Seconds, 0, 0, 0);
		let cd1 = Model.Duration.combine(d1, d2);
		expect_eq_nbr(Model.DistanceUnit.Yards, cd1.getUnit());
		expect_eq_nbr(400, cd1.getValue());
		let cd2 = Model.Duration.combine(d2, d1);
		expect_eq_nbr(Model.DistanceUnit.Yards, cd2.getUnit());
		expect_eq_nbr(400, cd2.getValue());
	});
});

// TODO: Add test for half MINUTES

describe('Combine duration', function () {
	it('Combine two distances', function () {
		let dur = Model.Duration.combine(new Model.Duration(Model.DistanceUnit.Yards, 100, 0, 0), new Model.Duration(Model.DistanceUnit.Yards, 200, 0, 0));
		expect_eq_nbr(Model.DistanceUnit.Yards, dur.getUnit());
		expect_eq_nbr(300, dur.getValue());
	});
});

describe('IntervalParser', function () {
	it('Parse double', function () {
		expect_eq_nbr(123, Model.IntervalParser.parseDouble("123", 0).value);
		expect_eq_nbr(123.456, Model.IntervalParser.parseDouble("123.456", 0).value);
	});
});

describe('UserProfile', function () {
	it('6min/mi to other paces', function () {
		var up_6tpace = new Model.UserProfile(310, "6:00min/mi", 100, "1:10/100yards", "foo@bar.com");
		expect_eq_nbr(6, up_6tpace.getPaceMinMi(new Model.Intensity(1, 1)));
		expect_eq_nbr(7.05, up_6tpace.getPaceMinMi(new Model.Intensity(0.85, 0.85)));
		expect_eq_nbr(8, up_6tpace.getPaceMinMi(new Model.Intensity(0.75, 0.75)));
	});
});

describe('File Generation', function () {
	var file_interval_simple = Model.IntervalParser.parse(of_bike, "(10min, 55, 75), (1hr, 80), (5min, 75, 55)");
	var file_interval_free_ride = Model.IntervalParser.parse(of_bike, "(10min, 55, 75), (1hr, *, Free), (5min, 75, 55)");

	it('Zwift Simple', function () {
		var zwift = new Model.ZwiftDataVisitor("untitled_workout");
		Model.VisitorHelper.visitAndFinalize(zwift, file_interval_simple);
		var expected_content = `<workout_file>
	<author>Workout Planner Author</author>
	<name>untitled_workout</name>
	<description>Auto generated by https://github.com/sergioclemente/WorkoutPlanner</description>
	<tags>
		<tag name="INTERVALS"/>
	</tags>
	<workout>
		<Warmup Duration="600" PowerLow="0.55" PowerHigh="0.75"/>
		<SteadyState Duration="3600" Power="0.8">
			<textevent timeoffset="0" message="1hr @ 80%"/>
		</SteadyState>
		<Cooldown Duration="300" PowerLow="0.75" PowerHigh="0.55"/>
	</workout>
</workout_file>`;
		expect_eq_str(expected_content, zwift.getContent());
	});
	it('Zwift Free Ride', function () {
		var zwift = new Model.ZwiftDataVisitor("untitled_workout");
		Model.VisitorHelper.visitAndFinalize(zwift, file_interval_free_ride);
		var expected_content = `<workout_file>
	<author>Workout Planner Author</author>
	<name>untitled_workout</name>
	<description>Auto generated by https://github.com/sergioclemente/WorkoutPlanner</description>
	<tags>
		<tag name="INTERVALS"/>
	</tags>
	<workout>
		<Warmup Duration="600" PowerLow="0.55" PowerHigh="0.75"/>
		<FreeRide Duration="3600">
			<textevent timeoffset="0" message="Free"/>
		</FreeRide>
		<Cooldown Duration="300" PowerLow="0.75" PowerHigh="0.55"/>
	</workout>
</workout_file>`;
		expect_eq_str(expected_content, zwift.getContent());
	});
	it('MRC Simple', function () {
		var mrc = new Model.MRCCourseDataVisitor("untitled_workout");
		Model.VisitorHelper.visitAndFinalize(mrc, file_interval_simple);
		var expected_content = `[COURSE HEADER]
VERSION=2
UNITS=ENGLISH
FILE NAME=untitled_workout
MINUTES\tPERCENT
[END COURSE HEADER]
[COURSE DATA]
0\t55
10\t75
10\t80
70\t80
70\t75
75\t55
[END COURSE DATA]
[PERFPRO DESCRIPTIONS]
Desc0=10' build from 55% to 75%
Desc1=1hr @ 80%
Desc2=5' warm down from 75% to 55%
[END PERFPRO DESCRIPTIONS]
`;

		expect_eq_str(expected_content, mrc.getContent());
	});
	it('MRC more complex', function () {
		var file_interval = Model.IntervalParser.parse(of_bike, "(10min, 55, 75), 4[(1hr, 80), (5min, 55)], (20min, 75)");
		var mrc = new Model.MRCCourseDataVisitor("untitled_workout");
		Model.VisitorHelper.visitAndFinalize(mrc, file_interval);
		var expected_content = `[COURSE HEADER]
VERSION=2
UNITS=ENGLISH
FILE NAME=untitled_workout
MINUTES\tPERCENT
[END COURSE HEADER]
[COURSE DATA]
0\t55
10\t75
10\t80
70\t80
70\t55
75\t55
75\t80
135\t80
135\t55
140\t55
140\t80
200\t80
200\t55
205\t55
205\t80
265\t80
265\t55
270\t55
270\t75
290\t75
[END COURSE DATA]
[PERFPRO DESCRIPTIONS]
Desc0=10' build from 55% to 75%
Desc1=1hr @ 80% | 1 of 4
Desc2=5' @ 55% | 1 of 4
Desc3=1hr @ 80% | 2 of 4
Desc4=5' @ 55% | 2 of 4
Desc5=1hr @ 80% | 3 of 4
Desc6=5' @ 55% | 3 of 4
Desc7=1hr @ 80% | 4 of 4
Desc8=5' @ 55% | 4 of 4
Desc9=20' @ 75%
[END PERFPRO DESCRIPTIONS]
`;

		expect_eq_str(expected_content, mrc.getContent());
	});
	it('PPSMRX Free Ride', function () {
		var zwift = new Model.PPSMRXCourseDataVisitor("untitled_workout");
		Model.VisitorHelper.visitAndFinalize(zwift, file_interval_free_ride);
		var expected_content = `{
	"type":"json",
	"createdby":"PerfPRO Studio v5.80.25",
	"version":5.00,
	"name":"untitled_workout",
	"workoutType":"",
	"comments":"",
	"isLocked":0,
	"videoFile":"",
	"showCountDown":0,
	"showStep":0,
	"movieMode":0,
	"startMinute":0,
	"set_fields":["description","seconds","start","finish","mode","intervals","group","autolap","targetcad"],
	"sets":[
		["10' build from 55% to 75%",600,55,75,"M",1,75,0,90],
		["Free",3600,0,0,"T",1,0,0,90],
		["5' warm down from 75% to 55%",300,75,55,"M",1,55,0,90]
	]
}`;
		expect_eq_str(expected_content, zwift.getContent());
	});
	it('PPSMRX More Complex', function () {
		let file_interval = Model.IntervalParser.parse(of_bike, "(10min, 55, 75), 4[(1hr, 80), (5min, 55)], (20min, 75)");
		let mrx_visitor = new Model.PPSMRXCourseDataVisitor("untitled_workout");
		Model.VisitorHelper.visitAndFinalize(mrx_visitor, file_interval);
		let expected_content = `{
	"type":"json",
	"createdby":"PerfPRO Studio v5.80.25",
	"version":5.00,
	"name":"untitled_workout",
	"workoutType":"",
	"comments":"",
	"isLocked":0,
	"videoFile":"",
	"showCountDown":0,
	"showStep":0,
	"movieMode":0,
	"startMinute":0,
	"set_fields":["description","seconds","start","finish","mode","intervals","group","autolap","targetcad"],
	"sets":[
		["10' build from 55% to 75%",600,55,75,"M",1,75,0,90],
		["1hr @ 80% (1/4)",3600,80,80,"M",1,1,0,90],
		["5' @ 55% (1/4)",300,55,55,"M",1,1,0,90],
		["1hr @ 80% (2/4)",3600,80,80,"M",1,1,0,90],
		["5' @ 55% (2/4)",300,55,55,"M",1,1,0,90],
		["1hr @ 80% (3/4)",3600,80,80,"M",1,1,0,90],
		["5' @ 55% (3/4)",300,55,55,"M",1,1,0,90],
		["1hr @ 80% (4/4)",3600,80,80,"M",1,1,0,90],
		["5' @ 55% (4/4)",300,55,55,"M",1,1,0,90],
		["20' @ 75%",1200,75,75,"M",1,0,0,90]
	]
}`;
		expect_eq_str(expected_content, mrx_visitor.getContent());
	});
});

// StepBuildInterval basic tests
var duration1min = new Model.Duration(Model.TimeUnit.Seconds, 60, 60, 0);
var duration30s = new Model.Duration(Model.TimeUnit.Seconds, 30, 30, 0);
var si1min80 = new Model.SimpleInterval("", new Model.Intensity(80), duration1min, Model.Duration.ZeroDuration);
var si1min90 = new Model.SimpleInterval("", new Model.Intensity(90), duration1min, Model.Duration.ZeroDuration);
var si1min100 = new Model.SimpleInterval("", new Model.Intensity(100), duration1min, Model.Duration.ZeroDuration);
var si30s50 = new Model.SimpleInterval("", new Model.Intensity(50), duration30s, Model.Duration.ZeroDuration);

var sbi = new Model.StepBuildInterval("", [si1min80, si1min90, si1min100, si30s50]);
expect_eq_nbr(3, sbi.getRepeatCount());
expect_eq_nbr(3 * 60 + 3 * 30, sbi.getWorkDuration().getSeconds());

describe('zone visitor', function () {
	it('1', function () {
		expect_eq_nbr(1, Model.ZonesVisitor.getZone(Model.SportType.Bike, 0.50));
	});
	it('2', function () {
		expect_eq_nbr(2, Model.ZonesVisitor.getZone(Model.SportType.Bike, 0.55));
	});
	it('3', function () {
		expect_eq_nbr(3, Model.ZonesVisitor.getZone(Model.SportType.Bike, 0.75));
	});
	it('4', function () {
		expect_eq_nbr(4, Model.ZonesVisitor.getZone(Model.SportType.Bike, 0.90));
	});
	it('5', function () {
		expect_eq_nbr(5, Model.ZonesVisitor.getZone(Model.SportType.Bike, 1.05));
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
		expect_eq_nbr(8, Model.SpeedParser.getSpeedInMph("7:30min/mi"))
		expect_eq_nbr(8, Model.SpeedParser.getSpeedInMph("8mi/h"))
		expect_eq_nbr(8.44, Model.SpeedParser.getSpeedInMph("4:25min/km"))
		expect_eq_nbr(9.94, Model.SpeedParser.getSpeedInMph("1:30/400meters"));
	});
});

describe('Formatter', function () {
	it('number formatter', function () {
		expect_eq_str("8:00min/mi", Model.FormatterHelper.formatNumber(8, 60, ":", "min/mi", 0));
		expect_eq_str("8:00min/mi", Model.FormatterHelper.formatNumber(8, 60, ":", "min/mi", 5));

		expect_eq_str("7:30min/mi", Model.FormatterHelper.formatNumber(7.5, 60, ":", "min/mi", 0));
		expect_eq_str("7:30min/mi", Model.FormatterHelper.formatNumber(7.5, 60, ":", "min/mi", 5));

		expect_eq_str("7:08min/mi", Model.FormatterHelper.formatNumber(7.13, 60, ":", "min/mi", 0));
		expect_eq_str("7:05min/mi", Model.FormatterHelper.formatNumber(7.13, 60, ":", "min/mi", 5));

		expect_eq_str("7:46min/mi", Model.FormatterHelper.formatNumber(7.77, 60, ":", "min/mi", 0));
		expect_eq_str("7:45min/mi", Model.FormatterHelper.formatNumber(7.77, 60, ":", "min/mi", 5));

		expect_eq_str("7:14min/mi", Model.FormatterHelper.formatNumber(7.23, 60, ":", "min/mi", 0));
		expect_eq_str("7:10min/mi", Model.FormatterHelper.formatNumber(7.23, 60, ":", "min/mi", 5));
	});
	it('number rounder (up)', function () {
		expect_eq_nbr(240, Model.FormatterHelper.roundNumberUp(240, 5));
		expect_eq_nbr(245, Model.FormatterHelper.roundNumberUp(241, 5));
		expect_eq_nbr(245, Model.FormatterHelper.roundNumberUp(242, 5));
		expect_eq_nbr(245, Model.FormatterHelper.roundNumberUp(243, 5));
		expect_eq_nbr(245, Model.FormatterHelper.roundNumberUp(244, 5));
		expect_eq_nbr(245, Model.FormatterHelper.roundNumberUp(245, 5));
		expect_eq_nbr(250, Model.FormatterHelper.roundNumberUp(246, 5));
	});
	it('number rounder (down)', function () {
		expect_eq_nbr(240, Model.FormatterHelper.roundNumberDown(240, 5));
		expect_eq_nbr(240, Model.FormatterHelper.roundNumberDown(241, 5));
		expect_eq_nbr(240, Model.FormatterHelper.roundNumberDown(242, 5));
		expect_eq_nbr(240, Model.FormatterHelper.roundNumberDown(243, 5));
		expect_eq_nbr(240, Model.FormatterHelper.roundNumberDown(244, 5));
		expect_eq_nbr(245, Model.FormatterHelper.roundNumberDown(245, 5));
		expect_eq_nbr(245, Model.FormatterHelper.roundNumberDown(246, 5));
	});
	it('time', function () {
		expect_eq_str("01:00:30", Model.FormatterHelper.formatTime(3630000));
	});
});

describe('Swim', function () {
	it('speed conversion', function () {
		expect_eq_nbr(2.41, Model.IntensityUnitHelper.convertTo(1.41, Model.IntensityUnit.Per100Yards, Model.IntensityUnit.Mph));
		expect_eq_nbr(1.42, Model.IntensityUnitHelper.convertTo(2.4, Model.IntensityUnit.Mph, Model.IntensityUnit.Per100Yards));
		expect_eq_nbr(2.40, Model.SpeedParser.getSpeedInMph("1:25/100yards"));
		expect_eq_nbr(2.55, Model.SpeedParser.getSpeedInMph("0:20/25yards"));
		expect_eq_nbr(2.63, Model.SpeedParser.getSpeedInMph("1:25/100meters"));

	});
	it('intensity conversion', function () {
		expect_eq_str("1:30/100yards", new Model.Intensity(1, 1.5, Model.IntensityUnit.Per100Yards).toString());
		expect_eq_str("0:20/25yards", new Model.Intensity(1, 0.33333, Model.IntensityUnit.Per25Yards).toString());
		var swim_visitor_mph = new Model.WorkoutTextVisitor(up, Model.SportType.Swim, Model.IntensityUnit.Mph, /*roundValues=*/true);
		var swim_visitor_per100 = new Model.WorkoutTextVisitor(up, Model.SportType.Swim, Model.IntensityUnit.Per100Yards, /*roundValues=*/true);

		expect_eq_str("2.4mi/h", swim_visitor_mph.getIntensityPretty(intensity_100_pct))
		expect_eq_str("1:25/100yards", swim_visitor_per100.getIntensityPretty(intensity_100_pct))
	});
	it('speed conversion (meters)', function () {
		expect_eq_str("500 warmup on 8'36'' (1:43/100meters)", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_swim, `(500m, 90, warmup)`), up, Model.SportType.Swim, Model.IntensityUnit.Per100Meters));
		expect_eq_str("100 strong on 1'32''", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_swim, `(100m, 100, strong)`), up, Model.SportType.Swim, Model.IntensityUnit.Per100Meters));

		expect_eq_nbr(2.48, Model.IntensityUnitHelper.convertTo(1.5, Model.IntensityUnit.Per100Meters, Model.IntensityUnit.Mph));
		expect_eq_nbr(1.5, Model.IntensityUnitHelper.convertTo(2.48, Model.IntensityUnit.Mph, Model.IntensityUnit.Per100Meters));

		expect_eq_str("1:30/100meters", new Model.Intensity(1, 1.5, Model.IntensityUnit.Per100Meters).toString());

		var swim_visitor_mph = new Model.WorkoutTextVisitor(up, Model.SportType.Swim, Model.IntensityUnit.Mph, /*roundValues=*/true);
		var swim_visitor_per100 = new Model.WorkoutTextVisitor(up, Model.SportType.Swim, Model.IntensityUnit.Per100Meters, /*roundValues=*/true);

		expect_eq_str("2.4mi/h", swim_visitor_mph.getIntensityPretty(intensity_100_pct));
		expect_eq_str("1:33/100meters", swim_visitor_per100.getIntensityPretty(intensity_100_pct));
	});
	it('speed', function () {
		expect_eq_nbr(/* 1:25 */ 60 + 25, new Model.ObjectFactory(up, Model.SportType.Swim).createDuration(intensity_100_pct, Model.DistanceUnit.Yards, 100).getSeconds());
	});
	it('speed (meters)', function () {
		expect_eq_nbr(/* 1:32 */ 92.95, new Model.ObjectFactory(up, Model.SportType.Swim).createDuration(intensity_100_pct, Model.DistanceUnit.Meters, 100).getSeconds());
	});
});

describe('Player Helper', function () {
	it('Two intervals, 2 boundaries', function () {
		let interval = Model.IntervalParser.parse(of_swim, "(10min, 55, t1), (20min, 60, t2)");
		let ph = new Model.PlayerHelper(interval);
		expect_eq_str("t1", ph.get(0).getInterval().getTitle());
		expect_eq_str("t1", ph.get(10 * 60).getInterval().getTitle());
		expect_eq_str("t2", ph.get(20 * 60).getInterval().getTitle());
		expect_eq_str("t2", ph.get(30 * 60).getInterval().getTitle());
		expect_true(null == ph.get(40 * 60));
	});
});

// TODO: Refactor this function, its becoming a bit of a mess.
function GoldenTest(of: any, input_file: string, golden_file: string) {
	let fs = require('fs');
	let input: string = fs.readFileSync(input_file).toString();
	let test_cases = input.toString().split("-- EOT\n");
	let separator = "----------------------------\n";
	let expected_output: string = fs.readFileSync(golden_file).toString();
	let expected_outputs: string[] = expected_output.split(separator);
	// Set 'generate_golden' to true if you need to regenerate the files.
	let generate_golden = false;
	let final_output: string = "";
	for (let i = 0; i < test_cases.length; ++i) {
		let input = test_cases[i];
		// Skip last one which is a blank.
		// Extract name and output unit
		let lines = input.split("\n");
		let test_case = "";
		let name = "";
		let output_unit: Model.IntensityUnit = Model.IntensityUnit.Unknown;
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
						output_unit = Model.IntensityUnitHelper.toIntensityUnit(assignment[1]);
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
			continue;
		}
		let interval = Model.IntervalParser.parse(of, test_case);
		let actual_output = "";
		if (name.length > 0) {
			actual_output += string_format("Name: {0}\n", name);
		}
		actual_output += "Input: \n";
		actual_output += test_case;
		let normalized_text = Model.IntervalParser.normalize(of, test_case);
		actual_output += "Normalized: \n";
		actual_output += normalized_text;
		actual_output += "\n";
		actual_output += "AST: \n";
		actual_output += Model.TreePrinterVisitor.Print(interval);
		actual_output += string_format("IF (Avg): {0}\n", interval.getIntensity().getValue());
		actual_output += string_format("TSS: {0}\n", interval.getTSS());
		actual_output += string_format("TSS2: {0}\n", interval.getTSS2());

		// Get the dominant unit and pretty print.
		let dominant_intensity_unit = Model.DominantUnitVisitor.computeIntensity(interval);
		if (dominant_intensity_unit != Model.IntensityUnit.Unknown || output_unit != Model.IntensityUnit.Unknown) {
			let presentation_unit: Model.IntensityUnit;
			if (output_unit != Model.IntensityUnit.Unknown) {
				presentation_unit = output_unit;
				actual_output += string_format("Output Unit: {0}\n", Model.IntensityUnitHelper.toString(output_unit));
			} else {
				presentation_unit = dominant_intensity_unit;
				actual_output += string_format("Dominant Unit: {0}\n", Model.IntensityUnitHelper.toString(dominant_intensity_unit));
			}

			var workout_steps = interval.getIntervals().map(function (interval_1: any, index: number) {
				return "\t* " + Model.WorkoutTextVisitor.getIntervalTitle(interval_1, of.getUserProfile(), of.getSportType(), presentation_unit, /*round_values=*/false);
			}.bind(this));
			actual_output += "Pretty Print:\n";
			actual_output += workout_steps.join("\n") + "\n";
		}
		let duration_unit = Model.DominantUnitVisitor.computeDuration(interval);
		if (duration_unit != Model.DistanceUnit.Unknown) {
			actual_output += string_format("Duration Unit: {0}\n", Model.DurationUnitHelper.toString(duration_unit));
			if (duration_unit == Model.DistanceUnit.Yards) {
				actual_output += string_format("Yards: {0}\n", interval.getTotalDuration().getValueInUnit(Model.DistanceUnit.Yards));
			} else if (duration_unit == Model.DistanceUnit.Meters) {
				actual_output += string_format("Meters: {0}\n", interval.getTotalDuration().getValueInUnit(Model.DistanceUnit.Meters));
			} else if (duration_unit == Model.DistanceUnit.Kilometers) {
				actual_output += string_format("Kilometers: {0}\n", interval.getTotalDuration().getValueInUnit(Model.DistanceUnit.Kilometers));
			} else {
				if (dominant_intensity_unit != null && dominant_intensity_unit != Model.IntensityUnit.Unknown) {
					if (of.getSportType() == Model.SportType.Run) {
						if (dominant_intensity_unit == Model.IntensityUnit.Kmh ||
							dominant_intensity_unit == Model.IntensityUnit.MinKm ||
							dominant_intensity_unit == Model.IntensityUnit.Per400Meters) {
							actual_output += string_format("Kilometers: {0}\n", interval.getWorkDuration().toStringDistance(Model.DistanceUnit.Kilometers));
						} else {
							actual_output += string_format("Miles: {0}\n", interval.getWorkDuration().toStringDistance(Model.DistanceUnit.Miles));
						}
					}
				}
			}
		}

		actual_output += string_format("Duration (Sec): {0}\n", interval.getTotalDuration().getSeconds());
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

describe('Golden Test', function () {
	it('swim', function () {
		GoldenTest(of_swim, "./swim_test.input", "./swim_test.golden");
	});
	it('bike', function () {
		GoldenTest(of_bike, "./bike_test.input", "./bike_test.golden");
	});
	it('run', function () {
		GoldenTest(of_run, "./run_test.input", "./run_test.golden");
	});
});

function GoldenTestPlayer(of: any, input_file: string, golden_file: string) {
	let fs = require('fs');
	let input: string = fs.readFileSync(input_file).toString();
	let test_cases = input.toString().split("-- EOT\n");
	let separator = "----------------------------\n";
	let expected_output: string = fs.readFileSync(golden_file).toString();
	let expected_outputs: string[] = expected_output.split(separator);
	// Set 'generate_golden' to true if you need to regenerate the files.
	let generate_golden = false;
	let final_output: string = "";
	for (let i = 0; i < test_cases.length; ++i) {
		let input = test_cases[i];
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
			continue;
		}
		let interval = Model.IntervalParser.parse(of, test_case);
		// Create the visitor for the AbsoluteTimeInterval.
		var pv = new Model.AbsoluteTimeIntervalVisitor();
		Model.VisitorHelper.visitAndFinalize(pv, interval);

		let actual_output = "";
		actual_output += "Input: \n";
		actual_output += test_case;
		actual_output += "Titles: \n";
		for (let ati of pv.getIntervalArray()) {
			actual_output += ati.getTitle() + "\n";
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
	it('bike', function () {
		GoldenTestPlayer(of_bike, "./swim_player.input", "./swim_player.golden");
	});
});

describe('NumberAndUnitParser', function () {
	it('Per400m', function () {
		let p = new Model.NumberAndUnitParser();
		p.evaluate("1:30/400m", 0);
		expect_eq_nbr(1.5, p.getValue());
		expect_eq_str("/400m", p.getUnit());
	});
});

function textPreprocessor(input: string, expected: string) {
	let tp = new Model.TextPreprocessor(Model.SportType.Bike);
	let actual = tp.process(input);
	expect_eq_str(expected, actual);
}

describe('text processor', function () {
	it('simple', function () {
		// Make sure #wu gets resolved. Its a random output so we cannot
		// check against a static value unless we override the random generator.
		let tp = new Model.TextPreprocessor(Model.SportType.Bike);
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
	let ma = new Model.MovingAverage(window_size);

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


function computePower(input_workout: string, expected_np: number, expected_avg: number) {
	let np_visitor = new Model.NPVisitor();
	var interval = Model.IntervalParser.parse(of_bike, input_workout);
	Model.VisitorHelper.visitAndFinalize(np_visitor, interval);
	expect_eq_nbr(expected_np, up.getBikeFTP() * np_visitor.getIF());
	let avg_power = interval.getIntensity().getValue() * up.getBikeFTP();
	expect_eq_nbr(expected_avg, avg_power);
}

describe('np computation', function () {
	it('simple', function () {
		computePower("(30s, 100)", /*np=*/310, /*avg=*/310);
		computePower("(30s, 100), (30s, 55)", /*np=*/279, /*avg=*/250.17);
	});
});
