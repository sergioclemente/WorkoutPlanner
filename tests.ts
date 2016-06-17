/// <reference path="./type_definitions/node.d.ts" />
/// <reference path="./type_definitions/model.d.ts" />

var Model = require("./model");
var UI = require("./ui");

function expect_true(condition : boolean, message : string = "Expect true failed") {
    if (!condition) {
		console.log(message);
		console.trace();
    }
}

function expect_eq_str(expected : string, actual : string) {
	if (expected !== actual) {
		console.log("expected=", JSON.stringify(expected));
		console.log("actual=", JSON.stringify(actual));
		expect_true(false, "expect_eq_str failed");
	}
}

function expect_eq_nbr(expected : number, actual : number, error : number = 0.01) {
	var delta = Math.abs(expected - actual);
	if (delta > error) {
		console.log("expected=", JSON.stringify(expected));
		console.log("actual=", JSON.stringify(actual));
		expect_true(false, "expect_eq_nbr failed");
	}
}

function createSimpleInterval(if_value : number, secs : number) {
	var i = new Model.Intensity(if_value, if_value);
	var dur = new Model.Duration(Model.DurationUnit.Seconds, secs, secs, -1 /* distance */);
	return new Model.SimpleInterval("", i, dur);
}

var res = null;

var intensity_100_pct = new Model.Intensity(1, 1);

// DistanceUnitHelper tests
res = Model.DistanceUnitHelper.convertTo(1000, Model.DistanceUnit.Miles, Model.DistanceUnit.Kilometers);
expect_eq_nbr(1609.344, res);

// TimeUnitHelper tests
res = Model.TimeUnitHelper.convertTo(1, Model.TimeUnit.Hours, Model.TimeUnit.Seconds); 
expect_eq_nbr(3600, res);

// Intensity
var i90 = new Model.Intensity(0.90, 0.90);
var i80 = new Model.Intensity(0.80, 0.80);

res = Model.Intensity.combine([i90, i80], [1, 1]).getValue();
expect_eq_nbr(0.85, res);

var up = new Model.UserProfile(310, "6:00min/mi", "1:25/100yards");
var of_swim = new Model.ObjectFactory(up, Model.SportType.Swim);
var of_bike = new Model.ObjectFactory(up, Model.SportType.Bike);
var of_run = new Model.ObjectFactory(up, Model.SportType.Run);

// TSS tests
var int1hri75 = new Model.ArrayInterval("", [createSimpleInterval(0.75, 3600)]);
expect_eq_nbr(56.3, int1hri75.getTSS());

var int1hri85 = new Model.ArrayInterval("", [createSimpleInterval(0.85, 3600)]);
expect_eq_nbr(72.2, int1hri85.getTSS());

var buildInterval = Model.IntervalParser.parse(of_bike, "(1min, 55, 75)");
expect_eq_nbr(0.7, buildInterval.getTSS());

// IntervalParser
expect_eq_nbr(123, Model.IntervalParser.parseDouble("123", 0).value);
expect_eq_nbr(123.456, Model.IntervalParser.parseDouble("123.456", 0).value);

// Parser tests
var int_par_1hr_75 = Model.IntervalParser.parse(of_bike, "(1hr, 75)");
expect_eq_nbr(56.3, int_par_1hr_75.getTSS());

var int_par_2hr_75_85 = Model.IntervalParser.parse(of_bike, "(1hr, 75), (1hr, 85)");
expect_eq_nbr(128.5, int_par_2hr_75_85.getTSS());

var simple1min85 = Model.IntervalParser.parse(of_bike, "(1, 85)");
expect_eq_nbr(0.85, simple1min85.getIntensities()[0].getValue());

var build1min5585 = Model.IntervalParser.parse(of_bike, "(1, 55, 85)");
expect_eq_nbr(0.55, build1min5585.getIntensities()[0].getValue());
expect_eq_nbr(0.85, build1min5585.getIntensities()[1].getValue());

// UserProfile 
var up_6tpace = new Model.UserProfile(310, "6:00min/mi");
expect_eq_nbr(6, up_6tpace.getPaceMinMi(new Model.Intensity(1, 1)));
expect_eq_nbr(7.05, up_6tpace.getPaceMinMi(new Model.Intensity(0.85, 0.85)));
expect_eq_nbr(8, up_6tpace.getPaceMinMi(new Model.Intensity(0.75, 0.75)));

for (var i = 50; i <= 100; i=i+5) {
	var garbage = new Model.UserProfile(310, "6:00min/mi");
	var ifv = i / 100.0;
}

var int_par_bug = Model.IntervalParser.parse(of_bike, "(1hr, 75), (20mi, 85)");
expect_eq_nbr(2, int_par_bug.getIntensities().length);

// Parsing of units bug
var int_par_unit_bike = Model.IntervalParser.parse(of_bike, "(1s, 50), (2s, 155w), (3s, 50%)");
expect_eq_nbr(Model.IntensityUnit.IF, int_par_unit_bike.getIntervals()[0].getIntensity().getOriginalUnit());
expect_eq_nbr(0.5, int_par_unit_bike.getIntervals()[0].getIntensity().getOriginalValue());

expect_eq_nbr(Model.IntensityUnit.Watts, int_par_unit_bike.getIntervals()[1].getIntensity().getOriginalUnit());
expect_eq_nbr(155, int_par_unit_bike.getIntervals()[1].getIntensity().getOriginalValue());

expect_eq_nbr(Model.IntensityUnit.IF, int_par_unit_bike.getIntervals()[2].getIntensity().getOriginalUnit());
expect_eq_nbr(0.5, int_par_unit_bike.getIntervals()[2].getIntensity().getOriginalValue());

var int_par_unit_run = Model.IntervalParser.parse(of_run, "(4s, 10mph), (5s, 6min/mi)");
expect_eq_nbr(Model.IntensityUnit.Mph, int_par_unit_run.getIntervals()[0].getIntensity().getOriginalUnit());
expect_eq_nbr(10, int_par_unit_run.getIntervals()[0].getIntensity().getOriginalValue());

expect_eq_nbr(Model.IntensityUnit.MinMi, int_par_unit_run.getIntervals()[1].getIntensity().getOriginalUnit());
expect_eq_nbr(6, int_par_unit_run.getIntervals()[1].getIntensity().getOriginalValue());


// Zwift File testing
var zwift = new Model.ZwiftDataVisitor("untitled_workout");
var file_interval = Model.IntervalParser.parse(of_bike, "(10min, 55, 75), (1hr, 80), (5min, 75, 55)");
Model.VisitorHelper.visitAndFinalize(zwift, file_interval);
var expected_content = `<workout_file>
	<author>Workout Planner Author</author>
	<name>untitled_workout</name>
	<description>Auto generated by https://github.com/sergioclemente/WorkoutPlanner</description>
	<tags>
		<tag name="INTERVALS"/>
	</tags>
	<workout>
		<Warmup Duration='600' PowerLow='0.55' PowerHigh='0.75'/>
		<SteadyState Duration='3600' Power='0.8'>
			<textevent timeoffset='0' message='1hr @ 80%'/>
		</SteadyState>
		<Cooldown Duration='300' PowerLow='0.75' PowerHigh='0.55'/>
	</workout>
</workout_file>`;
expect_eq_str(expected_content, zwift.getContent());

// MRC File testing
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
70\t75
75\t55
[END COURSE DATA]
[PERFPRO DESCRIPTIONS]
Desc0=10' warmup to 75%
Desc1=1hr @ 80%
Desc2=5' build from 75% to 55%
[END PERFPRO DESCRIPTIONS]
`;

expect_eq_str(expected_content, mrc.getContent());

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
Desc0=10' warmup to 75%
Desc1=1hr @ 80% | 1 of 4
Desc2=5' easy | 1 of 4
Desc3=1hr @ 80% | 2 of 4
Desc4=5' easy | 2 of 4
Desc5=1hr @ 80% | 3 of 4
Desc6=5' easy | 3 of 4
Desc7=1hr @ 80% | 4 of 4
Desc8=5' easy | 4 of 4
Desc9=20' @ 75%
[END PERFPRO DESCRIPTIONS]
`;

expect_eq_str(expected_content, mrc.getContent());

// No intensity specified
expect_eq_nbr(0.55, Model.IntervalParser.parse(of_bike, `(10min, easy)`).getIntensity().getValue());

// rest interval
expect_eq_nbr(0.0, Model.IntervalParser.parse(of_bike, `(10s, rest)`).getIntensity().getValue());

// Repeat interval bug
var repeat_85_1 = Model.IntervalParser.parse(of_bike, `1[(1hr, 85)]`);
var repeat_85_2 = Model.IntervalParser.parse(of_bike, `2[(1hr, 85)]`);

expect_true(repeat_85_1.getIntervals()[0] instanceof Model.RepeatInterval);
expect_eq_nbr(72.2, repeat_85_1.getTSS());
expect_eq_nbr(3600, repeat_85_1.getDuration().getSeconds());
expect_eq_nbr(0.85, repeat_85_1.getIntensity().getValue());

expect_eq_nbr(144.5, repeat_85_2.getTSS());
expect_eq_nbr(2*3600, repeat_85_2.getDuration().getSeconds());
expect_eq_nbr(0.85, repeat_85_2.getIntensity().getValue());

var baseLinePlusRepeat = Model.IntervalParser.parse(of_bike, `(1hr, 75) 2[(1hr, 85)]`);
expect_eq_nbr(200.8, baseLinePlusRepeat.getTSS(), 0.1);
expect_eq_nbr(3 * 3600, baseLinePlusRepeat.getDuration().getSeconds());
expect_eq_nbr(0.816, baseLinePlusRepeat.getIntensity().getValue());

// TSS accumulation over the second not average if
var onehr85 = Model.IntervalParser.parse(of_bike, `(1hr, 86)`);
expect_eq_nbr(74, onehr85.getTSS(), 0.1);
expect_eq_nbr(0.86, onehr85.getIntensity().getValue());
expect_eq_nbr(3600, onehr85.getDuration().getSeconds());

var onehr85ButHighTSS = Model.IntervalParser.parse(of_bike, `(30min, 60), (30min, 100)`);
expect_eq_nbr(68, onehr85ButHighTSS.getTSS(), 0.1);
expect_eq_nbr(0.82, onehr85ButHighTSS.getIntensity().getValue());
expect_eq_nbr(3600, onehr85ButHighTSS.getDuration().getSeconds());

// StepBuildInterval basic tests
var duration1min = new Model.Duration(Model.DurationUnit.Seconds, 60, 60, 0);
var duration30s = new Model.Duration(Model.DurationUnit.Seconds, 30, 30, 0);
var si1min80 = new Model.SimpleInterval("", new Model.Intensity(80), duration1min);
var si1min90 = new Model.SimpleInterval("", new Model.Intensity(90), duration1min);
var si1min100 = new Model.SimpleInterval("", new Model.Intensity(100), duration1min);
var si30s50 = new Model.SimpleInterval("", new Model.Intensity(50), duration30s);

var sbi = new Model.StepBuildInterval("", [si1min80, si1min90, si1min100, si30s50]);
expect_eq_nbr(3, sbi.getRepeatCount());
expect_eq_nbr(3*60 + 3*30, sbi.getDuration().getSeconds());

var step_build_85_100 = Model.IntervalParser.parse(of_bike, `3[(1min, 80, 90, 100), (30s, 50)]`);
expect_eq_nbr(4.7, step_build_85_100.getTSS(), 0.1);
expect_eq_nbr(3*60+3*30, step_build_85_100.getDuration().getSeconds());
expect_eq_nbr(0.85, step_build_85_100.getIntensity().getValue());
expect_true(!step_build_85_100.getIntervals()[0].areAllIntensitiesSame());

var step_build_equal_intensity = Model.IntervalParser.parse(of_bike, `3[(2min, 1min, 1min, 75), (1min, 55)]`);
expect_eq_nbr((2 + 1 + 1) *60 + 3*60, step_build_equal_intensity.getDuration().getSeconds());
expect_true(step_build_equal_intensity.getIntervals()[0].areAllIntensitiesSame());

expect_eq_nbr(1, Model.ZonesVisitor.getZone(Model.SportType.Bike, 0.50));
expect_eq_nbr(2, Model.ZonesVisitor.getZone(Model.SportType.Bike, 0.55));
expect_eq_nbr(3, Model.ZonesVisitor.getZone(Model.SportType.Bike, 0.75));
expect_eq_nbr(4, Model.ZonesVisitor.getZone(Model.SportType.Bike, 0.90));
expect_eq_nbr(5, Model.ZonesVisitor.getZone(Model.SportType.Bike, 1.05));

expect_true(!UI.FieldValidator.validateEmail(""));
expect_true(!UI.FieldValidator.validateEmail("invalid"));
expect_true(!UI.FieldValidator.validateEmail("@bar.com"));
expect_true(UI.FieldValidator.validateEmail("foo@bar.com"));

expect_true(!UI.FieldValidator.validateNumber(""));
expect_true(!UI.FieldValidator.validateNumber("asd123asd"));
expect_true(UI.FieldValidator.validateNumber("123"));

expect_eq_nbr(8, Model.SpeedParser.getSpeedInMph("7:30min/mi"))
expect_eq_nbr(8, Model.SpeedParser.getSpeedInMph("8mi/h"))
expect_eq_nbr(8.44, Model.SpeedParser.getSpeedInMph("4:25min/km"))

var repeat_main_interval = Model.IntervalParser.parse(of_bike, `4[(45s, 75, 100), (15s, 55)]`);
expect_eq_nbr(1, repeat_main_interval.getIntervals().length);
var repeat_interval = repeat_main_interval.getIntervals()[0];
expect_eq_nbr(4, repeat_interval.getRepeatCount());

var units_on_workout = Model.IntervalParser.parse(of_run, `(60min, 6:00min/mi)`);
expect_eq_nbr(3600, units_on_workout.getDuration().getSeconds());
expect_eq_nbr(1, units_on_workout.getIntensity().getValue());

var units_on_workout_spc = Model.IntervalParser.parse(of_run, `(60min, 6:00 min/mi)`);
expect_eq_nbr(3600, units_on_workout_spc.getDuration().getSeconds());
expect_eq_nbr(1, units_on_workout_spc.getIntensity().getValue());

var units_on_workout_2 = Model.IntervalParser.parse(of_run, `(45min, 3:44min/km)`);
expect_eq_nbr(45*60, units_on_workout_2.getDuration().getSeconds());
expect_eq_nbr(1, units_on_workout_2.getIntensity().getValue());


// formatting tests

// simple interval
expect_eq_str("10' easy", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_run, `(10min, 55)`), up, Model.SportType.Bike, Model.IntensityUnit.Watts));
expect_eq_str("10'' rest", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_run, `(10s, rest)`), up, Model.SportType.Bike, Model.IntensityUnit.Watts));
expect_eq_str("10' single leg @ 140w", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_run, `(10min, 45, single leg)`), up, Model.SportType.Bike, Model.IntensityUnit.Watts));
expect_eq_str("10' @ 205w", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_run, `(10min, 65)`), up, Model.SportType.Bike, Model.IntensityUnit.Watts));
expect_eq_str("10' LC @ 235w", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_run, `(10min, 75, LC)`), up, Model.SportType.Bike, Model.IntensityUnit.Watts));
expect_eq_str("10' @ 65%", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_run, `(10min, 65)`), up, Model.SportType.Bike, Model.IntensityUnit.IF));

// ramp build interval
expect_eq_str("10' warmup to 235w", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_run, `(55, 75, 10min)`), up, Model.SportType.Bike, Model.IntensityUnit.Watts));
expect_eq_str("10' build from 235w to 310w", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_run, `(75, 100, 10min)`), up, Model.SportType.Bike, Model.IntensityUnit.Watts));

// repeat interval w/ 2 and 3 elements
expect_eq_str("2 x (5' @ 235w - 2' @ 310w)", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_run, `2[(5min, 75), (2min, 100)]`), up, Model.SportType.Bike, Model.IntensityUnit.Watts));
expect_eq_str("2 x 5' @ 235w - 1' easy", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_run, `2[(5min, 75), (1min, 55)]`), up, Model.SportType.Bike, Model.IntensityUnit.Watts));
expect_eq_str("2 x (5' @ 235w, 2' @ 310w) - w/ 1' easy", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_run, `2[(5min, 75), (2min, 100), (1min, 55)]`), up, Model.SportType.Bike, Model.IntensityUnit.Watts));
expect_eq_str("2 x (5' @ 235w, 2' @ 310w) - w/ 1' @ 205w", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_run, `2[(5min, 75), (2min, 100), (1min, 65)]`), up, Model.SportType.Bike, Model.IntensityUnit.Watts));

// step build (same intensities and same duration)
expect_eq_str("2 x 2' - w/ 1' easy (235w, 265w)", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_run, `2[(75, 85, 2min), (1min, 55)]`), up, Model.SportType.Bike, Model.IntensityUnit.Watts));
expect_eq_str("2 x 235w - w/ 1' easy (1', 3')", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_run, `2[(75, 1min, 3min), (1min, 55)]`), up, Model.SportType.Bike, Model.IntensityUnit.Watts));

// comment
expect_eq_str("Do this in a flat terrain", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_run, `"Do this in a flat terrain"`), up, Model.SportType.Bike, Model.IntensityUnit.IF));
expect_eq_str("Do this in a flat terrain - 10' easy", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_run, `"Do this in a flat terrain", (10min, 55)`), up, Model.SportType.Bike, Model.IntensityUnit.IF));
expect_eq_str("Do this in a flat terrain - 10' easy", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_run, `"Do this in a flat terrain",(10min, 55)`), up, Model.SportType.Bike, Model.IntensityUnit.IF));
expect_eq_str("10' easy - Do this in a flat terrain", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_run, `(10min, 55), "Do this in a flat terrain"`), up, Model.SportType.Bike, Model.IntensityUnit.IF));

// WorkoutTextVisitor
expect_eq_str("8:00min/mi", Model.WorkoutTextVisitor.formatNumber(8, 60, ":", "min/mi", 0));
expect_eq_str("8:00min/mi", Model.WorkoutTextVisitor.formatNumber(8, 60, ":", "min/mi", 5));

expect_eq_str("7:30min/mi", Model.WorkoutTextVisitor.formatNumber(7.5, 60, ":", "min/mi", 0));
expect_eq_str("7:30min/mi", Model.WorkoutTextVisitor.formatNumber(7.5, 60, ":", "min/mi", 5));

expect_eq_str("7:08min/mi", Model.WorkoutTextVisitor.formatNumber(7.13, 60, ":", "min/mi", 0));
expect_eq_str("7:05min/mi", Model.WorkoutTextVisitor.formatNumber(7.13, 60, ":", "min/mi", 5));

expect_eq_str("7:46min/mi", Model.WorkoutTextVisitor.formatNumber(7.77, 60, ":", "min/mi", 0));
expect_eq_str("7:45min/mi", Model.WorkoutTextVisitor.formatNumber(7.77, 60, ":", "min/mi", 5));

expect_eq_str("7:14min/mi", Model.WorkoutTextVisitor.formatNumber(7.23, 60, ":", "min/mi", 0));
expect_eq_str("7:10min/mi", Model.WorkoutTextVisitor.formatNumber(7.23, 60, ":", "min/mi", 5));

// Swim tests (yards)
expect_eq_str("500yards warmup @ 1:34", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_swim, `(500yards, 90, warmup)`), up, Model.SportType.Swim, Model.IntensityUnit.Per100Yards));
expect_eq_str("100yards strong @ 1:25", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_swim, `(100yards, 100, strong)`), up, Model.SportType.Swim, Model.IntensityUnit.Per100Yards));
expect_eq_str("500yards warmup @ 1:35", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_swim, `(500yards, +10, warmup)`), up, Model.SportType.Swim, Model.IntensityUnit.Per100Yards));
expect_eq_str("500yards warmup @ 1:40", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_swim, `(500yards, +15, warmup)`), up, Model.SportType.Swim, Model.IntensityUnit.Per100Yards));
expect_eq_str("500yards warmup @ 1:20", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_swim, `(500yards, -5, warmup)`), up, Model.SportType.Swim, Model.IntensityUnit.Per100Yards));
expect_eq_str("500yards warmup @ 1:15", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_swim, `(500yards, -10, warmup)`), up, Model.SportType.Swim, Model.IntensityUnit.Per100Yards));

expect_eq_str("500yards warmup @ CSS+10", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_swim, `(500yards, +10, warmup)`), up, Model.SportType.Swim, Model.IntensityUnit.IF));
expect_eq_str("100yards strong @ CSS-5", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_swim, `(100yards, -5, strong)`), up, Model.SportType.Swim, Model.IntensityUnit.IF));
expect_eq_str("100yards strong @ CSS", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_swim, `(100yards, +0, strong)`), up, Model.SportType.Swim, Model.IntensityUnit.IF));

expect_eq_nbr(2.41, Model.IntensityUnitHelper.convertTo(1.41, Model.IntensityUnit.Per100Yards, Model.IntensityUnit.Mph));
expect_eq_nbr(1.42, Model.IntensityUnitHelper.convertTo(2.4, Model.IntensityUnit.Mph, Model.IntensityUnit.Per100Yards));

expect_eq_str("1:30/100yards", new Model.Intensity(1, 1.5, Model.IntensityUnit.Per100Yards).toString());

var swim_visitor_mph = new Model.WorkoutTextVisitor(up, Model.SportType.Swim, Model.IntensityUnit.Mph);
var swim_visitor_per100 = new Model.WorkoutTextVisitor(up, Model.SportType.Swim, Model.IntensityUnit.Per100Yards);

expect_eq_str("2.4mi/h", swim_visitor_mph.getIntensityPretty(intensity_100_pct))
expect_eq_str("1:25", swim_visitor_per100.getIntensityPretty(intensity_100_pct))

expect_eq_nbr(2.40, Model.SpeedParser.getSpeedInMph("1:25/100yards"));

expect_eq_nbr(/* 1:25 */ 60 + 25, new Model.ObjectFactory(up, Model.SportType.Swim).createDuration(intensity_100_pct, Model.DurationUnit.Yards, 100).getSeconds());

expect_eq_nbr(425, Model.IntervalParser.parse(of_swim, `(500yards, 100, warmup)`).getDuration().getSeconds());
expect_eq_nbr(425, Model.IntervalParser.parse(of_swim, `(500yards, warmup, 100)`).getDuration().getSeconds());
expect_eq_nbr(11.8, Model.IntervalParser.parse(of_swim, `(500yards, 100, warmup)`).getTSS());
expect_eq_nbr(15.6, Model.IntervalParser.parse(of_swim, `(500yards, 100, warmup), (200yards, 80, easy)`).getTSS());

// Swim tests (meters)
expect_eq_str("500m warmup @ 1:43", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_swim, `(500m, 90, warmup)`), up, Model.SportType.Swim, Model.IntensityUnit.Per100Meters));
expect_eq_str("100m strong @ 1:33", Model.WorkoutTextVisitor.getIntervalTitle(Model.IntervalParser.parse(of_swim, `(100m, 100, strong)`), up, Model.SportType.Swim, Model.IntensityUnit.Per100Meters));

expect_eq_nbr(2.48, Model.IntensityUnitHelper.convertTo(1.5, Model.IntensityUnit.Per100Meters, Model.IntensityUnit.Mph));
expect_eq_nbr(1.5, Model.IntensityUnitHelper.convertTo(2.48, Model.IntensityUnit.Mph, Model.IntensityUnit.Per100Meters));

expect_eq_str("1:30/100m", new Model.Intensity(1, 1.5, Model.IntensityUnit.Per100Meters).toString());

var swim_visitor_mph = new Model.WorkoutTextVisitor(up, Model.SportType.Swim, Model.IntensityUnit.Mph);
var swim_visitor_per100 = new Model.WorkoutTextVisitor(up, Model.SportType.Swim, Model.IntensityUnit.Per100Meters);

expect_eq_str("2.4mi/h", swim_visitor_mph.getIntensityPretty(intensity_100_pct))
expect_eq_str("1:33", swim_visitor_per100.getIntensityPretty(intensity_100_pct))

expect_eq_nbr(2.63, Model.SpeedParser.getSpeedInMph("1:25/100meters"));

expect_eq_nbr(/* 1:32 */ 92.95, new Model.ObjectFactory(up, Model.SportType.Swim).createDuration(intensity_100_pct, Model.DurationUnit.Meters, 100).getSeconds());

expect_eq_nbr(464.78, Model.IntervalParser.parse(of_swim, `(500m, 100, warmup)`).getDuration().getSeconds());
expect_eq_nbr(464.78, Model.IntervalParser.parse(of_swim, `(500m, warmup, 100)`).getDuration().getSeconds());
expect_eq_nbr(12.9, Model.IntervalParser.parse(of_swim, `(500m, 100, warmup)`).getTSS());
expect_eq_nbr(17, Model.IntervalParser.parse(of_swim, `(500m, 100, warmup), (200m, 80, easy)`).getTSS());