/// <reference path="./type_definitions/node.d.ts" />
var Model = require("./model");
var UI = require("./ui");
function expect_true(condition, message) {
    if (message === void 0) { message = "Expect true failed"; }
    if (!condition) {
        console.log(message);
        console.trace();
    }
}
function expect_eq_str(expected, actual) {
    if (expected !== actual) {
        console.log("expected=", JSON.stringify(expected));
        console.log("actual=", JSON.stringify(actual));
        expect_true(false, "expect_eq_str failed");
    }
}
function expect_eq_nbr(expected, actual, error) {
    if (error === void 0) { error = 0.01; }
    var delta = Math.abs(expected - actual);
    if (delta > error) {
        console.log("expected=", JSON.stringify(expected));
        console.log("actual=", JSON.stringify(actual));
        expect_true(false, "expect_eq_nbr failed");
    }
}
function createSimpleInterval(if_value, secs) {
    var i = new Model.Intensity(if_value, if_value);
    var dur = new Model.Duration(Model.DurationUnit.Seconds, secs, secs, -1 /* distance */);
    return new Model.SimpleInterval("", i, dur);
}
var res = null;
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
var up = new Model.UserProfile(310, "6:00min/mi");
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
for (var i = 50; i <= 100; i = i + 5) {
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
// MRC testing
var zwift = new Model.ZwiftDataVisitor("untitled_workout");
var zwift_interval = Model.IntervalParser.parse(of_bike, "(10min, 55, 75), (1hr, 80), (5min, 75, 55)");
Model.VisitorHelper.visit(zwift, zwift_interval);
zwift.finalize();
var expected_content = "<workout_file>\n\t<author>Workout Planner Author</author>\n\t<name>untitled_workout</name>\n\t<description>Auto generated by https://github.com/sergioclemente/WorkoutPlanner</description>\n\t<tags>\n\t\t<tag name=\"INTERVALS\"/>\n\t</tags>\n\t<workout>\n\t\t<Warmup Duration='600' PowerLow='0.55' PowerHigh='0.75'/>\n\t\t<SteadyState Duration='3600' Power='0.8'>\n\t\t\t<textevent timeoffset='0' message='80% for 1hr'/>\n\t\t</SteadyState>\n\t\t<Cooldown Duration='300' PowerLow='0.75' PowerHigh='0.55'/>\n\t</workout>\n</workout_file>";
expect_eq_str(expected_content, zwift.getContent());
// Repeat interval bug
var repeat_85_1 = Model.IntervalParser.parse(of_bike, "1[(1hr, 85)]");
var repeat_85_2 = Model.IntervalParser.parse(of_bike, "2[(1hr, 85)]");
expect_true(repeat_85_1.getIntervals()[0] instanceof Model.RepeatInterval);
expect_eq_nbr(72.2, repeat_85_1.getTSS());
expect_eq_nbr(3600, repeat_85_1.getDuration().getSeconds());
expect_eq_nbr(0.85, repeat_85_1.getIntensity().getValue());
expect_eq_nbr(144.5, repeat_85_2.getTSS());
expect_eq_nbr(2 * 3600, repeat_85_2.getDuration().getSeconds());
expect_eq_nbr(0.85, repeat_85_2.getIntensity().getValue());
var baseLinePlusRepeat = Model.IntervalParser.parse(of_bike, "(1hr, 75) 2[(1hr, 85)]");
expect_eq_nbr(200.8, baseLinePlusRepeat.getTSS(), 0.1);
expect_eq_nbr(3 * 3600, baseLinePlusRepeat.getDuration().getSeconds());
expect_eq_nbr(0.816, baseLinePlusRepeat.getIntensity().getValue());
// TSS accumulation over the second not average if
var onehr85 = Model.IntervalParser.parse(of_bike, "(1hr, 86)");
expect_eq_nbr(74, onehr85.getTSS(), 0.1);
expect_eq_nbr(0.86, onehr85.getIntensity().getValue());
expect_eq_nbr(3600, onehr85.getDuration().getSeconds());
var onehr85ButHighTSS = Model.IntervalParser.parse(of_bike, "(30min, 60), (30min, 100)");
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
expect_eq_nbr(3 * 60 + 3 * 30, sbi.getDuration().getSeconds());
var step_build_85_100 = Model.IntervalParser.parse(of_bike, "3[(1min, 80, 90, 100), (30s, 50)]");
expect_eq_nbr(4.7, step_build_85_100.getTSS(), 0.1);
expect_eq_nbr(3 * 60 + 3 * 30, step_build_85_100.getDuration().getSeconds());
expect_eq_nbr(0.85, step_build_85_100.getIntensity().getValue());
expect_true(!step_build_85_100.getIntervals()[0].areAllIntensitiesSame());
var step_build_equal_intensity = Model.IntervalParser.parse(of_bike, "3[(2min, 1min, 1min, 75), (1min, 55)]");
expect_eq_nbr((2 + 1 + 1) * 60 + 3 * 60, step_build_equal_intensity.getDuration().getSeconds());
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
expect_eq_nbr(8, Model.SpeedParser.getSpeedInMph("7:30min/mi"));
expect_eq_nbr(8, Model.SpeedParser.getSpeedInMph("8mi/h"));
expect_eq_nbr(8.44, Model.SpeedParser.getSpeedInMph("4:25min/km"));
var repeat_main_interval = Model.IntervalParser.parse(of_bike, "4[(45s, 75, 100), (15s, 55)]");
expect_eq_nbr(1, repeat_main_interval.getIntervals().length);
var repeat_interval = repeat_main_interval.getIntervals()[0];
expect_eq_nbr(4, repeat_interval.getRepeatCount());
var units_on_workout = Model.IntervalParser.parse(of_run, "(60min, 6:00min/mi)");
expect_eq_nbr(3600, units_on_workout.getDuration().getSeconds());
expect_eq_nbr(1, units_on_workout.getIntensity().getValue());
var units_on_workout_spc = Model.IntervalParser.parse(of_run, "(60min, 6:00 min/mi)");
expect_eq_nbr(3600, units_on_workout_spc.getDuration().getSeconds());
expect_eq_nbr(1, units_on_workout_spc.getIntensity().getValue());
var units_on_workout_2 = Model.IntervalParser.parse(of_run, "(45min, 3:44min/km)");
expect_eq_nbr(45 * 60, units_on_workout_2.getDuration().getSeconds());
expect_eq_nbr(1, units_on_workout_2.getIntensity().getValue());
