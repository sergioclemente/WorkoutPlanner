var m = require('./model');
function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}
function expect_eq_str(a, b) {
    if (a !== b) {
        console.log("a=", JSON.stringify(a));
        console.log("b=", JSON.stringify(b));
        assert(false, "expect_eq failed");
    }
}
function expect_eq_nbr(a, b) {
    var delta = Math.abs(a - b);
    if (delta > 0.01) {
        console.log("a=", JSON.stringify(a));
        console.log("b=", JSON.stringify(b));
        assert(false, "expect_eq_dbl failed");
    }
}
function createSimpleInterval(if_value, secs) {
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
// Parser tests
var up = new m.UserProfile(310, 6);
var of = new m.ObjectFactory(up, m.SportType.Bike);
var int_par = m.IntervalParser.parse(of, "(1hr, 75)");
expect_eq_nbr(57.3, int_par.getTSS());
