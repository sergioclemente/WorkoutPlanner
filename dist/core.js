"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectFactory = exports.UserProfile = exports.SpeedParser = exports.MyMath = exports.stringFormat = exports.FormatterHelper = exports.TimeUnitHelper = exports.IntensityUnitHelper = exports.DistanceUnitHelper = exports.RampBuildInterval = exports.SimpleInterval = exports.CommentInterval = exports.StepBuildInterval = exports.RepeatInterval = exports.ArrayInterval = exports.BaseInterval = exports.Intensity = exports.Duration = exports.DurationUnitHelper = exports.PreconditionsCheck = exports.IntensityUnit = exports.TimeUnit = exports.DistanceUnit = exports.SportType = void 0;
var SportType;
(function (SportType) {
    SportType[SportType["Unknown"] = -1] = "Unknown";
    SportType[SportType["Swim"] = 0] = "Swim";
    SportType[SportType["Bike"] = 1] = "Bike";
    SportType[SportType["Run"] = 2] = "Run";
    SportType[SportType["Other"] = 3] = "Other";
})(SportType = exports.SportType || (exports.SportType = {}));
const MIN_TIME = 11;
const MAX_DISTANCE = 10;
var DistanceUnit;
(function (DistanceUnit) {
    DistanceUnit[DistanceUnit["Unknown"] = 0] = "Unknown";
    DistanceUnit[DistanceUnit["Miles"] = 1] = "Miles";
    DistanceUnit[DistanceUnit["Kilometers"] = 2] = "Kilometers";
    DistanceUnit[DistanceUnit["Meters"] = 3] = "Meters";
    DistanceUnit[DistanceUnit["Yards"] = 4] = "Yards";
})(DistanceUnit = exports.DistanceUnit || (exports.DistanceUnit = {}));
var TimeUnit;
(function (TimeUnit) {
    TimeUnit[TimeUnit["Unknown"] = 11] = "Unknown";
    TimeUnit[TimeUnit["Seconds"] = 12] = "Seconds";
    TimeUnit[TimeUnit["Minutes"] = 13] = "Minutes";
    TimeUnit[TimeUnit["Hours"] = 14] = "Hours";
})(TimeUnit = exports.TimeUnit || (exports.TimeUnit = {}));
var IntensityUnit;
(function (IntensityUnit) {
    IntensityUnit[IntensityUnit["Unknown"] = -1] = "Unknown";
    IntensityUnit[IntensityUnit["IF"] = 0] = "IF";
    IntensityUnit[IntensityUnit["Watts"] = 1] = "Watts";
    IntensityUnit[IntensityUnit["MinMi"] = 2] = "MinMi";
    IntensityUnit[IntensityUnit["Mph"] = 3] = "Mph";
    IntensityUnit[IntensityUnit["Kmh"] = 4] = "Kmh";
    IntensityUnit[IntensityUnit["MinKm"] = 5] = "MinKm";
    IntensityUnit[IntensityUnit["Per25Yards"] = 12] = "Per25Yards";
    IntensityUnit[IntensityUnit["Per100Yards"] = 6] = "Per100Yards";
    IntensityUnit[IntensityUnit["Per100Meters"] = 7] = "Per100Meters";
    IntensityUnit[IntensityUnit["Per400Meters"] = 8] = "Per400Meters";
    IntensityUnit[IntensityUnit["OffsetSeconds"] = 9] = "OffsetSeconds";
    IntensityUnit[IntensityUnit["HeartRate"] = 10] = "HeartRate";
    IntensityUnit[IntensityUnit["FreeRide"] = 11] = "FreeRide";
})(IntensityUnit = exports.IntensityUnit || (exports.IntensityUnit = {}));
class PreconditionsCheck {
    static assertIsNumber(v, name) {
        console.assert(typeof (v) == "number", stringFormat("{0} must be a number, it was {1}", name, typeof (v)));
    }
    static assertIsBoolean(v, name) {
        console.assert(typeof (v) == "boolean", stringFormat("{0} must be a boolean, it was {1}", name, typeof (v)));
    }
    static assertIsString(v, name) {
        console.assert(typeof (v) == "string", stringFormat("{0} must be a string, it was {1}", name, typeof (v)));
    }
    static assertTrue(v) {
        console.assert(v, "Precondition failed");
    }
}
exports.PreconditionsCheck = PreconditionsCheck;
;
class DurationUnitHelper {
    static isTime(durationUnit) {
        return durationUnit >= MIN_TIME;
    }
    static isDistance(durationUnit) {
        return durationUnit <= MAX_DISTANCE;
    }
    static isDurationUnit(unit) {
        return DurationUnitHelper.toDurationUnit(unit) != TimeUnit.Unknown;
    }
    static getDistanceMiles(unit, value) {
        if (DurationUnitHelper.isTime(unit)) {
            return 0;
        }
        else {
            var distance = value;
            if (unit == DistanceUnit.Meters) {
                return DistanceUnitHelper.convertTo(value, DistanceUnit.Meters, DistanceUnit.Miles);
            }
            else if (unit == DistanceUnit.Kilometers) {
                return DistanceUnitHelper.convertTo(value, DistanceUnit.Kilometers, DistanceUnit.Miles);
            }
            else if (unit == DistanceUnit.Yards) {
                return DistanceUnitHelper.convertTo(value, DistanceUnit.Yards, DistanceUnit.Miles);
            }
            else if (unit == DistanceUnit.Miles) {
                return distance;
            }
            else {
                return 0;
            }
        }
    }
    static getDurationSeconds(unit, value) {
        if (DurationUnitHelper.isDistance(unit)) {
            return 0;
        }
        else {
            var time = value;
            if (unit == TimeUnit.Hours) {
                return TimeUnitHelper.convertTo(value, TimeUnit.Hours, TimeUnit.Seconds);
            }
            else if (unit == TimeUnit.Minutes) {
                return TimeUnitHelper.convertTo(value, TimeUnit.Minutes, TimeUnit.Seconds);
            }
            else if (unit == TimeUnit.Seconds) {
                return time;
            }
            else {
                return 0;
            }
        }
    }
    static areDurationUnitsSame(durationUnits) {
        if (durationUnits == null || durationUnits.length <= 1) {
            return true;
        }
        let durationUnit = durationUnits[0];
        for (let i = 1; i < durationUnits.length; ++i) {
            if (durationUnits[i] != durationUnit) {
                return false;
            }
        }
        return true;
    }
    static toString(unit) {
        if (unit == null) {
            return "null";
        }
        switch (unit) {
            case DistanceUnit.Unknown:
            case TimeUnit.Unknown:
                return "Unknown";
            case DistanceUnit.Miles:
                return "mi";
            case DistanceUnit.Kilometers:
                return "km";
            case DistanceUnit.Meters:
                return "m";
            case DistanceUnit.Yards:
                return "yards";
            case TimeUnit.Hours:
                return "h";
            case TimeUnit.Minutes:
                return "min";
            case TimeUnit.Seconds:
                return "s";
        }
    }
    static toDurationUnit(unit) {
        var conversionMap = {
            "mi": DistanceUnit.Miles,
            "km": DistanceUnit.Kilometers,
            "m": DistanceUnit.Meters,
            "meter": DistanceUnit.Meters,
            "meters": DistanceUnit.Meters,
            "h": TimeUnit.Hours,
            "hr": TimeUnit.Hours,
            "hour": TimeUnit.Hours,
            "hours": TimeUnit.Hours,
            "min": TimeUnit.Minutes,
            "sec": TimeUnit.Seconds,
            "s": TimeUnit.Seconds,
            "yards": DistanceUnit.Yards,
            "y": DistanceUnit.Yards,
            "yrd": DistanceUnit.Yards,
        };
        if (unit in conversionMap) {
            return conversionMap[unit];
        }
        else {
            return TimeUnit.Unknown;
        }
    }
}
exports.DurationUnitHelper = DurationUnitHelper;
let Duration = (() => {
    class Duration {
        constructor(unit, value, estimatedDurationInSeconds, estimatedDistanceInMiles) {
            PreconditionsCheck.assertIsNumber(unit, "unit");
            PreconditionsCheck.assertIsNumber(value, "value");
            PreconditionsCheck.assertIsNumber(estimatedDurationInSeconds, "estimatedDurationInSeconds");
            PreconditionsCheck.assertIsNumber(estimatedDistanceInMiles, "estimatedDistanceInMiles");
            this.unit = unit;
            this.value = value;
            if (estimatedDistanceInMiles == 0 && DurationUnitHelper.isDistance(unit)) {
                this.estimatedDistanceInMiles = DurationUnitHelper.getDistanceMiles(unit, value);
            }
            else {
                this.estimatedDistanceInMiles = estimatedDistanceInMiles;
            }
            if (estimatedDurationInSeconds == 0 && DurationUnitHelper.isTime(unit)) {
                this.estimatedDurationInSeconds = DurationUnitHelper.getDurationSeconds(unit, value);
            }
            else {
                this.estimatedDurationInSeconds = estimatedDurationInSeconds;
            }
        }
        getUnit() {
            return this.unit;
        }
        getValue() {
            return this.value;
        }
        getSeconds() {
            if (isNaN(this.estimatedDurationInSeconds) || !isFinite(this.estimatedDurationInSeconds)) {
                return 0;
            }
            return this.estimatedDurationInSeconds;
        }
        getDistanceInMiles() {
            return this.estimatedDistanceInMiles;
        }
        getValueInUnit(unitTo) {
            PreconditionsCheck.assertTrue(unitTo != DistanceUnit.Unknown);
            if (unitTo == DistanceUnit.Unknown) {
                return MyMath.round10(this.value, -1);
            }
            else {
                if (DurationUnitHelper.isDistance(unitTo)) {
                    var value = DistanceUnitHelper.convertTo(this.getDistanceInMiles(), DistanceUnit.Miles, unitTo);
                    return MyMath.round10(value, -1);
                }
                else {
                    return MyMath.round10(this.value, -1);
                }
            }
        }
        toStringDistance(unitTo) {
            return this.getValueInUnit(unitTo) + DurationUnitHelper.toString(unitTo);
        }
        getTimeComponents() {
            var hours = (this.estimatedDurationInSeconds / 3600) | 0;
            return {
                hours: hours,
                minutes: ((this.estimatedDurationInSeconds - hours * 3600) / 60) | 0,
                seconds: (this.estimatedDurationInSeconds % 60) | 0
            };
        }
        toTimeStringLong() {
            var result = "";
            var time = this.getTimeComponents();
            let unit = "";
            if (time.hours != 0) {
                result += time.hours;
                unit = "hr";
            }
            if (time.minutes != 0) {
                if (result.length > 0) {
                    result += ":";
                }
                else {
                    unit = "min";
                }
                result += time.minutes;
            }
            if (time.seconds != 0) {
                if (result.length > 0) {
                    result += ":";
                }
                else {
                    unit = "sec";
                }
                result += time.seconds;
            }
            return result + unit;
        }
        toTimeStringShort() {
            var result = "";
            var time = this.getTimeComponents();
            if (time.hours != 0) {
                return this.toTimeStringLong();
            }
            if (time.minutes != 0) {
                result += time.minutes + "'";
            }
            if (time.seconds != 0) {
                result += FormatterHelper.enforceDigits(time.seconds, 2) + "''";
            }
            return result;
        }
        toStringShort(omitUnit) {
            if (!DurationUnitHelper.isTime(this.unit)) {
                if (omitUnit) {
                    return this.getValueInUnit(this.unit) + "";
                }
                else {
                    return this.toStringDistance(this.unit);
                }
            }
            return this.toTimeStringShort();
        }
        toString() {
            if (DurationUnitHelper.isTime(this.unit)) {
                return this.toTimeStringLong();
            }
            else {
                return this.toStringDistance(this.unit);
            }
        }
        static combine(dur1, dur2) {
            var estTime = dur1.getSeconds() + dur2.getSeconds();
            var estDistance = dur1.getDistanceInMiles() + dur2.getDistanceInMiles();
            if (dur1.getUnit() == dur2.getUnit()) {
                return new Duration(dur1.getUnit(), dur1.getValue() + dur2.getValue(), estTime, estDistance);
            }
            if (dur1.getValue() == 0) {
                return dur2;
            }
            if (dur2.getValue() == 0) {
                return dur1;
            }
            if (DurationUnitHelper.isTime(dur1.getUnit())) {
                if (DurationUnitHelper.isTime(dur2.getUnit())) {
                    var time1 = DurationUnitHelper.getDurationSeconds(dur1.getUnit(), dur1.getValue());
                    var time2 = DurationUnitHelper.getDurationSeconds(dur2.getUnit(), dur2.getValue());
                    return new Duration(TimeUnit.Seconds, time1 + time2, estTime, estDistance);
                }
                else {
                    var time_sum = dur1.getSeconds() + dur2.getSeconds();
                    return new Duration(TimeUnit.Seconds, time_sum, estTime, estDistance);
                }
            }
            else {
                if (DurationUnitHelper.isTime(dur2.getUnit())) {
                    var time_sum = dur1.getSeconds() + dur2.getSeconds();
                    return new Duration(TimeUnit.Seconds, time_sum, estTime, estDistance);
                }
                else {
                    var distance1 = DurationUnitHelper.getDistanceMiles(dur1.getUnit(), dur1.getValue());
                    var distance2 = DurationUnitHelper.getDistanceMiles(dur2.getUnit(), dur2.getValue());
                    return new Duration(DistanceUnit.Miles, distance1 + distance2, estTime, estDistance);
                }
            }
        }
        static combineArray(durations) {
            return durations.reduce(function (prev, cur) {
                return Duration.combine(prev, cur);
            });
        }
    }
    Duration.ZeroDuration = new Duration(TimeUnit.Seconds, 0, 0, 0);
    return Duration;
})();
exports.Duration = Duration;
let Intensity = (() => {
    class Intensity {
        constructor(ifValue = 0, value = 0, unit = IntensityUnit.IF) {
            PreconditionsCheck.assertIsNumber(ifValue, "ifValue");
            PreconditionsCheck.assertIsNumber(value, "value");
            PreconditionsCheck.assertIsNumber(unit, "unit");
            if (ifValue > 10) {
                ifValue = ifValue / 100;
            }
            console.assert(ifValue <= 2 && ifValue >= 0, stringFormat("Invalid if {0}", ifValue));
            if (unit == IntensityUnit.IF) {
                if (value > 10) {
                    value = value / 100;
                }
                if (value == 0) {
                    value = ifValue;
                }
                this.ifValue = ifValue;
                this.originalUnit = IntensityUnit.IF;
                this.originalValue = value;
            }
            else {
                this.ifValue = ifValue;
                this.originalUnit = unit;
                this.originalValue = value;
            }
        }
        getValue() {
            return this.ifValue;
        }
        toString() {
            if (this.originalUnit == IntensityUnit.IF) {
                return MyMath.round10(100 * this.originalValue, -1) + "%";
            }
            else {
                if (this.originalUnit == IntensityUnit.MinMi) {
                    return FormatterHelper.formatNumber(this.originalValue, 60, ":", IntensityUnitHelper.toString(IntensityUnit.MinMi));
                }
                else if (this.originalUnit == IntensityUnit.Per100Yards || this.originalUnit == IntensityUnit.Per100Meters || this.originalUnit == IntensityUnit.Per400Meters || this.originalUnit == IntensityUnit.Per25Yards) {
                    return FormatterHelper.formatNumber(this.originalValue, 60, ":", IntensityUnitHelper.toString(this.originalUnit));
                }
                else {
                    if (this.originalUnit == IntensityUnit.OffsetSeconds) {
                        if (this.originalValue > 0) {
                            return stringFormat("CSS+{0}", this.originalValue);
                        }
                        else if (this.originalValue < 0) {
                            return stringFormat("CSS{0}", this.originalValue);
                        }
                        else {
                            return "CSS";
                        }
                    }
                    else if (this.originalUnit == IntensityUnit.FreeRide) {
                        return "*";
                    }
                    else {
                        return MyMath.round10(this.originalValue, -1) + IntensityUnitHelper.toString(this.originalUnit);
                    }
                }
            }
        }
        getOriginalUnit() {
            return this.originalUnit;
        }
        getOriginalValue() {
            return this.originalValue;
        }
        static combine(intensities, weights) {
            if (weights.length != intensities.length) {
                console.assert(false, "The size of intensities and weights should be the same");
                throw new Error("The size of intensities and weights should be the same");
            }
            var sum1 = 0;
            var sum2 = 0;
            for (var i = 0; i < intensities.length; i++) {
                sum1 += Math.pow(intensities[i].ifValue, 2) * weights[i];
                sum2 += weights[i];
            }
            if (sum1 == 0) {
                return Intensity.ZeroIntensity;
            }
            return new Intensity(Math.sqrt(sum1 / sum2));
        }
        isEasy() {
            return Intensity.equals(this, Intensity.EasyIntensity);
        }
        static equals(i1, i2) {
            return (i1.ifValue == i2.ifValue
                && i1.originalValue == i2.originalValue
                && i1.originalUnit == i2.originalUnit);
        }
    }
    Intensity.ZeroIntensity = new Intensity(0, 0, IntensityUnit.IF);
    Intensity.EasyIntensity = new Intensity(0.01, -1, IntensityUnit.IF);
    return Intensity;
})();
exports.Intensity = Intensity;
class BaseInterval {
    constructor(title) {
        this.title = title;
    }
    getTitle() {
        return this.title;
    }
    getRestDuration() {
        return Duration.ZeroDuration;
    }
    getTotalDuration() {
        return Duration.combine(this.getWorkDuration(), this.getRestDuration());
    }
}
exports.BaseInterval = BaseInterval;
class ArrayInterval {
    constructor(title, intervals) {
        this.title = title;
        this.intervals = intervals;
    }
    getIntensity() {
        var intensities = this.intervals.map(function (value) {
            return value.getIntensity();
        });
        var weights = this.intervals.map(function (value) {
            return value.getWorkDuration().getSeconds();
        });
        return Intensity.combine(intensities, weights);
    }
    getWorkDuration() {
        if (this.intervals.length == 0) {
            return Duration.ZeroDuration;
        }
        var res = this.intervals.reduce(function (previousValue, currentValue) {
            var duration = Duration.combine(previousValue.getWorkDuration(), currentValue.getWorkDuration());
            return new SimpleInterval("", Intensity.ZeroIntensity, duration, Duration.ZeroDuration);
        });
        return res.getWorkDuration();
    }
    getRestDuration() {
        let durations = this.intervals.map(function (cur) {
            return cur.getRestDuration();
        });
        return Duration.combineArray(durations);
    }
    getTotalDuration() {
        return Duration.combine(this.getWorkDuration(), this.getRestDuration());
    }
    getTitle() {
        return this.title;
    }
    getIntervals() {
        return this.intervals;
    }
}
exports.ArrayInterval = ArrayInterval;
class RepeatInterval extends ArrayInterval {
    constructor(title, mainInterval, restInterval, repeatCount) {
        var intervals = [];
        if (mainInterval != null) {
            intervals.push(mainInterval);
        }
        if (restInterval != null) {
            intervals.push(restInterval);
        }
        super(title, intervals);
        this.repeatCount = repeatCount;
    }
    getWorkDuration() {
        var baseDuration = super.getWorkDuration();
        var durationRaw = baseDuration.getValue() * this.repeatCount;
        var durationSecs = baseDuration.getSeconds() * this.repeatCount;
        var durationMiles = baseDuration.getDistanceInMiles() * this.repeatCount;
        return new Duration(baseDuration.getUnit(), durationRaw, durationSecs, durationMiles);
    }
    getRestDuration() {
        var baseDuration = super.getRestDuration();
        var durationRaw = baseDuration.getValue() * this.repeatCount;
        var durationSecs = baseDuration.getSeconds() * this.repeatCount;
        var durationMiles = baseDuration.getDistanceInMiles() * this.repeatCount;
        return new Duration(baseDuration.getUnit(), durationRaw, durationSecs, durationMiles);
    }
    getRepeatCount() {
        return this.repeatCount;
    }
}
exports.RepeatInterval = RepeatInterval;
class StepBuildInterval extends ArrayInterval {
    constructor(title, intervals) {
        super(title, intervals);
    }
    getIntensity() {
        var intensities = this.intervals.map(function (value) {
            return value.getIntensity();
        });
        var repeatCount = this.getRepeatCount();
        var weights = this.intervals.map(function (value) {
            return value.getWorkDuration().getSeconds() * repeatCount;
        });
        return Intensity.combine(intensities, weights);
    }
    getRepeatCount() {
        return this.intervals.length - 1;
    }
    getStepInterval(idx) {
        return this.intervals[idx];
    }
    getRestInterval() {
        return this.intervals[this.intervals.length - 1];
    }
    areAllIntensitiesSame() {
        var first_intensity = this.intervals[0].getIntensity().getValue();
        for (var i = 1; i < this.intervals.length - 1; i++) {
            var cur_intensity = this.intervals[i].getIntensity().getValue();
            if (cur_intensity != first_intensity) {
                return false;
            }
        }
        return true;
    }
    areAllDurationsSame() {
        let first_duration = this.intervals[0].getWorkDuration().getSeconds();
        for (var i = 1; i < this.intervals.length - 1; i++) {
            var cur_duration = this.intervals[i].getWorkDuration();
            if (cur_duration.getSeconds() != first_duration) {
                return false;
            }
        }
        return true;
    }
    getWorkDuration() {
        var durations = [];
        for (var i = 0; i < this.intervals.length; i++) {
            durations[i] = this.intervals[i].getWorkDuration();
        }
        if (durations.length < 2) {
            return durations[0];
        }
        else if (durations.length <= 2) {
            return Duration.combine(durations[0], durations[1]);
        }
        else {
            var duration = Duration.combine(durations[0], durations[1]);
            for (var i = 2; i < durations.length - 1; i++) {
                duration = Duration.combine(duration, durations[i]);
            }
            for (var i = 0; i < this.getRepeatCount(); i++) {
                duration = Duration.combine(duration, durations[durations.length - 1]);
            }
            return duration;
        }
    }
}
exports.StepBuildInterval = StepBuildInterval;
class CommentInterval extends BaseInterval {
    constructor(title) {
        super(title);
    }
    getIntensity() {
        return Intensity.ZeroIntensity;
    }
    getWorkDuration() {
        return Duration.ZeroDuration;
    }
}
exports.CommentInterval = CommentInterval;
class SimpleInterval extends BaseInterval {
    constructor(title, intensity, duration, restDuration) {
        super(title);
        this.intensity = intensity;
        this.duration = duration;
        this.restDuration = restDuration;
    }
    getIntensity() {
        return this.intensity;
    }
    getWorkDuration() {
        return this.duration;
    }
    getRestDuration() {
        return this.restDuration;
    }
}
exports.SimpleInterval = SimpleInterval;
class RampBuildInterval extends BaseInterval {
    constructor(title, startIntensity, endIntensity, work_duration, rest_duration) {
        super(title);
        this.startIntensity = startIntensity;
        this.endIntensity = endIntensity;
        this.work_duration = work_duration;
        this.rest_duration = rest_duration;
    }
    getIntensity() {
        return RampBuildInterval.computeAverageIntensity(this.startIntensity, this.endIntensity);
    }
    getWorkDuration() {
        return this.work_duration;
    }
    getRestDuration() {
        return this.rest_duration;
    }
    getStartIntensity() {
        return this.startIntensity;
    }
    getEndIntensity() {
        return this.endIntensity;
    }
    static computeAverageIntensity(intensity1, intensity2) {
        return Intensity.combine([intensity1, intensity2], [1, 1]);
    }
}
exports.RampBuildInterval = RampBuildInterval;
class DistanceUnitHelper {
    static convertTo(value, unitFrom, unitTo) {
        var distanceInMeters = 0;
        if (unitFrom == DistanceUnit.Kilometers) {
            distanceInMeters = value * 1000;
        }
        else if (unitFrom == DistanceUnit.Meters) {
            distanceInMeters = value;
        }
        else if (unitFrom == DistanceUnit.Miles) {
            distanceInMeters = value * 1609.344;
        }
        else if (unitFrom == DistanceUnit.Yards) {
            distanceInMeters = value * 0.9144;
        }
        else {
            console.assert(false, stringFormat("Unknown unitFrom {0}", unitFrom));
            throw new Error("Unknown distance unit");
        }
        if (unitTo == DistanceUnit.Kilometers) {
            return distanceInMeters / 1000;
        }
        else if (unitTo == DistanceUnit.Meters) {
            return distanceInMeters;
        }
        else if (unitTo == DistanceUnit.Miles) {
            return distanceInMeters / 1609.344;
        }
        else if (unitTo == DistanceUnit.Yards) {
            return distanceInMeters / 0.9144;
        }
        else {
            return -1;
        }
    }
}
exports.DistanceUnitHelper = DistanceUnitHelper;
class IntensityUnitHelper {
    static convertTo(value, unitFrom, unitTo) {
        var invalidUnitsForConversion = [
            IntensityUnit.Unknown,
            IntensityUnit.IF,
            IntensityUnit.Watts
        ];
        if (invalidUnitsForConversion.indexOf(unitFrom) != -1
            || invalidUnitsForConversion.indexOf(unitTo) != -1) {
            var msg = stringFormat("Invalid unitFrom({0}) or unitTo({1}) for conversion", unitFrom, unitTo);
            console.assert(false, msg);
            throw new Error(msg);
        }
        var speedMph = 0;
        if (unitFrom == IntensityUnit.Mph) {
            speedMph = value;
        }
        else if (unitFrom == IntensityUnit.MinMi) {
            speedMph = 60 / value;
        }
        else if (unitFrom == IntensityUnit.Kmh) {
            speedMph = DistanceUnitHelper.convertTo(value, DistanceUnit.Kilometers, DistanceUnit.Miles);
        }
        else if (unitFrom == IntensityUnit.MinKm) {
            speedMph = DistanceUnitHelper.convertTo(60 / value, DistanceUnit.Kilometers, DistanceUnit.Miles);
        }
        else if (unitFrom == IntensityUnit.Per25Yards) {
            speedMph = DistanceUnitHelper.convertTo(1500 / value, DistanceUnit.Yards, DistanceUnit.Miles);
        }
        else if (unitFrom == IntensityUnit.Per100Yards) {
            speedMph = DistanceUnitHelper.convertTo(6000 / value, DistanceUnit.Yards, DistanceUnit.Miles);
        }
        else if (unitFrom == IntensityUnit.Per100Meters) {
            speedMph = DistanceUnitHelper.convertTo(6000 / value, DistanceUnit.Meters, DistanceUnit.Miles);
        }
        else if (unitFrom == IntensityUnit.Per400Meters) {
            speedMph = DistanceUnitHelper.convertTo((4 * 6000) / value, DistanceUnit.Meters, DistanceUnit.Miles);
        }
        else {
            console.assert(false, stringFormat("Unknown intensity unit {0}", unitFrom));
            throw new Error("Unknown IntensityUnit!");
        }
        var result = 0;
        if (unitTo == IntensityUnit.Mph) {
            result = speedMph;
        }
        else if (unitTo == IntensityUnit.MinMi) {
            result = 60 / speedMph;
        }
        else if (unitTo == IntensityUnit.Kmh) {
            result = DistanceUnitHelper.convertTo(speedMph, DistanceUnit.Miles, DistanceUnit.Kilometers);
        }
        else if (unitTo == IntensityUnit.MinKm) {
            result = 60 / DistanceUnitHelper.convertTo(speedMph, DistanceUnit.Miles, DistanceUnit.Kilometers);
        }
        else if (unitTo == IntensityUnit.Per25Yards) {
            result = 1500 / DistanceUnitHelper.convertTo(speedMph, DistanceUnit.Miles, DistanceUnit.Yards);
        }
        else if (unitTo == IntensityUnit.Per100Yards) {
            result = 6000 / DistanceUnitHelper.convertTo(speedMph, DistanceUnit.Miles, DistanceUnit.Yards);
        }
        else if (unitTo == IntensityUnit.Per100Meters) {
            result = 6000 / DistanceUnitHelper.convertTo(speedMph, DistanceUnit.Miles, DistanceUnit.Meters);
        }
        else if (unitTo == IntensityUnit.Per400Meters) {
            result = 400 / (DistanceUnitHelper.convertTo(speedMph, DistanceUnit.Miles, DistanceUnit.Meters) / 60);
        }
        else {
            console.assert(false, stringFormat("Unknown intensity unit {0}", unitTo));
            throw new Error("Unknown IntensityUnit!");
        }
        return result;
    }
    static toString(unit) {
        if (unit == null) {
            return "null";
        }
        PreconditionsCheck.assertIsNumber(unit, "unit");
        switch (unit) {
            case IntensityUnit.Unknown:
                return "Unknown";
            case IntensityUnit.IF:
                return "%";
            case IntensityUnit.Watts:
                return "w";
            case IntensityUnit.MinMi:
                return "min/mi";
            case IntensityUnit.Mph:
                return "mi/h";
            case IntensityUnit.Kmh:
                return "km/h";
            case IntensityUnit.MinKm:
                return "min/km";
            case IntensityUnit.Per25Yards:
                return "/25yards";
            case IntensityUnit.Per100Yards:
                return "/100yards";
            case IntensityUnit.Per100Meters:
                return "/100meters";
            case IntensityUnit.Per400Meters:
                return "/400meters";
            case IntensityUnit.OffsetSeconds:
                return "offset-seconds";
            case IntensityUnit.HeartRate:
                return "hr";
            case IntensityUnit.FreeRide:
                return "free-ride";
        }
    }
    static toIntensityUnit(unit) {
        var conversionMap = {
            "w": IntensityUnit.Watts,
            "watts": IntensityUnit.Watts,
            "%": IntensityUnit.IF,
            "min/mi": IntensityUnit.MinMi,
            "mi/hr": IntensityUnit.Mph,
            "mph": IntensityUnit.Mph,
            "km/hr": IntensityUnit.Kmh,
            "min/km": IntensityUnit.MinKm,
            "/25yards": IntensityUnit.Per25Yards,
            "/100yards": IntensityUnit.Per100Yards,
            "/100meters": IntensityUnit.Per100Meters,
            "/400meters": IntensityUnit.Per400Meters,
            "/400m": IntensityUnit.Per400Meters,
            "offset": IntensityUnit.OffsetSeconds,
            "hr": IntensityUnit.HeartRate,
            "heart rate": IntensityUnit.HeartRate,
            "bpm": IntensityUnit.HeartRate,
            "free-ride": IntensityUnit.FreeRide,
            "fr": IntensityUnit.FreeRide,
        };
        if (unit in conversionMap) {
            return conversionMap[unit];
        }
        else {
            return IntensityUnit.Unknown;
        }
    }
    static isIntensityUnit(unit) {
        return IntensityUnitHelper.toIntensityUnit(unit) != IntensityUnit.Unknown;
    }
}
exports.IntensityUnitHelper = IntensityUnitHelper;
;
class TimeUnitHelper {
    static convertTo(value, unitFrom, unitTo) {
        var timeInSeconds = 0;
        if (unitFrom == TimeUnit.Seconds) {
            timeInSeconds = value;
        }
        else if (unitFrom == TimeUnit.Minutes) {
            timeInSeconds = value * 60;
        }
        else if (unitFrom == TimeUnit.Hours) {
            timeInSeconds = value * 3600;
        }
        else {
            console.assert(false, "Unknown unitFrom {0}", unitFrom);
            throw new Error("Unknown time unit");
        }
        if (unitTo == TimeUnit.Seconds) {
            return timeInSeconds;
        }
        else if (unitTo == TimeUnit.Minutes) {
            return timeInSeconds / 60;
        }
        else if (unitTo == TimeUnit.Hours) {
            return timeInSeconds / 3600;
        }
        else {
            return -1;
        }
    }
}
exports.TimeUnitHelper = TimeUnitHelper;
class FormatterHelper {
    static roundNumberUp(value, round_val = 0) {
        if (round_val != 0) {
            var mod = value % round_val;
            if (mod != 0) {
                value += round_val - mod;
            }
        }
        return value;
    }
    static roundNumberDown(value, round_val = 0) {
        if (round_val != 0) {
            var mod = value % round_val;
            if (mod != 0) {
                value -= mod;
            }
        }
        return value;
    }
    static formatNumber(value, decimalMultiplier, separator, unit, round_val = 0) {
        var integerPart = Math.floor(value);
        var fractionPart = FormatterHelper.roundNumberDown(Math.round(decimalMultiplier * (value - integerPart)), round_val);
        return integerPart + separator + FormatterHelper.enforceDigits(fractionPart, 2) + unit;
    }
    static enforceDigits(value, digits) {
        var result = value + "";
        if (result.length > digits) {
            return result.substring(0, digits);
        }
        else {
            while (result.length < digits) {
                result = "0" + result;
            }
            return result;
        }
    }
    static formatTime(milliseconds) {
        var hours = ((milliseconds / 3600000) % 60) | 0;
        var minutes = ((milliseconds / 60000) % 60) | 0;
        var seconds = ((milliseconds % 60000) / 1000) | 0;
        var ms = (milliseconds % 1000) | 0;
        if (ms > 500) {
            seconds++;
        }
        if (hours != 0) {
            return FormatterHelper.enforceDigits(hours, 2) + ":" + FormatterHelper.enforceDigits(minutes, 2) + ":" + FormatterHelper.enforceDigits(seconds, 2);
        }
        else {
            if (minutes != 0) {
                return FormatterHelper.enforceDigits(minutes, 2) + "m" + FormatterHelper.enforceDigits(seconds, 2) + "s";
            }
            else {
                return seconds + "s";
            }
        }
    }
}
exports.FormatterHelper = FormatterHelper;
function stringFormat(format, ...args) {
    return format.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match;
    });
}
exports.stringFormat = stringFormat;
class MyMath {
    static decimalAdjust(type, value, exp) {
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        let values = value.toString().split('e');
        value = Math[type](+(values[0] + 'e' + (values[1] ? (+values[1] - exp) : -exp)));
        values = value.toString().split('e');
        return +(values[0] + 'e' + (values[1] ? (+values[1] + exp) : exp));
    }
    static round10(value, exp) {
        return MyMath.decimalAdjust('round', value, exp);
    }
    static floor10(value, exp) {
        return MyMath.decimalAdjust('floor', value, exp);
    }
    static ceil10(value, exp) {
        return MyMath.decimalAdjust('ceil', value, exp);
    }
}
exports.MyMath = MyMath;
class SpeedParser {
    static getSpeedInMph(speed) {
        var res = null;
        try {
            if (speed.indexOf("min/mi") != -1) {
                res = 60 / this._extractNumber(speed, 60, ":", "min/mi");
            }
            else if (speed.indexOf("km/h") != -1) {
                res = this._extractNumber(speed, 100, ".", "km/h") / 1.609344;
            }
            else if (speed.indexOf("mi/h") != -1) {
                res = this._extractNumber(speed, 100, ".", "mi/h");
            }
            else if (speed.indexOf("min/km") != -1) {
                res = (60 / (this._extractNumber(speed, 60, ":", "min/km") * 1.609344));
            }
            else if (speed.indexOf("/400meters") != -1 || speed.indexOf("/400m") != -1) {
                let suffix = "/400meters";
                if (speed.indexOf("/400m") != -1) {
                    suffix = "/400m";
                }
                res = (60 / (this._extractNumber(speed, 60, ":", suffix) * 2.5 * 1.609344));
            }
            else if (speed.indexOf("/25yards") != -1) {
                var pace_per_25_yards = this._extractNumber(speed, 60, ":", "/25yards");
                res = IntensityUnitHelper.convertTo(pace_per_25_yards, IntensityUnit.Per25Yards, IntensityUnit.Mph);
            }
            else if (speed.indexOf("/100yards") != -1) {
                var pace_per_100_yards = this._extractNumber(speed, 60, ":", "/100yards");
                res = IntensityUnitHelper.convertTo(pace_per_100_yards, IntensityUnit.Per100Yards, IntensityUnit.Mph);
            }
            else if (speed.indexOf("/100meters") != -1) {
                var pace_per_100_meters = this._extractNumber(speed, 60, ":", "/100meters");
                res = IntensityUnitHelper.convertTo(pace_per_100_meters, IntensityUnit.Per100Meters, IntensityUnit.Mph);
            }
            else {
                console.assert(false);
            }
        }
        catch (e) {
        }
        return res;
    }
    static _extractNumber(numberString, decimalMultiplier, strSeparator, strSuffix) {
        var indexSuffix = numberString.indexOf(strSuffix);
        var indexSeparator = numberString.indexOf(strSeparator);
        if (indexSuffix < 0) {
            return null;
        }
        var fractionPart;
        if (indexSeparator < 0) {
            indexSeparator = indexSuffix;
            fractionPart = 0;
        }
        else {
            fractionPart = parseInt(numberString.substr(indexSeparator + 1, indexSuffix - indexSeparator - 1));
        }
        var integerPart = parseInt(numberString.substr(0, indexSeparator));
        return integerPart + fractionPart / decimalMultiplier;
    }
}
exports.SpeedParser = SpeedParser;
class UserProfile {
    constructor(bikeFTPWatts, runningTPace, swimmingFTP, swimCSS, email) {
        this.bikeFTP = bikeFTPWatts;
        var speed_mph = SpeedParser.getSpeedInMph(runningTPace);
        this.runningTPaceMinMi = IntensityUnitHelper.convertTo(speed_mph, IntensityUnit.Mph, IntensityUnit.MinMi);
        this.swimmingFTP = swimmingFTP;
        var swim_css_mph = SpeedParser.getSpeedInMph(swimCSS);
        this.swimmingCSSMinPer100Yards = IntensityUnitHelper.convertTo(swim_css_mph, IntensityUnit.Mph, IntensityUnit.Per100Yards);
        this.email = email;
    }
    setEfficiencyFactor(efficiencyFactor) {
        this.effiencyFactor = efficiencyFactor;
    }
    getEfficiencyFactor() {
        return this.effiencyFactor;
    }
    getBikeFTP() {
        return this.bikeFTP;
    }
    getRunningTPaceMinMi() {
        return this.runningTPaceMinMi;
    }
    getRunnintTPaceMph() {
        return IntensityUnitHelper.convertTo(this.getRunningTPaceMinMi(), IntensityUnit.MinMi, IntensityUnit.Mph);
    }
    getEmail() {
        return this.email;
    }
    getPaceMph(intensity) {
        var estPaceMinMi = this.getPaceMinMi(intensity);
        return 60 / estPaceMinMi;
    }
    getRunningPace(intensity, outputUnit) {
        let pace_mph = this.getPaceMph(intensity);
        return IntensityUnitHelper.convertTo(pace_mph, IntensityUnit.Mph, outputUnit);
    }
    getPaceMinMi(intensity) {
        var pace_mph = IntensityUnitHelper.convertTo(this.getRunningTPaceMinMi(), IntensityUnit.MinMi, IntensityUnit.Mph) * intensity.getValue();
        return IntensityUnitHelper.convertTo(pace_mph, IntensityUnit.Mph, IntensityUnit.MinMi);
    }
    getSwimFTP() {
        return this.swimmingFTP;
    }
    getSwimCSSMph() {
        var css_mph = IntensityUnitHelper.convertTo(this.swimmingCSSMinPer100Yards, IntensityUnit.Per100Yards, IntensityUnit.Mph);
        return css_mph;
    }
    getSwimPaceMph(intensity) {
        var css_mph = IntensityUnitHelper.convertTo(this.swimmingCSSMinPer100Yards, IntensityUnit.Per100Yards, IntensityUnit.Mph);
        return css_mph * intensity.getValue();
    }
    getSwimPace(intensity_unit_result, intensity) {
        var pace_mph = this.getSwimCSSMph() * intensity.getValue();
        return IntensityUnitHelper.convertTo(pace_mph, IntensityUnit.Mph, intensity_unit_result);
    }
}
exports.UserProfile = UserProfile;
class ObjectFactory {
    constructor(userProfile, sportType) {
        this.userProfile = userProfile;
        this.sportType = sportType;
    }
    getBikeSpeedMphForIntensity(intensity) {
        var actualSpeedMph = 0;
        if (intensity.getValue() < 0.65) {
            actualSpeedMph = 15;
        }
        else {
            actualSpeedMph = 20;
        }
        return actualSpeedMph;
    }
    getSportType() {
        return this.sportType;
    }
    getUserProfile() {
        return this.userProfile;
    }
    createIntensity(value, unit) {
        var ifValue = 0;
        if (unit == IntensityUnit.FreeRide) {
            return new Intensity(value, 0, IntensityUnit.FreeRide);
        }
        if (this.sportType == SportType.Bike) {
            if (unit == IntensityUnit.Watts) {
                ifValue = value / this.userProfile.getBikeFTP();
            }
            else if (unit == IntensityUnit.IF) {
                ifValue = value;
            }
            else {
                console.assert(false, stringFormat("Invalid unit {0}", unit));
                throw new Error("Invalid unit : " + unit);
            }
        }
        else if (this.sportType == SportType.Run) {
            var running_tpace_mph = IntensityUnitHelper.convertTo(this.userProfile.getRunningTPaceMinMi(), IntensityUnit.MinMi, IntensityUnit.Mph);
            if (unit == IntensityUnit.IF) {
                ifValue = value;
            }
            else if (unit == IntensityUnit.MinMi) {
                var running_mph = IntensityUnitHelper.convertTo(value, IntensityUnit.MinMi, IntensityUnit.Mph);
                ifValue = running_mph / running_tpace_mph;
            }
            else if (unit == IntensityUnit.Mph) {
                ifValue = value / running_tpace_mph;
            }
            else if (unit == IntensityUnit.MinKm) {
                var running_mph = IntensityUnitHelper.convertTo(value, IntensityUnit.MinKm, IntensityUnit.Mph);
                ifValue = running_mph / running_tpace_mph;
            }
            else if (unit == IntensityUnit.Per400Meters) {
                var running_mph = IntensityUnitHelper.convertTo(value, IntensityUnit.Per400Meters, IntensityUnit.Mph);
                ifValue = running_mph / running_tpace_mph;
            }
            else {
                console.assert(false, stringFormat("Unit {0} is not implemented"));
                throw new Error("Not implemented");
            }
        }
        else if (this.sportType == SportType.Swim) {
            if (unit == IntensityUnit.Watts) {
                ifValue = value / this.userProfile.getSwimFTP();
            }
            else if (unit == IntensityUnit.IF) {
                ifValue = value;
            }
            else if (unit == IntensityUnit.Per100Yards || unit == IntensityUnit.Per100Meters || unit == IntensityUnit.Per25Yards) {
                var swimming_mph = IntensityUnitHelper.convertTo(value, unit, IntensityUnit.Mph);
                var swimming_mph_css = this.userProfile.getSwimCSSMph();
                ifValue = swimming_mph / swimming_mph_css;
            }
            else if (unit == IntensityUnit.Mph) {
                ifValue = value / this.userProfile.getSwimCSSMph();
            }
            else if (unit == IntensityUnit.OffsetSeconds) {
                var speed_per_100_yards = this.userProfile.getSwimPace(IntensityUnit.Per100Yards, new Intensity(1));
                speed_per_100_yards += value / 60;
                var speed_mph = IntensityUnitHelper.convertTo(speed_per_100_yards, IntensityUnit.Per100Yards, IntensityUnit.Mph);
                ifValue = speed_mph / this.userProfile.getSwimCSSMph();
            }
            else {
                console.assert(false, stringFormat("Invalid intensity unit {0}", unit));
            }
        }
        else {
            console.assert(this.sportType == SportType.Other);
            console.assert(unit == IntensityUnit.IF);
            ifValue = value;
        }
        return new Intensity(ifValue, value, unit);
    }
    createDuration(intensity, unit, value) {
        PreconditionsCheck.assertTrue(typeof (intensity) != 'undefined');
        PreconditionsCheck.assertIsNumber(value, "value");
        var estimatedDistanceInMiles = 0;
        var estimatedTimeInSeconds = 0;
        var estimatedSpeedMph;
        if (this.sportType == SportType.Bike) {
            estimatedSpeedMph = this.getBikeSpeedMphForIntensity(intensity);
        }
        else if (this.sportType == SportType.Run) {
            estimatedSpeedMph = this.userProfile.getPaceMph(intensity);
        }
        else if (this.sportType == SportType.Swim) {
            estimatedSpeedMph = this.userProfile.getSwimPaceMph(intensity);
        }
        else {
            console.assert(this.sportType == SportType.Other);
            estimatedSpeedMph = 0;
        }
        if (DurationUnitHelper.isTime(unit)) {
            estimatedTimeInSeconds = DurationUnitHelper.getDurationSeconds(unit, value);
            estimatedDistanceInMiles = estimatedSpeedMph * (estimatedTimeInSeconds / 3600);
        }
        else {
            estimatedDistanceInMiles = DurationUnitHelper.getDistanceMiles(unit, value);
            estimatedTimeInSeconds = 3600 * (estimatedDistanceInMiles / estimatedSpeedMph);
        }
        return new Duration(unit, value, estimatedTimeInSeconds, estimatedDistanceInMiles);
    }
}
exports.ObjectFactory = ObjectFactory;
