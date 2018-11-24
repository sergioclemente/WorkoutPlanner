"use strict";
var Model;
(function (Model) {
    var zlib = require('zlib');
    let SportType;
    (function (SportType) {
        SportType[SportType["Unknown"] = -1] = "Unknown";
        SportType[SportType["Swim"] = 0] = "Swim";
        SportType[SportType["Bike"] = 1] = "Bike";
        SportType[SportType["Run"] = 2] = "Run";
        SportType[SportType["Other"] = 3] = "Other";
    })(SportType = Model.SportType || (Model.SportType = {}));
    class SportTypeHelper {
        // TODO: Can I use toString and or add this to the enum itself?
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
            else if (sportType == SportType.Other) {
                return "Other";
            }
            else {
                console.assert(false);
                return "";
            }
        }
    }
    Model.SportTypeHelper = SportTypeHelper;
    const MIN_TIME = 11;
    const MAX_DISTANCE = 10;
    // If you add another distance, make sure you update the MAX_DISTANCE
    // and that it doesn't overlap with TimeUnit
    let DistanceUnit;
    (function (DistanceUnit) {
        DistanceUnit[DistanceUnit["Unknown"] = 0] = "Unknown";
        DistanceUnit[DistanceUnit["Miles"] = 1] = "Miles";
        DistanceUnit[DistanceUnit["Kilometers"] = 2] = "Kilometers";
        DistanceUnit[DistanceUnit["Meters"] = 3] = "Meters";
        DistanceUnit[DistanceUnit["Yards"] = 4] = "Yards";
    })(DistanceUnit = Model.DistanceUnit || (Model.DistanceUnit = {}));
    // If you add another time unit, be careful not adding one before MIN_TIME
    let TimeUnit;
    (function (TimeUnit) {
        TimeUnit[TimeUnit["Unknown"] = 11] = "Unknown"; /* MIN_TIME */
        TimeUnit[TimeUnit["Seconds"] = 12] = "Seconds";
        TimeUnit[TimeUnit["Minutes"] = 13] = "Minutes";
        TimeUnit[TimeUnit["Hours"] = 14] = "Hours";
    })(TimeUnit = Model.TimeUnit || (Model.TimeUnit = {}));
    let IntensityUnit;
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
    })(IntensityUnit = Model.IntensityUnit || (Model.IntensityUnit = {}));
    // Even though typescript guarantees type safety, specially when you don't have 
    // type annotations properly you can have strings being passed as ints and so forth.
    // Until all type annotations are added (through --noImplicitAny) we still need
    // this compiler option.
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
    ;
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
            let values = value.toString().split('e');
            value = Math[type](+(values[0] + 'e' + (values[1] ? (+values[1] - exp) : -exp)));
            // Shift back
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
    Model.MyMath = MyMath;
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
        // TODO: Move this to duration.
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
                    // TODO: Not doing anything here for now.
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
            // Combine the units directly if they are the same
            if (dur1.getUnit() == dur2.getUnit()) {
                return new Duration(dur1.getUnit(), dur1.getValue() + dur2.getValue(), estTime, estDistance);
            }
            // Check if either is 0
            if (dur1.getValue() == 0) {
                return dur2;
            }
            if (dur2.getValue() == 0) {
                return dur1;
            }
            if (DurationUnitHelper.isTime(dur1.getUnit())) {
                if (DurationUnitHelper.isTime(dur2.getUnit())) {
                    // Both are Time
                    // Convert both to seconds
                    var time1 = DurationUnitHelper.getDurationSeconds(dur1.getUnit(), dur1.getValue());
                    var time2 = DurationUnitHelper.getDurationSeconds(dur2.getUnit(), dur2.getValue());
                    return new Duration(TimeUnit.Seconds, time1 + time2, estTime, estDistance);
                }
                else {
                    // Use the distance unit in case they are different.
                    // Convert to time
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
                    // Both are NOT time
                    // Convert to miles
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
    Model.Duration = Duration;
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
    class Intensity {
        constructor(ifValue = 0, value = 0, unit = IntensityUnit.IF) {
            PreconditionsCheck.assertIsNumber(ifValue, "ifValue");
            PreconditionsCheck.assertIsNumber(value, "value");
            PreconditionsCheck.assertIsNumber(unit, "unit");
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
            // do a weighed sum
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
    }
    Intensity.ZeroIntensity = new Intensity(0, 0, IntensityUnit.IF);
    Model.Intensity = Intensity;
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
    Model.BaseInterval = BaseInterval;
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
    Model.CommentInterval = CommentInterval;
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
        getWorkDuration() {
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
        constructor(x, y, label, tag) {
            this.x = x;
            this.y = y;
            this.label = label;
            this.tag = tag;
        }
    }
    Model.Point = Point;
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
            // If the interval is empty lets bail right away otherwise reducing the array will cause an
            // exception
            if (this.intervals.length == 0) {
                return Duration.ZeroDuration;
            }
            // It will create dummy intervals along the way so that I can use
            // the reduce abstraction		
            var res = this.intervals.reduce(function (previousValue, currentValue) {
                var duration = Duration.combine(previousValue.getWorkDuration(), currentValue.getWorkDuration());
                // Create a dummy interval with the proper duration
                return new SimpleInterval("", Intensity.ZeroIntensity, duration, Duration.ZeroDuration);
            });
            return res.getWorkDuration();
        }
        getRestDuration() {
            var durations = this.intervals.map(function (cur) {
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
        getTSS() {
            var tssVisitor = new TSSVisitor();
            VisitorHelper.visitAndFinalize(tssVisitor, this);
            let tss = tssVisitor.getTSS();
            if (isNaN(tss) || !isFinite(tss)) {
                return 0;
            }
            return tss;
        }
        getTSS2() {
            return TSSCalculator.compute(this);
        }
        getTimeSeries() {
            var pv = new DataPointVisitor();
            VisitorHelper.visitAndFinalize(pv, this);
            // - Massaging the time component
            var list = pv.data.map(function (item) {
                return {
                    x: item.x.getSeconds() / 60,
                    y: Math.round(item.y.getValue() * 100),
                    tag: item.tag
                };
            });
            // Separate into one list per tag
            var tagToPoints = {};
            var lastItemTag = null;
            for (let i = 0; i < list.length; ++i) {
                let item = list[i];
                if (tagToPoints[item.tag] == null) {
                    tagToPoints[item.tag] = [];
                }
                if (lastItemTag != null) {
                    if (item.tag != lastItemTag) {
                        tagToPoints[lastItemTag].push({ x: item.x, y: 0 });
                        tagToPoints[item.tag].push({ x: item.x, y: 0 });
                    }
                }
                tagToPoints[item.tag].push(item);
                lastItemTag = item.tag;
            }
            return tagToPoints;
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
        getWorkDuration() {
            var baseDuration = super.getWorkDuration();
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
    Model.StepBuildInterval = StepBuildInterval;
    // TODO: Refactor this to accept time as well.
    // For example:
    // "10" => 10
    // 10:30 => 10.5
    // "10.5" => 10.5
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
    // Retrieves the next token from the interval.
    // For example:
    // (10min, 75, free)
    // Can return: "10min" or "75" or "free"
    class TokenParser {
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
    Model.TokenParser = TokenParser;
    // For a string like: "10min"
    // It will set |value| to 10
    // and unit to "min"
    class NumberAndUnitParser {
        evaluate(input, i) {
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
                }
                else {
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
            }
            else {
                this.unit = nextToken;
            }
            return i - 1;
        }
        getValue() {
            return this.value;
        }
        getUnit() {
            return this.unit;
        }
    }
    Model.NumberAndUnitParser = NumberAndUnitParser;
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
                            var interval;
                            var durationValues = [];
                            var durationUnits = [];
                            var intensities = [];
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
                                }
                                else {
                                    // Get the Intensity unit and do some minor massaging for
                                    // handling free intervals.
                                    var unit = IntensityUnitHelper.toIntensityUnit(units[k]);
                                    // Unit could be time, so we have to safeguard on valid
                                    // intensities.
                                    if (unit != IntensityUnit.Unknown) {
                                        if (unit == IntensityUnit.FreeRide) {
                                            intensities.push(factory.createIntensity(factory.getEasyThreshold(), IntensityUnit.FreeRide));
                                        }
                                        else {
                                            intensities.push(factory.createIntensity(nums[k], unit));
                                        }
                                    }
                                }
                            }
                            // (3) Handle repeat interval by peaking at the stack
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
                                        || (DurationUnitHelper.areDurationUnitsSame(durationUnits) && durationValues.length == repeatInterval.getRepeatCount()))) {
                                    // OK this should not be a RepeatInterval, it should be
                                    // a StepBuildInterval instead
                                    // Remove the ArrayInterval from the top and from the parent
                                    stack.pop();
                                    stack[stack.length - 1].getIntervals().pop();
                                    // add the new intervals
                                    var step_intervals = [];
                                    for (let k = 0; k < repeatInterval.getRepeatCount(); k++) {
                                        var durationUnit = k < durationUnits.length ? durationUnits[k] : durationUnits[0];
                                        var durationValue = k < durationValues.length ? durationValues[k] : durationValues[0];
                                        var intensity = k < intensities.length ? intensities[k] : intensities[0];
                                        var step_duration = factory.createDuration(intensity, durationUnit, durationValue);
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
                                let endIntensity = intensities[1];
                                let intensity = RampBuildInterval.computeAverageIntensity(startIntensity, endIntensity);
                                let duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
                                interval = new RampBuildInterval(title.trim(), startIntensity, endIntensity, duration);
                            }
                            else if (intensities.length == 1) {
                                // Simple interval
                                let intensity = intensities[0];
                                let duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
                                if (durationUnits.length == 2 && durationValues.length == 2) {
                                    restDuration = factory.createDuration(zeroIntensity, durationUnits[1], durationValues[1]);
                                }
                                interval = new SimpleInterval(title.trim(), intensity, duration, restDuration);
                            }
                            else {
                                // Whenever there us no intensity is specified, we get
                                // the default intensity. There is no rest interval with 0
                                // intensity anymore.
                                let intensity = factory.createIntensity(factory.getEasyThreshold(), IntensityUnit.IF);
                                let duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
                                if (durationUnits.length == 2 && durationValues.length == 2) {
                                    restDuration = factory.createDuration(zeroIntensity, durationUnits[1], durationValues[1]);
                                }
                                interval = new SimpleInterval(title.trim(), intensity, duration, restDuration);
                            }
                            stack[stack.length - 1].getIntervals().push(interval);
                            break;
                        }
                        else if (ch == ",") {
                            numIndex++;
                        }
                        else {
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
                                }
                                else {
                                    // If we don't recognize, fallback and set as a title
                                    title = value;
                                    units[numIndex] = "";
                                }
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
                                // TODO: Use magic number for identifying free ride for now
                                if (value == "*") {
                                    units[numIndex] = "free-ride";
                                }
                                else {
                                    // Set the value for the title.
                                    // Do not set the units[numIndex]="";
                                    // Its ok to have a gap on it.
                                    title = value;
                                }
                            }
                        }
                    }
                    // end simple workout
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
        static normalize(factory, input) {
            let interval = IntervalParser.parse(factory, input);
            let visitor = new UnparserVisitor();
            VisitorHelper.visitAndFinalize(visitor, interval);
            return visitor.output;
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
    class TreePrinterVisitor {
        constructor() {
            this.output = "";
            this.indentation = 0;
        }
        visitCommentInterval(interval) {
            this.indent();
            this.output += stringFormat("Comment({0})\n", interval.getTitle());
        }
        visitSimpleInterval(interval) {
            this.indent();
            if (interval.getRestDuration().getValue() > 0) {
                this.output += stringFormat("SimpleInterval({0}, {1}, {2}, {3})\n", interval.getWorkDuration().toString(), interval.getIntensity().toString(), interval.getTitle(), interval.getRestDuration().toString());
            }
            else {
                this.output += stringFormat("SimpleInterval({0}, {1}, {2})\n", interval.getWorkDuration().toString(), interval.getIntensity().toString(), interval.getTitle());
            }
        }
        visitStepBuildInterval(interval) {
            this.indent();
            // TODO: Implement
        }
        visitRampBuildInterval(interval) {
            this.indent();
            this.output += stringFormat("BuildInterval({0}, {1}, {2}, {3})\n", interval.getWorkDuration().toString(), interval.getStartIntensity().toString(), interval.getEndIntensity().toString(), interval.getTitle());
        }
        visitRepeatInterval(interval) {
            this.indent();
            this.output += stringFormat("RepeatInterval(count={0}, {1}\n", interval.getRepeatCount(), interval.getTitle());
            this.indentation++;
            for (var i = 0; i < interval.getIntervals().length; i++) {
                VisitorHelper.visit(this, interval.getIntervals()[i]);
            }
            this.indentation--;
            this.indent();
            this.output += ")\n";
        }
        visitArrayInterval(interval) {
            this.indent();
            this.indentation++;
            this.output += "ArrayInterval(\n";
            for (var i = 0; i < interval.getIntervals().length; i++) {
                VisitorHelper.visit(this, interval.getIntervals()[i]);
            }
            this.indentation--;
            this.indent();
            this.output += ")\n";
        }
        finalize() {
        }
        indent() {
            for (let i = 0; i < this.indentation; i++) {
                this.output += "\t";
            }
        }
        getOutput() {
            return this.output;
        }
        static Print(interval) {
            let tree_printer = new TreePrinterVisitor();
            VisitorHelper.visitAndFinalize(tree_printer, interval);
            return tree_printer.getOutput();
        }
    }
    Model.TreePrinterVisitor = TreePrinterVisitor;
    class BaseVisitor {
        visitCommentInterval() {
            // nothing to do
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
    // Moving average class.
    // 
    // The constructor receives the window size which is used to compute the average.
    // The behavior should be similar to a sliding window as old values are discarded
    // once the number of elements is equal to the window_size.
    //
    // Simply call insert(value) with the values
    // and whenever needed the moving average then
    // call get_moving_average()
    class MovingAverage {
        constructor(window_size) {
            this.values = [];
            this.window_size = 0;
            this.end = 0;
            PreconditionsCheck.assertTrue(window_size > 0);
            this.window_size = window_size;
        }
        insert(v) {
            if (this.values.length < this.window_size) {
                this.values.push(v);
            }
            else {
                this.values[this.end] = v;
                this.end = (this.end + 1) % this.values.length;
            }
        }
        get_moving_average() {
            if (this.values.length == 0) {
                return null;
            }
            let sum = 0;
            for (let i = 0; i < this.values.length; i++) {
                sum += this.values[i];
            }
            return sum / this.values.length;
        }
        is_full() {
            return this.values.length == this.window_size;
        }
    }
    Model.MovingAverage = MovingAverage;
    // Because IF are usually > 0 and < 1, using IF directly creates
    // incorrect results for the AVG IF, so we use a artificial FTP here
    // in order to compute the NP Power, since the only exposed member
    // from this class is the IF.
    let FTP = 256;
    // Calculate the IF similar to how the NP is calculated.
    // 
    // Calculate a 30-second rolling average of the power data
    // * Raise these values to the fourth power
    // * Average the resulting values
    // * Take the fourth root of the result
    class NPVisitor extends BaseVisitor {
        constructor() {
            super(...arguments);
            this.sum = 0;
            this.count = 0;
            this.ma = new MovingAverage(/*window_size=*/ 30);
            this.np = 0;
        }
        visitSimpleInterval(interval) {
            var duration = interval.getWorkDuration().getSeconds();
            var watts_pow_4 = Math.pow(interval.getIntensity().getValue() * FTP, 4);
            for (let t = 0; t < duration; t++) {
                this._insert_and_flush(watts_pow_4);
            }
        }
        visitRampBuildInterval(interval) {
            var start_watts = interval.getStartIntensity().getValue() * FTP;
            var end_watts = interval.getEndIntensity().getValue() * FTP;
            var duration = interval.getWorkDuration().getSeconds();
            // Right way to estimate the intensity is by doing incremental of 1 sec
            for (var t = 0; t < duration; t++) {
                var current_watts = start_watts + (end_watts - start_watts) * (t / duration);
                var current_watts_pow_4 = 1 * Math.pow(current_watts, 4);
                this._insert_and_flush(current_watts_pow_4);
            }
        }
        _insert_and_flush(value) {
            this.ma.insert(value);
            if (this.ma.is_full()) {
                this.sum += this.ma.get_moving_average();
                this.count += 1;
            }
        }
        finalize() {
            // If the moving average was never "flushed"
            // we then flush so that we have some values
            // to compute.
            if (!this.ma.is_full()) {
                this.sum += this.ma.get_moving_average();
                this.count += 1;
            }
            this.np = MyMath.round10(Math.sqrt(Math.sqrt(this.sum / this.count)), -1);
        }
        getIF() {
            return MyMath.round10(this.np / FTP, -1);
        }
    }
    Model.NPVisitor = NPVisitor;
    // TSS = [(s x NP x IF) / (FTP x 3600)] x 100
    // TSS = [(s x NP x IF) / (FTP x 36)]
    // IF = AVG_POWER / FTP
    // TSS = [s x NP x (AVG_POWER / FTP)] / (FTP x 36)
    // TSS = [(s x NP x AVG_POWER) / FTP] / (FTP x 36)
    // TSS = (s x NP x AVG_POWER) / (36 * FTP^2)
    // 
    // 
    class TSSCalculator {
        static compute(interval) {
            let np = new NPVisitor();
            VisitorHelper.visitAndFinalize(np, interval);
            let avg = interval.getIntensity().getValue() * FTP;
            let s = interval.getTotalDuration().getSeconds();
            return MyMath.round10((s * np.getIF() * FTP * avg) / (36 * FTP * FTP), -1);
        }
    }
    Model.TSSCalculator = TSSCalculator;
    class DominantUnitVisitor extends BaseVisitor {
        constructor() {
            super(...arguments);
            this.intensity_unit = null;
            this.duration_unit = null;
        }
        visitSimpleInterval(interval) {
            this.updateIntensity(interval.getIntensity());
            this.updateDuration(interval.getWorkDuration());
        }
        visitRampBuildInterval(interval) {
            this.updateIntensity(interval.getStartIntensity());
            this.updateIntensity(interval.getEndIntensity());
            this.updateDuration(interval.getWorkDuration());
        }
        updateIntensity(intensity) {
            if (this.intensity_unit == null) {
                this.intensity_unit = intensity.getOriginalUnit();
            }
            else {
                if (this.intensity_unit != intensity.getOriginalUnit()) {
                    this.intensity_unit = IntensityUnit.Unknown;
                }
            }
        }
        updateDuration(duration) {
            if (this.duration_unit == null) {
                this.duration_unit = duration.getUnit();
            }
            else {
                if (this.duration_unit != duration.getUnit()) {
                    this.duration_unit = DistanceUnit.Unknown;
                }
            }
        }
        static computeIntensity(interval) {
            let dominant = new DominantUnitVisitor();
            VisitorHelper.visit(dominant, interval);
            return dominant.intensity_unit == null ? IntensityUnit.Unknown : dominant.intensity_unit;
        }
        static computeDuration(interval) {
            let dominant = new DominantUnitVisitor();
            VisitorHelper.visit(dominant, interval);
            return dominant.duration_unit == null ? DistanceUnit.Unknown : dominant.duration_unit;
        }
    }
    Model.DominantUnitVisitor = DominantUnitVisitor;
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
            var duration = interval.getWorkDuration().getSeconds();
            var intensity = interval.getIntensity().getValue();
            var val = duration * Math.pow(intensity, 2);
            this.tss += val;
        }
        visitRampBuildInterval(interval) {
            var startIntensity = interval.getStartIntensity().getValue();
            var endIntensity = interval.getEndIntensity().getValue();
            var duration = interval.getWorkDuration().getSeconds();
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
            if (sportType == SportType.Bike || sportType == SportType.Other) {
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
            else {
                return {};
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
            this.incrementZoneTime(interval.getIntensity().getValue(), interval.getWorkDuration().getSeconds());
        }
        visitRampBuildInterval(interval) {
            var startIntensity = interval.getStartIntensity().getValue();
            var endIntensity = interval.getEndIntensity().getValue();
            var duration = interval.getWorkDuration().getSeconds();
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
        getIntervalTag(interval) {
            if (interval.getIntensity().getOriginalUnit() == IntensityUnit.FreeRide) {
                return "free-ride";
            }
            else {
                return "if";
            }
        }
        visitSimpleInterval(interval) {
            var title = WorkoutTextVisitor.getIntervalTitle(interval);
            // Work interval
            this.initX(interval.getWorkDuration());
            this.data.push(new Point(this.x, interval.getIntensity(), title, this.getIntervalTag(interval)));
            this.incrementX(interval.getWorkDuration());
            this.data.push(new Point(this.x, interval.getIntensity(), title, this.getIntervalTag(interval)));
            if (interval.getRestDuration().getValue() > 0) {
                // Rest interval
                this.initX(interval.getRestDuration());
                this.data.push(new Point(this.x, Intensity.ZeroIntensity, title, this.getIntervalTag(interval)));
                this.incrementX(interval.getRestDuration());
                this.data.push(new Point(this.x, Intensity.ZeroIntensity, title, this.getIntervalTag(interval)));
            }
        }
        visitRampBuildInterval(interval) {
            var title = WorkoutTextVisitor.getIntervalTitle(interval);
            this.initX(interval.getWorkDuration());
            this.data.push(new Point(this.x, interval.getStartIntensity(), title, this.getIntervalTag(interval)));
            this.incrementX(interval.getWorkDuration());
            this.data.push(new Point(this.x, interval.getEndIntensity(), title, this.getIntervalTag(interval)));
        }
    }
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
        escapeString(input) {
            return input.replace("\"", "\\\"");
        }
        visitSimpleInterval(interval) {
            var duration = interval.getWorkDuration().getSeconds();
            var title = this.escapeString(this.getIntervalTitle(interval));
            if (interval.getIntensity().getOriginalUnit() == IntensityUnit.FreeRide) {
                this.content += `\t\t<FreeRide Duration="${duration}">\n`;
                this.content += `\t\t\t<textevent timeoffset="0" message="${title}"/>\n`;
                this.content += `\t\t</FreeRide>\n`;
            }
            else {
                var intensity = interval.getIntensity().getValue();
                this.content += `\t\t<SteadyState Duration="${duration}" Power="${intensity}">\n`;
                this.content += `\t\t\t<textevent timeoffset="0" message="${title}"/>\n`;
                this.content += `\t\t</SteadyState>\n`;
            }
            // TODO: Add rest duration here
        }
        visitRampBuildInterval(interval) {
            var duration = interval.getWorkDuration().getSeconds();
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
            this.processCourseData(interval.getIntensity(), interval.getWorkDuration().getSeconds());
            this.processTitle(interval);
            // TODO: Add rest interval here
        }
        visitRampBuildInterval(interval) {
            this.processCourseData(interval.getStartIntensity(), 0);
            this.processCourseData(interval.getEndIntensity(), interval.getWorkDuration().getSeconds());
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
    class PPSMRXCourseDataVisitor extends BaseVisitor {
        constructor(title) {
            super();
            this.title = "";
            this.content = "";
            this.groupId = 1;
            this.currentRepeatIteration = [];
            this.repeatCountMax = [];
            this.title = title;
        }
        getTitlePretty(interval) {
            var title = interval.getTitle();
            if (title.length == 0) {
                title = WorkoutTextVisitor.getIntervalTitle(interval);
            }
            if (this.isGroupActive()) {
                title += " (" + (this.currentRepeatIteration[this.currentRepeatIteration.length - 1] + 1) + "/" + this.repeatCountMax[this.repeatCountMax.length - 1] + ")";
            }
            return title;
        }
        getGroupId() {
            if (this.isGroupActive()) {
                return this.groupId;
            }
            else {
                return 0;
            }
        }
        getMode(interval) {
            if (interval.getIntensity().getOriginalUnit() == IntensityUnit.FreeRide) {
                return "T";
            }
            else {
                return "M";
            }
        }
        getIntensity(interval) {
            if (interval.getIntensity().getOriginalUnit() == IntensityUnit.FreeRide) {
                return 0;
            }
            else {
                return Math.round(interval.getIntensity().getValue() * 100);
            }
        }
        // ["description","seconds","start","finish","mode","intervals","group","autolap","targetcad"]
        visitSimpleInterval(interval) {
            this.content += stringFormat(`\t\t["{0}",{1},{2},{2},"{3}",1,{4},0,90],\n`, this.getTitlePretty(interval), interval.getWorkDuration().getSeconds(), this.getIntensity(interval), this.getMode(interval), this.getGroupId());
            // TODO: Add rest interval here
        }
        visitRampBuildInterval(interval) {
            this.content += stringFormat(`\t\t["{0}",{1},{2},{3},"M",1,{3},0,90],\n`, this.getTitlePretty(interval), interval.getWorkDuration().getSeconds(), Math.round(interval.getStartIntensity().getValue() * 100), Math.round(interval.getEndIntensity().getValue() * 100), this.getGroupId());
        }
        visitRepeatInterval(interval) {
            this.repeatCountMax.push(interval.getRepeatCount());
            for (var i = 0; i < interval.getRepeatCount(); i++) {
                this.currentRepeatIteration.push(i);
                this.visitArrayInterval(interval);
                this.currentRepeatIteration.pop();
            }
            this.repeatCountMax.pop();
            this.groupId++;
        }
        isGroupActive() {
            return this.repeatCountMax.length > 0;
        }
        finalize() {
            if (this.content.length > 0) {
                // Remove trailing ",\n"
                this.content = this.content.substr(0, this.content.length - 2);
                // Add just the "\n"
                this.content += "\n";
            }
            this.content = stringFormat(`{
	"type":"json",
	"createdby":"PerfPRO Studio v5.80.25",
	"version":5.00,
	"name":"{0}",
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
`, this.title) + this.content +
                `	]
}`;
        }
        getContent() {
            return this.content;
        }
    }
    Model.PPSMRXCourseDataVisitor = PPSMRXCourseDataVisitor;
    class FileNameHelper {
        constructor(intervals) {
            this.intervals = intervals;
        }
        getFileName() {
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
            var timeInZones = this.intervals.getTimeInZones(SportType.Bike);
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
            }
            else {
                return intensity_string;
            }
        }
    }
    class WorkoutTextVisitor {
        constructor(userProfile, sportType, outputUnit, roundValues) {
            this.result = "";
            this.userProfile = null;
            this.sportType = SportType.Unknown;
            this.outputUnit = IntensityUnit.Unknown;
            this.disableEasyTitle = false;
            this.roundValues = false;
            PreconditionsCheck.assertIsNumber(sportType, "sportType");
            PreconditionsCheck.assertIsNumber(outputUnit, "outputUnit");
            this.userProfile = userProfile;
            this.sportType = sportType;
            this.outputUnit = outputUnit;
            this.roundValues = roundValues;
        }
        static getIntervalTitle(interval, userProfile = null, sportType = SportType.Unknown, outputUnit = IntensityUnit.Unknown, roundValues = true) {
            var f = new WorkoutTextVisitor(userProfile, sportType, outputUnit, roundValues);
            VisitorHelper.visitAndFinalize(f, interval);
            return f.result;
        }
        visitCommentInterval(interval) {
            this.result += this.getIntervalTitle(interval);
        }
        visitRestInterval(interval) {
            var value = interval.getIntensity().getValue();
            if (value <= DefaultIntensity.getEasyThreshold(this.sportType)) {
                let title = this.getIntervalTitle(interval);
                if (title == null || title.trim().length == 0) {
                    title = "easy";
                }
                this.result += interval.getWorkDuration().toStringShort(this.sportType == SportType.Swim) + " " + title;
                ;
            }
            else {
                this.result += interval.getWorkDuration().toStringShort(this.sportType == SportType.Swim) + " @ " + this.getIntensityPretty(interval.getIntensity());
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
                this.result += interval.getWorkDuration().toStringShort(this.sportType == SportType.Swim) + " warm up to " + this.getIntensityPretty(interval.getEndIntensity());
            }
            else {
                if (interval.getStartIntensity().getValue() < interval.getEndIntensity().getValue()) {
                    this.result += interval.getWorkDuration().toStringShort(this.sportType == SportType.Swim) + " build from " + this.getIntensityPretty(interval.getStartIntensity()) + " to " + this.getIntensityPretty(interval.getEndIntensity());
                }
                else {
                    this.result += interval.getWorkDuration().toStringShort(this.sportType == SportType.Swim) + " warm down from " + this.getIntensityPretty(interval.getStartIntensity()) + " to " + this.getIntensityPretty(interval.getEndIntensity());
                }
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
                    this.result += interval.getStepInterval(i).getWorkDuration().toStringShort(this.sportType == SportType.Swim);
                    this.result += ", ";
                }
                // remove extra ", "
                this.result = this.result.slice(0, this.result.length - 2);
                this.result += ")";
            }
            else {
                this.result += interval.getStepInterval(0).getWorkDuration().toStringShort(this.sportType == SportType.Swim);
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
            this.result += interval.getWorkDuration().toStringShort(this.sportType == SportType.Swim);
            let title = this.getIntervalTitle(interval);
            if (title != null && title.length > 0) {
                this.result += " " + title;
            }
            // If its a Free ride we are done!
            if (interval.getIntensity().getOriginalUnit() == IntensityUnit.FreeRide) {
                return;
            }
            // 3 cases to cover:
            // - warmup (usually IF around 50-60) - no title - easy peasy
            // - drills with single leg (IF < 60) - title present - check for title
            // - recovery interval, first interval in a repeat rest is something like 60. 
            let isEasyInterval = DefaultIntensity.isEasy(interval.getIntensity(), this.sportType);
            if (isEasyInterval && !this.disableEasyTitle) {
                // If no title was provided, let's give one
                let title = interval.getTitle();
                if (title == null || title.trim().length == 0) {
                    if (interval.getIntensity().getValue() == 0) {
                        this.result += " rest";
                    }
                    else {
                        this.result += " easy";
                    }
                }
                else {
                    // Remove intensity from intervals without specified intensity.
                    if (interval.getIntensity().getValue() != 0) {
                        this.result += " @ " + this.getIntensityPretty(interval.getIntensity());
                    }
                }
                if (interval.getRestDuration().getSeconds() > 0) {
                    this.result += " w/ " + interval.getRestDuration().toStringShort(this.sportType == SportType.Swim) + " rest";
                    return;
                }
            }
            else {
                // Handle swim differently
                // We want to add the total touch time on the swim. For example, if you CSS
                // is 1:30 /100yards and you are doing 200 yards, we want to add
                // that you are touching the wall on 3 min.
                if (this.sportType == SportType.Swim) {
                    var total_duration = interval.getTotalDuration();
                    if (total_duration.getSeconds() != interval.getWorkDuration().getSeconds()) {
                        this.result += " on " + interval.getWorkDuration().toTimeStringShort() + " off " + total_duration.toTimeStringShort();
                    }
                    else {
                        this.result += " on " + interval.getWorkDuration().toTimeStringShort();
                    }
                    // If the distance is 100yards don't show the pace.
                    if (!((interval.getWorkDuration().getUnit() == DistanceUnit.Yards ||
                        interval.getWorkDuration().getUnit() == DistanceUnit.Meters) &&
                        interval.getWorkDuration().getValue() == 100) &&
                        this.outputUnit != IntensityUnit.IF) {
                        this.result += " (" + this.getIntensityPretty(interval.getIntensity()) + ")";
                    }
                }
                else {
                    this.result += " @ " + this.getIntensityPretty(interval.getIntensity());
                    if (interval.getRestDuration().getSeconds() > 0) {
                        this.result += " w/ " + interval.getRestDuration().toStringShort(false) + " rest";
                        return;
                    }
                }
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
            if (this.outputUnit == IntensityUnit.FreeRide) {
                return "Free Ride";
            }
            if (this.outputUnit == IntensityUnit.Unknown ||
                this.sportType == SportType.Unknown ||
                this.outputUnit == IntensityUnit.IF) {
                return intensity.toString();
            }
            if (this.sportType == SportType.Bike) {
                if (this.outputUnit == IntensityUnit.Watts) {
                    let value = Math.round(this.userProfile.getBikeFTP() * intensity.getValue());
                    if (this.roundValues) {
                        return FormatterHelper.roundNumberUp(value, 5) + "w";
                    }
                    else {
                        return value + "w";
                    }
                }
                else {
                    return intensity.toString();
                }
            }
            else if (this.sportType == SportType.Run) {
                var minMi = this.userProfile.getPaceMinMi(intensity);
                var outputValue = IntensityUnitHelper.convertTo(minMi, IntensityUnit.MinMi, this.outputUnit);
                if (this.outputUnit == IntensityUnit.Kmh || this.outputUnit == IntensityUnit.Mph) {
                    return MyMath.round10(outputValue, -1) + IntensityUnitHelper.toString(this.outputUnit);
                }
                else {
                    if (this.outputUnit == IntensityUnit.MinMi || this.outputUnit == IntensityUnit.MinKm) {
                        let roundIncrement = 5;
                        if (!this.roundValues) {
                            roundIncrement = 0;
                        }
                        return FormatterHelper.formatNumber(outputValue, 60, ":", IntensityUnitHelper.toString(this.outputUnit), roundIncrement);
                    }
                    else {
                        let pace_per_400m = this.userProfile.getRunningPace(intensity, this.outputUnit);
                        return FormatterHelper.formatNumber(pace_per_400m, 60, ":", "") + IntensityUnitHelper.toString(this.outputUnit);
                    }
                }
            }
            else if (this.sportType == SportType.Swim) {
                if (this.outputUnit == IntensityUnit.Mph) {
                    return MyMath.round10(this.userProfile.getSwimPaceMph(intensity), -1) + IntensityUnitHelper.toString(this.outputUnit);
                }
                else if (this.outputUnit == IntensityUnit.Per100Yards || this.outputUnit == IntensityUnit.Per100Meters || this.outputUnit == IntensityUnit.Per25Yards) {
                    var swim_pace_per_100 = this.userProfile.getSwimPace(this.outputUnit, intensity);
                    return FormatterHelper.formatNumber(swim_pace_per_100, 60, ":", "") + IntensityUnitHelper.toString(this.outputUnit);
                }
                else if (this.outputUnit == IntensityUnit.OffsetSeconds) {
                    // TODO: Not handling if the intensity needs conversion. 
                    console.assert(intensity.getOriginalUnit() == IntensityUnit.OffsetSeconds);
                    if (intensity.getOriginalValue() > 0) {
                        return "+" + intensity.getOriginalValue();
                    }
                    else {
                        return "" + intensity.getOriginalValue();
                    }
                }
                else {
                    console.assert(false, stringFormat("Invalid output unit {0}", this.outputUnit));
                    return "";
                }
            }
            else {
                console.assert(this.sportType == SportType.Other);
                return "";
            }
        }
        getIntervalTitle(interval) {
            let title = interval.getTitle();
            if (title == null || title.length == 0) {
                return null;
            }
            return title;
        }
        finalize() {
        }
    }
    Model.WorkoutTextVisitor = WorkoutTextVisitor;
    class UnparserVisitor {
        constructor() {
            this.output = "";
            this.level = 0;
        }
        getDurationPretty(d) {
            if (DurationUnitHelper.isDistance(d.getUnit())) {
                return d.toString();
            }
            return d.toTimeStringLong();
        }
        getIntensityPretty(i) {
            if (i.getOriginalUnit() == IntensityUnit.OffsetSeconds) {
                return "+" + i.getOriginalValue() + "s";
            }
            else if (i.getOriginalUnit() == IntensityUnit.FreeRide) {
                return "*";
            }
            else {
                return MyMath.round10(i.getValue() * 100, -1).toString();
            }
        }
        getTitlePretty(i) {
            if (i.getTitle().length != 0) {
                return ", " + i.getTitle();
            }
            else {
                return "";
            }
        }
        visitCommentInterval(interval) {
            this.output += stringFormat("\"{0}\"", interval.getTitle());
            this.addSeparator();
        }
        visitSimpleInterval(interval) {
            if (interval.getRestDuration().getValue() != 0) {
                let duration_pretty = this.getDurationPretty(interval.getWorkDuration());
                console.assert(duration_pretty.length > 0, "" + interval.getWorkDuration());
                let intensity_pretty = this.getIntensityPretty(interval.getIntensity());
                console.assert(intensity_pretty.length > 0, "" + interval.getIntensity());
                let duration_rest_pretty = this.getDurationPretty(interval.getRestDuration());
                console.assert(duration_rest_pretty.length > 0, "" + interval.getRestDuration());
                this.output += stringFormat("({0}, {1}{2}, {3})", duration_pretty, intensity_pretty, this.getTitlePretty(interval), duration_rest_pretty);
            }
            else {
                this.output += stringFormat("({0}, {1}{2})", this.getDurationPretty(interval.getWorkDuration()), this.getIntensityPretty(interval.getIntensity()), this.getTitlePretty(interval));
            }
            this.addSeparator();
        }
        visitStepBuildInterval(interval) {
            this.level++;
            this.output += interval.getRepeatCount().toString();
            this.output += "[";
            if (interval.areAllIntensitiesSame()) {
                this.output += "(";
                // Get any step as all the durations are the same.
                this.output += this.getIntensityPretty(interval.getStepInterval(0).getIntensity());
                for (let i = 0; i < interval.getRepeatCount(); i++) {
                    this.output += ", ";
                    this.output += this.getDurationPretty(interval.getStepInterval(i).getTotalDuration());
                }
                this.output += ")";
                this.addSeparator();
                VisitorHelper.visit(this, interval.getRestInterval());
            }
            else {
                console.assert(interval.areAllDurationsSame());
                this.output += "(";
                // Get any step as all the durations are the same.
                this.output += this.getDurationPretty(interval.getStepInterval(0).getTotalDuration());
                for (let i = 0; i < interval.getRepeatCount(); i++) {
                    this.output += ", ";
                    this.output += this.getIntensityPretty(interval.getStepInterval(i).getIntensity());
                }
                this.output += ")";
                this.addSeparator();
                VisitorHelper.visit(this, interval.getRestInterval());
            }
            this.trimSeparator();
            this.output += "]";
            this.level--;
            this.addSeparator();
        }
        visitRampBuildInterval(interval) {
            this.level++;
            this.output += stringFormat("({0}, {1}, {2}{3})", this.getDurationPretty(interval.getWorkDuration()), this.getIntensityPretty(interval.getStartIntensity()), this.getIntensityPretty(interval.getEndIntensity()), this.getTitlePretty(interval));
            this.level--;
            this.addSeparator();
        }
        visitRepeatInterval(interval) {
            this.level++;
            this.output += interval.getRepeatCount().toString();
            this.output += "[";
            for (let i = 0; i < interval.getIntervals().length; i++) {
                VisitorHelper.visit(this, interval.getIntervals()[i]);
            }
            this.trimSeparator();
            this.output += "]";
            this.level--;
            this.addSeparator();
        }
        visitArrayInterval(interval) {
            this.level++;
            if (this.level > 1) {
                this.output += "[";
            }
            for (var i = 0; i < interval.getIntervals().length; i++) {
                VisitorHelper.visit(this, interval.getIntervals()[i]);
            }
            this.trimSeparator();
            if (this.level > 1) {
                this.output += "]";
            }
            this.level--;
            this.addSeparator();
        }
        finalize() {
            this.trimNewLine();
            this.trimSeparator();
            this.trimNewLine();
            // The surroundings [ ] are redundant. lets remove them.
            if (this.output[0] == "[" && this.output[this.output.length - 1] == "]") {
                this.output = this.output.slice(1, this.output.length - 1);
            }
        }
        addSeparator() {
            if (this.level == 1) {
                this.output += "\n";
                return;
            }
            this.output += ", ";
        }
        trimSeparator() {
            while (this.output.endsWith(", ")) {
                this.output = this.output.slice(0, this.output.length - 2);
            }
            while (this.output.endsWith(",")) {
                this.output = this.output.slice(0, this.output.length - 1);
            }
        }
        trimNewLine() {
            while (this.output.endsWith("\n")) {
                this.output = this.output.slice(0, this.output.length - 1);
            }
        }
    }
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
        getRunningPace(intensity, outputUnit) {
            let pace_mph = this.getPaceMph(intensity);
            return IntensityUnitHelper.convertTo(pace_mph, IntensityUnit.Mph, outputUnit);
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
        getSportType() {
            return this.sportType;
        }
        getUserProfile() {
            return this.userProfile;
        }
        createIntensity(value, unit) {
            var ifValue = 0;
            // HACK here for now
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
                // For swimming we support 3 IntensityUnits
                if (unit == IntensityUnit.IF) {
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
                console.assert(this.sportType == SportType.Other);
                console.assert(unit == IntensityUnit.IF);
                ifValue = value;
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
                console.assert(this.sportType == SportType.Other);
                estimatedSpeedMph = 0;
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
        // Returns the easy IF threshold
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
            var zwift = new ZwiftDataVisitor(this.getBaseFileName());
            VisitorHelper.visitAndFinalize(zwift, this.intervals);
            return zwift.getContent();
        }
        getPPSMRXFile() {
            var zwift = new PPSMRXCourseDataVisitor(this.getBaseFileName());
            VisitorHelper.visitAndFinalize(zwift, this.intervals);
            return zwift.getContent();
        }
        getZWOFileName() {
            return this.getBaseFileName() + ".zwo";
        }
        getMRCFileName() {
            return this.getBaseFileName() + ".mrc";
        }
        getPPSMRXFileName() {
            return this.getBaseFileName() + ".ppsmrx";
        }
        getBaseFileName() {
            if (typeof (this.workoutTitle) != 'undefined' && this.workoutTitle.length != 0) {
                return this.workoutTitle;
            }
            var fileNameHelper = new FileNameHelper(this.intervals);
            return fileNameHelper.getFileName();
        }
    }
    class WorkoutBuilder {
        constructor(userProfile, sportType, outputUnit) {
            PreconditionsCheck.assertIsNumber(sportType, "sportType");
            PreconditionsCheck.assertIsNumber(outputUnit, "outputUnit");
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
        getNormalizedWorkoutDefinition() {
            let object_factory = new ObjectFactory(this.userProfile, this.sportType);
            return IntervalParser.normalize(object_factory, this.workoutDefinition);
        }
        withDefinition(workoutTitle, workoutDefinition) {
            let object_factory = new ObjectFactory(this.userProfile, this.sportType);
            this.intervals = IntervalParser.parse(object_factory, workoutDefinition);
            this.workoutTitle = workoutTitle;
            this.workoutDefinition = workoutDefinition;
            return this;
        }
        getIntensityFriendly(intensity, roundValues) {
            var f = new WorkoutTextVisitor(this.userProfile, this.sportType, this.outputUnit, roundValues);
            return f.getIntensityPretty(intensity);
        }
        getTSS() {
            return this.intervals.getTSS();
        }
        getTSS2() {
            return this.intervals.getTSS2();
        }
        getTimePretty() {
            return this.intervals.getTotalDuration().toTimeStringLong();
        }
        getIF() {
            return MyMath.round10(this.intervals.getIntensity().getValue() * 100, -1);
        }
        getAveragePower() {
            return MyMath.round10(this.userProfile.getBikeFTP() * this.intervals.getIntensity().getValue(), -1);
        }
        getIntervalPretty(interval, roundValues) {
            return WorkoutTextVisitor.getIntervalTitle(interval, this.userProfile, this.sportType, this.outputUnit, roundValues);
        }
        getEstimatedDistancePretty() {
            if (this.sportType == SportType.Swim) {
                return this.intervals.getWorkDuration().toStringDistance(DistanceUnit.Yards);
            }
            else {
                return this.intervals.getWorkDuration().toStringDistance(DistanceUnit.Miles);
            }
        }
        getAveragePace() {
            var minMi = this.userProfile.getPaceMinMi(this.intervals.getIntensity());
            let outputUnit = this.outputUnit;
            if (outputUnit == IntensityUnit.HeartRate) {
                outputUnit = IntensityUnit.MinMi;
            }
            var outputValue = IntensityUnitHelper.convertTo(minMi, IntensityUnit.MinMi, outputUnit);
            if (outputUnit == IntensityUnit.Kmh || outputUnit == IntensityUnit.Mph) {
                return MyMath.round10(outputValue, -1) + IntensityUnitHelper.toString(outputUnit);
            }
            else {
                return FormatterHelper.formatNumber(outputValue, 60, ":", IntensityUnitHelper.toString(outputUnit));
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
                if (interval.getWorkDuration().getDistanceInMiles() > 0) {
                    result += interval.getWorkDuration().getDistanceInMiles();
                }
            }.bind(this));
            return result;
        }
        getPrettyPrint(new_line = "\n") {
            let workout_text = this.getStepsList(new_line);
            var result = workout_text;
            result += new_line;
            result += new_line;
            result += "web+wp://";
            result += zlib.deflateSync(this.workoutDefinition).toString('base64');
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
        getPPSMRXFile() {
            let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
            return wfg.getPPSMRXFile();
        }
        getZWOFileName() {
            let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
            return wfg.getZWOFileName();
        }
        getMRCFileName() {
            let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
            return wfg.getMRCFileName();
        }
        getPPSMRXFileName() {
            let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
            return wfg.getPPSMRXFileName();
        }
    }
    Model.WorkoutBuilder = WorkoutBuilder;
    ;
    class StopWatch {
        constructor() {
            this.startTimeMillis = null;
            this.stoppedTimeMillis = null;
        }
        start() {
            if (this.startTimeMillis === null) {
                this.startTimeMillis = Date.now();
            }
        }
        stop() {
            if (this.startTimeMillis !== null) {
                this.stoppedTimeMillis += Date.now() - this.startTimeMillis;
                this.startTimeMillis = null;
            }
        }
        reset() {
            this.startTimeMillis = null;
            this.stoppedTimeMillis = 0;
        }
        getIsStarted() {
            return this.startTimeMillis !== null;
        }
        getElapsedTimeMillis() {
            if (this.startTimeMillis !== null) {
                return (Date.now() - this.startTimeMillis) + this.stoppedTimeMillis;
            }
            else {
                return this.stoppedTimeMillis;
            }
        }
        // Moves the start time so that durationMillis will be 
        // the result of getElapsedTimeMillis.
        moveStartTime(durationMillis) {
            if (this.startTimeMillis != null) {
                // now() - start = durationMillis
                // start = now() - durationMillis
                this.startTimeMillis = Date.now() - durationMillis;
            }
            else {
                // Change stopped so that when we start again
                // elapsed == duration_ts
                this.stoppedTimeMillis = durationMillis;
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
            var duration_seconds = interval.getTotalDuration().getSeconds();
            this.data_.push(new AbsoluteTimeInterval(this.time_, this.time_ + duration_seconds, interval));
            this.time_ += duration_seconds;
        }
        visitRampBuildInterval(interval) {
            var duration_seconds = interval.getWorkDuration().getSeconds();
            this.data_.push(new AbsoluteTimeInterval(this.time_, this.time_ + duration_seconds, interval));
            this.time_ += duration_seconds;
        }
        getIntervalArray() {
            return this.data_;
        }
        // Visit the intervals in order t
        visitRepeatInterval(interval) {
            for (let i = 0; i < interval.getRepeatCount(); i++) {
                // TODO: Save the iteration number and total interval, here in order to improve
                // the title that is going to be saved in AbsoluteTimeInterval.
                for (let j = 0; j < interval.getIntervals().length; j++) {
                    VisitorHelper.visit(this, interval.getIntervals()[j]);
                }
            }
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
            this.durationTotalSeconds_ = interval.getTotalDuration().getSeconds();
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
        getNext(ts) {
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
        getDurationTotalSeconds() {
            return this.durationTotalSeconds_;
        }
    }
    Model.PlayerHelper = PlayerHelper;
    let ArgType;
    (function (ArgType) {
        ArgType[ArgType["Number"] = 0] = "Number";
        ArgType[ArgType["String"] = 1] = "String";
    })(ArgType || (ArgType = {}));
    ;
    // Class that processes the input like #wu and replaces with macros.
    class TextPreprocessor {
        constructor(sport_type) {
            this.sport_type = sport_type;
        }
        _randBool() {
            return this._rand(0, 2) == 1;
        }
        // Generated a number in [min, max)
        _rand(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        }
        _randElement(array) {
            if (array.length > 0) {
                return array[this._rand(0, array.length)] + "\n";
            }
            else {
                return "";
            }
        }
        _warmup() {
            let warmup_text = "";
            let warmup_groups = [];
            if (this.sport_type == Model.SportType.Bike) {
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
                }
                else {
                    // No.
                    warmup_groups = [
                        // 9 min (warmup)
                        [
                            "(3min, 55), (3min, 65), (3min, 75)",
                            "(9min, 55, 75)"
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
                            "4[(30s, 85, 90, 95, 100), (30s, 55)]"
                        ],
                        // static (3min)
                        ["(3min, 55)"]
                    ];
                    for (let i = 0; i < warmup_groups.length; i++) {
                        warmup_text += this._randElement(warmup_groups[i]);
                    }
                }
            }
            else if (this.sport_type == Model.SportType.Run) {
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
            }
            else if (this.sport_type == Model.SportType.Swim) {
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
        _single_leg(number_repeats, single_leg_duration_secs) {
            console.assert(single_leg_duration_secs >= 0);
            console.assert(single_leg_duration_secs <= 90);
            return number_repeats + "[(" + single_leg_duration_secs + "s,45,Left Leg), (15s,45,Both), (" + single_leg_duration_secs + "s,45,Right Leg), (15s,45,Both)]";
        }
        _open_intervals(number_repeats, work_duration_sec) {
            console.assert(work_duration_sec >= 0);
            console.assert(work_duration_sec <= 60);
            let title = work_duration_sec <= 10 ? "Max efforts" : "Build";
            let rest_duration_sec = work_duration_sec <= 30 ? 60 - work_duration_sec : work_duration_sec;
            return number_repeats + "[(" + work_duration_sec + "s,*," + title + "), (" + rest_duration_sec + "s,55,Relaxed)]";
        }
        // TODO: number_repeats: number, work_duration_sec: number, rest_duration_sec: number
        _cadence_intervals() {
            // Not sure yet how to model this.
            // 2x(2-2-1 Spin Ups @ 75% 90-100-110 rpm)
            // 5x30s Highest Sustainable Cadence @ L2 - rest 30s very easy
            // 4[(4min, 60, cadence 80rpm), (3min, 65, cadence 90rpm), (2min, 70, cadence 100rpm), (1min, 75, cadence 110rpm)]
            //
            // (3min, 55, cadence @ 65rpm)
            // (2min, 55, cadence @ 95rpm)
            // (3min, 55, cadence @ 70rpm)
            // (2min, 55, cadence @ 100rpm)
            //
            // (3min, 55, cadence @ 75rpm)
            // (2min, 55, cadence @ 105rpm)
            // (3min, 55, cadence @ 80rpm)
            // (2min, 55, cadence @ 110rpm)
            return "<cd>";
        }
        processOne(input) {
            let funcs = [
                { regex: /#wu/, callback: this._warmup, params: [], description: "Warm up" },
                { regex: /#sl\((\d*),(\d*)\)/, callback: this._single_leg, params: [ArgType.Number, ArgType.Number], description: "Single Leg Drills." },
                { regex: /#o\((\d*),(\d*)\)/, callback: this._open_intervals, params: [ArgType.Number, ArgType.Number], description: "Open Power Intervals." },
                { regex: /#c\((\d*),(\d*)\)/, callback: this._cadence_intervals, params: [ArgType.Number, ArgType.Number], description: "Cadence Intervals." }
            ];
            for (let i = 0; i < funcs.length; i++) {
                let regex = funcs[i].regex;
                // Try seeing if this function matches the input.
                if (regex.test(input)) {
                    var instance_params = input.match(regex);
                    // Parse all parameters from the regex.
                    var func_params = [];
                    if (instance_params.length - 1 != funcs[i].params.length) {
                        console.log("Function call " + input + " is not matching definition.");
                    }
                    for (let j = 1; j < instance_params.length; j++) {
                        let instance_param = instance_params[j];
                        if (funcs[i].params[j - 1] == ArgType.Number) {
                            func_params.push(parseInt(instance_param));
                        }
                        else {
                            func_params.push(instance_param);
                        }
                    }
                    return funcs[i].callback.apply(this, func_params);
                }
                else {
                    console.log("regex " + regex + " failed to match " + input);
                }
            }
            return input;
        }
        process(input) {
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
    Model.TextPreprocessor = TextPreprocessor;
})(Model || (Model = {}));
module.exports = Model;
