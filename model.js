"use strict";
var Model;
(function (Model) {
    // TODO: Add other
    (function (SportType) {
        SportType[SportType["Unknown"] = -1] = "Unknown";
        SportType[SportType["Swim"] = 0] = "Swim";
        SportType[SportType["Bike"] = 1] = "Bike";
        SportType[SportType["Run"] = 2] = "Run";
    })(Model.SportType || (Model.SportType = {}));
    var SportType = Model.SportType;
    // If you add another distance, make sure you update the MAX_DISTANCE
    // and that it doesn't overlap with TimeUnit
    (function (DistanceUnit) {
        DistanceUnit[DistanceUnit["Unknown"] = 0] = "Unknown";
        DistanceUnit[DistanceUnit["Miles"] = 1] = "Miles";
        DistanceUnit[DistanceUnit["Kilometers"] = 2] = "Kilometers";
        DistanceUnit[DistanceUnit["Meters"] = 3] = "Meters";
        DistanceUnit[DistanceUnit["Yards"] = 4] = "Yards";
    })(Model.DistanceUnit || (Model.DistanceUnit = {}));
    var DistanceUnit = Model.DistanceUnit;
    // If you add another time unit, be careful not adding one before MIN_TIME
    (function (TimeUnit) {
        TimeUnit[TimeUnit["Unknown"] = 11] = "Unknown";
        TimeUnit[TimeUnit["Seconds"] = 12] = "Seconds";
        TimeUnit[TimeUnit["Minutes"] = 13] = "Minutes";
        TimeUnit[TimeUnit["Hours"] = 14] = "Hours";
    })(Model.TimeUnit || (Model.TimeUnit = {}));
    var TimeUnit = Model.TimeUnit;
    const MIN_TIME = 10;
    const MAX_DISTANCE = 10;
    (function (IntensityUnit) {
        IntensityUnit[IntensityUnit["Unknown"] = -1] = "Unknown";
        IntensityUnit[IntensityUnit["IF"] = 0] = "IF";
        IntensityUnit[IntensityUnit["Watts"] = 1] = "Watts";
        IntensityUnit[IntensityUnit["MinMi"] = 2] = "MinMi";
        IntensityUnit[IntensityUnit["Mph"] = 3] = "Mph";
        IntensityUnit[IntensityUnit["Kmh"] = 4] = "Kmh";
        IntensityUnit[IntensityUnit["MinKm"] = 5] = "MinKm";
        IntensityUnit[IntensityUnit["Per100Yards"] = 6] = "Per100Yards";
        IntensityUnit[IntensityUnit["Per100Meters"] = 7] = "Per100Meters";
        IntensityUnit[IntensityUnit["OffsetSeconds"] = 8] = "OffsetSeconds";
        IntensityUnit[IntensityUnit["HeartRate"] = 9] = "HeartRate";
    })(Model.IntensityUnit || (Model.IntensityUnit = {}));
    var IntensityUnit = Model.IntensityUnit;
    (function (RunningPaceUnit) {
        RunningPaceUnit[RunningPaceUnit["Unknown"] = 0] = "Unknown";
        RunningPaceUnit[RunningPaceUnit["MinMi"] = 1] = "MinMi";
        RunningPaceUnit[RunningPaceUnit["Mph"] = 2] = "Mph";
        RunningPaceUnit[RunningPaceUnit["MinKm"] = 3] = "MinKm";
        RunningPaceUnit[RunningPaceUnit["KmHr"] = 4] = "KmHr";
    })(Model.RunningPaceUnit || (Model.RunningPaceUnit = {}));
    var RunningPaceUnit = Model.RunningPaceUnit;
    class MyMath {
        /**
         * Decimal adjustment of a number.
         *
         * @param   {String}    type    The type of adjustment.
         * @param   {Number}    value   The number.
         * @param   {Integer}   exp     The exponent (the 10 logarithm of the adjustment base).
         * @returns {Number}            The adjusted value.
         */
        static decimalAdjust(type, value, exp) {
            // If the exp is undefined or zero...
            if (typeof exp === 'undefined' || +exp === 0) {
                return Math[type](value);
            }
            value = +value;
            exp = +exp;
            // If the value is not a number or the exp is not an integer...
            if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
                return NaN;
            }
            // Shift
            value = value.toString().split('e');
            value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
            // Shift back
            value = value.toString().split('e');
            return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
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
    Model.MyMath = MyMath;
    class SportTypeHelper {
        static convertToString(sportType) {
            if (sportType == SportType.Bike) {
                return "Bike";
            }
            else if (sportType == SportType.Run) {
                return "Run";
            }
            else if (sportType == SportType.Swim) {
                return "Swim";
            }
            else {
                console.assert(false);
                return "";
            }
        }
    }
    Model.SportTypeHelper = SportTypeHelper;
    class DistanceUnitHelper {
        static convertTo(value, unitFrom, unitTo) {
            // convert first to meters
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
            // convert to final unit
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
    Model.DistanceUnitHelper = DistanceUnitHelper;
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
            // convert to final unit
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
    Model.TimeUnitHelper = TimeUnitHelper;
    function getStringFromDurationUnit(unit) {
        switch (unit) {
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
            default:
                console.assert(false, stringFormat("unkown duration {0}", unit));
                return "unknown";
        }
    }
    class DurationUnitHelper {
        static isTime(durationUnit) {
            return durationUnit >= MIN_TIME;
        }
        static isDistance(durationUnit) {
            return durationUnit <= MAX_DISTANCE;
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
    }
    Model.DurationUnitHelper = DurationUnitHelper;
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
            // Round up
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
    Model.FormatterHelper = FormatterHelper;
    class Duration {
        constructor(unit, value, estimatedDurationInSeconds, estimatedDistanceInMiles) {
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
            return this.estimatedDurationInSeconds;
        }
        getDistanceInMiles() {
            return this.estimatedDistanceInMiles;
        }
        toStringDistance(unitTo = DistanceUnit.Unknown) {
            if (DurationUnitHelper.isDistance(this.unit)) {
                if (unitTo == DistanceUnit.Unknown) {
                    return MyMath.round10(this.value, -1) + getStringFromDurationUnit(this.unit);
                }
                else {
                    if (unitTo == DistanceUnit.Yards) {
                        var yards = DistanceUnitHelper.convertTo(this.getDistanceInMiles(), DistanceUnit.Miles, DistanceUnit.Yards);
                        return MyMath.round10(yards, -1) + getStringFromDurationUnit(DistanceUnit.Yards);
                    }
                    else {
                        return MyMath.round10(this.value, -1) + getStringFromDurationUnit(this.unit);
                    }
                }
            }
            else {
                return MyMath.round10(this.estimatedDistanceInMiles, -1) + getStringFromDurationUnit(DistanceUnit.Miles);
            }
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
            if (time.hours != 0) {
                result += time.hours + "hr";
            }
            if (time.minutes != 0) {
                result += time.minutes + "min";
            }
            if (time.seconds != 0) {
                result += time.seconds + "sec";
            }
            return result;
        }
        toStringShort() {
            if (!DurationUnitHelper.isTime(this.unit)) {
                return this.toStringDistance();
            }
            var result = "";
            var time = this.getTimeComponents();
            if (time.hours != 0) {
                return this.toTimeStringLong();
            }
            if (time.minutes != 0) {
                result += time.minutes + "'";
            }
            if (time.seconds != 0) {
                result += time.seconds + "''";
            }
            return result;
        }
        toString() {
            if (DurationUnitHelper.isTime(this.unit)) {
                return this.toTimeStringLong();
            }
            else {
                return this.toStringDistance();
            }
        }
        static combine(dur1, dur2) {
            var estTime = dur1.getSeconds() + dur2.getSeconds();
            var estDistance = dur1.getDistanceInMiles() + dur2.getDistanceInMiles();
            if (DurationUnitHelper.isTime(dur1.getUnit())) {
                if (DurationUnitHelper.isTime(dur2.getUnit())) {
                    // Both are Time
                    // Convert both to seconds
                    var time1 = DurationUnitHelper.getDurationSeconds(dur1.getUnit(), dur1.getValue());
                    var time2 = DurationUnitHelper.getDurationSeconds(dur2.getUnit(), dur2.getValue());
                    return new Duration(TimeUnit.Seconds, time1 + time2, estTime, estDistance);
                }
                else {
                    // Use the unit of time in case is different
                    return new Duration(TimeUnit.Seconds, estTime, estTime, estDistance);
                }
            }
            else {
                if (DurationUnitHelper.isTime(dur2.getUnit())) {
                    // Use the unit of time in case is different
                    return new Duration(TimeUnit.Seconds, estTime, estTime, estDistance);
                }
                else {
                    var distance1 = DurationUnitHelper.getDistanceMiles(dur1.getUnit(), dur1.getValue());
                    var distance2 = DurationUnitHelper.getDistanceMiles(dur2.getUnit(), dur2.getValue());
                    return new Duration(DistanceUnit.Miles, distance1 + distance2, estTime, estDistance);
                }
            }
        }
    }
    Model.Duration = Duration;
    function getStringFromIntensityUnit(unit) {
        switch (unit) {
            case IntensityUnit.Watts:
                return "w";
            case IntensityUnit.IF:
                return "%";
            case IntensityUnit.MinMi:
                return "min/mi";
            case IntensityUnit.Mph:
                return "mi/hr";
            case IntensityUnit.Kmh:
                return "km/hr";
            case IntensityUnit.MinKm:
                return "min/km";
            case IntensityUnit.Per100Yards:
                return "/100yards";
            case IntensityUnit.Per100Meters:
                return "/100meters";
            case IntensityUnit.HeartRate:
                return "hr";
            default:
                console.assert(false, stringFormat("Unknown intensity unit {0}", unit));
                return "unknown";
        }
    }
    function getDurationUnitFromString(unit) {
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
    function getIntensityUnitFromString(unit) {
        var conversionMap = {
            "w": IntensityUnit.Watts,
            "watts": IntensityUnit.Watts,
            "%": IntensityUnit.IF,
            "min/mi": IntensityUnit.MinMi,
            "mi/hr": IntensityUnit.Mph,
            "mph": IntensityUnit.Mph,
            "km/hr": IntensityUnit.Kmh,
            "min/km": IntensityUnit.MinKm,
            "/100yards": IntensityUnit.Per100Yards,
            "/100meters": IntensityUnit.Per100Meters,
            "offset": IntensityUnit.OffsetSeconds,
            "hr": IntensityUnit.HeartRate,
            "heart rate": IntensityUnit.HeartRate,
            "bpm": IntensityUnit.HeartRate
        };
        if (unit in conversionMap) {
            return conversionMap[unit];
        }
        else {
            return IntensityUnit.Unknown;
        }
    }
    function getIntensityUnit(unit) {
        if (unit == IntensityUnit.Watts) {
            return "w";
        }
        else if (unit == IntensityUnit.IF) {
            return "%";
        }
        else if (unit == IntensityUnit.MinMi) {
            return "min/mi";
        }
        else if (unit == IntensityUnit.Mph) {
            return "mi/h";
        }
        else if (unit == IntensityUnit.MinKm) {
            return "min/km";
        }
        else if (unit == IntensityUnit.Kmh) {
            return "km/h";
        }
        else if (unit == IntensityUnit.Per100Yards) {
            return "/100yards";
        }
        else if (unit == IntensityUnit.Per100Meters) {
            return "/100m";
        }
        else if (unit == IntensityUnit.HeartRate) {
            return "hr";
        }
        else {
            console.assert(false, stringFormat("Invalid intensity unit {0}", unit));
        }
    }
    function isDurationUnit(value) {
        return getDurationUnitFromString(value) != TimeUnit.Unknown;
    }
    function isIntensityUnit(value) {
        return getIntensityUnitFromString(value) != IntensityUnit.Unknown;
    }
    function stringFormat(format, ...args) {
        return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match;
        });
    }
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
            else if (unitFrom == IntensityUnit.Per100Yards) {
                speedMph = DistanceUnitHelper.convertTo(6000 / value, DistanceUnit.Yards, DistanceUnit.Miles);
            }
            else if (unitFrom == IntensityUnit.Per100Meters) {
                speedMph = DistanceUnitHelper.convertTo(6000 / value, DistanceUnit.Meters, DistanceUnit.Miles);
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
            else if (unitTo == IntensityUnit.Per100Yards) {
                result = 6000 / DistanceUnitHelper.convertTo(speedMph, DistanceUnit.Miles, DistanceUnit.Yards);
            }
            else if (unitTo == IntensityUnit.Per100Meters) {
                result = 6000 / DistanceUnitHelper.convertTo(speedMph, DistanceUnit.Miles, DistanceUnit.Meters);
            }
            else {
                console.assert(false, stringFormat("Unknown intensity unit {0}", unitTo));
                throw new Error("Unknown IntensityUnit!");
            }
            return result;
        }
    }
    Model.IntensityUnitHelper = IntensityUnitHelper;
    ;
    class DefaultIntensity {
        static isEasy(intensity, sportType) {
            // If the pace is swim based and its on offset relative to the CSS, lets handle it 
            // differently. 10s from CSS is the threshold for easy.
            if (sportType == SportType.Swim
                && intensity.getOriginalUnit() == IntensityUnit.OffsetSeconds) {
                return intensity.getOriginalValue() > 10;
            }
            return intensity.getValue() <= DefaultIntensity.getEasyThreshold(sportType);
        }
        static getEasyThreshold(sportType) {
            var easyThreshold = 0.55;
            if (sportType == SportType.Run) {
                easyThreshold = 0.75;
            }
            else if (sportType == SportType.Swim) {
                easyThreshold = 0.88;
            }
            return easyThreshold;
        }
    }
    Model.DefaultIntensity = DefaultIntensity;
    class Intensity {
        constructor(ifValue = 0, value = 0, unit = IntensityUnit.IF) {
            // HACK: Find a better way of doing this
            if (ifValue > 10) {
                ifValue = ifValue / 100;
            }
            console.assert(ifValue <= 2 && ifValue >= 0, stringFormat("Invalid if {0}", ifValue));
            if (unit == IntensityUnit.IF) {
                // HACK: Find a better way of doing this
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
        /**
         * A value between 0 and 1 that represents the intensity of the interval
         */
        getValue() {
            return this.ifValue;
        }
        toString() {
            if (this.originalUnit == IntensityUnit.IF) {
                return MyMath.round10(100 * this.originalValue, -1) + "%";
            }
            else {
                if (this.originalUnit == IntensityUnit.MinMi) {
                    return FormatterHelper.formatNumber(this.originalValue, 60, ":", getIntensityUnit(IntensityUnit.MinMi));
                }
                else if (this.originalUnit == IntensityUnit.Per100Yards || this.originalUnit == IntensityUnit.Per100Meters) {
                    return FormatterHelper.formatNumber(this.originalValue, 60, ":", getIntensityUnit(this.originalUnit));
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
                    else {
                        return MyMath.round10(this.originalValue, -1) + getStringFromIntensityUnit(this.originalUnit);
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
            // do a weighed sum
            var sum1 = 0;
            var sum2 = 0;
            for (var i = 0; i < intensities.length; i++) {
                sum1 += Math.pow(intensities[i].ifValue, 2) * weights[i];
                sum2 += weights[i];
            }
            return new Intensity(Math.sqrt(sum1 / sum2));
        }
    }
    Model.Intensity = Intensity;
    class BaseInterval {
        constructor(title) {
            this.title = title;
        }
        getTitle() {
            return this.title;
        }
        getIntensity() {
            // not aware that typescript supports abstract methods
            throw new Error("not implemented");
        }
        getDuration() {
            // not aware that typescript supports abstract methods
            throw new Error("not implemented");
        }
    }
    Model.BaseInterval = BaseInterval;
    class CommentInterval extends BaseInterval {
        constructor(title) {
            super(title);
        }
        getIntensity() {
            return new Intensity(0, 0, IntensityUnit.IF);
        }
        getDuration() {
            return new Duration(TimeUnit.Seconds, 0, 0, 0);
        }
    }
    Model.CommentInterval = CommentInterval;
    class SimpleInterval extends BaseInterval {
        constructor(title, intensity, duration) {
            super(title);
            this.intensity = intensity;
            this.duration = duration;
        }
        getIntensity() {
            return this.intensity;
        }
        getDuration() {
            return this.duration;
        }
    }
    Model.SimpleInterval = SimpleInterval;
    class RampBuildInterval extends BaseInterval {
        constructor(title, startIntensity, endIntensity, duration) {
            super(title);
            this.startIntensity = startIntensity;
            this.endIntensity = endIntensity;
            this.duration = duration;
        }
        getIntensity() {
            return RampBuildInterval.computeAverageIntensity(this.startIntensity, this.endIntensity);
        }
        getDuration() {
            return this.duration;
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
    Model.RampBuildInterval = RampBuildInterval;
    class Point {
        constructor(x, y, label) {
            this.x = x;
            this.y = y;
            this.label = label;
        }
    }
    Model.Point = Point;
    class ArrayInterval {
        constructor(title, intervals) {
            this.title = title;
            this.intervals = intervals;
        }
        getIntensity() {
            var intensities = this.intervals.map(function (value, index, array) {
                return value.getIntensity();
            });
            var weights = this.intervals.map(function (value, index, array) {
                return value.getDuration().getSeconds();
            });
            return Intensity.combine(intensities, weights);
        }
        getDuration() {
            // If the interval is empty lets bail right away otherwise reducing the array will cause an
            // exception
            if (this.intervals.length == 0) {
                return new Duration(TimeUnit.Seconds, 0, 0, 0);
            }
            // It will create dummy intervals along the way so that I can use
            // the reduce abstraction		
            var res = this.intervals.reduce(function (previousValue, currentValue) {
                var duration = Duration.combine(previousValue.getDuration(), currentValue.getDuration());
                // Create a dummy interval with the proper duration
                return new SimpleInterval("", new Intensity(0), duration);
            });
            return res.getDuration();
        }
        getTitle() {
            return this.title;
        }
        getIntervals() {
            return this.intervals;
        }
        getTSS() {
            var tssVisitor = new TSSVisitor();
            VisitorHelper.visitAndFinalize(tssVisitor, this);
            return tssVisitor.getTSS();
        }
        getTSSFromIF() {
            var tss_from_if = (this.getIntensity().getValue() * this.getIntensity().getValue() * this.getDuration().getSeconds()) / 36;
            return MyMath.round10(tss_from_if, -1);
        }
        getIntensities() {
            var iv = new IntensitiesVisitor();
            VisitorHelper.visitAndFinalize(iv, this);
            return iv.getIntensities();
        }
        getTimeSeries() {
            var pv = new DataPointVisitor();
            VisitorHelper.visitAndFinalize(pv, this);
            // TODO: Massaging the data here to show in minutes
            return pv.data.map(function (item) {
                return {
                    x: item.x.getSeconds() / 60,
                    y: Math.round(item.y.getValue() * 100),
                };
            });
        }
        getTimeInZones(sportType) {
            var zv = new ZonesVisitor(sportType);
            VisitorHelper.visitAndFinalize(zv, this);
            return zv.getTimeInZones();
        }
    }
    Model.ArrayInterval = ArrayInterval;
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
        getDuration() {
            var baseDuration = super.getDuration();
            var durationRaw = baseDuration.getValue() * this.repeatCount;
            var durationSecs = baseDuration.getSeconds() * this.repeatCount;
            var durationMiles = baseDuration.getDistanceInMiles() * this.repeatCount;
            return new Duration(baseDuration.getUnit(), durationRaw, durationSecs, durationMiles);
        }
        getRepeatCount() {
            return this.repeatCount;
        }
    }
    Model.RepeatInterval = RepeatInterval;
    // Step is defined as follows
    // 2[(1min, 85, 95), (30s, 55)]
    // Which in fact translates to:
    // * 1min @ 85
    // * 30s @ 55
    // * 1min @ 95
    // * 30s @ 55
    class StepBuildInterval extends ArrayInterval {
        // The constructor receives the step intervals, the rest will be added later on
        // so that for the above interval it will look like:
        // [(1min, 85), (1min, 95), (30s, 55)]
        constructor(title, intervals) {
            super(title, intervals);
        }
        getIntensity() {
            var intensities = this.intervals.map(function (value, index, array) {
                return value.getIntensity();
            });
            var repeatCount = this.getRepeatCount();
            var weights = this.intervals.map(function (value, index, array) {
                return value.getDuration().getSeconds() * repeatCount;
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
        getDuration() {
            var durations = [];
            for (var i = 0; i < this.intervals.length; i++) {
                durations[i] = this.intervals[i].getDuration();
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
    Model.StepBuildInterval = StepBuildInterval;
    class NumberParser {
        evaluate(input, i) {
            this.value = 0;
            for (; i < input.length; i++) {
                var ch = input[i];
                if (IntervalParser.isDigit(ch)) {
                    this.value = this.value * 10 + IntervalParser.getCharVal(ch) - IntervalParser.getCharVal("0");
                }
                else if (ch == ".") {
                    i++;
                    var base = 10;
                    for (; i < input.length; i++) {
                        var ch = input[i];
                        if (IntervalParser.isDigit(ch)) {
                            this.value = this.value + (IntervalParser.getCharVal(ch) - IntervalParser.getCharVal("0")) / base;
                            base = base * 10;
                        }
                        else {
                            break;
                        }
                    }
                    break;
                }
                else {
                    break;
                }
            }
            // Points to the last valid char
            return i - 1;
        }
        getValue() {
            return this.value;
        }
    }
    Model.NumberParser = NumberParser;
    class StringChunkParser {
        constructor(delimiters) {
            this.delimiters = delimiters;
        }
        evaluate(input, i) {
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
        getValue() {
            return this.value;
        }
    }
    Model.StringChunkParser = StringChunkParser;
    class IntensityParser {
        evaluate(input, i) {
            var num_parser = new NumberParser();
            i = num_parser.evaluate(input, i);
            this.value = num_parser.getValue();
            // Parse the unit
            // Check for :
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
            // look for a unit
            this.unit = "";
            for (var j = i + 1; j < input.length; j++) {
                // check for letters or (slashes/percent)
                // this will cover for example: 
                // 210w
                // 75w
                // 10mph
                // 6min/mi
                if (IntervalParser.isLetter(input[j])
                    || input[j] == "%"
                    || input[j] == "/") {
                    this.unit += input[j];
                }
                else {
                    break;
                }
            }
            return i + this.unit.length;
        }
        getValue() {
            return this.value;
        }
        getUnit() {
            return this.unit;
        }
    }
    Model.IntensityParser = IntensityParser;
    class IntervalParser {
        static getCharVal(ch) {
            if (ch.length == 1) {
                return ch.charCodeAt(0);
            }
            else {
                return 0;
            }
        }
        static isDigit(ch) {
            return ch.length == 1 &&
                IntervalParser.getCharVal(ch) >= IntervalParser.getCharVal("0") &&
                IntervalParser.getCharVal(ch) <= IntervalParser.getCharVal("9");
        }
        static isLetter(ch) {
            return ch.length == 1 &&
                IntervalParser.getCharVal(ch) >= IntervalParser.getCharVal("a") &&
                IntervalParser.getCharVal(ch) <= IntervalParser.getCharVal("z");
        }
        static parseDouble(input, i) {
            var p = new NumberParser();
            var pos = p.evaluate(input, i);
            return { i: pos, value: p.getValue() };
        }
        static isWhitespace(ch) {
            return ch.length == 1 && (ch == " " || ch == "\t" || ch == "\n");
        }
        static throwParserError(column, msg) {
            throw Error("Error while parsing input on column " + column + "-  Error: " + msg);
        }
        static parse(factory, input) {
            var result = new ArrayInterval("Workout", []);
            var stack = [];
            stack.push(result);
            for (var i = 0; i < input.length; i++) {
                var ch = input[i];
                if (ch == "(") {
                    i++;
                    var nums = {};
                    var units = {};
                    var title = "";
                    var numIndex = 0;
                    for (; i < input.length; i++) {
                        ch = input[i];
                        if (ch == ")") {
                            // simple workout completed, pop element from stack and create
                            var interval;
                            var durationValues = [];
                            var durationUnits = [];
                            var intensities = [];
                            // Do we have the units?
                            var containsUnit = false;
                            // Tries to guess where is the time and where is the intensity
                            // The assumption here is that intensity will likely be bigger
                            // than time. For example: 65% for 60min
                            var minIndex = -1;
                            var minValue = 9999999999999;
                            for (var k = 0; k < Object.keys(units).length; k++) {
                                containsUnit = containsUnit || units[k] != "";
                                if (nums[k] < minValue) {
                                    minValue = nums[k];
                                    minIndex = k;
                                }
                            }
                            // Patch the missing units now.
                            if (!containsUnit) {
                                for (var k = 0; k < Object.keys(units).length; k++) {
                                    if (units[k] == "") {
                                        if (k == minIndex) {
                                            units[k] = "min";
                                        }
                                        else {
                                            units[k] = "%";
                                        }
                                    }
                                }
                            }
                            // Handle properly the duration unit
                            for (var k = 0; k < Object.keys(units).length; k++) {
                                if (isDurationUnit(units[k])) {
                                    durationUnits.push(getDurationUnitFromString(units[k]));
                                    durationValues.push(nums[k]);
                                }
                                else if (nums[k] > 0) {
                                    var intensityUnit = IntensityUnit.IF;
                                    if (isIntensityUnit(units[k])) {
                                        intensityUnit = getIntensityUnitFromString(units[k]);
                                    }
                                    intensities.push(factory.createIntensity(nums[k], intensityUnit));
                                }
                                else {
                                    var unit = getIntensityUnitFromString(units[k]);
                                    if (unit == IntensityUnit.OffsetSeconds) {
                                        intensities.push(factory.createIntensity(nums[k], IntensityUnit.OffsetSeconds));
                                    }
                                }
                            }
                            // Take a peek at the top of the stack
                            if (stack[stack.length - 1] instanceof RepeatInterval) {
                                var repeatInterval = (stack[stack.length - 1]);
                                // There is ambiguity in the following interval:
                                // 2[(45s, 75, 100), (15s, 55)]
                                // It could be two types of intervals:
                                // 1) 2x (Ramp from 75% to 100% with 15s rest)
                                // or
                                // 2) 2x (45s @ 75% and 100% w/ 15s rest)
                                // Will assume the former, since the latter is less common.
                                if (repeatInterval.getRepeatCount() > 1 &&
                                    (intensities.length == repeatInterval.getRepeatCount()
                                        || durationValues.length == repeatInterval.getRepeatCount())) {
                                    // OK this should not be a RepeatInterval, it should be
                                    // a StepBuildInterval instead
                                    // Remove the ArrayInterval from the top and from the parent
                                    stack.pop();
                                    stack[stack.length - 1].getIntervals().pop();
                                    // add the new intervals
                                    var step_intervals = [];
                                    for (var k = 0; k < repeatInterval.getRepeatCount(); k++) {
                                        var durationUnit = k < durationUnits.length ? durationUnits[k] : durationUnits[0];
                                        var durationValue = k < durationValues.length ? durationValues[k] : durationValues[0];
                                        var intensity = k < intensities.length ? intensities[k] : intensities[0];
                                        var step_duration = factory.createDuration(intensity, durationUnit, durationValue);
                                        step_intervals.push(new SimpleInterval(title.trim(), intensity, step_duration));
                                    }
                                    var bsi = new StepBuildInterval(title.trim(), step_intervals);
                                    // put back to the parent and top of the stack
                                    stack[stack.length - 1].getIntervals().push(bsi);
                                    stack.push(bsi);
                                    break;
                                }
                            }
                            if (intensities.length == 2) {
                                var startIntensity = intensities[0];
                                var endIntensity = intensities[1];
                                var intensity = RampBuildInterval.computeAverageIntensity(startIntensity, endIntensity);
                                var duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
                                interval = new RampBuildInterval(title.trim(), startIntensity, endIntensity, duration);
                            }
                            else if (intensities.length == 1) {
                                var intensity = intensities[0];
                                var duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
                                interval = new SimpleInterval(title.trim(), intensity, duration);
                            }
                            else {
                                // Two types of interval here:
                                // (10s) - means 10s rest
                                // (10min, easy) - means 10min at default interval pace
                                let intensity = null;
                                if (title.trim().length == 0) {
                                    intensity = factory.createIntensity(0, IntensityUnit.IF);
                                }
                                else {
                                    intensity = factory.createIntensity(factory.getEasyThreshold(), IntensityUnit.IF);
                                }
                                var duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
                                interval = new SimpleInterval(title.trim(), intensity, duration);
                            }
                            stack[stack.length - 1].getIntervals().push(interval);
                            break;
                        }
                        else if (ch == ",") {
                            numIndex++;
                        }
                        else {
                            var string_parser = new StringChunkParser([',', ')']);
                            i = string_parser.evaluate(input, i);
                            var value = string_parser.getValue();
                            // If its a number
                            if (IntervalParser.isDigit(value[0])) {
                                var intensity_parser = new IntensityParser();
                                intensity_parser.evaluate(string_parser.getValue(), 0);
                                nums[numIndex] = intensity_parser.getValue();
                                units[numIndex] = intensity_parser.getUnit();
                            }
                            else if (value[0] == "+" || value[0] == "-") {
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
                            }
                            else {
                                // Set the value for the title and a dummy value in the units
                                title = string_parser.getValue();
                                units[numIndex] = "";
                            }
                        }
                    }
                }
                else if (ch == "[") {
                    var ai = new ArrayInterval("", []);
                    stack[stack.length - 1].getIntervals().push(ai);
                    stack.push(ai);
                }
                else if (ch == "]") {
                    stack.pop();
                }
                else if (IntervalParser.isDigit(ch)) {
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
                }
                else if (ch == "\"") {
                    var scp = new StringChunkParser(["\""]);
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
    }
    Model.IntervalParser = IntervalParser;
    class VisitorHelper {
        static visitAndFinalize(visitor, interval) {
            this.visit(visitor, interval);
            visitor.finalize();
        }
        static visit(visitor, interval) {
            if (interval instanceof SimpleInterval) {
                return visitor.visitSimpleInterval(interval);
            }
            else if (interval instanceof StepBuildInterval) {
                return visitor.visitStepBuildInterval(interval);
            }
            else if (interval instanceof RampBuildInterval) {
                return visitor.visitRampBuildInterval(interval);
            }
            else if (interval instanceof RepeatInterval) {
                return visitor.visitRepeatInterval(interval);
            }
            else if (interval instanceof ArrayInterval) {
                return visitor.visitArrayInterval(interval);
            }
            else if (interval instanceof CommentInterval) {
                return visitor.visitCommentInterval(interval);
            }
            else {
                console.assert(false, "invalid type!");
                return null;
            }
        }
    }
    Model.VisitorHelper = VisitorHelper;
    class BaseVisitor {
        visitCommentInterval(interval) {
            // nothing to do
        }
        visitSimpleInterval(interval) {
            // not aware that typescript supports abstract methods
            throw new Error("not implemented");
        }
        visitStepBuildInterval(interval) {
            // Generic implementation
            for (var i = 0; i < interval.getRepeatCount(); i++) {
                // step interval
                VisitorHelper.visit(this, interval.getStepInterval(i));
                // rest interval
                VisitorHelper.visit(this, interval.getRestInterval());
            }
        }
        visitRampBuildInterval(interval) {
            // not aware that typescript supports abstract methods
            throw new Error("not implemented");
        }
        visitRepeatInterval(interval) {
            for (var i = 0; i < interval.getRepeatCount(); i++) {
                this.visitArrayInterval(interval);
            }
        }
        visitArrayInterval(interval) {
            for (var i = 0; i < interval.getIntervals().length; i++) {
                VisitorHelper.visit(this, interval.getIntervals()[i]);
            }
        }
        finalize() {
        }
    }
    Model.BaseVisitor = BaseVisitor;
    // TSS = [(s x NP x IF) / (FTP x 3600)] x 100
    // IF = NP / FTP
    // TSS = [(s x NP x NP/FTP) / (FTP x 3600)] x 100
    // TSS = [s x (NP / FTP) ^ 2] / 36
    class TSSVisitor extends BaseVisitor {
        constructor() {
            super(...arguments);
            this.tss = 0;
        }
        visitSimpleInterval(interval) {
            var duration = interval.getDuration().getSeconds();
            var intensity = interval.getIntensity().getValue();
            var val = duration * Math.pow(intensity, 2);
            this.tss += val;
        }
        visitRampBuildInterval(interval) {
            var startIntensity = interval.getStartIntensity().getValue();
            var endIntensity = interval.getEndIntensity().getValue();
            var duration = interval.getDuration().getSeconds();
            // Right way to estimate the intensity is by doing incremental of 1 sec
            for (var t = 0; t < duration; t++) {
                var intensity = startIntensity + (endIntensity - startIntensity) * (t / duration);
                var val = 1 * Math.pow(intensity, 2);
                this.tss += val;
            }
        }
        getTSS() {
            return MyMath.round10(this.tss / 36, -1);
        }
    }
    Model.TSSVisitor = TSSVisitor;
    class DateHelper {
        static getDayOfWeek() {
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
    Model.DateHelper = DateHelper;
    class ZonesMap {
        static getZoneMap(sportType) {
            // TODO: Use same zones as bike for now
            if (sportType == SportType.Bike) {
                return {
                    1: { name: "z1", low: 0.00, high: 0.55 },
                    2: { name: "z2", low: 0.55, high: 0.75 },
                    3: { name: "z3", low: 0.75, high: 0.90 },
                    4: { name: "z4", low: 0.90, high: 1.05 },
                    5: { name: "z5", low: 1.05, high: 1.2 },
                    6: { name: "z6", low: 1.20, high: 10 },
                };
            }
            else if (sportType == SportType.Run) {
                return {
                    1: { name: "z1", low: 0.00, high: 0.76 },
                    2: { name: "z2", low: 0.76, high: 0.87 },
                    3: { name: "z3", low: 0.87, high: 0.94 },
                    4: { name: "z4", low: 0.94, high: 1.01 },
                    5: { name: "z5", low: 1.01, high: 1.10 },
                    6: { name: "z6", low: 1.10, high: 10 },
                };
            }
            else if (sportType == SportType.Swim) {
                return {
                    1: { name: "z1", low: 0.00, high: 0.84 },
                    2: { name: "z2", low: 0.84, high: 0.89 },
                    3: { name: "z3", low: 0.89, high: 0.95 },
                    4: { name: "z4", low: 0.95, high: 1.01 },
                    5: { name: "z5", low: 1.01, high: 1.05 },
                    6: { name: "z6", low: 1.05, high: 10 },
                };
            }
        }
    }
    Model.ZonesMap = ZonesMap;
    class ZonesVisitor extends BaseVisitor {
        constructor(sportType) {
            super();
            this.zones = {};
            this.zones = {};
            this.sportType = sportType;
            // Create the zones manually. Something like the following
            // 1 : {name:"Z1", range:"(0,55%]", value:0},
            // 2 : {name:"Z2", range:"(55%;75%]", value:0},
            // 3 : {name:"Z3", range:"(75%;90%]", value:0},
            // 4 : {name:"Z4", range:"(90%;105%]", value:0},
            // 5 : {name:"Z5", range:"(105%;120%]", value:0},
            // 6 : {name:"Z6+", range:"(120%;+oo)", value:0},
            var zone_map = ZonesMap.getZoneMap(this.sportType);
            for (var zone = 1; zone <= 6; zone++) {
                var zone_obj = zone_map[zone];
                this.zones[zone] = {
                    name: zone_obj.name,
                    range: "[" + Math.floor(zone_obj.low * 100) + "%;" + Math.floor(zone_obj.high * 100) + "%)",
                    value: 0,
                };
            }
        }
        static getZone(sportType, intensity) {
            var zone_map = ZonesMap.getZoneMap(sportType);
            for (var zone = 1; zone <= 5; zone++) {
                var zone_obj = zone_map[zone];
                if (intensity >= zone_obj.low && intensity < zone_obj.high) {
                    return zone;
                }
            }
            return 6;
        }
        incrementZoneTime(intensity, numberOfSeconds) {
            var zone = ZonesVisitor.getZone(this.sportType, intensity);
            this.zones[zone].value += numberOfSeconds;
        }
        visitSimpleInterval(interval) {
            this.incrementZoneTime(interval.getIntensity().getValue(), interval.getDuration().getSeconds());
        }
        visitRampBuildInterval(interval) {
            var startIntensity = interval.getStartIntensity().getValue();
            var endIntensity = interval.getEndIntensity().getValue();
            var duration = interval.getDuration().getSeconds();
            // Go on 1 second increments 
            var intensity = startIntensity;
            var intensityIncrement = (endIntensity - startIntensity) / duration;
            for (var t = 0; t < duration; t++) {
                this.incrementZoneTime(intensity, 1);
                intensity += intensityIncrement;
            }
        }
        getTimeInZones() {
            var result = [];
            for (var key in this.zones) {
                var zone = this.zones[key];
                if (zone.value > 0) {
                    result.push({
                        name: zone.name,
                        range: zone.range,
                        duration: new Duration(TimeUnit.Seconds, zone.value, 0, 0)
                    });
                }
            }
            return result;
        }
    }
    Model.ZonesVisitor = ZonesVisitor;
    class IntensitiesVisitor extends BaseVisitor {
        constructor() {
            super(...arguments);
            this.intensities = {};
        }
        visitSimpleInterval(interval) {
            this.intensities[interval.getIntensity().getValue()] = interval.getIntensity();
        }
        visitRampBuildInterval(interval) {
            this.intensities[interval.getStartIntensity().getValue()] = interval.getStartIntensity();
            this.intensities[interval.getEndIntensity().getValue()] = interval.getEndIntensity();
        }
        getIntensities() {
            var result = [];
            for (var intensityValue in this.intensities) {
                result.push(this.intensities[intensityValue]);
            }
            result.sort(function (left, right) {
                return left.getValue() - right.getValue();
            });
            return result;
        }
    }
    Model.IntensitiesVisitor = IntensitiesVisitor;
    class DataPointVisitor extends BaseVisitor {
        constructor() {
            super(...arguments);
            this.x = null;
            this.data = [];
        }
        initX(duration) {
            if (this.x == null) {
                this.x = new Duration(duration.getUnit(), 0, 0, 0);
            }
        }
        incrementX(duration) {
            this.x = Duration.combine(this.x, duration);
        }
        visitSimpleInterval(interval) {
            var title = WorkoutTextVisitor.getIntervalTitle(interval);
            this.initX(interval.getDuration());
            this.data.push(new Point(this.x, interval.getIntensity(), title));
            this.incrementX(interval.getDuration());
            this.data.push(new Point(this.x, interval.getIntensity(), title));
        }
        visitRampBuildInterval(interval) {
            var title = WorkoutTextVisitor.getIntervalTitle(interval);
            this.initX(interval.getDuration());
            this.data.push(new Point(this.x, interval.getStartIntensity(), title));
            this.incrementX(interval.getDuration());
            this.data.push(new Point(this.x, interval.getEndIntensity(), title));
        }
    }
    Model.DataPointVisitor = DataPointVisitor;
    class ZwiftDataVisitor extends BaseVisitor {
        constructor(name) {
            super();
            this.content = "";
            this.content = `<workout_file>
\t<author>Workout Planner Author</author>
\t<name>${name}</name>
\t<description>Auto generated by https://github.com/sergioclemente/WorkoutPlanner</description>
\t<tags>
\t\t<tag name="INTERVALS"/>
\t</tags>
\t<workout>\n`;
        }
        finalize() {
            this.content += `\t</workout>
</workout_file>`;
        }
        getIntervalTitle(interval) {
            var title = interval.getTitle();
            if (title.length == 0) {
                title = WorkoutTextVisitor.getIntervalTitle(interval);
            }
            return title;
        }
        visitSimpleInterval(interval) {
            var duration = interval.getDuration().getSeconds();
            var intensity = interval.getIntensity().getValue();
            var title = encodeURI(this.getIntervalTitle(interval));
            this.content += `\t\t<SteadyState Duration="${duration}" Power="${intensity}">\n`;
            this.content += `\t\t\t<textevent timeoffset="0" message="${title}"/>\n`;
            this.content += `\t\t</SteadyState>\n`;
        }
        visitRampBuildInterval(interval) {
            var duration = interval.getDuration().getSeconds();
            var intensityStart = interval.getStartIntensity().getValue();
            var intensityEnd = interval.getEndIntensity().getValue();
            if (intensityStart < intensityEnd) {
                this.content += `\t\t<Warmup Duration="${duration}" PowerLow="${intensityStart}" PowerHigh="${intensityEnd}"/>\n`;
            }
            else {
                this.content += `\t\t<Cooldown Duration="${duration}" PowerLow="${intensityStart}" PowerHigh="${intensityEnd}"/>\n`;
            }
        }
        getContent() {
            return this.content;
        }
    }
    Model.ZwiftDataVisitor = ZwiftDataVisitor;
    class MRCCourseDataVisitor extends BaseVisitor {
        constructor(fileName) {
            super();
            this.courseData = "";
            this.time = 0;
            this.idx = 0;
            this.fileName = "";
            this.perfPRODescription = "";
            this.content = "";
            this.repeatIntervals = [];
            this.repeatIteration = [];
            this.fileName = fileName;
        }
        processCourseData(intensity, durationInSeconds) {
            this.time += durationInSeconds;
            // Course Data has to be in minutes
            this.courseData += (this.time / 60) + "\t" + Math.round(intensity.getValue() * 100) + "\n";
        }
        processTitle(interval) {
            var title = interval.getTitle();
            if (title.length == 0) {
                title = WorkoutTextVisitor.getIntervalTitle(interval);
            }
            var suffix = "";
            if (this.repeatIntervals.length > 0) {
                console.assert(this.repeatIteration.length > 0);
                var iteration = 1 + this.repeatIteration[this.repeatIteration.length - 1];
                var total = this.repeatIntervals[this.repeatIntervals.length - 1].getRepeatCount();
                suffix = " | " + iteration + " of " + total;
            }
            this.perfPRODescription += "Desc" + this.idx++ + "=" + title + suffix + "\n";
        }
        visitSimpleInterval(interval) {
            this.processCourseData(interval.getIntensity(), 0);
            this.processCourseData(interval.getIntensity(), interval.getDuration().getSeconds());
            this.processTitle(interval);
        }
        visitRampBuildInterval(interval) {
            this.processCourseData(interval.getStartIntensity(), 0);
            this.processCourseData(interval.getEndIntensity(), interval.getDuration().getSeconds());
            this.processTitle(interval);
        }
        visitRepeatInterval(interval) {
            this.repeatIntervals.push(interval);
            for (var i = 0; i < interval.getRepeatCount(); i++) {
                this.repeatIteration.push(i);
                this.visitArrayInterval(interval);
                this.repeatIteration.pop();
            }
            this.repeatIntervals.pop();
        }
        finalize() {
            this.content = "";
            this.content += "[COURSE HEADER]\n";
            this.content += "VERSION=2\n";
            this.content += "UNITS=ENGLISH\n";
            this.content += stringFormat("FILE NAME={0}\n", this.fileName);
            this.content += "MINUTES\tPERCENT\n";
            this.content += "[END COURSE HEADER]\n";
            this.content += "[COURSE DATA]\n";
            this.content += this.courseData;
            this.content += "[END COURSE DATA]\n";
            this.content += "[PERFPRO DESCRIPTIONS]\n";
            this.content += this.perfPRODescription;
            this.content += "[END PERFPRO DESCRIPTIONS]\n";
        }
        getContent() {
            return this.content;
        }
    }
    Model.MRCCourseDataVisitor = MRCCourseDataVisitor;
    class FileNameHelper {
        constructor(intervals) {
            this.intervals = intervals;
        }
        getFileName() {
            var mainInterval = null;
            var duration = this.intervals.getDuration().getSeconds();
            var intensity_string = DateHelper.getDayOfWeek() + " - IF" + Math.round(this.intervals.getIntensity().getValue() * 100) + " - ";
            this.intervals.getIntervals().forEach(function (interval) {
                if (interval.getDuration().getSeconds() > duration / 2) {
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
            var timeInZones = this.intervals.getTimeInZones(SportType.Bike);
            var zoneMaxTime = 0;
            var zoneMaxName = -1;
            for (var id in timeInZones) {
                var zone = timeInZones[id];
                var zoneDuration = zone.duration.estimatedDurationInSeconds;
                if (zoneDuration > zoneMaxTime) {
                    zoneMaxTime = zoneDuration;
                    zoneMaxName = zone.name;
                }
            }
            if (zoneMaxTime != 0) {
                var duration_hr = Math.round(TimeUnitHelper.convertTo(duration, TimeUnit.Seconds, TimeUnit.Hours));
                return intensity_string + duration_hr + "hour-" + zoneMaxName;
            }
            else {
                return intensity_string;
            }
        }
    }
    Model.FileNameHelper = FileNameHelper;
    class WorkoutTextVisitor {
        constructor(userProfile = null, sportType = SportType.Unknown, outputUnit = IntensityUnit.Unknown) {
            this.result = "";
            this.userProfile = null;
            this.sportType = SportType.Unknown;
            this.outputUnit = IntensityUnit.Unknown;
            this.disableEasyTitle = false;
            this.userProfile = userProfile;
            this.sportType = sportType;
            this.outputUnit = outputUnit;
        }
        static getIntervalTitle(interval, userProfile = null, sportType = SportType.Unknown, outputUnit = IntensityUnit.Unknown) {
            // TODO: instantiating visitor is a bit clowny
            var f = new WorkoutTextVisitor(userProfile, sportType, outputUnit);
            VisitorHelper.visitAndFinalize(f, interval);
            return f.result;
        }
        visitCommentInterval(interval) {
            this.result += interval.getTitle();
        }
        visitRestInterval(interval) {
            var value = interval.getIntensity().getValue();
            if (value <= DefaultIntensity.getEasyThreshold(this.sportType)) {
                this.result += interval.getDuration().toStringShort() + " easy";
            }
            else {
                this.result += interval.getDuration().toStringShort() + " @ " + this.getIntensityPretty(interval.getIntensity());
            }
        }
        // ArrayInterval
        visitArrayInterval(interval) {
            this.visitArrayIntervalInternal(interval, false);
        }
        visitArrayIntervalInternal(interval, always_add_parenthesis) {
            var length = interval.getIntervals().length;
            var firstInterval = interval.getIntervals()[0];
            var lastInterval = interval.getIntervals()[length - 1];
            var isRestIncluded = lastInterval.getIntensity().getValue() <
                firstInterval.getIntensity().getValue() &&
                !(lastInterval instanceof CommentInterval); // its not a comment				
            if (length == 2) {
                if (isRestIncluded) {
                    var oldFlag = this.disableEasyTitle;
                    this.disableEasyTitle = true;
                    VisitorHelper.visit(this, firstInterval);
                    this.disableEasyTitle = oldFlag;
                    this.result += " - ";
                    this.visitRestInterval(lastInterval);
                }
                else {
                    if (always_add_parenthesis) {
                        this.result += "(";
                    }
                    VisitorHelper.visit(this, firstInterval);
                    this.result += " - ";
                    VisitorHelper.visit(this, lastInterval);
                    if (always_add_parenthesis) {
                        this.result += ")";
                    }
                }
            }
            else {
                if (isRestIncluded) {
                    this.result += "(";
                    for (var i = 0; i < length - 1; i++) {
                        var subInterval = interval.getIntervals()[i];
                        VisitorHelper.visit(this, subInterval);
                        this.result += ", ";
                    }
                    // remove extra ", "
                    this.result = this.result.slice(0, this.result.length - 2);
                    this.result += ") - w/ ";
                    this.visitRestInterval(lastInterval);
                }
                else {
                    if (length >= 2) {
                        this.result += "(";
                    }
                    for (var i = 0; i < length; i++) {
                        var subInterval = interval.getIntervals()[i];
                        VisitorHelper.visit(this, subInterval);
                        this.result += ", ";
                    }
                    // remove extra ", "
                    this.result = this.result.slice(0, this.result.length - 2);
                    if (length >= 2) {
                        this.result += ")";
                    }
                }
            }
        }
        // RepeatInterval
        visitRepeatInterval(interval) {
            this.result += interval.getRepeatCount() + " x ";
            this.visitArrayIntervalInternal(interval, true);
        }
        // RampBuildInterval
        visitRampBuildInterval(interval) {
            if (interval.getStartIntensity().getValue() <= DefaultIntensity.getEasyThreshold(this.sportType)) {
                this.result += interval.getDuration().toStringShort() + " warmup to " + this.getIntensityPretty(interval.getEndIntensity());
            }
            else {
                this.result += interval.getDuration().toStringShort() + " build from " + this.getIntensityPretty(interval.getStartIntensity()) + " to " + this.getIntensityPretty(interval.getEndIntensity());
            }
        }
        visitStepBuildInterval(interval) {
            this.result += interval.getRepeatCount() + " x ";
            // There are two types of step build interval
            // 1) Same duration - different intensities
            // 2) Different duration - same intensities
            // case 1
            if (interval.areAllIntensitiesSame()) {
                this.result += this.getIntensityPretty(interval.getStepInterval(0).getIntensity());
                this.result += " - w/ ";
                this.visitRestInterval(interval.getRestInterval());
                this.result += " (";
                for (var i = 0; i < interval.getRepeatCount(); i++) {
                    this.result += interval.getStepInterval(i).getDuration().toStringShort();
                    this.result += ", ";
                }
                // remove extra ", "
                this.result = this.result.slice(0, this.result.length - 2);
                this.result += ")";
            }
            else {
                this.result += interval.getStepInterval(0).getDuration().toStringShort();
                this.result += " - w/ ";
                this.visitRestInterval(interval.getRestInterval());
                this.result += " (";
                for (var i = 0; i < interval.getRepeatCount(); i++) {
                    this.result += this.getIntensityPretty(interval.getStepInterval(i).getIntensity());
                    this.result += ", ";
                }
                // remove extra ", "
                this.result = this.result.slice(0, this.result.length - 2);
                this.result += ")";
            }
        }
        // SimpleInterval
        visitSimpleInterval(interval) {
            this.result += interval.getDuration().toStringShort();
            var title = interval.getTitle();
            if (title.length > 0) {
                this.result += " " + title;
            }
            // 3 cases to cover:
            // - warmup (usually IF around 50-60) - no title - easy peasy
            // - drills with single leg (IF < 60) - title present - check for title
            // - recovery interval, first interval in a repeat rest is something like 60. 
            let isEasyInterval = DefaultIntensity.isEasy(interval.getIntensity(), this.sportType);
            if (isEasyInterval && !this.disableEasyTitle) {
                // If no title was provided, let's give one
                if (interval.getTitle().length == 0) {
                    if (interval.getIntensity().getValue() == 0) {
                        this.result += " rest";
                    }
                    else {
                        this.result += " easy";
                    }
                }
                else {
                    // Remove intensity from easy swim intervals
                    if (this.sportType != SportType.Swim) {
                        this.result += " @ " + this.getIntensityPretty(interval.getIntensity());
                    }
                }
            }
            else {
                this.result += " @ " + this.getIntensityPretty(interval.getIntensity());
            }
        }
        // |intensity| : The intensity of the interval. For example 90%, 100%
        getIntensityPretty(intensity) {
            if (this.outputUnit == IntensityUnit.HeartRate) {
                var bpm = 0;
                if (this.sportType == SportType.Bike) {
                    bpm = this.userProfile.getBikeFTP() / this.userProfile.getEfficiencyFactor();
                }
                else if (this.sportType == SportType.Run) {
                    // 1760 yards
                    // http://home.trainingpeaks.com/blog/article/the-efficiency-factor-in-running
                    bpm = (1760 * this.userProfile.getRunnintTPaceMph()) / (60 * this.userProfile.getEfficiencyFactor());
                }
                return Math.round(intensity.getValue() * bpm) + "bpm";
            }
            if (this.outputUnit == IntensityUnit.Unknown ||
                this.sportType == SportType.Unknown ||
                this.outputUnit == IntensityUnit.IF) {
                return intensity.toString();
            }
            if (this.sportType == SportType.Bike) {
                if (this.outputUnit == IntensityUnit.Watts) {
                    return FormatterHelper.roundNumberUp(Math.round(this.userProfile.getBikeFTP() * intensity.getValue()), 5) + "w";
                }
                else {
                    return intensity.toString();
                }
            }
            else if (this.sportType == SportType.Run) {
                var minMi = this.userProfile.getPaceMinMi(intensity);
                var outputValue = IntensityUnitHelper.convertTo(minMi, IntensityUnit.MinMi, this.outputUnit);
                if (this.outputUnit == IntensityUnit.Kmh || this.outputUnit == IntensityUnit.Mph) {
                    return MyMath.round10(outputValue, -1) + getIntensityUnit(this.outputUnit);
                }
                else {
                    return FormatterHelper.formatNumber(outputValue, 60, ":", getIntensityUnit(this.outputUnit), 5);
                }
            }
            else if (this.sportType == SportType.Swim) {
                if (this.outputUnit == IntensityUnit.Mph) {
                    return MyMath.round10(this.userProfile.getSwimPaceMph(intensity), -1) + getIntensityUnit(this.outputUnit);
                }
                else if (this.outputUnit == IntensityUnit.Per100Yards || this.outputUnit == IntensityUnit.Per100Meters) {
                    var swim_pace_per_100 = this.userProfile.getSwimPace(this.outputUnit, intensity);
                    return FormatterHelper.formatNumber(swim_pace_per_100, 60, ":", "") + getStringFromIntensityUnit(this.outputUnit);
                }
                else {
                    console.assert(false, stringFormat("Invalid output unit {0}", this.outputUnit));
                }
            }
            else {
                console.assert(false, stringFormat("Invalid sport type {0}", this.sportType));
            }
        }
        finalize() {
        }
    }
    Model.WorkoutTextVisitor = WorkoutTextVisitor;
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
                else if (speed.indexOf("min/400m") != -1) {
                    res = (60 / (this._extractNumber(speed, 60, ":", "min/400m") * 2.5 * 1.609344));
                }
                else if (speed.indexOf("/100yards") != -1) {
                    var pace_per_100_yards = this._extractNumber(speed, 60, ":", "/100yards");
                    res = IntensityUnitHelper.convertTo(pace_per_100_yards, IntensityUnit.Per100Yards, IntensityUnit.Mph);
                }
                else if (speed.indexOf("/100meters") != -1) {
                    var pace_per_100_meters = this._extractNumber(speed, 60, ":", "/100meters");
                    res = IntensityUnitHelper.convertTo(pace_per_100_meters, IntensityUnit.Per100Meters, IntensityUnit.Mph);
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
    Model.SpeedParser = SpeedParser;
    class UserProfile {
        constructor(bikeFTPWatts, renameTPace, swimCSS, email) {
            this.bikeFTP = bikeFTPWatts;
            var speed_mph = SpeedParser.getSpeedInMph(renameTPace);
            this.runningTPaceMinMi = IntensityUnitHelper.convertTo(speed_mph, IntensityUnit.Mph, IntensityUnit.MinMi);
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
        getPaceMinMi(intensity) {
            var pace_mph = IntensityUnitHelper.convertTo(this.getRunningTPaceMinMi(), IntensityUnit.MinMi, IntensityUnit.Mph) * intensity.getValue();
            return IntensityUnitHelper.convertTo(pace_mph, IntensityUnit.Mph, IntensityUnit.MinMi);
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
    Model.UserProfile = UserProfile;
    class ObjectFactory {
        constructor(userProfile, sportType) {
            this.userProfile = userProfile;
            this.sportType = sportType;
        }
        getBikeSpeedMphForIntensity(intensity) {
            // TODO: very simple for now
            // its either 20 or 15mph
            var actualSpeedMph = 0;
            if (intensity.getValue() < 0.65) {
                actualSpeedMph = 15;
            }
            else {
                actualSpeedMph = 20;
            }
            return actualSpeedMph;
        }
        createIntensity(value, unit) {
            var ifValue = 0;
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
                else {
                    console.assert(false, stringFormat("Unit {0} is not implemented"));
                    throw new Error("Not implemented");
                }
            }
            else if (this.sportType == SportType.Swim) {
                // For swimming we support 3 IntensityUnits
                if (unit == IntensityUnit.IF) {
                    ifValue = value;
                }
                else if (unit == IntensityUnit.Per100Yards || unit == IntensityUnit.Per100Meters) {
                    var swimming_mph = IntensityUnitHelper.convertTo(value, unit, IntensityUnit.Mph);
                    var swimming_mph_css = this.userProfile.getSwimCSSMph();
                    ifValue = swimming_mph / swimming_mph_css;
                }
                else if (unit == IntensityUnit.Mph) {
                    ifValue = value / this.userProfile.getSwimCSSMph();
                }
                else if (unit == IntensityUnit.OffsetSeconds) {
                    // TODO: not handling if user specified speed in profile / meters
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
                console.assert(false, stringFormat("Invalid sport type {0}", this.sportType));
            }
            return new Intensity(ifValue, value, unit);
        }
        createDuration(intensity, unit, value) {
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
                console.assert(false, stringFormat("Invalid sport type {0}", this.sportType));
            }
            if (DurationUnitHelper.isTime(unit)) {
                estimatedTimeInSeconds = DurationUnitHelper.getDurationSeconds(unit, value);
                // v = s/t
                // s = v * t
                estimatedDistanceInMiles = estimatedSpeedMph * (estimatedTimeInSeconds / 3600);
            }
            else {
                estimatedDistanceInMiles = DurationUnitHelper.getDistanceMiles(unit, value);
                // v = s/t;
                // t = s / v;
                estimatedTimeInSeconds = 3600 * (estimatedDistanceInMiles / estimatedSpeedMph);
            }
            return new Duration(unit, value, estimatedTimeInSeconds, estimatedDistanceInMiles);
        }
        getEasyThreshold() {
            return DefaultIntensity.getEasyThreshold(this.sportType);
        }
    }
    Model.ObjectFactory = ObjectFactory;
    class WorkoutFileGenerator {
        constructor(workoutTitle, intervals) {
            this.workoutTitle = workoutTitle;
            this.intervals = intervals;
        }
        getMRCFile() {
            var dataVisitor = new MRCCourseDataVisitor(this.getMRCFileName());
            VisitorHelper.visitAndFinalize(dataVisitor, this.intervals);
            return dataVisitor.getContent();
        }
        getZWOFile() {
            var fileNameHelper = new FileNameHelper(this.intervals);
            var workout_name = fileNameHelper.getFileName();
            var zwift = new ZwiftDataVisitor(workout_name);
            VisitorHelper.visitAndFinalize(zwift, this.intervals);
            return zwift.getContent();
        }
        getZWOFileName() {
            if (typeof (this.workoutTitle) != 'undefined' && this.workoutTitle.length != 0) {
                return this.workoutTitle + ".zwo";
            }
            var fileNameHelper = new FileNameHelper(this.intervals);
            return fileNameHelper.getFileName() + ".zwo";
        }
        getMRCFileName() {
            if (typeof (this.workoutTitle) != 'undefined' && this.workoutTitle.length != 0) {
                return this.workoutTitle + ".mrc";
            }
            var fileNameHelper = new FileNameHelper(this.intervals);
            return fileNameHelper.getFileName() + ".mrc";
        }
    }
    Model.WorkoutFileGenerator = WorkoutFileGenerator;
    class WorkoutBuilder {
        constructor(userProfile, sportType, outputUnit) {
            this.userProfile = userProfile;
            this.sportType = sportType;
            this.outputUnit = outputUnit;
        }
        getInterval() {
            return this.intervals;
        }
        getSportType() {
            return this.sportType;
        }
        getWorkoutTitle() {
            return this.workoutTitle;
        }
        withDefinition(workoutTitle, workoutDefinition) {
            this.intervals = IntervalParser.parse(new ObjectFactory(this.userProfile, this.sportType), workoutDefinition);
            this.workoutTitle = workoutTitle;
            this.workoutDefinition = workoutDefinition;
            return this;
        }
        getIntensityFriendly(intensity) {
            var f = new WorkoutTextVisitor(this.userProfile, this.sportType, this.outputUnit);
            return f.getIntensityPretty(intensity);
        }
        getTSS() {
            return this.intervals.getTSS();
        }
        getTSSFromIF() {
            return this.intervals.getTSSFromIF();
        }
        getTimePretty() {
            return this.intervals.getDuration().toTimeStringLong();
        }
        getIF() {
            return MyMath.round10(this.intervals.getIntensity().getValue() * 100, -1);
        }
        getAveragePower() {
            return MyMath.round10(this.userProfile.getBikeFTP() * this.intervals.getIntensity().getValue(), -1);
        }
        getIntervalPretty(interval) {
            return WorkoutTextVisitor.getIntervalTitle(interval, this.userProfile, this.sportType, this.outputUnit);
        }
        getEstimatedDistancePretty() {
            if (this.sportType == SportType.Swim) {
                return this.intervals.getDuration().toStringDistance(DistanceUnit.Yards);
            }
            else {
                return this.intervals.getDuration().toStringDistance(DistanceUnit.Miles);
            }
        }
        getAveragePace() {
            var minMi = this.userProfile.getPaceMinMi(this.intervals.getIntensity());
            var outputValue = IntensityUnitHelper.convertTo(minMi, IntensityUnit.MinMi, this.outputUnit);
            if (this.outputUnit == IntensityUnit.Kmh || this.outputUnit == IntensityUnit.Mph) {
                return MyMath.round10(outputValue, -1) + getIntensityUnit(this.outputUnit);
            }
            else {
                return FormatterHelper.formatNumber(outputValue, 60, ":", getIntensityUnit(this.outputUnit));
            }
        }
        getStepsList(new_line) {
            var result = "";
            this.intervals.getIntervals().forEach(function (interval) {
                result += ("* " + this.getIntervalPretty(interval) + new_line);
            }.bind(this));
            return result;
        }
        getDistanceInMiles() {
            var result = 0;
            this.intervals.getIntervals().forEach(function (interval) {
                if (interval.getDuration().getDistanceInMiles() > 0) {
                    result += interval.getDuration().getDistanceInMiles();
                }
            }.bind(this));
            return result;
        }
        getPrettyPrint(new_line = "\n") {
            var intensities = this.intervals.getIntensities();
            var result = "";
            result += this.getStepsList(new_line);
            return result;
        }
        getMRCFile() {
            let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
            return wfg.getMRCFile();
        }
        getZWOFile() {
            let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
            return wfg.getZWOFile();
        }
        getZWOFileName() {
            let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
            return wfg.getZWOFileName();
        }
        getMRCFileName() {
            let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
            return wfg.getMRCFileName();
        }
    }
    Model.WorkoutBuilder = WorkoutBuilder;
    ;
    class StopWatch {
        constructor() {
            this.startTime = null;
            this.stoppedTime = null;
        }
        start() {
            if (this.startTime === null) {
                this.startTime = Date.now();
            }
        }
        stop() {
            if (this.startTime !== null) {
                this.stoppedTime += Date.now() - this.startTime;
                this.startTime = null;
            }
        }
        reset() {
            this.startTime = null;
            this.stoppedTime = 0;
        }
        getIsStarted() {
            return this.startTime !== null;
        }
        getElapsedTime() {
            if (this.startTime !== null) {
                return (Date.now() - this.startTime) + this.stoppedTime;
            }
            else {
                return this.stoppedTime;
            }
        }
    }
    Model.StopWatch = StopWatch;
    // Class that is created with the absolute begin and end times.
    // |interval_| will be either SimpleInterval or RampBuildInterval.
    class AbsoluteTimeInterval {
        constructor(begin, end, interval) {
            this.begin_ = begin;
            this.end_ = end;
            this.interval_ = interval;
        }
        getBeginSeconds() {
            return this.begin_;
        }
        getEndSeconds() {
            return this.end_;
        }
        getDurationSeconds() {
            return this.end_ - this.begin_;
        }
        getInterval() {
            return this.interval_;
        }
    }
    Model.AbsoluteTimeInterval = AbsoluteTimeInterval;
    class AbsoluteTimeIntervalVisitor extends BaseVisitor {
        constructor() {
            super(...arguments);
            this.time_ = 0;
            this.data_ = [];
        }
        visitSimpleInterval(interval) {
            var duration_seconds = interval.getDuration().getSeconds();
            this.data_.push(new AbsoluteTimeInterval(this.time_, this.time_ + duration_seconds, interval));
            this.time_ += duration_seconds;
        }
        visitRampBuildInterval(interval) {
            var duration_seconds = interval.getDuration().getSeconds();
            this.data_.push(new AbsoluteTimeInterval(this.time_, this.time_ + duration_seconds, interval));
            this.time_ += duration_seconds;
        }
        getIntervalArray() {
            return this.data_;
        }
    }
    Model.AbsoluteTimeIntervalVisitor = AbsoluteTimeIntervalVisitor;
    class PlayerHelper {
        constructor(interval) {
            this.data_ = [];
            this.durationTotalSeconds_ = 0;
            // Create the visitor for the AbsoluteTimeInterval.
            var pv = new AbsoluteTimeIntervalVisitor();
            VisitorHelper.visitAndFinalize(pv, interval);
            this.data_ = pv.getIntervalArray();
            this.durationTotalSeconds_ = interval.getDuration().getSeconds();
        }
        get(ts) {
            // TODO: Can potentially do a binary search here.
            for (let i = 0; i < this.data_.length; i++) {
                let bei = this.data_[i];
                if (ts >= bei.getBeginSeconds() && ts <= bei.getEndSeconds()) {
                    return bei;
                }
            }
            return null;
        }
        getDurationTotalSeconds() {
            return this.durationTotalSeconds_;
        }
    }
    Model.PlayerHelper = PlayerHelper;
})(Model || (Model = {}));
module.exports = Model;
