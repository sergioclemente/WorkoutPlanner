var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
    (function (DistanceUnit) {
        DistanceUnit[DistanceUnit["Unknown"] = 0] = "Unknown";
        DistanceUnit[DistanceUnit["Miles"] = 1] = "Miles";
        DistanceUnit[DistanceUnit["Kilometers"] = 2] = "Kilometers";
        DistanceUnit[DistanceUnit["Meters"] = 3] = "Meters";
        DistanceUnit[DistanceUnit["Yards"] = 4] = "Yards";
    })(Model.DistanceUnit || (Model.DistanceUnit = {}));
    var DistanceUnit = Model.DistanceUnit;
    (function (TimeUnit) {
        TimeUnit[TimeUnit["Unknown"] = 0] = "Unknown";
        TimeUnit[TimeUnit["Seconds"] = 1] = "Seconds";
        TimeUnit[TimeUnit["Minutes"] = 2] = "Minutes";
        TimeUnit[TimeUnit["Hours"] = 3] = "Hours";
    })(Model.TimeUnit || (Model.TimeUnit = {}));
    var TimeUnit = Model.TimeUnit;
    (function (DurationUnit) {
        DurationUnit[DurationUnit["Unknown"] = -1] = "Unknown";
        DurationUnit[DurationUnit["Seconds"] = 0] = "Seconds";
        DurationUnit[DurationUnit["Minutes"] = 1] = "Minutes";
        DurationUnit[DurationUnit["Hours"] = 2] = "Hours";
        DurationUnit[DurationUnit["Meters"] = 3] = "Meters";
        DurationUnit[DurationUnit["Miles"] = 4] = "Miles";
        DurationUnit[DurationUnit["Kilometers"] = 5] = "Kilometers";
        DurationUnit[DurationUnit["Yards"] = 6] = "Yards";
    })(Model.DurationUnit || (Model.DurationUnit = {}));
    var DurationUnit = Model.DurationUnit;
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
    var MyMath = (function () {
        function MyMath() {
        }
        /**
         * Decimal adjustment of a number.
         *
         * @param   {String}    type    The type of adjustment.
         * @param   {Number}    value   The number.
         * @param   {Integer}   exp     The exponent (the 10 logarithm of the adjustment base).
         * @returns {Number}            The adjusted value.
         */
        MyMath.decimalAdjust = function (type, value, exp) {
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
        };
        MyMath.round10 = function (value, exp) {
            return MyMath.decimalAdjust('round', value, exp);
        };
        MyMath.floor10 = function (value, exp) {
            return MyMath.decimalAdjust('floor', value, exp);
        };
        MyMath.ceil10 = function (value, exp) {
            return MyMath.decimalAdjust('ceil', value, exp);
        };
        return MyMath;
    })();
    Model.MyMath = MyMath;
    var DistanceUnitHelper = (function () {
        function DistanceUnitHelper() {
        }
        DistanceUnitHelper.convertTo = function (value, unitFrom, unitTo) {
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
        };
        return DistanceUnitHelper;
    })();
    Model.DistanceUnitHelper = DistanceUnitHelper;
    var TimeUnitHelper = (function () {
        function TimeUnitHelper() {
        }
        TimeUnitHelper.convertTo = function (value, unitFrom, unitTo) {
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
        };
        return TimeUnitHelper;
    })();
    Model.TimeUnitHelper = TimeUnitHelper;
    function getStringFromDurationUnit(unit) {
        switch (unit) {
            case DurationUnit.Miles:
                return "mi";
            case DurationUnit.Kilometers:
                return "km";
            case DurationUnit.Meters:
                return "m";
            case DurationUnit.Hours:
                return "h";
            case DurationUnit.Minutes:
                return "min";
            case DurationUnit.Seconds:
                return "s";
            case DurationUnit.Yards:
                return "yards";
            default:
                console.assert(false, stringFormat("unkown duration {0}", unit));
                return "unknown";
        }
    }
    var DurationUnitHelper = (function () {
        function DurationUnitHelper() {
        }
        DurationUnitHelper.isTime = function (durationUnit) {
            return (durationUnit == DurationUnit.Hours
                || durationUnit == DurationUnit.Minutes
                || durationUnit == DurationUnit.Seconds);
        };
        DurationUnitHelper.isDistance = function (durationUnit) {
            return !DurationUnitHelper.isTime(durationUnit);
        };
        DurationUnitHelper.getDistanceMiles = function (unit, value) {
            if (DurationUnitHelper.isTime(unit)) {
                return 0;
            }
            else {
                var distance = value;
                if (unit == DurationUnit.Meters) {
                    return DistanceUnitHelper.convertTo(value, DistanceUnit.Meters, DistanceUnit.Miles);
                }
                else if (unit == DurationUnit.Kilometers) {
                    return DistanceUnitHelper.convertTo(value, DistanceUnit.Kilometers, DistanceUnit.Miles);
                }
                else if (unit == DurationUnit.Yards) {
                    return DistanceUnitHelper.convertTo(value, DistanceUnit.Yards, DistanceUnit.Miles);
                }
                else if (unit == DurationUnit.Miles) {
                    return distance;
                }
                else {
                    return 0;
                }
            }
        };
        DurationUnitHelper.getDurationSeconds = function (unit, value) {
            if (DurationUnitHelper.isDistance(unit)) {
                return 0;
            }
            else {
                var time = value;
                if (unit == DurationUnit.Hours) {
                    return TimeUnitHelper.convertTo(value, TimeUnit.Hours, TimeUnit.Seconds);
                }
                else if (unit == DurationUnit.Minutes) {
                    return TimeUnitHelper.convertTo(value, TimeUnit.Minutes, TimeUnit.Seconds);
                }
                else if (unit == DurationUnit.Seconds) {
                    return time;
                }
                else {
                    return 0;
                }
            }
        };
        return DurationUnitHelper;
    })();
    Model.DurationUnitHelper = DurationUnitHelper;
    var Duration = (function () {
        function Duration(unit, value, estimatedDurationInSeconds, estimatedDistanceInMiles) {
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
        Duration.prototype.getUnit = function () {
            return this.unit;
        };
        Duration.prototype.getValue = function () {
            return this.value;
        };
        Duration.prototype.getSeconds = function () {
            return this.estimatedDurationInSeconds;
        };
        Duration.prototype.getDistanceInMiles = function () {
            return this.estimatedDistanceInMiles;
        };
        Duration.prototype.toStringDistance = function (unitTo) {
            if (unitTo === void 0) { unitTo = DistanceUnit.Unknown; }
            if (DurationUnitHelper.isDistance(this.unit)) {
                if (unitTo == DistanceUnit.Unknown) {
                    return MyMath.round10(this.value, -1) + getStringFromDurationUnit(this.unit);
                }
                else {
                    if (unitTo == DistanceUnit.Yards) {
                        var yards = DistanceUnitHelper.convertTo(this.getDistanceInMiles(), DistanceUnit.Miles, DistanceUnit.Yards);
                        return MyMath.round10(yards, -1) + getStringFromDurationUnit(DurationUnit.Yards);
                    }
                    else {
                        // Not implemented yet
                        console.assert(false, stringFormat("Not implemted distance unit {0}", unitTo));
                    }
                }
            }
            else {
                return MyMath.round10(this.estimatedDistanceInMiles, -1) + getStringFromDurationUnit(DurationUnit.Miles);
            }
        };
        Duration.prototype.getTimeComponents = function () {
            var hours = (this.estimatedDurationInSeconds / 3600) | 0;
            return {
                hours: hours,
                minutes: ((this.estimatedDurationInSeconds - hours * 3600) / 60) | 0,
                seconds: (this.estimatedDurationInSeconds % 60) | 0
            };
        };
        Duration.prototype.toTimeStringLong = function () {
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
        };
        Duration.prototype.toStringShort = function () {
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
        };
        Duration.prototype.toString = function () {
            if (DurationUnitHelper.isTime(this.unit)) {
                return this.toTimeStringLong();
            }
            else {
                return this.toStringDistance();
            }
        };
        Duration.combine = function (dur1, dur2) {
            var estTime = dur1.getSeconds() + dur2.getSeconds();
            var estDistance = dur1.getDistanceInMiles() + dur2.getDistanceInMiles();
            if (DurationUnitHelper.isTime(dur1.getUnit())) {
                if (DurationUnitHelper.isTime(dur2.getUnit())) {
                    // Both are Time
                    // Convert both to seconds
                    var time1 = DurationUnitHelper.getDurationSeconds(dur1.getUnit(), dur1.getValue());
                    var time2 = DurationUnitHelper.getDurationSeconds(dur2.getUnit(), dur2.getValue());
                    return new Duration(DurationUnit.Seconds, time1 + time2, estTime, estDistance);
                }
                else {
                    // Use the unit of time in case is different
                    return new Duration(DurationUnit.Seconds, estTime, estTime, estDistance);
                }
            }
            else {
                if (DurationUnitHelper.isTime(dur2.getUnit())) {
                    // Use the unit of time in case is different
                    return new Duration(DurationUnit.Seconds, estTime, estTime, estDistance);
                }
                else {
                    var distance1 = DurationUnitHelper.getDistanceMiles(dur1.getUnit(), dur1.getValue());
                    var distance2 = DurationUnitHelper.getDistanceMiles(dur2.getUnit(), dur2.getValue());
                    return new Duration(DurationUnit.Miles, distance1 + distance2, estTime, estDistance);
                }
            }
        };
        return Duration;
    })();
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
            default:
                console.assert(false, stringFormat("Unknown intensity unit {0}", unit));
                return "unknown";
        }
    }
    function getDurationUnitFromString(unit) {
        var conversionMap = {
            "mi": DurationUnit.Miles,
            "km": DurationUnit.Kilometers,
            "m": DurationUnit.Meters,
            "meter": DurationUnit.Meters,
            "meters": DurationUnit.Meters,
            "h": DurationUnit.Hours,
            "hr": DurationUnit.Hours,
            "hour": DurationUnit.Hours,
            "hours": DurationUnit.Hours,
            "min": DurationUnit.Minutes,
            "sec": DurationUnit.Seconds,
            "s": DurationUnit.Seconds,
            "yards": DurationUnit.Yards,
            "y": DurationUnit.Yards,
            "yrd": DurationUnit.Yards,
        };
        if (unit in conversionMap) {
            return conversionMap[unit];
        }
        else {
            return DurationUnit.Unknown;
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
        else {
            console.assert(false, stringFormat("Invalid intensity unit {0}", unit));
        }
    }
    function isDurationUnit(value) {
        return getDurationUnitFromString(value) != DurationUnit.Unknown;
    }
    function isIntensityUnit(value) {
        return getIntensityUnitFromString(value) != IntensityUnit.Unknown;
    }
    function stringFormat(format) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match;
        });
    }
    var IntensityUnitHelper = (function () {
        function IntensityUnitHelper() {
        }
        IntensityUnitHelper.convertTo = function (value, unitFrom, unitTo) {
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
        };
        return IntensityUnitHelper;
    })();
    Model.IntensityUnitHelper = IntensityUnitHelper;
    ;
    var Intensity = (function () {
        function Intensity(ifValue, value, unit) {
            if (ifValue === void 0) { ifValue = 0; }
            if (value === void 0) { value = 0; }
            if (unit === void 0) { unit = IntensityUnit.IF; }
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
        Intensity.prototype.getValue = function () {
            return this.ifValue;
        };
        Intensity.prototype.toString = function () {
            if (this.originalUnit == IntensityUnit.IF) {
                return MyMath.round10(100 * this.originalValue, -1) + "%";
            }
            else {
                if (this.originalUnit == IntensityUnit.MinMi) {
                    return WorkoutTextVisitor.formatNumber(this.originalValue, 60, ":", getIntensityUnit(IntensityUnit.MinMi));
                }
                else if (this.originalUnit == IntensityUnit.Per100Yards || this.originalUnit == IntensityUnit.Per100Meters) {
                    return WorkoutTextVisitor.formatNumber(this.originalValue, 60, ":", getIntensityUnit(this.originalUnit));
                }
                else {
                    return MyMath.round10(this.originalValue, -1) + getStringFromIntensityUnit(this.originalUnit);
                }
            }
        };
        Intensity.prototype.getOriginalUnit = function () {
            return this.originalUnit;
        };
        Intensity.prototype.getOriginalValue = function () {
            return this.originalValue;
        };
        Intensity.combine = function (intensities, weights) {
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
        };
        return Intensity;
    })();
    Model.Intensity = Intensity;
    var BaseInterval = (function () {
        function BaseInterval(title) {
            this.title = title;
        }
        BaseInterval.prototype.getTitle = function () {
            return this.title;
        };
        BaseInterval.prototype.getIntensity = function () {
            // not aware that typescript supports abstract methods
            throw new Error("not implemented");
        };
        BaseInterval.prototype.getDuration = function () {
            // not aware that typescript supports abstract methods
            throw new Error("not implemented");
        };
        return BaseInterval;
    })();
    Model.BaseInterval = BaseInterval;
    var SimpleInterval = (function (_super) {
        __extends(SimpleInterval, _super);
        function SimpleInterval(title, intensity, duration) {
            _super.call(this, title);
            this.intensity = intensity;
            this.duration = duration;
        }
        SimpleInterval.prototype.getIntensity = function () {
            return this.intensity;
        };
        SimpleInterval.prototype.getDuration = function () {
            return this.duration;
        };
        return SimpleInterval;
    })(BaseInterval);
    Model.SimpleInterval = SimpleInterval;
    var RampBuildInterval = (function (_super) {
        __extends(RampBuildInterval, _super);
        function RampBuildInterval(title, startIntensity, endIntensity, duration) {
            _super.call(this, title);
            this.startIntensity = startIntensity;
            this.endIntensity = endIntensity;
            this.duration = duration;
        }
        RampBuildInterval.prototype.getIntensity = function () {
            return RampBuildInterval.computeAverageIntensity(this.startIntensity, this.endIntensity);
        };
        RampBuildInterval.prototype.getDuration = function () {
            return this.duration;
        };
        RampBuildInterval.prototype.getStartIntensity = function () {
            return this.startIntensity;
        };
        RampBuildInterval.prototype.getEndIntensity = function () {
            return this.endIntensity;
        };
        RampBuildInterval.computeAverageIntensity = function (intensity1, intensity2) {
            return Intensity.combine([intensity1, intensity2], [1, 1]);
        };
        return RampBuildInterval;
    })(BaseInterval);
    Model.RampBuildInterval = RampBuildInterval;
    var Point = (function () {
        function Point(x, y, label) {
            this.x = x;
            this.y = y;
            this.label = label;
        }
        return Point;
    })();
    Model.Point = Point;
    var ArrayInterval = (function () {
        function ArrayInterval(title, intervals) {
            this.title = title;
            this.intervals = intervals;
        }
        ArrayInterval.prototype.getIntensity = function () {
            var intensities = this.intervals.map(function (value, index, array) {
                return value.getIntensity();
            });
            var weights = this.intervals.map(function (value, index, array) {
                return value.getDuration().getSeconds();
            });
            return Intensity.combine(intensities, weights);
        };
        ArrayInterval.prototype.getDuration = function () {
            // If the interval is empty lets bail right away otherwise reducing the array will cause an
            // exception
            if (this.intervals.length == 0) {
                return new Duration(DurationUnit.Seconds, 0, 0, 0);
            }
            // It will create dummy intervals along the way so that I can use
            // the reduce abstraction		
            var res = this.intervals.reduce(function (previousValue, currentValue) {
                var duration = Duration.combine(previousValue.getDuration(), currentValue.getDuration());
                // Create a dummy interval with the proper duration
                return new SimpleInterval("", new Intensity(0), duration);
            });
            return res.getDuration();
        };
        ArrayInterval.prototype.getTitle = function () {
            return this.title;
        };
        ArrayInterval.prototype.getIntervals = function () {
            return this.intervals;
        };
        ArrayInterval.prototype.getTSS = function () {
            var tssVisitor = new TSSVisitor();
            VisitorHelper.visit(tssVisitor, this);
            return tssVisitor.getTSS();
        };
        ArrayInterval.prototype.getTSSFromIF = function () {
            var tss_from_if = (this.getIntensity().getValue() * this.getIntensity().getValue() * this.getDuration().getSeconds()) / 36;
            return MyMath.round10(tss_from_if, -1);
        };
        ArrayInterval.prototype.getIntensities = function () {
            var iv = new IntensitiesVisitor();
            VisitorHelper.visit(iv, this);
            return iv.getIntensities();
        };
        ArrayInterval.prototype.getTimeSeries = function () {
            var pv = new DataPointVisitor();
            VisitorHelper.visit(pv, this);
            // TODO: Massaging the data here to show in minutes
            return pv.data.map(function (item) {
                return {
                    x: item.x.getSeconds() / 60,
                    y: Math.round(item.y.getValue() * 100),
                };
            });
        };
        ArrayInterval.prototype.getTimeInZones = function (sportType) {
            var zv = new ZonesVisitor(sportType);
            VisitorHelper.visit(zv, this);
            return zv.getTimeInZones();
        };
        return ArrayInterval;
    })();
    Model.ArrayInterval = ArrayInterval;
    var RepeatInterval = (function (_super) {
        __extends(RepeatInterval, _super);
        function RepeatInterval(title, mainInterval, restInterval, repeatCount) {
            var intervals = [];
            if (mainInterval != null) {
                intervals.push(mainInterval);
            }
            if (restInterval != null) {
                intervals.push(restInterval);
            }
            _super.call(this, title, intervals);
            this.repeatCount = repeatCount;
        }
        RepeatInterval.prototype.getDuration = function () {
            var baseDuration = _super.prototype.getDuration.call(this);
            var durationRaw = baseDuration.getValue() * this.repeatCount;
            var durationSecs = baseDuration.getSeconds() * this.repeatCount;
            var durationMiles = baseDuration.getDistanceInMiles() * this.repeatCount;
            return new Duration(baseDuration.getUnit(), durationRaw, durationSecs, durationMiles);
        };
        RepeatInterval.prototype.getRepeatCount = function () {
            return this.repeatCount;
        };
        return RepeatInterval;
    })(ArrayInterval);
    Model.RepeatInterval = RepeatInterval;
    // Step is defined as follows
    // 2[(1min, 85, 95), (30s, 55)]
    // Which in fact translates to:
    // * 1min @ 85
    // * 30s @ 55
    // * 1min @ 95
    // * 30s @ 55
    var StepBuildInterval = (function (_super) {
        __extends(StepBuildInterval, _super);
        // The constructor receives the step intervals, the rest will be added later on
        // so that for the above interval it will look like:
        // [(1min, 85), (1min, 95), (30s, 55)]
        function StepBuildInterval(title, intervals) {
            _super.call(this, title, intervals);
        }
        StepBuildInterval.prototype.getIntensity = function () {
            var intensities = this.intervals.map(function (value, index, array) {
                return value.getIntensity();
            });
            var repeatCount = this.getRepeatCount();
            var weights = this.intervals.map(function (value, index, array) {
                return value.getDuration().getSeconds() * repeatCount;
            });
            return Intensity.combine(intensities, weights);
        };
        StepBuildInterval.prototype.getRepeatCount = function () {
            return this.intervals.length - 1;
        };
        StepBuildInterval.prototype.getStepInterval = function (idx) {
            return this.intervals[idx];
        };
        StepBuildInterval.prototype.getRestInterval = function () {
            return this.intervals[this.intervals.length - 1];
        };
        StepBuildInterval.prototype.areAllIntensitiesSame = function () {
            var prev_intensity = this.intervals[0].getIntensity().getValue();
            for (var i = 1; i < this.intervals.length - 1; i++) {
                var cur_intensity = this.intervals[i].getIntensity().getValue();
                if (cur_intensity != prev_intensity) {
                    return false;
                }
                prev_intensity = cur_intensity;
            }
            return true;
        };
        StepBuildInterval.prototype.getDuration = function () {
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
        };
        return StepBuildInterval;
    })(ArrayInterval);
    Model.StepBuildInterval = StepBuildInterval;
    var NumberParser = (function () {
        function NumberParser() {
        }
        NumberParser.prototype.evaluate = function (input, i) {
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
        };
        NumberParser.prototype.getValue = function () {
            return this.value;
        };
        return NumberParser;
    })();
    Model.NumberParser = NumberParser;
    var StringChunkParser = (function () {
        function StringChunkParser() {
        }
        StringChunkParser.prototype.evaluate = function (input, i) {
            this.value = "";
            while (input[i] == ',' || input[i] == ' ') {
                i++;
            }
            for (; i < input.length; i++) {
                var ch = input[i];
                if (ch == ',' || ch == ')') {
                    break;
                }
                this.value += ch;
            }
            // Points to the last valid char
            return i - 1;
        };
        StringChunkParser.prototype.getValue = function () {
            return this.value;
        };
        return StringChunkParser;
    })();
    Model.StringChunkParser = StringChunkParser;
    var IntensityParser = (function () {
        function IntensityParser() {
        }
        IntensityParser.prototype.evaluate = function (input, i) {
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
        };
        IntensityParser.prototype.getValue = function () {
            return this.value;
        };
        IntensityParser.prototype.getUnit = function () {
            return this.unit;
        };
        return IntensityParser;
    })();
    Model.IntensityParser = IntensityParser;
    var IntervalParser = (function () {
        function IntervalParser() {
        }
        IntervalParser.getCharVal = function (ch) {
            if (ch.length == 1) {
                return ch.charCodeAt(0);
            }
            else {
                return 0;
            }
        };
        IntervalParser.isDigit = function (ch) {
            return ch.length == 1 &&
                IntervalParser.getCharVal(ch) >= IntervalParser.getCharVal("0") &&
                IntervalParser.getCharVal(ch) <= IntervalParser.getCharVal("9");
        };
        IntervalParser.isLetter = function (ch) {
            return ch.length == 1 &&
                IntervalParser.getCharVal(ch) >= IntervalParser.getCharVal("a") &&
                IntervalParser.getCharVal(ch) <= IntervalParser.getCharVal("z");
        };
        IntervalParser.parseDouble = function (input, i) {
            var p = new NumberParser();
            var pos = p.evaluate(input, i);
            return { i: pos, value: p.getValue() };
        };
        IntervalParser.isWhitespace = function (ch) {
            return ch.length == 1 && (ch == " " || ch == "\t" || ch == "\n");
        };
        IntervalParser.throwParserError = function (column, msg) {
            throw Error("Error while parsing input on column " + column + "-  Error: " + msg);
        };
        IntervalParser.parse = function (factory, input) {
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
                            // Patch the missing units now
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
                                else if (nums[k] == -1) {
                                    // Rest interval. Lets assume as intensity = 0 
                                    intensities.push(factory.createIntensity(0, IntensityUnit.IF));
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
                                        step_intervals.push(new SimpleInterval("", intensity, step_duration));
                                    }
                                    var bsi = new StepBuildInterval("", step_intervals);
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
                                // assume a default intensity of 55%
                                var intensity = factory.createIntensity(55, IntensityUnit.IF);
                                var duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
                                interval = new SimpleInterval("", intensity, duration);
                            }
                            stack[stack.length - 1].getIntervals().push(interval);
                            break;
                        }
                        else if (ch == ",") {
                            numIndex++;
                        }
                        else {
                            var string_parser = new StringChunkParser();
                            i = string_parser.evaluate(input, i);
                            var value = string_parser.getValue();
                            // We have to distinguish between title and intensity
                            if (value == "rest") {
                                // HACK! this used
                                nums[numIndex] = -1;
                                units[numIndex] = "";
                            }
                            else if (IntervalParser.isDigit(value[0])) {
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
            }
            if (result.getIntervals().length == 0) {
                IntervalParser.throwParserError(0, "Invalid interval");
            }
            return result;
        };
        return IntervalParser;
    })();
    Model.IntervalParser = IntervalParser;
    var VisitorHelper = (function () {
        function VisitorHelper() {
        }
        VisitorHelper.visit = function (visitor, interval) {
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
            else {
                return null;
            }
        };
        return VisitorHelper;
    })();
    Model.VisitorHelper = VisitorHelper;
    var BaseVisitor = (function () {
        function BaseVisitor() {
        }
        BaseVisitor.prototype.visitSimpleInterval = function (interval) {
            // not aware that typescript supports abstract methods
            throw new Error("not implemented");
        };
        BaseVisitor.prototype.visitStepBuildInterval = function (interval) {
            // Generic implementation
            for (var i = 0; i < interval.getRepeatCount(); i++) {
                // step interval
                VisitorHelper.visit(this, interval.getStepInterval(i));
                // rest interval
                VisitorHelper.visit(this, interval.getRestInterval());
            }
        };
        BaseVisitor.prototype.visitRampBuildInterval = function (interval) {
            // not aware that typescript supports abstract methods
            throw new Error("not implemented");
        };
        BaseVisitor.prototype.visitRepeatInterval = function (interval) {
            for (var i = 0; i < interval.getRepeatCount(); i++) {
                this.visitArrayInterval(interval);
            }
        };
        BaseVisitor.prototype.visitArrayInterval = function (interval) {
            for (var i = 0; i < interval.getIntervals().length; i++) {
                VisitorHelper.visit(this, interval.getIntervals()[i]);
            }
        };
        return BaseVisitor;
    })();
    Model.BaseVisitor = BaseVisitor;
    // TSS = [(s x NP x IF) / (FTP x 3600)] x 100
    // IF = NP / FTP
    // TSS = [(s x NP x NP/FTP) / (FTP x 3600)] x 100
    // TSS = [s x (NP / FTP) ^ 2] / 36
    var TSSVisitor = (function (_super) {
        __extends(TSSVisitor, _super);
        function TSSVisitor() {
            _super.apply(this, arguments);
            this.tss = 0;
        }
        TSSVisitor.prototype.visitSimpleInterval = function (interval) {
            var duration = interval.getDuration().getSeconds();
            var intensity = interval.getIntensity().getValue();
            var val = duration * Math.pow(intensity, 2);
            this.tss += val;
        };
        TSSVisitor.prototype.visitRampBuildInterval = function (interval) {
            var startIntensity = interval.getStartIntensity().getValue();
            var endIntensity = interval.getEndIntensity().getValue();
            var duration = interval.getDuration().getSeconds();
            // Right way to estimate the intensity is by doing incremental of 1 sec
            for (var t = 0; t < duration; t++) {
                var intensity = startIntensity + (endIntensity - startIntensity) * (t / duration);
                var val = 1 * Math.pow(intensity, 2);
                this.tss += val;
            }
        };
        TSSVisitor.prototype.getTSS = function () {
            return MyMath.round10(this.tss / 36, -1);
        };
        return TSSVisitor;
    })(BaseVisitor);
    Model.TSSVisitor = TSSVisitor;
    var DateHelper = (function () {
        function DateHelper() {
        }
        DateHelper.getDayOfWeek = function () {
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
        };
        return DateHelper;
    })();
    Model.DateHelper = DateHelper;
    var ZonesMap = (function () {
        function ZonesMap() {
        }
        ZonesMap.getZoneMap = function (sportType) {
            // TODO: Use same zones as bike for now
            if (sportType == SportType.Bike || sportType == SportType.Swim) {
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
        };
        return ZonesMap;
    })();
    Model.ZonesMap = ZonesMap;
    var ZonesVisitor = (function (_super) {
        __extends(ZonesVisitor, _super);
        function ZonesVisitor(sportType) {
            _super.call(this);
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
        ZonesVisitor.getZone = function (sportType, intensity) {
            var zone_map = ZonesMap.getZoneMap(sportType);
            for (var zone = 1; zone <= 5; zone++) {
                var zone_obj = zone_map[zone];
                if (intensity >= zone_obj.low && intensity < zone_obj.high) {
                    return zone;
                }
            }
            return 6;
        };
        ZonesVisitor.prototype.incrementZoneTime = function (intensity, numberOfSeconds) {
            var zone = ZonesVisitor.getZone(this.sportType, intensity);
            this.zones[zone].value += numberOfSeconds;
        };
        ZonesVisitor.prototype.visitSimpleInterval = function (interval) {
            this.incrementZoneTime(interval.getIntensity().getValue(), interval.getDuration().getSeconds());
        };
        ZonesVisitor.prototype.visitRampBuildInterval = function (interval) {
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
        };
        ZonesVisitor.prototype.getTimeInZones = function () {
            var result = [];
            for (var key in this.zones) {
                var zone = this.zones[key];
                if (zone.value > 0) {
                    result.push({
                        name: zone.name,
                        range: zone.range,
                        duration: new Duration(DurationUnit.Seconds, zone.value, 0, 0)
                    });
                }
            }
            return result;
        };
        return ZonesVisitor;
    })(BaseVisitor);
    Model.ZonesVisitor = ZonesVisitor;
    var IntensitiesVisitor = (function (_super) {
        __extends(IntensitiesVisitor, _super);
        function IntensitiesVisitor() {
            _super.apply(this, arguments);
            this.intensities = {};
        }
        IntensitiesVisitor.prototype.visitSimpleInterval = function (interval) {
            this.intensities[interval.getIntensity().getValue()] = interval.getIntensity();
        };
        IntensitiesVisitor.prototype.visitRampBuildInterval = function (interval) {
            this.intensities[interval.getStartIntensity().getValue()] = interval.getStartIntensity();
            this.intensities[interval.getEndIntensity().getValue()] = interval.getEndIntensity();
        };
        IntensitiesVisitor.prototype.getIntensities = function () {
            var result = [];
            for (var intensityValue in this.intensities) {
                result.push(this.intensities[intensityValue]);
            }
            result.sort(function (left, right) {
                return left.getValue() - right.getValue();
            });
            return result;
        };
        return IntensitiesVisitor;
    })(BaseVisitor);
    Model.IntensitiesVisitor = IntensitiesVisitor;
    var DataPointVisitor = (function (_super) {
        __extends(DataPointVisitor, _super);
        function DataPointVisitor() {
            _super.apply(this, arguments);
            this.x = null;
            this.data = [];
        }
        DataPointVisitor.prototype.initX = function (duration) {
            if (this.x == null) {
                this.x = new Duration(duration.getUnit(), 0, 0, 0);
            }
        };
        DataPointVisitor.prototype.incrementX = function (duration) {
            this.x = Duration.combine(this.x, duration);
        };
        DataPointVisitor.prototype.visitSimpleInterval = function (interval) {
            var title = WorkoutTextVisitor.getIntervalTitle(interval);
            this.initX(interval.getDuration());
            this.data.push(new Point(this.x, interval.getIntensity(), title));
            this.incrementX(interval.getDuration());
            this.data.push(new Point(this.x, interval.getIntensity(), title));
        };
        DataPointVisitor.prototype.visitRampBuildInterval = function (interval) {
            var title = WorkoutTextVisitor.getIntervalTitle(interval);
            this.initX(interval.getDuration());
            this.data.push(new Point(this.x, interval.getStartIntensity(), title));
            this.incrementX(interval.getDuration());
            this.data.push(new Point(this.x, interval.getEndIntensity(), title));
        };
        return DataPointVisitor;
    })(BaseVisitor);
    Model.DataPointVisitor = DataPointVisitor;
    var ZwiftDataVisitor = (function (_super) {
        __extends(ZwiftDataVisitor, _super);
        function ZwiftDataVisitor(name) {
            _super.call(this);
            this.content = "";
            this.content = "<workout_file>\n\t<author>Workout Planner Author</author>\n\t<name>" + name + "</name>\n\t<description>Auto generated by https://github.com/sergioclemente/WorkoutPlanner</description>\n\t<tags>\n\t\t<tag name=\"INTERVALS\"/>\n\t</tags>\n\t<workout>\n";
        }
        ZwiftDataVisitor.prototype.finalize = function () {
            this.content += "\t</workout>\n</workout_file>";
        };
        ZwiftDataVisitor.prototype.getIntervalTitle = function (interval) {
            var title = interval.getTitle();
            if (title.length == 0) {
                title = WorkoutTextVisitor.getIntervalTitle(interval);
            }
            return title;
        };
        ZwiftDataVisitor.prototype.visitSimpleInterval = function (interval) {
            var duration = interval.getDuration().getSeconds();
            var intensity = interval.getIntensity().getValue();
            var title = this.getIntervalTitle(interval);
            this.content += "\t\t<SteadyState Duration='" + duration + "' Power='" + intensity + "'>\n";
            this.content += "\t\t\t<textevent timeoffset='0' message='" + title + "'/>\n";
            this.content += "\t\t</SteadyState>\n";
        };
        ZwiftDataVisitor.prototype.visitRampBuildInterval = function (interval) {
            var duration = interval.getDuration().getSeconds();
            var intensityStart = interval.getStartIntensity().getValue();
            var intensityEnd = interval.getEndIntensity().getValue();
            if (intensityStart < intensityEnd) {
                this.content += "\t\t<Warmup Duration='" + duration + "' PowerLow='" + intensityStart + "' PowerHigh='" + intensityEnd + "'/>\n";
            }
            else {
                this.content += "\t\t<Cooldown Duration='" + duration + "' PowerLow='" + intensityStart + "' PowerHigh='" + intensityEnd + "'/>\n";
            }
        };
        ZwiftDataVisitor.prototype.getContent = function () {
            return this.content;
        };
        return ZwiftDataVisitor;
    })(BaseVisitor);
    Model.ZwiftDataVisitor = ZwiftDataVisitor;
    var MRCCourseDataVisitor = (function (_super) {
        __extends(MRCCourseDataVisitor, _super);
        function MRCCourseDataVisitor() {
            _super.apply(this, arguments);
            this.courseData = "";
            this.time = 0;
            this.idx = 0;
            this.perfPRODescription = "";
        }
        MRCCourseDataVisitor.prototype.processCourseData = function (intensity, durationInSeconds) {
            this.time += durationInSeconds;
            // Course Data has to be in minutes
            this.courseData += (this.time / 60) + "\t" + Math.round(intensity.getValue() * 100) + "\n";
        };
        MRCCourseDataVisitor.prototype.processTitle = function (interval) {
            var title = interval.getTitle();
            if (title.length == 0) {
                title = WorkoutTextVisitor.getIntervalTitle(interval);
            }
            this.perfPRODescription += "Desc" + this.idx++ + "=" + title + "\n";
        };
        MRCCourseDataVisitor.prototype.getCourseData = function () {
            return this.courseData;
        };
        MRCCourseDataVisitor.prototype.getPerfPRODescription = function () {
            return this.perfPRODescription;
        };
        MRCCourseDataVisitor.prototype.visitSimpleInterval = function (interval) {
            this.processCourseData(interval.getIntensity(), 0);
            this.processCourseData(interval.getIntensity(), interval.getDuration().getSeconds());
            this.processTitle(interval);
        };
        MRCCourseDataVisitor.prototype.visitRampBuildInterval = function (interval) {
            this.processCourseData(interval.getStartIntensity(), 0);
            this.processCourseData(interval.getEndIntensity(), interval.getDuration().getSeconds());
            this.processTitle(interval);
        };
        return MRCCourseDataVisitor;
    })(BaseVisitor);
    Model.MRCCourseDataVisitor = MRCCourseDataVisitor;
    var FileNameHelper = (function () {
        function FileNameHelper(intervals) {
            this.intervals = intervals;
        }
        FileNameHelper.prototype.getFileName = function () {
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
        };
        return FileNameHelper;
    })();
    Model.FileNameHelper = FileNameHelper;
    var EASY_THRESHOLD = 0.60;
    var WorkoutTextVisitor = (function () {
        function WorkoutTextVisitor(userProfile, sportType, outputUnit) {
            if (userProfile === void 0) { userProfile = null; }
            if (sportType === void 0) { sportType = SportType.Unknown; }
            if (outputUnit === void 0) { outputUnit = IntensityUnit.Unknown; }
            this.result = "";
            this.userProfile = null;
            this.sportType = SportType.Unknown;
            this.outputUnit = IntensityUnit.Unknown;
            this.userProfile = userProfile;
            this.sportType = sportType;
            this.outputUnit = outputUnit;
        }
        WorkoutTextVisitor.roundNumberUp = function (value, round_val) {
            if (round_val === void 0) { round_val = 0; }
            if (round_val != 0) {
                var mod = value % round_val;
                if (mod != 0) {
                    value += round_val - mod;
                }
            }
            return value;
        };
        WorkoutTextVisitor.roundNumberDown = function (value, round_val) {
            if (round_val === void 0) { round_val = 0; }
            if (round_val != 0) {
                var mod = value % round_val;
                if (mod != 0) {
                    value -= mod;
                }
            }
            return value;
        };
        WorkoutTextVisitor.formatNumber = function (value, decimalMultiplier, separator, unit, round_val) {
            if (round_val === void 0) { round_val = 0; }
            var integerPart = Math.floor(value);
            var fractionPart = WorkoutTextVisitor.roundNumberDown(Math.round(decimalMultiplier * (value - integerPart)), round_val);
            return integerPart + separator + WorkoutTextVisitor.enforceDigits(fractionPart, 2) + unit;
        };
        WorkoutTextVisitor.enforceDigits = function (value, digits) {
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
        };
        WorkoutTextVisitor.getIntervalTitle = function (interval, userProfile, sportType, outputUnit) {
            if (userProfile === void 0) { userProfile = null; }
            if (sportType === void 0) { sportType = SportType.Unknown; }
            if (outputUnit === void 0) { outputUnit = IntensityUnit.Unknown; }
            // TODO: instantiating visitor is a bit clowny
            var f = new WorkoutTextVisitor(userProfile, sportType, outputUnit);
            VisitorHelper.visit(f, interval);
            return f.result;
        };
        WorkoutTextVisitor.prototype.visitRestInterval = function (interval) {
            if (interval.getIntensity().getValue() <= EASY_THRESHOLD) {
                this.result += interval.getDuration().toStringShort() + " easy";
            }
            else {
                this.result += interval.getDuration().toStringShort() + " rest @ " + this.getIntensityPretty(interval.getIntensity());
            }
        };
        // ArrayInterval
        WorkoutTextVisitor.prototype.visitArrayInterval = function (interval) {
            this.visitArrayIntervalInternal(interval, false);
        };
        WorkoutTextVisitor.prototype.visitArrayIntervalInternal = function (interval, always_add_parenthesis) {
            var length = interval.getIntervals().length;
            var firstInterval = interval.getIntervals()[0];
            var lastInterval = interval.getIntervals()[length - 1];
            var isRestIncluded = lastInterval.getIntensity().getValue() <
                firstInterval.getIntensity().getValue();
            if (length == 2) {
                if (isRestIncluded) {
                    VisitorHelper.visit(this, firstInterval);
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
        };
        // RepeatInterval
        WorkoutTextVisitor.prototype.visitRepeatInterval = function (interval) {
            this.result += interval.getRepeatCount() + " x ";
            this.visitArrayIntervalInternal(interval, true);
        };
        // RampBuildInterval
        WorkoutTextVisitor.prototype.visitRampBuildInterval = function (interval) {
            if (interval.getStartIntensity().getValue() <= EASY_THRESHOLD) {
                this.result += interval.getDuration().toStringShort() + " build to " + this.getIntensityPretty(interval.getEndIntensity());
            }
            else {
                this.result += interval.getDuration().toStringShort() + " build from " + this.getIntensityPretty(interval.getStartIntensity()) + " to " + this.getIntensityPretty(interval.getEndIntensity());
            }
        };
        WorkoutTextVisitor.prototype.visitStepBuildInterval = function (interval) {
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
        };
        // SimpleInterval
        WorkoutTextVisitor.prototype.visitSimpleInterval = function (interval) {
            this.result += interval.getDuration().toStringShort();
            var title = interval.getTitle();
            if (title.length > 0) {
                this.result += " " + title;
            }
            // Lets write the intensity as easy if its lower than a threshold, but it didn't have a title
            // Otherwise it might be something like single leg drills
            if (interval.getIntensity().getValue() <= EASY_THRESHOLD && title.length == 0) {
                if (interval.getIntensity().getValue() == 0) {
                    this.result += " rest";
                }
                else {
                    this.result += " easy";
                }
            }
            else {
                this.result += " @ " + this.getIntensityPretty(interval.getIntensity());
            }
        };
        WorkoutTextVisitor.prototype.getIntensityPretty = function (intensity) {
            if (this.outputUnit == IntensityUnit.Unknown || this.sportType == SportType.Unknown) {
                return intensity.toString();
            }
            if (this.outputUnit == IntensityUnit.IF) {
                return intensity.toString();
            }
            if (this.sportType == SportType.Bike) {
                if (this.outputUnit == IntensityUnit.Watts) {
                    return WorkoutTextVisitor.roundNumberUp(Math.round(this.userProfile.getBikeFTP() * intensity.getValue()), 5) + "w";
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
                    return WorkoutTextVisitor.formatNumber(outputValue, 60, ":", getIntensityUnit(this.outputUnit), 5);
                }
            }
            else if (this.sportType == SportType.Swim) {
                if (this.outputUnit == IntensityUnit.Mph) {
                    return MyMath.round10(this.userProfile.getSwimPaceMph(intensity), -1) + getIntensityUnit(this.outputUnit);
                }
                else if (this.outputUnit == IntensityUnit.Per100Yards || this.outputUnit == IntensityUnit.Per100Meters) {
                    var swim_pace_per_100 = this.userProfile.getSwimPace(this.outputUnit, intensity);
                    return WorkoutTextVisitor.formatNumber(swim_pace_per_100, 60, ":", getIntensityUnit(this.outputUnit));
                }
                else {
                    console.assert(false, stringFormat("Invalid output unit {0}", this.outputUnit));
                }
            }
            else {
                console.assert(false, stringFormat("Invalid sport type {0}", this.sportType));
            }
        };
        return WorkoutTextVisitor;
    })();
    Model.WorkoutTextVisitor = WorkoutTextVisitor;
    var SpeedParser = (function () {
        function SpeedParser() {
        }
        SpeedParser.getSpeedInMph = function (speed) {
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
        };
        SpeedParser._extractNumber = function (numberString, decimalMultiplier, strSeparator, strSuffix) {
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
        };
        return SpeedParser;
    })();
    Model.SpeedParser = SpeedParser;
    var UserProfile = (function () {
        function UserProfile(bikeFTPWatts, renameTPace, swimCSS, email) {
            this.bikeFTP = bikeFTPWatts;
            var speed_mph = SpeedParser.getSpeedInMph(renameTPace);
            this.runningTPaceMinMi = IntensityUnitHelper.convertTo(speed_mph, IntensityUnit.Mph, IntensityUnit.MinMi);
            var swim_css_mph = SpeedParser.getSpeedInMph(swimCSS);
            this.swimmingCSSMinPer100Yards = IntensityUnitHelper.convertTo(swim_css_mph, IntensityUnit.Mph, IntensityUnit.Per100Yards);
            this.email = email;
        }
        UserProfile.prototype.getBikeFTP = function () {
            return this.bikeFTP;
        };
        UserProfile.prototype.getRunningTPaceMinMi = function () {
            return this.runningTPaceMinMi;
        };
        UserProfile.prototype.getEmail = function () {
            return this.email;
        };
        UserProfile.prototype.getPaceMph = function (intensity) {
            var estPaceMinMi = this.getPaceMinMi(intensity);
            return 60 / estPaceMinMi;
        };
        UserProfile.prototype.getPaceMinMi = function (intensity) {
            var pace_mph = IntensityUnitHelper.convertTo(this.getRunningTPaceMinMi(), IntensityUnit.MinMi, IntensityUnit.Mph) * intensity.getValue();
            return IntensityUnitHelper.convertTo(pace_mph, IntensityUnit.Mph, IntensityUnit.MinMi);
        };
        UserProfile.prototype.getSwimCSSMph = function () {
            var css_mph = IntensityUnitHelper.convertTo(this.swimmingCSSMinPer100Yards, IntensityUnit.Per100Yards, IntensityUnit.Mph);
            return css_mph;
        };
        UserProfile.prototype.getSwimPaceMph = function (intensity) {
            var css_mph = IntensityUnitHelper.convertTo(this.swimmingCSSMinPer100Yards, IntensityUnit.Per100Yards, IntensityUnit.Mph);
            return css_mph * intensity.getValue();
        };
        UserProfile.prototype.getSwimPace = function (intensity_unit_result, intensity) {
            var pace_mph = this.getSwimCSSMph() * intensity.getValue();
            return IntensityUnitHelper.convertTo(pace_mph, IntensityUnit.Mph, intensity_unit_result);
        };
        return UserProfile;
    })();
    Model.UserProfile = UserProfile;
    var ObjectFactory = (function () {
        function ObjectFactory(userProfile, sportType) {
            this.userProfile = userProfile;
            this.sportType = sportType;
        }
        ObjectFactory.prototype.getBikeSpeedMphForIntensity = function (intensity) {
            // TODO: simplifying it for now
            var actualSpeedMph = 0;
            if (intensity.getValue() < 0.65) {
                actualSpeedMph = 15;
            }
            else {
                actualSpeedMph = 20;
            }
            return actualSpeedMph;
        };
        ObjectFactory.prototype.createIntensity = function (value, unit) {
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
        };
        ObjectFactory.prototype.createDuration = function (intensity, unit, value) {
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
        };
        return ObjectFactory;
    })();
    Model.ObjectFactory = ObjectFactory;
    var StopWatch = (function () {
        function StopWatch() {
            this.startTime = null;
            this.stoppedTime = null;
        }
        StopWatch.prototype.start = function () {
            if (this.startTime === null) {
                this.startTime = Date.now();
            }
        };
        StopWatch.prototype.stop = function () {
            if (this.startTime !== null) {
                this.stoppedTime += Date.now() - this.startTime;
                this.startTime = null;
            }
        };
        StopWatch.prototype.getIsStarted = function () {
            return this.startTime !== null;
        };
        StopWatch.prototype.getElapsedTime = function () {
            if (this.startTime !== null) {
                return (Date.now() - this.startTime) + this.stoppedTime;
            }
            else {
                return this.stoppedTime;
            }
        };
        StopWatch.prototype.reset = function () {
            this.startTime = null;
            this.stoppedTime = 0;
        };
        return StopWatch;
    })();
    Model.StopWatch = StopWatch;
    var ArrayIterator = (function () {
        function ArrayIterator(array) {
            this.array = array;
        }
        ArrayIterator.prototype.reset = function () {
            this.index = -1;
        };
        ArrayIterator.prototype.getCurrent = function () {
            return this.array[this.index];
        };
        ArrayIterator.prototype.getCurrentIndex = function () {
            return this.index;
        };
        ArrayIterator.prototype.tryGettingNext = function () {
            if (this.index + 1 < this.array.length) {
                return this.array[this.index + 1];
            }
            else {
                return null;
            }
        };
        ArrayIterator.prototype.getIsValid = function () {
            return this.index >= 0 && this.index < this.array.length;
        };
        ArrayIterator.prototype.moveNext = function () {
            this.index++;
            return this.getIsValid();
        };
        return ArrayIterator;
    })();
    Model.ArrayIterator = ArrayIterator;
    var WorkoutBuilder = (function () {
        function WorkoutBuilder(userProfile, sportType, outputUnit) {
            this.userProfile = userProfile;
            this.sportType = sportType;
            this.outputUnit = outputUnit;
        }
        WorkoutBuilder.prototype.getInterval = function () {
            return this.intervals;
        };
        WorkoutBuilder.prototype.getSportType = function () {
            return this.sportType;
        };
        WorkoutBuilder.prototype.withDefinition = function (workoutDefinition) {
            this.intervals = IntervalParser.parse(new ObjectFactory(this.userProfile, this.sportType), workoutDefinition);
            this.workoutDefinition = workoutDefinition;
            return this;
        };
        WorkoutBuilder.prototype.getIntensityFriendly = function (intensity) {
            var f = new WorkoutTextVisitor(this.userProfile, this.sportType, this.outputUnit);
            return f.getIntensityPretty(intensity);
        };
        WorkoutBuilder.prototype.getTSS = function () {
            return this.intervals.getTSS();
        };
        WorkoutBuilder.prototype.getTSSFromIF = function () {
            return this.intervals.getTSSFromIF();
        };
        WorkoutBuilder.prototype.getTimePretty = function () {
            return this.intervals.getDuration().toTimeStringLong();
        };
        WorkoutBuilder.prototype.getIF = function () {
            return MyMath.round10(this.intervals.getIntensity().getValue() * 100, -1);
        };
        WorkoutBuilder.prototype.getAveragePower = function () {
            return MyMath.round10(this.userProfile.getBikeFTP() * this.intervals.getIntensity().getValue(), -1);
        };
        WorkoutBuilder.prototype.getIntervalPretty = function (interval) {
            return WorkoutTextVisitor.getIntervalTitle(interval, this.userProfile, this.sportType, this.outputUnit);
        };
        WorkoutBuilder.prototype.getEstimatedDistancePretty = function () {
            if (this.sportType == SportType.Swim) {
                return this.intervals.getDuration().toStringDistance(DistanceUnit.Yards);
            }
            else {
                return this.intervals.getDuration().toStringDistance(DistanceUnit.Miles);
            }
        };
        WorkoutBuilder.prototype.getAveragePace = function () {
            var minMi = this.userProfile.getPaceMinMi(this.intervals.getIntensity());
            var outputValue = IntensityUnitHelper.convertTo(minMi, IntensityUnit.MinMi, this.outputUnit);
            if (this.outputUnit == IntensityUnit.Kmh || this.outputUnit == IntensityUnit.Mph) {
                return MyMath.round10(outputValue, -1) + getIntensityUnit(this.outputUnit);
            }
            else {
                return WorkoutTextVisitor.formatNumber(outputValue, 60, ":", getIntensityUnit(this.outputUnit));
            }
        };
        WorkoutBuilder.prototype.getPrettyPrint = function (new_line) {
            if (new_line === void 0) { new_line = "\n"; }
            var intensities = this.intervals.getIntensities();
            var distanceInMiles = 0;
            var result = new_line;
            this.intervals.getIntervals().forEach(function (interval) {
                result += ("* " + this.getIntervalPretty(interval) + new_line);
                if (interval.getDuration().getDistanceInMiles() > 0) {
                    distanceInMiles += interval.getDuration().getDistanceInMiles();
                }
            }.bind(this));
            result += (new_line);
            result += ("Stats:");
            result += (new_line);
            result += ("TSS: " + this.getTSS());
            result += (new_line);
            result += ("\t* Time: " + this.getTimePretty());
            result += (new_line);
            if (this.sportType == SportType.Swim) {
                result += ("\t* Distance: " + this.getEstimatedDistancePretty());
            }
            else {
                result += ("\t* Distance: " + this.getEstimatedDistancePretty());
            }
            result += (new_line);
            result += ("\t* IF: " + this.getIF());
            result += (new_line);
            result += ("Zones:");
            result += (new_line);
            var zones = this.intervals.getTimeInZones(this.sportType);
            zones.forEach(function (zone) {
                result += ("\t* " + zone.name + " " + zone.range + " : " + zone.duration.toString());
                result += (new_line);
            });
            if (this.sportType == SportType.Bike) {
                result += ("\t* Avg Pwr: " + this.getAveragePower() + "w");
                result += (new_line);
            }
            result += (new_line);
            result += ("Paces:");
            result += (new_line);
            intensities.forEach(function (intensity) {
                result += ("\t* " + Math.round(intensity.getValue() * 100) + "% (" + this.getIntensityFriendly(intensity) + ")");
                result += (new_line);
            }, this);
            result += (new_line);
            result += ("Workout Definition: " + this.workoutDefinition);
            result += (new_line);
            return result;
        };
        WorkoutBuilder.prototype.getMRCFile = function () {
            var dataVisitor = new MRCCourseDataVisitor();
            VisitorHelper.visit(dataVisitor, this.intervals);
            var result = "";
            result += "[COURSE HEADER]\n";
            result += "VERSION=2\n";
            result += "UNITS=ENGLISH\n";
            result += "DESCRIPTION=Auto generated with WorkoutPlanner - https://github.com/sergioclemente/WorkoutPlanner\n";
            result += "MINUTES\tPERCENT\n";
            result += "[END COURSE HEADER]\n";
            result += "[COURSE DATA]\n";
            result += dataVisitor.getCourseData();
            result += "[END COURSE DATA]\n";
            result += "[PERFPRO DESCRIPTIONS]\n";
            result += dataVisitor.getPerfPRODescription();
            result += "[END PERFPRO DESCRIPTIONS]\n";
            return result;
        };
        WorkoutBuilder.prototype.getZWOFile = function () {
            var fileNameHelper = new FileNameHelper(this.intervals);
            var workout_name = fileNameHelper.getFileName();
            var zwift = new ZwiftDataVisitor(workout_name);
            VisitorHelper.visit(zwift, this.intervals);
            zwift.finalize();
            return zwift.getContent();
        };
        WorkoutBuilder.prototype.getZWOFileName = function () {
            var fileNameHelper = new FileNameHelper(this.intervals);
            return fileNameHelper.getFileName() + ".zwo";
        };
        WorkoutBuilder.prototype.getMRCFileName = function () {
            var fileNameHelper = new FileNameHelper(this.intervals);
            return fileNameHelper.getFileName() + ".mrc";
        };
        return WorkoutBuilder;
    })();
    Model.WorkoutBuilder = WorkoutBuilder;
    ;
})(Model || (Model = {}));
module.exports = Model;
