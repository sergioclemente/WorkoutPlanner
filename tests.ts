var m = require('./model');

function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}

function expect_eq_str(expected : string, actual : string) {
	if (expected !== actual) {
		console.log("expected=", JSON.stringify(expected));
		console.log("actual=", JSON.stringify(actual));
		assert(false, "expect_eq_str failed");
	}
}

function expect_eq_nbr(expected : number, actual : number) {
	var delta = Math.abs(expected - actual);
	if (delta > 0.01) {
		console.log("expected=", JSON.stringify(expected));
		console.log("actual=", JSON.stringify(actual));
		assert(false, "expect_eq_nbr failed");
	}
}

function createSimpleInterval(if_value : number, secs : number) {
	var i = new m.Intensity(if_value, if_value);
	var dur = new m.Duration(m.DurationUnit.Seconds, secs, secs, -1 /* distance */);
	return new m.SimpleInterval("", i, dur);
}

var res = null;

// DistanceUnitHelper tests
res = m.DistanceUnitHelper.convertTo(1000, m.DistanceUnit.Miles, m.DistanceUnit.Kilometers);
expect_eq_nbr(1609.344, res);

// TimeUnitHelper tests
res = m.TimeUnitHelper.convertTo(1, m.TimeUnit.Hours, m.TimeUnit.Seconds); 
expect_eq_nbr(3600, res);

// Intensity
var i90 = new m.Intensity(0.90, 0.90);
var i80 = new m.Intensity(0.80, 0.80);

res = m.Intensity.combine([i90, i80], [1, 1]).getValue();
expect_eq_nbr(0.85, res);

// TSS tests
var int1hri75 = new m.ArrayInterval("", [createSimpleInterval(0.75, 3600)]);
expect_eq_nbr(56.3, int1hri75.getTSS());

var int1hri85 = new m.ArrayInterval("", [createSimpleInterval(0.85, 3600)]);
expect_eq_nbr(72.2, int1hri85.getTSS());

// IntervalParser
expect_eq_nbr(123, m.IntervalParser.parseDouble("123", 0).value);
expect_eq_nbr(123.456, m.IntervalParser.parseDouble("123.456", 0).value);

// Parser tests
var up = new m.UserProfile(310, 6);
var of_bike = new m.ObjectFactory(up, m.SportType.Bike);
var of_run = new m.ObjectFactory(up, m.SportType.Run);

var int_par_1hr_75 = m.IntervalParser.parse(of_bike, "(1hr, 75)");
expect_eq_nbr(56.3, int_par_1hr_75.getTSS());

var int_par_2hr_75_85 = m.IntervalParser.parse(of_bike, "(1hr, 75), (1hr, 85)");
expect_eq_nbr(56.3 + 72.2, int_par_2hr_75_85.getTSS());


// UserProfile 
var up_6tpace = new m.UserProfile(310, 6);
expect_eq_nbr(6, up_6tpace.getPaceMinMi(new m.Intensity(1, 1)));
expect_eq_nbr(7.05, up_6tpace.getPaceMinMi(new m.Intensity(0.85, 0.85)));
expect_eq_nbr(8, up_6tpace.getPaceMinMi(new m.Intensity(0.75, 0.75)));

for (var i = 50; i <= 100; i=i+5) {
	var garbage = new m.UserProfile(310, 6);
	var ifv = i / 100.0;
	console.log("IF:" + i + ": " +  garbage.getPaceMinMi(new m.Intensity(ifv, ifv)));
}

var int_par_bug = m.IntervalParser.parse(of_bike, "(1hr, 75), (20mi, 85)");
expect_eq_nbr(2, int_par_bug.getIntensities().length);

// Parsing of units bug
var int_par_unit_bike = m.IntervalParser.parse(of_bike, "(1s, 50), (2s, 155w), (3s, 50%)");
expect_eq_nbr(m.IntensityUnit.IF, int_par_unit_bike.getIntervals()[0].getIntensity().originalUnit);
expect_eq_nbr(0.5, int_par_unit_bike.getIntervals()[0].getIntensity().originalValue);

expect_eq_nbr(m.IntensityUnit.Watts, int_par_unit_bike.getIntervals()[1].getIntensity().originalUnit);
expect_eq_nbr(155, int_par_unit_bike.getIntervals()[1].getIntensity().originalValue);

expect_eq_nbr(m.IntensityUnit.IF, int_par_unit_bike.getIntervals()[2].getIntensity().originalUnit);
expect_eq_nbr(0.5, int_par_unit_bike.getIntervals()[2].getIntensity().originalValue);

var int_par_unit_run = m.IntervalParser.parse(of_run, "(4s, 10mph), (5s, 6min/mi)");
expect_eq_nbr(m.IntensityUnit.Mph, int_par_unit_run.getIntervals()[0].getIntensity().originalUnit);
expect_eq_nbr(10, int_par_unit_run.getIntervals()[0].getIntensity().originalValue);

expect_eq_nbr(m.IntensityUnit.MinMi, int_par_unit_run.getIntervals()[1].getIntensity().originalUnit);
expect_eq_nbr(6, int_par_unit_run.getIntervals()[1].getIntensity().originalValue);

