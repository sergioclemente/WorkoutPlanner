export enum SportType {
	Unknown = -1,
	Swim = 0,
	Bike = 1,
	Run = 2,
	Other = 3
}

// If you add another distance, make sure you update the MAX_DISTANCE
// and that it doesn't overlap with TimeUnit
const MIN_TIME: number = 11;
const MAX_DISTANCE: number = 10;
export enum DistanceUnit {
	Unknown = 0,
	Miles = 1,
	Kilometers = 2,
	Meters = 3,
	Yards = 4,
}
// If you add another time unit, be careful not adding one before MIN_TIME
export enum TimeUnit {
	Unknown = 11 /* MIN_TIME */,
	Seconds,
	Minutes,
	Hours
}
// Duration of a workout can be either specified as time or distance
// We use the | definition of typescript, but we have to be careful
// so that the enums don't overlap. 
export type DurationUnit = TimeUnit | DistanceUnit;

export enum IntensityUnit {
	Unknown = -1,
	IF = 0,
	Watts = 1,
	MinMi = 2,
	Mph = 3,
	Kmh = 4,
	MinKm = 5,
	Per25Yards = 12,
	Per100Yards = 6,
	Per100Meters = 7,
	Per400Meters = 8,
	OffsetSeconds = 9,
	HeartRate = 10,
	FreeRide = 11,
}

// Even though typescript guarantees type safety, specially when you don't have 
// type annotations properly you can have strings being passed as ints and so forth.
// Until all type annotations are added (through --noImplicitAny) we still need
// this compiler option.
export class PreconditionsCheck {
	static assertIsNumber(v: number, name: string) {
		console.assert(typeof (v) == "number", stringFormat("{0} must be a number, it was {1}", name, typeof (v)));
	}

	static assertIsBoolean(v: boolean, name: string) {
		console.assert(typeof (v) == "boolean", stringFormat("{0} must be a boolean, it was {1}", name, typeof (v)));
	}

	static assertIsString(v: string, name: string) {
		console.assert(typeof (v) == "string", stringFormat("{0} must be a string, it was {1}", name, typeof (v)));
	}

	static assertTrue(v: boolean) {
		console.assert(v, "Precondition failed");
	}
};

export class DurationUnitHelper {
	public static isTime(durationUnit: DurationUnit): boolean {
		return durationUnit >= MIN_TIME;
	}

	public static isDistance(durationUnit: DurationUnit): boolean {
		return durationUnit <= MAX_DISTANCE;
	}

	public static isDurationUnit(unit: string): boolean {
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

	static toString(unit: DurationUnit): string {
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

	static toDurationUnit(unit: string): DurationUnit {
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


export class Duration {
	private value: number;
	private unit: DurationUnit;
	private estimatedDurationInSeconds: number;
	private estimatedDistanceInMiles: number;

	public static ZeroDuration: Duration = new Duration(TimeUnit.Seconds, 0, 0, 0);

	constructor(unit: DurationUnit, value: number, estimatedDurationInSeconds: number, estimatedDistanceInMiles: number) {
		PreconditionsCheck.assertIsNumber(unit, "unit");
		PreconditionsCheck.assertIsNumber(value, "value");
		PreconditionsCheck.assertIsNumber(estimatedDurationInSeconds, "estimatedDurationInSeconds");
		PreconditionsCheck.assertIsNumber(estimatedDistanceInMiles, "estimatedDistanceInMiles");

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

	getValueInUnit(unitTo: DistanceUnit): number {
		PreconditionsCheck.assertTrue(unitTo != DistanceUnit.Unknown);
		if (unitTo == DistanceUnit.Unknown) {
			return MyMath.round10(this.value, -1);
		} else {
			if (DurationUnitHelper.isDistance(unitTo)) {
				var value = DistanceUnitHelper.convertTo(this.getDistanceInMiles(), DistanceUnit.Miles, unitTo);
				return MyMath.round10(value, -1);
			} else {
				// TODO: Not doing anything here for now.
				return MyMath.round10(this.value, -1);
			}
		}
	}

	toStringDistance(unitTo: DistanceUnit): string {
		return this.getValueInUnit(unitTo) + DurationUnitHelper.toString(unitTo);
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

		let unit = "";
		if (time.hours != 0) {
			result += time.hours;
			unit = "hr";
		}

		if (time.minutes != 0) {
			if (result.length > 0) {
				result += ":";
			} else {
				unit = "min";
			}
			result += time.minutes;
		}

		if (time.seconds != 0) {
			if (result.length > 0) {
				result += ":";
			} else {
				unit = "sec";
			}
			result += time.seconds;
		}

		return result + unit;
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

	toStringShort(omitUnit: boolean): string {
		if (!DurationUnitHelper.isTime(this.unit)) {
			if (omitUnit) {
				return this.getValueInUnit(<DistanceUnit>this.unit) + "";
			} else {
				return this.toStringDistance(<DistanceUnit>this.unit);
			}
		}

		return this.toTimeStringShort();
	}

	toString(): string {
		if (DurationUnitHelper.isTime(this.unit)) {
			return this.toTimeStringLong();
		} else {
			return this.toStringDistance(<DistanceUnit>this.unit);
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

	static combineArray(durations: Duration[]): Duration {
		return durations.reduce(function (prev, cur) {
			return Duration.combine(prev, cur);
		});
	}
}


export class Intensity {
	private ifValue: number;

	private originalValue: number;
	private originalUnit: IntensityUnit;

	public static ZeroIntensity: Intensity = new Intensity(0, 0, IntensityUnit.IF);
	public static EasyIntensity: Intensity = new Intensity(0.01, -1, IntensityUnit.IF);

	constructor(ifValue: number = 0, value: number = 0, unit: IntensityUnit = IntensityUnit.IF) {
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
			} else if (this.originalUnit == IntensityUnit.Per100Yards || this.originalUnit == IntensityUnit.Per100Meters || this.originalUnit == IntensityUnit.Per400Meters || this.originalUnit == IntensityUnit.Per25Yards) {
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
				} else if (this.originalUnit == IntensityUnit.FreeRide) {
					return "*";
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


	isEasy(): Boolean {
		return Intensity.equals(this, Intensity.EasyIntensity);
	}

	static equals(i1: Intensity, i2: Intensity) {
		return (i1.ifValue == i2.ifValue
			&& i1.originalValue == i2.originalValue
			&& i1.originalUnit == i2.originalUnit);
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
		let durations = this.intervals.map(function (cur) {
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

	getRestDuration(): Duration {
		var baseDuration = super.getRestDuration();
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
	private work_duration: Duration;
	private rest_duration: Duration;

	constructor(title: string, startIntensity: Intensity, endIntensity: Intensity, work_duration: Duration, rest_duration: Duration) {
		super(title);
		this.startIntensity = startIntensity;
		this.endIntensity = endIntensity;
		this.work_duration = work_duration;
		this.rest_duration = rest_duration;
	}
	getIntensity(): Intensity {
		return RampBuildInterval.computeAverageIntensity(this.startIntensity, this.endIntensity);
	}
	getWorkDuration() : Duration {
		return this.work_duration;
	}
	getRestDuration() : Duration {
		return this.rest_duration;
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

export class DistanceUnitHelper {
	static convertTo(value: number, unitFrom: DistanceUnit, unitTo: DistanceUnit): number {
		// Convert to a common unit meters.
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

		// Convert to the final unit.
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
		} else if (unitFrom == IntensityUnit.Per25Yards) {
			speedMph = DistanceUnitHelper.convertTo(1500 / value, DistanceUnit.Yards, DistanceUnit.Miles);
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
		} else if (unitTo == IntensityUnit.Per25Yards) {
			result = 1500 / DistanceUnitHelper.convertTo(speedMph, DistanceUnit.Miles, DistanceUnit.Yards);
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
		} else {
			return IntensityUnit.Unknown;
		}
	}

	static isIntensityUnit(unit: string): boolean {
		return IntensityUnitHelper.toIntensityUnit(unit) != IntensityUnit.Unknown;
	}
};

export class TimeUnitHelper {
	static convertTo(value: number, unitFrom: TimeUnit, unitTo: TimeUnit): number {
		// Convert to common unit in seconds.
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

		// Convert to the final unit.
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

	static formatTime(milliseconds: number): string {
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

export function stringFormat(format: string, ...args: any[]) {
	return format.replace(/{(\d+)}/g, function (match, number) {
		return typeof args[number] != 'undefined'
			? args[number]
			: match
			;
	});
}

export class MyMath {
	/**
	 * Decimal adjustment of a number.
	 *
	 * @param   {String}    type    The type of adjustment.
	 * @param   {Number}    value   The number.
	 * @param   {Integer}   exp     The exponent (the 10 logarithm of the adjustment base).
	 * @returns {Number}            The adjusted value.
	 */
	static decimalAdjust(type: string, value: number, exp: number): number {
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
		let values: string[] = value.toString().split('e');
		value = Math[type](+(values[0] + 'e' + (values[1] ? (+values[1] - exp) : -exp)));
		// Shift back
		values = value.toString().split('e');
		return +(values[0] + 'e' + (values[1] ? (+values[1] + exp) : exp));
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
			} else if (speed.indexOf("/25yards") != -1) {
				var pace_per_25_yards = this._extractNumber(speed, 60, ":", "/25yards");
				res = IntensityUnitHelper.convertTo(pace_per_25_yards, IntensityUnit.Per25Yards, IntensityUnit.Mph);
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

	static _extractNumber(numberString: string, decimalMultiplier: number, strSeparator: string, strSuffix: string) {
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

// TODO: Can/Should I move UserProfile from core into something less core?
export class UserProfile {
	private bikeFTP: number;
	private runningTPaceMinMi: number;
	private swimmingCSSMinPer100Yards: number;
	private swimmingFTP: number;
	private email: string;
	private effiencyFactor: number;

	constructor(bikeFTPWatts: number, runningTPace: string, swimmingFTP: number, swimCSS: string, email: string) {
		this.bikeFTP = bikeFTPWatts;
		var speed_mph = SpeedParser.getSpeedInMph(runningTPace);
		this.runningTPaceMinMi = IntensityUnitHelper.convertTo(
			speed_mph,
			IntensityUnit.Mph,
			IntensityUnit.MinMi);
		this.swimmingFTP = swimmingFTP;
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

	getSwimFTP(): number {
		return this.swimmingFTP;
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

	getSportType(): SportType {
		return this.sportType;
	}

	getUserProfile(): UserProfile {
		return this.userProfile;
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
			// For swimming we support 4 IntensityUnits
			if (unit == IntensityUnit.Watts) {
				ifValue = value / this.userProfile.getSwimFTP();
			} else if (unit == IntensityUnit.IF) {
				ifValue = value;
			} else if (unit == IntensityUnit.Per100Yards || unit == IntensityUnit.Per100Meters || unit == IntensityUnit.Per25Yards) {
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
}