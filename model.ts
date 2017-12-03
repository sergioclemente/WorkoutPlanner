module Model {

	var zlib = require('zlib');

	export enum SportType {
		Unknown = -1,
		Swim = 0,
		Bike = 1,
		Run = 2,
		Other = 3
	}

	// If you add another distance, make sure you update the MAX_DISTANCE
	// and that it doesn't overlap with TimeUnit
	export enum DistanceUnit {
		Unknown = 0,
		Miles = 1,
		Kilometers = 2,
		Meters = 3,
		Yards = 4,
	}

	// If you add another time unit, be careful not adding one before MIN_TIME
	export enum TimeUnit {
		Unknown = 11,
		Seconds,
		Minutes,
		Hours
	}

	// Duration of a workout can be either specified as time or distance
	// We use the | definition of typescript, but we have to be careful
	// so that the enums don't overlap. 
	export type DurationUnit = TimeUnit | DistanceUnit;
	const MIN_TIME: number = 11;
	const MAX_DISTANCE: number = 10;

	export enum IntensityUnit {
		Unknown = -1,
		IF = 0,
		Watts = 1,
		MinMi = 2,
		Mph = 3,
		Kmh = 4,
		MinKm = 5,
		Per100Yards = 6,
		Per100Meters = 7,
		Per400Meters = 8,
		OffsetSeconds = 9,
		HeartRate = 10,
		FreeRide = 11,
	}

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

		static round10(value: number, exp: number): number {
			return MyMath.decimalAdjust('round', value, exp);
		}
		static floor10(value: number, exp: number): number {
			return MyMath.decimalAdjust('floor', value, exp);
		}
		static ceil10(value: number, exp: number): number {
			return MyMath.decimalAdjust('ceil', value, exp);
		}
	}

	export class SportTypeHelper {
		static convertToString(sportType: SportType) {
			if (sportType == SportType.Bike) {
				return "Bike";
			} else if (sportType == SportType.Run) {
				return "Run";
			} else if (sportType == SportType.Swim) {
				return "Swim";
			} else if (sportType == SportType.Other) {
				return "Other";
			} else {
				console.assert(false);
				return "";
			}
		}
	}

	export class DistanceUnitHelper {
		static convertTo(value: number, unitFrom: DistanceUnit, unitTo: DistanceUnit): number {
			// convert first to meters
			var distanceInMeters = 0;
			if (unitFrom == DistanceUnit.Kilometers) {
				distanceInMeters = value * 1000;
			} else if (unitFrom == DistanceUnit.Meters) {
				distanceInMeters = value;
			} else if (unitFrom == DistanceUnit.Miles) {
				distanceInMeters = value * 1609.344;
			} else if (unitFrom == DistanceUnit.Yards) {
				distanceInMeters = value * 0.9144;
			} else {
				console.assert(false, stringFormat("Unknown unitFrom {0}", unitFrom));
				throw new Error("Unknown distance unit");
			}

			// convert to final unit
			if (unitTo == DistanceUnit.Kilometers) {
				return distanceInMeters / 1000;
			} else if (unitTo == DistanceUnit.Meters) {
				return distanceInMeters;
			} else if (unitTo == DistanceUnit.Miles) {
				return distanceInMeters / 1609.344;
			} else if (unitTo == DistanceUnit.Yards) {
				return distanceInMeters / 0.9144;
			} else {
				return -1;
			}
		}
	}

	export class TimeUnitHelper {
		static convertTo(value: number, unitFrom: TimeUnit, unitTo: TimeUnit): number {
			var timeInSeconds = 0;
			if (unitFrom == TimeUnit.Seconds) {
				timeInSeconds = value;
			} else if (unitFrom == TimeUnit.Minutes) {
				timeInSeconds = value * 60;
			} else if (unitFrom == TimeUnit.Hours) {
				timeInSeconds = value * 3600;
			} else {
				console.assert(false, "Unknown unitFrom {0}", unitFrom);
				throw new Error("Unknown time unit");
			}

			// convert to final unit
			if (unitTo == TimeUnit.Seconds) {
				return timeInSeconds;
			} else if (unitTo == TimeUnit.Minutes) {
				return timeInSeconds / 60;
			} else if (unitTo == TimeUnit.Hours) {
				return timeInSeconds / 3600;
			} else {
				return -1;
			}
		}
	}

	class DurationUnitHelper {
		public static isTime(durationUnit: DurationUnit): boolean {
			return durationUnit >= MIN_TIME;
		}

		public static isDistance(durationUnit: DurationUnit): boolean {
			return durationUnit <= MAX_DISTANCE;
		}

		public static isDurationUnit(unit : string) : boolean {
			return DurationUnitHelper.toDurationUnit(unit) != TimeUnit.Unknown;
		}

		static getDistanceMiles(unit: DurationUnit, value: number) {
			if (DurationUnitHelper.isTime(unit)) {
				return 0;
			} else {
				var distance = value;
				if (unit == DistanceUnit.Meters) {
					return DistanceUnitHelper.convertTo(value, DistanceUnit.Meters, DistanceUnit.Miles);
				} else if (unit == DistanceUnit.Kilometers) {
					return DistanceUnitHelper.convertTo(value, DistanceUnit.Kilometers, DistanceUnit.Miles);
				} else if (unit == DistanceUnit.Yards) {
					return DistanceUnitHelper.convertTo(value, DistanceUnit.Yards, DistanceUnit.Miles);
				} else if (unit == DistanceUnit.Miles) {
					return distance;
				} else {
					return 0;
				}
			}
		}

		// TODO: Move this to duration.
		static getDurationSeconds(unit: DurationUnit, value: number): number {
			if (DurationUnitHelper.isDistance(unit)) {
				return 0;
			} else {
				var time = value;
				if (unit == TimeUnit.Hours) {
					return TimeUnitHelper.convertTo(value, TimeUnit.Hours, TimeUnit.Seconds);
				} else if (unit == TimeUnit.Minutes) {
					return TimeUnitHelper.convertTo(value, TimeUnit.Minutes, TimeUnit.Seconds);
				} else if (unit == TimeUnit.Seconds) {
					return time;
				} else {
					return 0;
				}
			}
		}

		static areDurationUnitsSame(durationUnits: DurationUnit[]): boolean {
			if (durationUnits == null || durationUnits.length <= 1) {
				return true;
			}
			let durationUnit: DurationUnit = durationUnits[0];
			for (let i = 1; i < durationUnits.length; ++i) {
				if (durationUnits[i] != durationUnit) {
					return false;
				}
			}
			return true;
		}

		static toString(unit : DurationUnit) : string {
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

		static toDurationUnit(unit : string) : DurationUnit {
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
			} else {
				return TimeUnit.Unknown;
			}			
		}
	}

	export class FormatterHelper {
		static roundNumberUp(value: number, round_val: number = 0) {
			if (round_val != 0) {
				var mod = value % round_val;
				if (mod != 0) {
					value += round_val - mod;
				}
			}
			return value;
		}

		static roundNumberDown(value: number, round_val: number = 0) {
			if (round_val != 0) {
				var mod = value % round_val;
				if (mod != 0) {
					value -= mod;
				}
			}
			return value;
		}

		static formatNumber(value: number, decimalMultiplier: number, separator: string, unit: string, round_val: number = 0) {
			var integerPart = Math.floor(value);
			var fractionPart = FormatterHelper.roundNumberDown(Math.round(decimalMultiplier * (value - integerPart)), round_val);
			return integerPart + separator + FormatterHelper.enforceDigits(fractionPart, 2) + unit;
		}

		public static enforceDigits(value: number, digits: number) {
			var result = value + "";
			if (result.length > digits) {
				return result.substring(0, digits);
			} else {
				while (result.length < digits) {
					result = "0" + result;
				}
				return result;
			}
		}

		static formatTime(milliseconds): string {
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
			} else {
				if (minutes != 0) {
					return FormatterHelper.enforceDigits(minutes, 2) + "m" + FormatterHelper.enforceDigits(seconds, 2) + "s";
				} else {
					return seconds + "s";
				}
			}
		}
	}

	export class Duration {
		private value: number;
		private unit: DurationUnit;
		private estimatedDurationInSeconds: number;
		private estimatedDistanceInMiles: number;

		public static ZeroDuration: Duration = new Duration(TimeUnit.Seconds, 0, 0, 0);

		constructor(unit: DurationUnit, value: number, estimatedDurationInSeconds: number, estimatedDistanceInMiles: number) {
			this.unit = unit;
			this.value = value;
			if (estimatedDistanceInMiles == 0 && DurationUnitHelper.isDistance(unit)) {
				this.estimatedDistanceInMiles = DurationUnitHelper.getDistanceMiles(unit, value);
			} else {
				this.estimatedDistanceInMiles = estimatedDistanceInMiles;
			}
			if (estimatedDurationInSeconds == 0 && DurationUnitHelper.isTime(unit)) {
				this.estimatedDurationInSeconds = DurationUnitHelper.getDurationSeconds(unit, value);
			} else {
				this.estimatedDurationInSeconds = estimatedDurationInSeconds;
			}
		}

		getUnit(): DurationUnit {
			return this.unit;
		}

		getValue(): number {
			return this.value;
		}

		getSeconds(): number {
			if (isNaN(this.estimatedDurationInSeconds) || !isFinite(this.estimatedDurationInSeconds)) {
				return 0;
			}
			return this.estimatedDurationInSeconds;
		}

		getDistanceInMiles(): number {
			return this.estimatedDistanceInMiles;
		}

		getDistance(unitTo: DistanceUnit = DistanceUnit.Unknown): number {
			if (DurationUnitHelper.isDistance(this.unit)) {
				if (unitTo == DistanceUnit.Unknown) {
					return MyMath.round10(this.value, -1);
				} else {
					if (unitTo == DistanceUnit.Yards) {
						var yards = DistanceUnitHelper.convertTo(this.getDistanceInMiles(), DistanceUnit.Miles, DistanceUnit.Yards);
						return MyMath.round10(yards, -1);
					} else {
						return MyMath.round10(this.value, -1);
					}
				}
			} else {
				return MyMath.round10(DistanceUnitHelper.convertTo(this.estimatedDistanceInMiles, DistanceUnit.Miles, unitTo), -1);
			}
		}

		toStringDistance(unitTo: DistanceUnit = DistanceUnit.Unknown): string {
			return this.getDistance(unitTo) + DurationUnitHelper.toString(this.unit);
		}

		getTimeComponents(): any {
			var hours = (this.estimatedDurationInSeconds / 3600) | 0;
			return {
				hours: hours,
				minutes: ((this.estimatedDurationInSeconds - hours * 3600) / 60) | 0,
				seconds: (this.estimatedDurationInSeconds % 60) | 0
			};
		}

		toTimeStringLong(): string {
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

		toTimeStringShort(): string {
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

		toStringShort(omitUnit : boolean): string {
			if (!DurationUnitHelper.isTime(this.unit)) {
				if (omitUnit) {
					return this.getDistance(<DistanceUnit>this.unit) + "";
				} else {
					return this.toStringDistance();
				}
			}

			return this.toTimeStringShort();
		}

		toString(): string {
			if (DurationUnitHelper.isTime(this.unit)) {
				return this.toTimeStringLong();
			} else {
				return this.toStringDistance();
			}
		}

		static combine(dur1: Duration, dur2: Duration): Duration {
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
				} else {
					// Use the distance unit in case they are different.
					// Convert to time
					var time_sum = dur1.getSeconds() + dur2.getSeconds();
					return new Duration(TimeUnit.Seconds, time_sum, estTime, estDistance);
				}
			} else {
				if (DurationUnitHelper.isTime(dur2.getUnit())) {
					var time_sum = dur1.getSeconds() + dur2.getSeconds();
					return new Duration(TimeUnit.Seconds, time_sum, estTime, estDistance);
				} else {
					// Both are NOT time
					// Convert to miles
					var distance1 = DurationUnitHelper.getDistanceMiles(dur1.getUnit(), dur1.getValue());
					var distance2 = DurationUnitHelper.getDistanceMiles(dur2.getUnit(), dur2.getValue());
					return new Duration(DistanceUnit.Miles, distance1 + distance2, estTime, estDistance);
				}
			}
		}

		static combineArray(durations : Duration[]) : Duration {
			return durations.reduce(function(prev, cur) {
				return Duration.combine(prev, cur);
			});
		}		
	}

	function stringFormat(format: string, ...args: any[]) {
		return format.replace(/{(\d+)}/g, function (match, number) {
			return typeof args[number] != 'undefined'
				? args[number]
				: match
				;
		});
	}

	export class IntensityUnitHelper {
		static convertTo(value: number, unitFrom: IntensityUnit, unitTo: IntensityUnit): number {
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
			} else if (unitFrom == IntensityUnit.MinMi) {
				speedMph = 60 / value;
			} else if (unitFrom == IntensityUnit.Kmh) {
				speedMph = DistanceUnitHelper.convertTo(value, DistanceUnit.Kilometers, DistanceUnit.Miles);
			} else if (unitFrom == IntensityUnit.MinKm) {
				speedMph = DistanceUnitHelper.convertTo(60 / value, DistanceUnit.Kilometers, DistanceUnit.Miles);
			} else if (unitFrom == IntensityUnit.Per100Yards) {
				speedMph = DistanceUnitHelper.convertTo(6000 / value, DistanceUnit.Yards, DistanceUnit.Miles);
			} else if (unitFrom == IntensityUnit.Per100Meters) {
				speedMph = DistanceUnitHelper.convertTo(6000 / value, DistanceUnit.Meters, DistanceUnit.Miles);
			} else if (unitFrom == IntensityUnit.Per400Meters) {
				speedMph = DistanceUnitHelper.convertTo((4 * 6000) / value, DistanceUnit.Meters, DistanceUnit.Miles);
			} else {
				console.assert(false, stringFormat("Unknown intensity unit {0}", unitFrom));
				throw new Error("Unknown IntensityUnit!");
			}

			var result = 0;
			if (unitTo == IntensityUnit.Mph) {
				result = speedMph;
			} else if (unitTo == IntensityUnit.MinMi) {
				result = 60 / speedMph;
			} else if (unitTo == IntensityUnit.Kmh) {
				result = DistanceUnitHelper.convertTo(speedMph, DistanceUnit.Miles, DistanceUnit.Kilometers);
			} else if (unitTo == IntensityUnit.MinKm) {
				result = 60 / DistanceUnitHelper.convertTo(speedMph, DistanceUnit.Miles, DistanceUnit.Kilometers);
			} else if (unitTo == IntensityUnit.Per100Yards) {
				result = 6000 / DistanceUnitHelper.convertTo(speedMph, DistanceUnit.Miles, DistanceUnit.Yards);
			} else if (unitTo == IntensityUnit.Per100Meters) {
				result = 6000 / DistanceUnitHelper.convertTo(speedMph, DistanceUnit.Miles, DistanceUnit.Meters);
			} else if (unitTo == IntensityUnit.Per400Meters) {
				result = 400 / (DistanceUnitHelper.convertTo(speedMph, DistanceUnit.Miles, DistanceUnit.Meters) / 60);
			} else {
				console.assert(false, stringFormat("Unknown intensity unit {0}", unitTo));
				throw new Error("Unknown IntensityUnit!");
			}

			return result;
		}

		static toString(unit: IntensityUnit): string {
			switch (unit) {
				case IntensityUnit.Watts:
					return "w";
				case IntensityUnit.IF:
					return "%";
				case IntensityUnit.MinMi:
					return "min/mi";
				case IntensityUnit.Mph:
					return "mi/h";
				case IntensityUnit.Kmh:
					return "km/h";
				case IntensityUnit.MinKm:
					return "min/km";
				case IntensityUnit.Per100Yards:
					return "/100yards";
				case IntensityUnit.Per100Meters:
					return "/100meters";
				case IntensityUnit.Per400Meters:
					return "/400meters";
				case IntensityUnit.HeartRate:
					return "hr";
				case IntensityUnit.FreeRide:
					return "free-ride";
				default:
					console.assert(false, stringFormat("Unknown intensity unit {0}", unit));
					return "unknown";
			}
		}

		static toIntensityUnit(unit: string): IntensityUnit {
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
				"/400meters": IntensityUnit.Per400Meters,
				"/400m" : IntensityUnit.Per400Meters,
				"offset": IntensityUnit.OffsetSeconds,
				"hr": IntensityUnit.HeartRate,
				"heart rate": IntensityUnit.HeartRate,
				"bpm": IntensityUnit.HeartRate,
				"free-ride": IntensityUnit.FreeRide,
				"fr": IntensityUnit.FreeRide,
			};
			if (unit in conversionMap) {
				return conversionMap[unit];
			} else {
				return IntensityUnit.Unknown;
			}
		}

		static isIntensityUnit(unit : string) : boolean {
			return IntensityUnitHelper.toIntensityUnit(unit) != IntensityUnit.Unknown;
		}
	};

	class DefaultIntensity {
		static isEasy(intensity: Intensity, sportType: SportType): boolean {
			// If the pace is swim based and its on offset relative to the CSS, lets handle it 
			// differently. 10s from CSS is the threshold for easy.
			if (sportType == SportType.Swim
				&& intensity.getOriginalUnit() == IntensityUnit.OffsetSeconds) {
				return intensity.getOriginalValue() > 10;
			}

			return intensity.getValue() <= DefaultIntensity.getEasyThreshold(sportType);
		}

		static getEasyThreshold(sportType: SportType): number {
			var easyThreshold = 0.55;
			if (sportType == SportType.Run) {
				easyThreshold = 0.75;
			} else if (sportType == SportType.Swim) {
				easyThreshold = 0.88;
			}
			return easyThreshold;
		}
	}

	export class Intensity {
		private ifValue: number;

		private originalValue: number;
		private originalUnit: IntensityUnit;

		public static ZeroIntensity: Intensity = new Intensity(0, 0, IntensityUnit.IF);

		constructor(ifValue: number = 0, value: number = 0, unit: IntensityUnit = IntensityUnit.IF) {
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
			} else {
				this.ifValue = ifValue;
				this.originalUnit = unit;
				this.originalValue = value;
			}
		}

		/**
		 * A value between 0 and 1 that represents the intensity of the interval
		 */
		getValue(): number {
			return this.ifValue;
		}

		toString(): string {
			if (this.originalUnit == IntensityUnit.IF) {
				return MyMath.round10(100 * this.originalValue, -1) + "%";
			} else {
				if (this.originalUnit == IntensityUnit.MinMi) {
					return FormatterHelper.formatNumber(this.originalValue, 60, ":", IntensityUnitHelper.toString(IntensityUnit.MinMi));
				} else if (this.originalUnit == IntensityUnit.Per100Yards || this.originalUnit == IntensityUnit.Per100Meters || this.originalUnit == IntensityUnit.Per400Meters) {
					return FormatterHelper.formatNumber(this.originalValue, 60, ":", IntensityUnitHelper.toString(this.originalUnit));
				} else {

					if (this.originalUnit == IntensityUnit.OffsetSeconds) {
						if (this.originalValue > 0) {
							return stringFormat("CSS+{0}", this.originalValue);
						} else if (this.originalValue < 0) {
							return stringFormat("CSS{0}", this.originalValue);
						} else {
							return "CSS";
						}
					} else {
						return MyMath.round10(this.originalValue, -1) + IntensityUnitHelper.toString(this.originalUnit);
					}
				}
			}
		}

		getOriginalUnit(): IntensityUnit {
			return this.originalUnit;
		}
		getOriginalValue(): number {
			return this.originalValue;
		}

		static combine(intensities: Intensity[], weights: number[]): Intensity {
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

	export interface Interval {
		getTitle(): string;
		getIntensity(): Intensity;
		getWorkDuration(): Duration;
		getRestDuration(): Duration;
		getTotalDuration(): Duration;
	}

	export abstract class BaseInterval implements Interval {
		private title: string;

		constructor(title: string) {
			this.title = title;
		}
		getTitle(): string {
			return this.title;
		}
		abstract getIntensity(): Intensity;
		abstract getWorkDuration(): Duration;
		getRestDuration(): Duration {
			return Duration.ZeroDuration;
		}
		getTotalDuration(): Duration {
			return Duration.combine(this.getWorkDuration(), this.getRestDuration());
		}
	}

	export class CommentInterval extends BaseInterval {
		constructor(title: string) {
			super(title);
		}
		getIntensity(): Intensity {
			return Intensity.ZeroIntensity;
		}
		getWorkDuration(): Duration {
			return Duration.ZeroDuration;
		}
	}

	export class SimpleInterval extends BaseInterval {
		private intensity: Intensity;
		private duration: Duration;
		private restDuration: Duration;

		constructor(title: string, intensity: Intensity, duration: Duration, restDuration: Duration) {
			super(title);
			this.intensity = intensity;
			this.duration = duration;
			this.restDuration = restDuration;
		}
		getIntensity(): Intensity {
			return this.intensity;
		}
		getWorkDuration(): Duration {
			return this.duration;
		}
		getRestDuration(): Duration {
			return this.restDuration;
		}
	}

	export class RampBuildInterval extends BaseInterval {
		private startIntensity: Intensity;
		private endIntensity: Intensity;
		private duration: Duration;

		constructor(title: string, startIntensity: Intensity, endIntensity: Intensity, duration: Duration) {
			super(title);
			this.startIntensity = startIntensity;
			this.endIntensity = endIntensity;
			this.duration = duration;
		}
		getIntensity(): Intensity {
			return RampBuildInterval.computeAverageIntensity(this.startIntensity, this.endIntensity);
		}
		getWorkDuration(): Duration {
			return this.duration;
		}
		getStartIntensity(): Intensity {
			return this.startIntensity;
		}
		getEndIntensity(): Intensity {
			return this.endIntensity;
		}

		static computeAverageIntensity(intensity1: Intensity, intensity2: Intensity): Intensity {
			return Intensity.combine([intensity1, intensity2], [1, 1]);
		}
	}

	export class Point {
		x: Duration;
		y: Intensity;
		label: string;
		tag: string;

		constructor(x: Duration, y: Intensity, label: string, tag: string) {
			this.x = x;
			this.y = y;
			this.label = label;
			this.tag = tag;
		}
	}

	export class ArrayInterval implements Interval {
		protected title: string;
		protected intervals: Interval[];

		constructor(title: string, intervals: Interval[]) {
			this.title = title;
			this.intervals = intervals;
		}

		getIntensity(): Intensity {
			var intensities: Intensity[] = this.intervals.map(function (value) {
				return value.getIntensity();
			});
			var weights: number[] = this.intervals.map(function (value) {
				return value.getWorkDuration().getSeconds();
			});

			return Intensity.combine(intensities, weights);
		}
		getWorkDuration(): Duration {
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
		getRestDuration(): Duration {
			var durations = this.intervals.map(function(cur) {
				return cur.getRestDuration();
			});
			return Duration.combineArray(durations);
		}
		getTotalDuration(): Duration {
			return Duration.combine(this.getWorkDuration(), this.getRestDuration());
		}
		getTitle(): string {
			return this.title;
		}

		getIntervals(): Interval[] {
			return this.intervals;
		}

		getTSS(): number {
			var tssVisitor = new TSSVisitor();
			VisitorHelper.visitAndFinalize(tssVisitor, this);
			let tss = tssVisitor.getTSS();
			if (isNaN(tss) || !isFinite(tss)) {
				return 0;
			}
			return tss;
		}

		getTSSFromIF(): number {
			var tss_from_if = (this.getIntensity().getValue() * this.getIntensity().getValue() * this.getWorkDuration().getSeconds()) / 36;
			return MyMath.round10(tss_from_if, -1);
		}

		getTimeSeries(): any {
			var pv = new DataPointVisitor();

			VisitorHelper.visitAndFinalize(pv, this);

			// - Massaging the time component
			var list = pv.data.map(function (item) {
				return {
					x: item.x.getSeconds() / 60,
					y: Math.round(item.y.getValue() * 100),
					tag: item.tag
				}
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
						tagToPoints[lastItemTag].push({x: item.x, y:0});
						tagToPoints[item.tag].push({x: item.x, y:0})
					}
				}
				tagToPoints[item.tag].push(item);
				lastItemTag = item.tag;
			}

			return tagToPoints;
		}

		getTimeInZones(sportType: SportType) {
			var zv = new ZonesVisitor(sportType);
			VisitorHelper.visitAndFinalize(zv, this);
			return zv.getTimeInZones();
		}
	}

	export class RepeatInterval extends ArrayInterval {
		private repeatCount: number;

		constructor(title: string, mainInterval: Interval, restInterval: Interval, repeatCount: number) {
			var intervals: Interval[] = [];
			if (mainInterval != null) {
				intervals.push(mainInterval);
			}
			if (restInterval != null) {
				intervals.push(restInterval);
			}
			super(title, intervals);

			this.repeatCount = repeatCount;
		}

		getWorkDuration(): Duration {
			var baseDuration = super.getWorkDuration();
			var durationRaw = baseDuration.getValue() * this.repeatCount;
			var durationSecs = baseDuration.getSeconds() * this.repeatCount;
			var durationMiles = baseDuration.getDistanceInMiles() * this.repeatCount;
			return new Duration(baseDuration.getUnit(), durationRaw, durationSecs, durationMiles);
		}

		getRepeatCount(): number {
			return this.repeatCount;
		}
	}

	// Step is defined as follows
	// 2[(1min, 85, 95), (30s, 55)]
	// Which in fact translates to:
	// * 1min @ 85
	// * 30s @ 55
	// * 1min @ 95
	// * 30s @ 55
	export class StepBuildInterval extends ArrayInterval {
		// The constructor receives the step intervals, the rest will be added later on
		// so that for the above interval it will look like:
		// [(1min, 85), (1min, 95), (30s, 55)]
		constructor(title: string, intervals: Interval[]) {
			super(title, intervals);
		}
		getIntensity(): Intensity {
			var intensities: Intensity[] = this.intervals.map(function (value) {
				return value.getIntensity();
			});
			var repeatCount = this.getRepeatCount();
			var weights: number[] = this.intervals.map(function (value) {
				return value.getWorkDuration().getSeconds() * repeatCount;
			});

			return Intensity.combine(intensities, weights);
		}
		getRepeatCount(): number {
			return this.intervals.length - 1;
		}
		getStepInterval(idx: number): Interval {
			return this.intervals[idx];
		}
		getRestInterval(): Interval {
			return this.intervals[this.intervals.length - 1];
		}
		areAllIntensitiesSame(): boolean {
			var first_intensity = this.intervals[0].getIntensity().getValue();
			for (var i = 1; i < this.intervals.length - 1; i++) {
				var cur_intensity = this.intervals[i].getIntensity().getValue();
				if (cur_intensity != first_intensity) {
					return false;
				}
			}
			return true;
		}
		areAllDurationsSame(): boolean {
			let first_duration = this.intervals[0].getWorkDuration().getSeconds();
			for (var i = 1; i < this.intervals.length - 1; i++) {
				var cur_duration = this.intervals[i].getWorkDuration();
				if (cur_duration.getSeconds() != first_duration) {
					return false;
				}
			}
			return true;			
		}
		getWorkDuration(): Duration {
			var durations = [];
			for (var i = 0; i < this.intervals.length; i++) {
				durations[i] = this.intervals[i].getWorkDuration();
			}
			if (durations.length < 2) {
				return durations[0];
			} else if (durations.length <= 2) {
				return Duration.combine(durations[0], durations[1]);
			} else {
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

	export interface Parser {
		// Returns the last valid char.
		// On success: Returns a position higher than |pos|.
		evaluate(input: string, pos: number): number;
	}

	// TODO: Refactor this to accept time as well.
	// For example:
	// "10" => 10
	// 10:30 => 10.5
	// "10.5" => 10.5
	export class NumberParser implements Parser {
		private value: number;

		evaluate(input: string, i: number): number {
			this.value = 0;

			for (; i < input.length; i++) {
				var ch = input[i];
				if (IntervalParser.isDigit(ch)) {
					this.value = this.value * 10 + IntervalParser.getCharVal(ch) - IntervalParser.getCharVal("0");
				} else if (ch == ".") {
					i++;
					var base = 10;
					for (; i < input.length; i++) {
						var ch = input[i];
						if (IntervalParser.isDigit(ch)) {
							this.value = this.value + (IntervalParser.getCharVal(ch) - IntervalParser.getCharVal("0")) / base;
							base = base * 10;
						} else {
							break;
						}
					}
					break;
				} else {
					break;
				}
			}
			// Points to the last valid char
			return i - 1;
		}
		getValue(): number {
			return this.value;
		}
	}

	// Retrieves the next token from the interval.
	// For example:
	// (10min, 75, free)
	// Can return: "10min" or "75" or "free"
	export class TokenParser implements Parser {
		private value: string;
		private delimiters: string[];

		constructor(delimiters: string[]) {
			this.delimiters = delimiters;
		}

		evaluate(input: string, i: number): number {
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

		getValue(): string {
			return this.value;
		}
	}

	// For a string like: "10min"
	// It will set |value| to 10
	// and unit to "min"
	export class NumberAndUnitParser implements Parser {
		private value: number;
		private unit: string;

		evaluate(input: string, i: number): number {
			var num_parser = new NumberParser();
			i = num_parser.evaluate(input, i);
			this.value = num_parser.getValue();
			let original_i = i;

			// - Check for another number after the current cursor.
			// - Skip any white spaces as well
			// TODO: Move this into number parser
			// Think on how to fix this code. There are a couple of options:
			// - 1) Make the Unparser generate 01:30 min style notation
			// - 2) Fix this parsing so that it parses something like 1hr30min10s
			// 
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
			// TODO: Find a better way to represent this
			var unitMap = {
				"w" : 1,
				"watts": 1,
				"%": 1,
				"min/mi": 1,
				"mi/hr": 1,
				"mph": 1,
				"km/hr": 1,
				"min/km": 1,
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
				"km" : 1,
				"meters": 1,
				"miles" : 1,
				"yards": 1,
				"yrs": 1,
				"mi": 1,
				"": 1,
			};
			// Get the next token
			let nextToken = "";
			for (i++; i < input.length; i++) {
				if (input[i] == ',' || input[i] == ")") {
					break;
				} else {
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
			} else {
				this.unit = nextToken;
			}

			return i - 1;
		}

		getValue(): number {
			return this.value;
		}

		getUnit(): string {
			return this.unit;
		}
	}

	export class IntervalParser {
		static getCharVal(ch: string): number {
			if (ch.length == 1) {
				return ch.charCodeAt(0);
			} else {
				return 0;
			}
		}
		static isDigit(ch: string): boolean {
			return ch.length == 1 &&
				IntervalParser.getCharVal(ch) >= IntervalParser.getCharVal("0") &&
				IntervalParser.getCharVal(ch) <= IntervalParser.getCharVal("9");
		}
		static isLetter(ch: string): boolean {
			return ch.length == 1 &&
				IntervalParser.getCharVal(ch) >= IntervalParser.getCharVal("a") &&
				IntervalParser.getCharVal(ch) <= IntervalParser.getCharVal("z");
		}

		static parseDouble(input: string, i: number) {
			var p = new NumberParser();
			var pos = p.evaluate(input, i)
			return { i: pos, value: p.getValue() };
		}

		static isWhitespace(ch: string): boolean {
			return ch.length == 1 && (ch == " " || ch == "\t" || ch == "\n");
		}
		static throwParserError(column: number, msg: string): void {
			throw Error("Error while parsing input on column " + column + "-  Error: " + msg);
		}

		static parse(factory: ObjectFactory, input: string): ArrayInterval {
			var result = new ArrayInterval("Workout", []);

			var stack = [];
			stack.push(result);

			for (var i = 0; i < input.length; i++) {
				var ch = input[i];

				if (ch == "(") { // parse simple workout
					i++;
					var nums = {
					};
					var units = {
					};
					var title = "";
					var numIndex = 0;

					for (; i < input.length; i++) {
						ch = input[i];
						if (ch == ")") {
							var interval: Interval;
							var durationValues: number[] = [];
							var durationUnits: DurationUnit[] = [];
							var intensities: Intensity[] = [];

							// (1) Tries to guess where is the time and where is the intensity
							// The assumption here is that intensity will likely be bigger
							// than time. For example: 65% for 60min
							var containsUnit = false;
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
										} else {
											units[k] = "%";
										}
									}
								}
							}

							// (2) Create the duration units and intensities
							for (var k = 0; k < Object.keys(units).length; k++) {
								if (DurationUnitHelper.isDurationUnit(units[k])) {
									durationUnits.push(DurationUnitHelper.toDurationUnit(units[k]));
									durationValues.push(nums[k]);
								} else if (nums[k] > 0) {
									var intensityUnit = IntensityUnit.IF;
									if (IntensityUnitHelper.isIntensityUnit(units[k])) {
										intensityUnit = IntensityUnitHelper.toIntensityUnit(units[k]);
									}
									intensities.push(factory.createIntensity(nums[k], intensityUnit));
								} else {
									// Most of the times here means we didn't have a intensity
									// Free ride or offset mode for example.
									var unit = IntensityUnitHelper.toIntensityUnit(units[k]);

									if (unit == IntensityUnit.OffsetSeconds) {
										intensities.push(factory.createIntensity(nums[k], IntensityUnit.OffsetSeconds));
									} else if (unit == IntensityUnit.FreeRide) {
										intensities.push(factory.createIntensity(factory.getEasyThreshold(), IntensityUnit.FreeRide));
									}
								}
							}

							// (3) Handle repeat interval by peaking at the stack
							if (stack[stack.length - 1] instanceof RepeatInterval) {
								var repeatInterval = <RepeatInterval>(stack[stack.length - 1]);
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
									for (var k = 0; k < repeatInterval.getRepeatCount(); k++) {
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
								let endIntensity = intensities[1]
								let intensity = RampBuildInterval.computeAverageIntensity(startIntensity, endIntensity);
								let duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
								interval = new RampBuildInterval(title.trim(), startIntensity, endIntensity, duration);
							} else if (intensities.length == 1) {
								// Simple interval
								let intensity = intensities[0];
								let duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
								if (durationUnits.length == 2 && durationValues.length == 2) {
									restDuration = factory.createDuration(zeroIntensity, durationUnits[1], durationValues[1]);
								}
								interval = new SimpleInterval(title.trim(), intensity, duration, restDuration);
							} else {
								// Two types of interval here:
								// (10s) - means 10s rest
								// (10min, easy) - means 10min at default interval pace
								let intensity = factory.createIntensity(0, IntensityUnit.IF);
								let duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
								if (durationUnits.length == 2 && durationValues.length == 2) {
									restDuration = factory.createDuration(zeroIntensity, durationUnits[1], durationValues[1]);
								}
								interval = new SimpleInterval(title.trim(), intensity, duration, restDuration);
							}

							stack[stack.length - 1].getIntervals().push(interval);
							break;
						} else if (ch == ",") {
							numIndex++;
						} else {
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
								} else {
									// If we don't recognize, fallback and set as a title
									title = value;
									units[numIndex] = "";
								}
							} else if (value[0] == "+" || value[0] == "-") {
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
							} else {
								// TODO: Use magic number for identifying free ride for now
								if (value == "*") {
									units[numIndex] = "free-ride";
								} else {
									// Set the value for the title and a dummy value in the units
									title = value;
									units[numIndex] = "";
								}
							}
						}
					}
					// end simple workout
				} else if (ch == "[") {
					var ai = new ArrayInterval("", []);
					stack[stack.length - 1].getIntervals().push(ai);
					stack.push(ai);
				} else if (ch == "]") {
					stack.pop();
				} else if (IntervalParser.isDigit(ch)) {
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
				} else if (ch == "\"") {
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
		static normalize(factory: ObjectFactory, input: string, unparser_format: UnparserFormat) : string {
			let interval = IntervalParser.parse(factory, input);
			let visitor = new UnparserVisitor(unparser_format);
			VisitorHelper.visit(visitor, interval);
			return visitor.output;	
		}
	}

	export class VisitorHelper {
		static visitAndFinalize(visitor: Visitor, interval: Interval): any {
			this.visit(visitor, interval);
			visitor.finalize();
		}
		static visit(visitor: Visitor, interval: Interval): any {
			if (interval instanceof SimpleInterval) {
				return visitor.visitSimpleInterval(<SimpleInterval>interval);
			} else if (interval instanceof StepBuildInterval) {
				return visitor.visitStepBuildInterval(<StepBuildInterval>interval);
			} else if (interval instanceof RampBuildInterval) {
				return visitor.visitRampBuildInterval(<RampBuildInterval>interval);
			} else if (interval instanceof RepeatInterval) {
				return visitor.visitRepeatInterval(<RepeatInterval>interval);
			} else if (interval instanceof ArrayInterval) {
				return visitor.visitArrayInterval(<ArrayInterval>interval);
			} else if (interval instanceof CommentInterval) {
				return visitor.visitCommentInterval(<CommentInterval>interval);
			} else {
				console.assert(false, "invalid type!");
				return null;
			}
		}
	}

	export interface Visitor {
		visitCommentInterval(interval: CommentInterval): void;
		visitSimpleInterval(interval: SimpleInterval): void;
		visitStepBuildInterval(interval: StepBuildInterval): void;
		visitRampBuildInterval(interval: RampBuildInterval): void;
		visitRepeatInterval(interval: RepeatInterval): void;
		visitArrayInterval(interval: ArrayInterval): void;
		finalize(): void;
	}

	export abstract class BaseVisitor implements Visitor {

		visitCommentInterval(/*interval: CommentInterval*/): void {
			// nothing to do
		}

		abstract visitSimpleInterval(interval: SimpleInterval): void;
		visitStepBuildInterval(interval: StepBuildInterval): void {
			// Generic implementation
			for (var i = 0; i < interval.getRepeatCount(); i++) {
				// step interval
				VisitorHelper.visit(this, interval.getStepInterval(i));

				// rest interval
				VisitorHelper.visit(this, interval.getRestInterval());
			}
		}
		abstract visitRampBuildInterval(interval: RampBuildInterval): void;

		visitRepeatInterval(interval: RepeatInterval) {
			for (var i = 0; i < interval.getRepeatCount(); i++) {
				this.visitArrayInterval(interval);
			}
		}
		visitArrayInterval(interval: ArrayInterval) {
			for (var i = 0; i < interval.getIntervals().length; i++) {
				VisitorHelper.visit(this, interval.getIntervals()[i]);
			}
		}
		finalize(): void {
		}
	}

	// TSS = [(s x NP x IF) / (FTP x 3600)] x 100
	// IF = NP / FTP
	// TSS = [(s x NP x NP/FTP) / (FTP x 3600)] x 100
	// TSS = [s x (NP / FTP) ^ 2] / 36
	export class TSSVisitor extends BaseVisitor {
		private tss: number = 0;

		visitSimpleInterval(interval: SimpleInterval): void {
			var duration = interval.getWorkDuration().getSeconds();
			var intensity = interval.getIntensity().getValue();
			var val = duration * Math.pow(intensity, 2);
			this.tss += val;
		}
		visitRampBuildInterval(interval: RampBuildInterval): void {
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

		getTSS(): number {
			return MyMath.round10(this.tss / 36, -1);
		}
	}

	export class DateHelper {
		public static getDayOfWeek(): string {
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

	export class ZonesMap {
		public static getZoneMap(sportType: SportType) {
			if (sportType == SportType.Bike || sportType == SportType.Other) {
				return {
					1: { name: "z1", low: 0.00, high: 0.55 },
					2: { name: "z2", low: 0.55, high: 0.75 },
					3: { name: "z3", low: 0.75, high: 0.90 },
					4: { name: "z4", low: 0.90, high: 1.05 },
					5: { name: "z5", low: 1.05, high: 1.2 },
					6: { name: "z6", low: 1.20, high: 10 },
				};
			} else if (sportType == SportType.Run) {
				return {
					1: { name: "z1", low: 0.00, high: 0.76 },
					2: { name: "z2", low: 0.76, high: 0.87 },
					3: { name: "z3", low: 0.87, high: 0.94 },
					4: { name: "z4", low: 0.94, high: 1.01 },
					5: { name: "z5", low: 1.01, high: 1.10 },
					6: { name: "z6", low: 1.10, high: 10 },
				};
			} else if (sportType == SportType.Swim) {
				return {
					1: { name: "z1", low: 0.00, high: 0.84 },
					2: { name: "z2", low: 0.84, high: 0.89 },
					3: { name: "z3", low: 0.89, high: 0.95 },
					4: { name: "z4", low: 0.95, high: 1.01 },
					5: { name: "z5", low: 1.01, high: 1.05 },
					6: { name: "z6", low: 1.05, high: 10 },
				};
			} else {
				return {};
			}
		}
	}

	export class ZonesVisitor extends BaseVisitor {
		private zones = {};
		private sportType: SportType;

		constructor(sportType: SportType) {
			super();
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

		public static getZone(sportType: SportType, intensity: number): number {
			var zone_map = ZonesMap.getZoneMap(sportType);
			for (var zone = 1; zone <= 5; zone++) {
				var zone_obj = zone_map[zone];
				if (intensity >= zone_obj.low && intensity < zone_obj.high) {
					return zone;
				}
			}
			return 6;
		}

		incrementZoneTime(intensity: number, numberOfSeconds: number) {
			var zone: number = ZonesVisitor.getZone(this.sportType, intensity);
			this.zones[zone].value += numberOfSeconds;
		}

		visitSimpleInterval(interval: SimpleInterval): void {
			this.incrementZoneTime(interval.getIntensity().getValue(), interval.getWorkDuration().getSeconds());
		}
		visitRampBuildInterval(interval: RampBuildInterval): void {
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

	class DataPointVisitor extends BaseVisitor {
		private x: Duration = null;
		data: Point[] = [];

		initX(duration: Duration) {
			if (this.x == null) {
				this.x = new Duration(duration.getUnit(), 0, 0, 0);
			}
		}

		incrementX(duration: Duration) {
			this.x = Duration.combine(this.x, duration);
		}

		getIntervalTag(interval: Interval): string {
			if (interval.getIntensity().getOriginalUnit() == IntensityUnit.FreeRide) {
				return "free-ride";
			} else {
				return "if";
			}
		}

		visitSimpleInterval(interval: SimpleInterval) {
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
		visitRampBuildInterval(interval: RampBuildInterval) {
			var title = WorkoutTextVisitor.getIntervalTitle(interval);
			this.initX(interval.getWorkDuration());
			this.data.push(new Point(this.x, interval.getStartIntensity(), title, this.getIntervalTag(interval)));
			this.incrementX(interval.getWorkDuration());
			this.data.push(new Point(this.x, interval.getEndIntensity(), title, this.getIntervalTag(interval)));
		}
	}

	export class ZwiftDataVisitor extends BaseVisitor {
		private content: string = "";

		constructor(name: string) {
			super();
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
		getIntervalTitle(interval: Interval) {
			var title = interval.getTitle();
			if (title.length == 0) {
				title = WorkoutTextVisitor.getIntervalTitle(interval);
			}
			return title;
		}
		escapeString(input: string) {
			return input.replace("\"", "\\\"");
		}
		visitSimpleInterval(interval: SimpleInterval) {
			var duration = interval.getWorkDuration().getSeconds();
			var title = this.escapeString(this.getIntervalTitle(interval));
			if (interval.getIntensity().getOriginalUnit() == IntensityUnit.FreeRide) {
				this.content += `\t\t<FreeRide Duration="${duration}">\n`;
				this.content += `\t\t\t<textevent timeoffset="0" message="${title}"/>\n`;
				this.content += `\t\t</FreeRide>\n`;
			} else {
				var intensity = interval.getIntensity().getValue();
				this.content += `\t\t<SteadyState Duration="${duration}" Power="${intensity}">\n`;
				this.content += `\t\t\t<textevent timeoffset="0" message="${title}"/>\n`;
				this.content += `\t\t</SteadyState>\n`;
			}
			// TODO: Add rest duration here
		}
		visitRampBuildInterval(interval: RampBuildInterval) {
			var duration = interval.getWorkDuration().getSeconds();
			var intensityStart = interval.getStartIntensity().getValue();
			var intensityEnd = interval.getEndIntensity().getValue();
			if (intensityStart < intensityEnd) {
				this.content += `\t\t<Warmup Duration="${duration}" PowerLow="${intensityStart}" PowerHigh="${intensityEnd}"/>\n`;
			} else {
				this.content += `\t\t<Cooldown Duration="${duration}" PowerLow="${intensityStart}" PowerHigh="${intensityEnd}"/>\n`;
			}
		}
		getContent(): string {
			return this.content;
		}
	}

	export class MRCCourseDataVisitor extends BaseVisitor {
		private courseData: string = "";
		private time: number = 0;
		private idx: number = 0;
		private fileName: string = "";
		private perfPRODescription: string = "";
		private content = "";
		private repeatIntervals: RepeatInterval[] = [];
		private repeatIteration: number[] = [];

		constructor(fileName: string) {
			super();
			this.fileName = fileName;
		}

		processCourseData(intensity: Intensity, durationInSeconds: number) {
			this.time += durationInSeconds;
			// Course Data has to be in minutes
			this.courseData += (this.time / 60) + "\t" + Math.round(intensity.getValue() * 100) + "\n";
		}

		processTitle(interval: Interval) {
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

		visitSimpleInterval(interval: SimpleInterval) {
			this.processCourseData(interval.getIntensity(), 0);
			this.processCourseData(interval.getIntensity(), interval.getWorkDuration().getSeconds());
			this.processTitle(interval);
			// TODO: Add rest interval here
		}
		visitRampBuildInterval(interval: RampBuildInterval) {
			this.processCourseData(interval.getStartIntensity(), 0);
			this.processCourseData(interval.getEndIntensity(), interval.getWorkDuration().getSeconds());
			this.processTitle(interval);
		}

		visitRepeatInterval(interval: RepeatInterval) {
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

		getContent(): string {
			return this.content;
		}
	}

	export class PPSMRXCourseDataVisitor extends BaseVisitor {
		private fileName: string = "";
		private content = "";
		private groupId = 1;
		private currentRepeatIteration = []
		private repeatCountMax = [];

		constructor(fileName: string) {
			super();
			this.fileName = fileName;
		}

		getTitlePretty(interval: BaseInterval): string {
			var title = interval.getTitle();
			if (title.length == 0) {
				title = WorkoutTextVisitor.getIntervalTitle(interval);
			}
			if (this.isGroupActive()) {
				title += " (" + (this.currentRepeatIteration[this.currentRepeatIteration.length-1]+1) + "/" + this.repeatCountMax[this.repeatCountMax.length-1] + ")";
			}
			return title;
		}

		getGroupId(): number {
			if (this.isGroupActive()) {
				return this.groupId;
			} else {
				return 0;
			}
		}

		getMode(interval: Interval): string {
			if (interval.getIntensity().getOriginalUnit() == IntensityUnit.FreeRide) {
				return "T";
			} else {
				return "M";
			}
		}

		getIntensity(interval: Interval) : number {
			if (interval.getIntensity().getOriginalUnit() == IntensityUnit.FreeRide) {
				return 0;
			} else {
				return Math.round(interval.getIntensity().getValue() * 100);
			}			
		}

		// ["description","seconds","start","finish","mode","intervals","group","autolap","targetcad"]
		visitSimpleInterval(interval: SimpleInterval) {
			this.content += stringFormat(`\t\t["{0}",{1},{2},{2},"{3}",1,{4},0,90],\n`,
				this.getTitlePretty(interval),
				interval.getWorkDuration().getSeconds(),
				this.getIntensity(interval),
				this.getMode(interval),
				this.getGroupId()
			);
			// TODO: Add rest interval here
		}
		visitRampBuildInterval(interval: RampBuildInterval) {
			this.content += stringFormat(`\t\t["{0}",{1},{2},{3},"M",1,{3},0,90],\n`,
				this.getTitlePretty(interval),
				interval.getWorkDuration().getSeconds(),
				Math.round(interval.getStartIntensity().getValue() * 100),
				Math.round(interval.getEndIntensity().getValue() * 100),
				this.getGroupId()
			);
		}

		visitRepeatInterval(interval: RepeatInterval) {
			this.repeatCountMax.push(interval.getRepeatCount());
			for (var i = 0; i < interval.getRepeatCount(); i++) {
				this.currentRepeatIteration.push(i);
				this.visitArrayInterval(interval);
				this.currentRepeatIteration.pop();
			}
			this.repeatCountMax.pop();
			this.groupId++;
		}

		isGroupActive() : boolean {
			return this.repeatCountMax.length > 0;
		}

		finalize() {
			if (this.content.length > 0) {
				// Remove trailing ",\n"
				this.content = this.content.substr(0, this.content.length - 2);
				// Add just the "\n"
				this.content += "\n";
			}
			this.content = stringFormat(
				`{
	"type":"json",
	"createdby":"PerfPRO Studio v5.80.25",
	"version":5.00,
	"name":"manual mode",
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
`) + this.content +
				`	]
}`;
		}

		getContent(): string {
			return this.content;
		}
	}

	class FileNameHelper {
		private intervals: ArrayInterval;

		constructor(intervals: ArrayInterval) {
			this.intervals = intervals;
		}

		getFileName(): string {
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
				var zoneDuration = zone.duration.estimatedDurationInSeconds;
				if (zoneDuration > zoneMaxTime) {
					zoneMaxTime = zoneDuration;
					zoneMaxName = zone.name;
				}
			}

			if (zoneMaxTime != 0) {
				var duration_hr = Math.round(TimeUnitHelper.convertTo(duration, TimeUnit.Seconds, TimeUnit.Hours));
				return intensity_string + duration_hr + "hour-" + zoneMaxName;
			} else {
				return intensity_string;
			}
		}
	}

	export class WorkoutTextVisitor implements Visitor {
		result: string = "";
		userProfile: UserProfile = null;
		sportType: SportType = SportType.Unknown;
		outputUnit: IntensityUnit = IntensityUnit.Unknown;
		disableEasyTitle: boolean = false;
		roundValues : boolean = false;

		constructor(userProfile: UserProfile,
			sportType: SportType,
			outputUnit: IntensityUnit,
		    roundValues : boolean) {
			this.userProfile = userProfile;
			this.sportType = sportType;
			this.outputUnit = outputUnit;
			this.roundValues = roundValues;
		}

		static getIntervalTitle(interval: Interval,
			userProfile: UserProfile = null,
			sportType: SportType = SportType.Unknown,
			outputUnit: IntensityUnit = IntensityUnit.Unknown,
			roundValues: boolean = true): string {
			// TODO: instantiating visitor is a bit clowny
			var f = new WorkoutTextVisitor(userProfile, sportType, outputUnit, roundValues);
			VisitorHelper.visitAndFinalize(f, interval);

			return f.result;
		}

		visitCommentInterval(interval: CommentInterval): void {
			this.result += this.getIntervalTitle(interval);
		}

		visitRestInterval(interval: Interval): void {
			var value = interval.getIntensity().getValue();
			if (value <= DefaultIntensity.getEasyThreshold(this.sportType)) {
				let title = this.getIntervalTitle(interval);
				if (title == null || title.trim().length == 0) {
					title = "easy";
				}
				this.result += interval.getWorkDuration().toStringShort(this.sportType == SportType.Swim) + " " + title;;
			} else {
				this.result += interval.getWorkDuration().toStringShort(this.sportType == SportType.Swim) + " @ " + this.getIntensityPretty(interval.getIntensity());
			}
		}

		// ArrayInterval
		visitArrayInterval(interval: ArrayInterval) : void {
			this.visitArrayIntervalInternal(interval, false);
		}

		visitArrayIntervalInternal(interval: ArrayInterval, always_add_parenthesis: boolean) : void {
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
				} else {
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
			} else {
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
				} else {
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
		visitRepeatInterval(interval: RepeatInterval) : void {
			this.result += interval.getRepeatCount() + " x ";
			this.visitArrayIntervalInternal(interval, true);
		}

		// RampBuildInterval
		visitRampBuildInterval(interval: RampBuildInterval) : void {
			if (interval.getStartIntensity().getValue() <= DefaultIntensity.getEasyThreshold(this.sportType)) {
				this.result += interval.getWorkDuration().toStringShort(this.sportType == SportType.Swim) + " warm up to " + this.getIntensityPretty(interval.getEndIntensity());
			} else {
				if (interval.getStartIntensity().getValue() < interval.getEndIntensity().getValue()) {
					this.result += interval.getWorkDuration().toStringShort(this.sportType == SportType.Swim) + " build from " + this.getIntensityPretty(interval.getStartIntensity()) + " to " + this.getIntensityPretty(interval.getEndIntensity());
				} else {
					this.result += interval.getWorkDuration().toStringShort(this.sportType == SportType.Swim) + " warm down from " + this.getIntensityPretty(interval.getStartIntensity()) + " to " + this.getIntensityPretty(interval.getEndIntensity());
				}
			}
		}

		visitStepBuildInterval(interval: StepBuildInterval) : void {
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
			} else {
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
		visitSimpleInterval(interval: SimpleInterval) : void {
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
					} else {
						this.result += " easy";
					}
				} else {
					// Remove intensity from intervals without specified intensity.
					if (interval.getIntensity().getValue() != 0) {
						this.result += " @ " + this.getIntensityPretty(interval.getIntensity());
					}
				}
				if (interval.getRestDuration().getSeconds() > 0) {
					this.result += " w/ " + interval.getRestDuration().toStringShort(this.sportType == SportType.Swim) + " rest";
					return;
				}
			} else {
				// Handle swim differently
				// We want to add the total touch time on the swim. For example, if you CSS
				// is 1:30 /100yards and you are doing 200 yards, we want to add
				// that you are touching the wall on 3 min.
				if (this.sportType == SportType.Swim) {
					var total_duration = interval.getTotalDuration();
					if (total_duration.getSeconds() != interval.getWorkDuration().getSeconds()) {
						this.result += " on " + interval.getWorkDuration().toTimeStringShort() + " off " + total_duration.toTimeStringShort();
					} else {
						this.result += " on " + interval.getWorkDuration().toTimeStringShort();
					}
				} else {
					this.result += " @ " + this.getIntensityPretty(interval.getIntensity());

					if (interval.getRestDuration().getSeconds() > 0) {
						this.result += " w/ " + interval.getRestDuration().toStringShort(false) + " rest";
						return;
					}
				}
			}
		}

		// |intensity| : The intensity of the interval. For example 90%, 100%
		getIntensityPretty(intensity: Intensity): string {
			if (this.outputUnit == IntensityUnit.HeartRate) {
				var bpm = 0;
				if (this.sportType == SportType.Bike) {
					bpm = this.userProfile.getBikeFTP() / this.userProfile.getEfficiencyFactor();
				} else if (this.sportType == SportType.Run) {
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
					} else {
						return value + "w";
					}
				} else {
					return intensity.toString();
				}
			} else if (this.sportType == SportType.Run) {
				var minMi = this.userProfile.getPaceMinMi(intensity);
				var outputValue = IntensityUnitHelper.convertTo(minMi, IntensityUnit.MinMi, this.outputUnit);
				if (this.outputUnit == IntensityUnit.Kmh || this.outputUnit == IntensityUnit.Mph) {
					return MyMath.round10(outputValue, -1) + IntensityUnitHelper.toString(this.outputUnit);
				} else {
					if (this.outputUnit == IntensityUnit.MinMi || this.outputUnit == IntensityUnit.MinKm) {
						let roundIncrement = 5;
						if (!this.roundValues) {
							roundIncrement = 0;	
						}
						return FormatterHelper.formatNumber(outputValue, 60, ":", IntensityUnitHelper.toString(this.outputUnit), roundIncrement);						
					} else {
						let pace_per_400m = this.userProfile.getRunningPace(intensity, this.outputUnit);
						return FormatterHelper.formatNumber(pace_per_400m, 60, ":", "") + IntensityUnitHelper.toString(this.outputUnit);		
					}					
				}
			} else if (this.sportType == SportType.Swim) {
				if (this.outputUnit == IntensityUnit.Mph) {
					return MyMath.round10(this.userProfile.getSwimPaceMph(intensity), -1) + IntensityUnitHelper.toString(this.outputUnit);
				} else if (this.outputUnit == IntensityUnit.Per100Yards || this.outputUnit == IntensityUnit.Per100Meters) {
					var swim_pace_per_100 = this.userProfile.getSwimPace(this.outputUnit, intensity);
					return FormatterHelper.formatNumber(swim_pace_per_100, 60, ":", "") + IntensityUnitHelper.toString(this.outputUnit);
				} else {
					console.assert(false, stringFormat("Invalid output unit {0}", this.outputUnit));
					return "";
				}
			} else {
				console.assert(this.sportType == SportType.Other);
				return "";
			}
		}

		getIntervalTitle(interval: Interval) {
			let title = interval.getTitle();
			if (title == null || title.length == 0) {
				return null;
			}
			return title;
		}

		finalize(): void {
		}
	}
	export enum UnparserFormat {
		NoWhitespaces,
		Whitespaces
	}
	class UnparserVisitor implements Visitor {
		output: string;
		format : UnparserFormat;

		constructor(format : UnparserFormat) {
			this.output = "";
			this.format = format;
		}

		getDurationPretty(d: Duration): string {
			if (DurationUnitHelper.isDistance(d.getUnit())) {
				return d.toString();
			}
			return d.toTimeStringLong();
		}

		getIntensityPretty(i: Intensity): string {
			if (i.getOriginalUnit() == IntensityUnit.OffsetSeconds) {
				return "+" + i.getOriginalValue() + "s";
			} else if (i.getOriginalUnit() == IntensityUnit.FreeRide) {
				return "*";
			} else {
				return MyMath.round10(i.getValue() * 100, -1).toString();
			}
		}

		getTitlePretty(i: Interval) : string {
			if (i.getTitle().length != 0) {
				return ", " + i.getTitle();
			} else {
				return "";
			}
		}

		addNewLine() : void {
			if (this.format == UnparserFormat.Whitespaces) {
				this.output += "\n";
			}
		}

		visitCommentInterval(interval: CommentInterval): void {
			this.output += stringFormat("\"{0}\"", interval.getTitle());
			this.addNewLine();
		}
		visitSimpleInterval(interval: SimpleInterval): void {
			if (interval.getRestDuration().getValue() != 0) {
				this.output += stringFormat("({0}, {1}, {2}{3})", this.getDurationPretty(interval.getWorkDuration()), this.getIntensityPretty(interval.getIntensity()), this.getDurationPretty(interval.getRestDuration()), this.getTitlePretty(interval));
			} else {
				this.output += stringFormat("({0}, {1}{2})", this.getDurationPretty(interval.getWorkDuration()), this.getIntensityPretty(interval.getIntensity()), this.getTitlePretty(interval));
			}
			this.addNewLine();
		}
		visitStepBuildInterval(interval: StepBuildInterval): void {
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
				this.output += "), ";
				VisitorHelper.visit(this, interval.getRestInterval());
			} else {
				console.assert(interval.areAllDurationsSame())
				this.output += "(";
				// Get any step as all the durations are the same.
				this.output += this.getDurationPretty(interval.getStepInterval(0).getTotalDuration());				
				for (let i = 0; i < interval.getRepeatCount(); i++) {
					this.output += ", ";					
					this.output += this.getIntensityPretty(interval.getStepInterval(i).getIntensity());
				}
				this.output += "), ";
				VisitorHelper.visit(this, interval.getRestInterval());
			}
			this.output += "]";
			this.addNewLine();
		}
		visitRampBuildInterval(interval: RampBuildInterval): void {
			this.output += stringFormat("({0}, {1}, {2}{3})", this.getIntensityPretty(interval.getStartIntensity()), this.getIntensityPretty(interval.getEndIntensity()), this.getDurationPretty(interval.getWorkDuration()), this.getTitlePretty(interval));
			this.addNewLine();
		}
		visitRepeatInterval(interval: RepeatInterval): void {
			this.output += interval.getRepeatCount().toString();
			this.output += "[";
			for (let i = 0; i < interval.getIntervals().length; i++) {
				VisitorHelper.visit(this, interval.getIntervals()[i]);
				if (i != interval.getIntervals().length - 1) {
					this.output += ", ";
				}
			}
			this.output += "]";
			this.addNewLine();
		}
		visitArrayInterval(interval: ArrayInterval): void {
			for (var i = 0; i < interval.getIntervals().length; i++) {
				VisitorHelper.visit(this, interval.getIntervals()[i]);
			}
		}
		finalize(): void {

		}
	}

	export class SpeedParser {
		static getSpeedInMph(speed: string): number {
			var res = null;
			try {
				if (speed.indexOf("min/mi") != -1) {
					res = 60 / this._extractNumber(speed, 60, ":", "min/mi");
				} else if (speed.indexOf("km/h") != -1) {
					res = this._extractNumber(speed, 100, ".", "km/h") / 1.609344;
				} else if (speed.indexOf("mi/h") != -1) {
					res = this._extractNumber(speed, 100, ".", "mi/h");
				} else if (speed.indexOf("min/km") != -1) {
					res = (60 / (this._extractNumber(speed, 60, ":", "min/km") * 1.609344));
				} else if (speed.indexOf("/400meters") != -1 || speed.indexOf("/400m") != -1) {
					let suffix = "/400meters";
					if (speed.indexOf("/400m") != -1) {
						suffix = "/400m";
					}
					res = (60 / (this._extractNumber(speed, 60, ":", suffix) * 2.5 * 1.609344));
				} else if (speed.indexOf("/100yards") != -1) {
					var pace_per_100_yards = this._extractNumber(speed, 60, ":", "/100yards");
					res = IntensityUnitHelper.convertTo(pace_per_100_yards, IntensityUnit.Per100Yards, IntensityUnit.Mph);
				} else if (speed.indexOf("/100meters") != -1) {
					var pace_per_100_meters = this._extractNumber(speed, 60, ":", "/100meters");
					res = IntensityUnitHelper.convertTo(pace_per_100_meters, IntensityUnit.Per100Meters, IntensityUnit.Mph);
				} else {
					console.assert(false);
				}
			} catch (e) {
			}

			return res;
		}

		static _extractNumber(numberString, decimalMultiplier, strSeparator, strSuffix) {
			var indexSuffix = numberString.indexOf(strSuffix);
			var indexSeparator = numberString.indexOf(strSeparator);
			if (indexSuffix < 0) {
				return null;
			}
			var fractionPart: number;
			if (indexSeparator < 0) {
				indexSeparator = indexSuffix;
				fractionPart = 0;
			} else {
				fractionPart = parseInt(numberString.substr(indexSeparator + 1, indexSuffix - indexSeparator - 1));
			}
			var integerPart = parseInt(numberString.substr(0, indexSeparator));

			return integerPart + fractionPart / decimalMultiplier;
		}
	}

	export class UserProfile {
		private bikeFTP: number;
		private runningTPaceMinMi: number;
		private swimmingCSSMinPer100Yards: number;
		private email: string;
		private effiencyFactor: number;

		constructor(bikeFTPWatts: number, renameTPace: string, swimCSS: string, email: string) {
			this.bikeFTP = bikeFTPWatts;
			var speed_mph = SpeedParser.getSpeedInMph(renameTPace);
			this.runningTPaceMinMi = IntensityUnitHelper.convertTo(
				speed_mph,
				IntensityUnit.Mph,
				IntensityUnit.MinMi);
			var swim_css_mph = SpeedParser.getSpeedInMph(swimCSS);
			this.swimmingCSSMinPer100Yards = IntensityUnitHelper.convertTo(
				swim_css_mph,
				IntensityUnit.Mph,
				IntensityUnit.Per100Yards
			);
			this.email = email;
		}

		setEfficiencyFactor(efficiencyFactor: number) {
			this.effiencyFactor = efficiencyFactor;
		}
		getEfficiencyFactor(): number {
			return this.effiencyFactor;
		}

		getBikeFTP() {
			return this.bikeFTP;
		}

		getRunningTPaceMinMi() {
			return this.runningTPaceMinMi;
		}

		getRunnintTPaceMph() {
			return IntensityUnitHelper.convertTo(
				this.getRunningTPaceMinMi(),
				IntensityUnit.MinMi,
				IntensityUnit.Mph);
		}

		getEmail(): string {
			return this.email;
		}

		getPaceMph(intensity: Intensity) {
			var estPaceMinMi = this.getPaceMinMi(intensity);
			return 60 / estPaceMinMi;
		}

		getRunningPace(intensity: Intensity, outputUnit: IntensityUnit) {
			let pace_mph = this.getPaceMph(intensity);
			return IntensityUnitHelper.convertTo(pace_mph, IntensityUnit.Mph, outputUnit);			
		}

		getPaceMinMi(intensity: Intensity) {
			var pace_mph = IntensityUnitHelper.convertTo(
				this.getRunningTPaceMinMi(),
				IntensityUnit.MinMi,
				IntensityUnit.Mph) * intensity.getValue();
			return IntensityUnitHelper.convertTo(pace_mph,
				IntensityUnit.Mph,
				IntensityUnit.MinMi);
		}

		getSwimCSSMph(): number {
			var css_mph = IntensityUnitHelper.convertTo(this.swimmingCSSMinPer100Yards, IntensityUnit.Per100Yards, IntensityUnit.Mph);
			return css_mph;
		}

		getSwimPaceMph(intensity: Intensity): number {
			var css_mph = IntensityUnitHelper.convertTo(this.swimmingCSSMinPer100Yards, IntensityUnit.Per100Yards, IntensityUnit.Mph);
			return css_mph * intensity.getValue();
		}

		getSwimPace(intensity_unit_result: IntensityUnit, intensity: Intensity): number {
			var pace_mph = this.getSwimCSSMph() * intensity.getValue();
			return IntensityUnitHelper.convertTo(pace_mph, IntensityUnit.Mph, intensity_unit_result);
		}
	}

	export class ObjectFactory {
		private userProfile: UserProfile;
		private sportType: SportType;

		constructor(userProfile: UserProfile, sportType: SportType) {
			this.userProfile = userProfile;
			this.sportType = sportType;
		}

		private getBikeSpeedMphForIntensity(intensity: Intensity): number {
			// TODO: very simple for now
			// its either 20 or 15mph
			var actualSpeedMph = 0;
			if (intensity.getValue() < 0.65) {
				actualSpeedMph = 15;
			} else {
				actualSpeedMph = 20;
			}
			return actualSpeedMph;
		}

		createIntensity(value: number, unit: IntensityUnit) {
			var ifValue = 0;

			// HACK here for now
			if (unit == IntensityUnit.FreeRide) {
				return new Intensity(value, 0, IntensityUnit.FreeRide);
			}

			if (this.sportType == SportType.Bike) {
				if (unit == IntensityUnit.Watts) {
					ifValue = value / this.userProfile.getBikeFTP();
				} else if (unit == IntensityUnit.IF) {
					ifValue = value;
				} else {
					console.assert(false, stringFormat("Invalid unit {0}", unit));
					throw new Error("Invalid unit : " + unit);
				}
			} else if (this.sportType == SportType.Run) {
				var running_tpace_mph = IntensityUnitHelper.convertTo(
					this.userProfile.getRunningTPaceMinMi(),
					IntensityUnit.MinMi,
					IntensityUnit.Mph);

				if (unit == IntensityUnit.IF) {
					ifValue = value;
				} else if (unit == IntensityUnit.MinMi) {
					var running_mph = IntensityUnitHelper.convertTo(
						value,
						IntensityUnit.MinMi,
						IntensityUnit.Mph);
					ifValue = running_mph / running_tpace_mph;
				} else if (unit == IntensityUnit.Mph) {
					ifValue = value / running_tpace_mph;
				} else if (unit == IntensityUnit.MinKm) {
					var running_mph = IntensityUnitHelper.convertTo(
						value,
						IntensityUnit.MinKm,
						IntensityUnit.Mph);
					ifValue = running_mph / running_tpace_mph;
				} else if (unit == IntensityUnit.Per400Meters) {
					var running_mph = IntensityUnitHelper.convertTo(
						value,
						IntensityUnit.Per400Meters,
						IntensityUnit.Mph);
					ifValue = running_mph / running_tpace_mph;					
				} else {
					console.assert(false, stringFormat("Unit {0} is not implemented"));
					throw new Error("Not implemented");
				}
			} else if (this.sportType == SportType.Swim) {
				// For swimming we support 3 IntensityUnits
				if (unit == IntensityUnit.IF) {
					ifValue = value;
				} else if (unit == IntensityUnit.Per100Yards || unit == IntensityUnit.Per100Meters) {
					var swimming_mph = IntensityUnitHelper.convertTo(value, unit, IntensityUnit.Mph);
					var swimming_mph_css = this.userProfile.getSwimCSSMph();
					ifValue = swimming_mph / swimming_mph_css;
				} else if (unit == IntensityUnit.Mph) {
					ifValue = value / this.userProfile.getSwimCSSMph();
				} else if (unit == IntensityUnit.OffsetSeconds) {
					// TODO: not handling if user specified speed in profile / meters
					var speed_per_100_yards = this.userProfile.getSwimPace(IntensityUnit.Per100Yards, new Intensity(1));
					speed_per_100_yards += value / 60;
					var speed_mph = IntensityUnitHelper.convertTo(speed_per_100_yards, IntensityUnit.Per100Yards, IntensityUnit.Mph);
					ifValue = speed_mph / this.userProfile.getSwimCSSMph();
				} else {
					console.assert(false, stringFormat("Invalid intensity unit {0}", unit));
				}
			} else {
				console.assert(this.sportType == SportType.Other);
				console.assert(unit == IntensityUnit.IF);
				ifValue = value;
			}

			return new Intensity(ifValue, value, unit);
		}

		createDuration(intensity: Intensity, unit: DurationUnit, value: number): Duration {
			var estimatedDistanceInMiles = 0;
			var estimatedTimeInSeconds = 0;

			var estimatedSpeedMph;
			if (this.sportType == SportType.Bike) {
				estimatedSpeedMph = this.getBikeSpeedMphForIntensity(intensity);
			} else if (this.sportType == SportType.Run) {
				estimatedSpeedMph = this.userProfile.getPaceMph(intensity);
			} else if (this.sportType == SportType.Swim) {
				estimatedSpeedMph = this.userProfile.getSwimPaceMph(intensity);
			} else {
				console.assert(this.sportType == SportType.Other);
				estimatedSpeedMph = 0;
			}

			if (DurationUnitHelper.isTime(unit)) {
				estimatedTimeInSeconds = DurationUnitHelper.getDurationSeconds(unit, value);
				// v = s/t
				// s = v * t
				estimatedDistanceInMiles = estimatedSpeedMph * (estimatedTimeInSeconds / 3600);
			} else {
				estimatedDistanceInMiles = DurationUnitHelper.getDistanceMiles(unit, value);
				// v = s/t;
				// t = s / v;
				estimatedTimeInSeconds = 3600 * (estimatedDistanceInMiles / estimatedSpeedMph);
			}

			return new Duration(unit, value, estimatedTimeInSeconds, estimatedDistanceInMiles);
		}

		// Returns the easy IF threshold
		getEasyThreshold(): number {
			return DefaultIntensity.getEasyThreshold(this.sportType);
		}
	}

	class WorkoutFileGenerator {
		private workoutTitle: string;
		private intervals: ArrayInterval;

		constructor(workoutTitle: string, intervals: ArrayInterval) {
			this.workoutTitle = workoutTitle;
			this.intervals = intervals;
		}

		getMRCFile(): string {
			var dataVisitor = new MRCCourseDataVisitor(this.getMRCFileName());
			VisitorHelper.visitAndFinalize(dataVisitor, this.intervals);
			return dataVisitor.getContent();
		}

		getZWOFile(): string {
			var fileNameHelper = new FileNameHelper(this.intervals);
			var workout_name = fileNameHelper.getFileName();

			var zwift = new ZwiftDataVisitor(workout_name);
			VisitorHelper.visitAndFinalize(zwift, this.intervals);
			return zwift.getContent();
		}

		getPPSMRXFile(): string {
			var fileNameHelper = new FileNameHelper(this.intervals);
			var workout_name = fileNameHelper.getFileName();

			var zwift = new PPSMRXCourseDataVisitor(workout_name);
			VisitorHelper.visitAndFinalize(zwift, this.intervals);
			return zwift.getContent();
		}

		getZWOFileName(): string {
			return this.getBaseFileName() + ".zwo";
		}

		getMRCFileName(): string {
			return this.getBaseFileName() + ".mrc";
		}

		getPPSMRXFileName(): string {
			return this.getBaseFileName() + ".ppsmrx";
		}

		getBaseFileName() : string {
			if (typeof (this.workoutTitle) != 'undefined' && this.workoutTitle.length != 0) {
				return this.workoutTitle;
			}
			var fileNameHelper = new FileNameHelper(this.intervals);
			return fileNameHelper.getFileName();			
		}
	}

	export class WorkoutBuilder {
		private userProfile: UserProfile;
		private sportType: SportType;
		private outputUnit: IntensityUnit;
		private intervals: ArrayInterval;
		private workoutDefinition: string;
		private workoutTitle: string;

		constructor(userProfile: UserProfile, sportType: SportType, outputUnit: IntensityUnit) {
			this.userProfile = userProfile;
			this.sportType = sportType;
			this.outputUnit = outputUnit;
		}

		getInterval(): ArrayInterval {
			return this.intervals;
		}

		getSportType(): SportType {
			return this.sportType;
		}

		getWorkoutTitle(): string {
			return this.workoutTitle;
		}

		getNormalizedWorkoutDefinition() : string {
			let object_factory = new ObjectFactory(this.userProfile, this.sportType);
			return IntervalParser.normalize(object_factory, this.workoutDefinition, UnparserFormat.Whitespaces);;
		}

		withDefinition(workoutTitle: string, workoutDefinition: string): WorkoutBuilder {
			let object_factory = new ObjectFactory(this.userProfile, this.sportType);
			this.intervals = IntervalParser.parse(
				object_factory,
				workoutDefinition
			);
			this.workoutTitle = workoutTitle;
			this.workoutDefinition = workoutDefinition;
			return this;
		}

		getIntensityFriendly(intensity: Intensity, roundValues: boolean) {
			var f = new WorkoutTextVisitor(this.userProfile, this.sportType, this.outputUnit, roundValues);
			return f.getIntensityPretty(intensity);
		}

		getTSS(): number {
			return this.intervals.getTSS();
		}

		getTSSFromIF(): number {
			return this.intervals.getTSSFromIF();
		}

		getTimePretty(): string {
			return this.intervals.getTotalDuration().toTimeStringLong();
		}

		getIF(): number {
			return MyMath.round10(this.intervals.getIntensity().getValue() * 100, -1);
		}

		getAveragePower(): number {
			return MyMath.round10(this.userProfile.getBikeFTP() * this.intervals.getIntensity().getValue(), -1);
		}

		getIntervalPretty(interval: Interval, roundValues: boolean) {
			return WorkoutTextVisitor.getIntervalTitle(interval, this.userProfile, this.sportType, this.outputUnit, roundValues);
		}

		getEstimatedDistancePretty(): string {
			if (this.sportType == SportType.Swim) {
				return this.intervals.getWorkDuration().toStringDistance(DistanceUnit.Yards);
			} else {
				return this.intervals.getWorkDuration().toStringDistance(DistanceUnit.Miles);
			}
		}

		getAveragePace(): string {
			var minMi = this.userProfile.getPaceMinMi(this.intervals.getIntensity());
			let outputUnit = this.outputUnit;
			if (outputUnit == IntensityUnit.HeartRate) {
				outputUnit = IntensityUnit.MinMi;
			}
			var outputValue = IntensityUnitHelper.convertTo(minMi, IntensityUnit.MinMi, outputUnit);
			if (outputUnit == IntensityUnit.Kmh || outputUnit == IntensityUnit.Mph) {
				return MyMath.round10(outputValue, -1) + IntensityUnitHelper.toString(outputUnit);
			} else {
				return FormatterHelper.formatNumber(outputValue, 60, ":", IntensityUnitHelper.toString(outputUnit));
			}
		}

		getStepsList(new_line): string {
			var result = "";

			this.intervals.getIntervals().forEach(function (interval) {
				result += ("* " + this.getIntervalPretty(interval) + new_line);
			}.bind(this));

			return result;
		}

		getDistanceInMiles(): number {
			var result = 0;

			this.intervals.getIntervals().forEach(function (interval) {
				if (interval.getWorkDuration().getDistanceInMiles() > 0) {
					result += interval.getWorkDuration().getDistanceInMiles();
				}
			}.bind(this));

			return result;
		}

		getPrettyPrint(new_line: string = "\n"): string {
			let workout_text = this.getStepsList(new_line);

			var result = workout_text;
			result += new_line;
			result += new_line;
			result += "web+wp://";
			result += zlib.deflateSync(this.workoutDefinition).toString('base64');

			return result
		}

		getMRCFile(): string {
			let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
			return wfg.getMRCFile();
		}

		getZWOFile(): string {
			let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
			return wfg.getZWOFile();
		}

		getPPSMRXFile(): string {
			let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
			return wfg.getPPSMRXFile();
		}

		getZWOFileName(): string {
			let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
			return wfg.getZWOFileName();
		}
		getMRCFileName(): string {
			let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
			return wfg.getMRCFileName();
		}

		getPPSMRXFileName(): string {
			let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
			return wfg.getPPSMRXFileName();
		}
	};

	export class StopWatch {
		startTime: number;
		stoppedTime: number;

		constructor() {
			this.startTime = null;
			this.stoppedTime = null;
		}
		start(): void {
			if (this.startTime === null) {
				this.startTime = Date.now();
			}
		}
		stop(): void {
			if (this.startTime !== null) {
				this.stoppedTime += Date.now() - this.startTime;
				this.startTime = null;
			}
		}
		reset(): void {
			this.startTime = null;
			this.stoppedTime = 0;
		}
		getIsStarted(): boolean {
			return this.startTime !== null;
		}
		getElapsedTime(): number {
			if (this.startTime !== null) {
				return (Date.now() - this.startTime) + this.stoppedTime;
			} else {
				return this.stoppedTime;
			}
		}
	}

	// Class that is created with the absolute begin and end times.
	// |interval_| will be either SimpleInterval or RampBuildInterval.
	export class AbsoluteTimeInterval {
		private begin_: number;
		private end_: number;
		private interval_: BaseInterval;

		constructor(begin: number, end: number, interval: BaseInterval) {
			this.begin_ = begin;
			this.end_ = end;
			this.interval_ = interval;
		}

		getBeginSeconds(): number {
			return this.begin_;
		}

		getEndSeconds(): number {
			return this.end_;
		}

		getDurationSeconds(): number {
			return this.end_ - this.begin_;
		}

		getInterval(): BaseInterval {
			return this.interval_;
		}
	}

	export class AbsoluteTimeIntervalVisitor extends BaseVisitor {
		private time_: number = 0;
		private data_: AbsoluteTimeInterval[] = [];

		visitSimpleInterval(interval: SimpleInterval) {
			var duration_seconds = interval.getTotalDuration().getSeconds();
			this.data_.push(new AbsoluteTimeInterval(this.time_, this.time_ + duration_seconds, interval));
			this.time_ += duration_seconds;
		}
		visitRampBuildInterval(interval: RampBuildInterval) {
			var duration_seconds = interval.getWorkDuration().getSeconds();
			this.data_.push(new AbsoluteTimeInterval(this.time_, this.time_ + duration_seconds, interval));
			this.time_ += duration_seconds;
		}

		getIntervalArray(): AbsoluteTimeInterval[] {
			return this.data_;
		}
	}

	export class PlayerHelper {
		private data_: AbsoluteTimeInterval[] = [];
		private durationTotalSeconds_: number = 0;

		constructor(interval: Interval) {
			// Create the visitor for the AbsoluteTimeInterval.
			var pv = new AbsoluteTimeIntervalVisitor();

			VisitorHelper.visitAndFinalize(pv, interval);

			this.data_ = pv.getIntervalArray();
			this.durationTotalSeconds_ = interval.getTotalDuration().getSeconds();
		}

		get(ts: number): AbsoluteTimeInterval {
			// TODO: Can potentially do a binary search here.
			for (let i = 0; i < this.data_.length; i++) {
				let bei = this.data_[i];
				if (ts >= bei.getBeginSeconds() && ts <= bei.getEndSeconds()) {
					return bei;
				}
			}
			return null;
		}

		getDurationTotalSeconds(): number {
			return this.durationTotalSeconds_;
		}
	}

}

export = Model;