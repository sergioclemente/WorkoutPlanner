module Model {

// TODO: Add other
export enum SportType {
	Unknown=-1,
	Swim=0,
	Bike=1,
	Run=2
}

export enum DistanceUnit {
	Unknown,
	Miles,
	Kilometers,
	Meters,
	Yards
}

export enum TimeUnit {
	Unknown,
	Seconds,
	Minutes,
	Hours
}

export enum DurationUnit {
	Unknown=-1,
	Seconds=0,
	Minutes=1,
	Hours=2,
	Meters=3,
	Miles=4,
	Kilometers=5,
	Yards = 6
}

export enum IntensityUnit {
	Unknown=-1,
	IF=0,
	Watts=1,
	MinMi=2,
	Mph=3,
	Kmh=4,
	MinKm=5,
	Per100Yards=6,
	Per100Meters=7,
	OffsetSeconds=8,
}

export enum RunningPaceUnit {
	Unknown,
	MinMi,
	Mph,
	MinKm,
	KmHr,
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

    static round10(value: number, exp: number) : number {
        return MyMath.decimalAdjust('round', value, exp);
    }
    static floor10(value: number, exp: number) : number {
        return MyMath.decimalAdjust('floor', value, exp);
    }
    static ceil10(value: number, exp: number) : number {
        return MyMath.decimalAdjust('ceil', value, exp);
    }
}

export class DistanceUnitHelper {
	static convertTo(value: number, unitFrom: DistanceUnit, unitTo: DistanceUnit) : number {
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
	static convertTo(value: number, unitFrom: TimeUnit, unitTo: TimeUnit) : number {
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

function getStringFromDurationUnit(unit: DurationUnit) {
	switch(unit) {
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

export class DurationUnitHelper {
	public static isTime(durationUnit: DurationUnit) : boolean {
		return (durationUnit == DurationUnit.Hours
			|| durationUnit == DurationUnit.Minutes
			|| durationUnit == DurationUnit.Seconds);
	}
	
	public static isDistance(durationUnit: DurationUnit) : boolean {
		return !DurationUnitHelper.isTime(durationUnit);
	}	

	static getDistanceMiles(unit: DurationUnit, value: number) {
		if (DurationUnitHelper.isTime(unit)) {
			return 0;
		} else {
			var distance = value;
			if (unit == DurationUnit.Meters) {
				return DistanceUnitHelper.convertTo(value, DistanceUnit.Meters, DistanceUnit.Miles);
			} else if (unit == DurationUnit.Kilometers) {
				return DistanceUnitHelper.convertTo(value, DistanceUnit.Kilometers, DistanceUnit.Miles);
			} else if (unit == DurationUnit.Yards) {
				return DistanceUnitHelper.convertTo(value, DistanceUnit.Yards, DistanceUnit.Miles);
			} else if (unit == DurationUnit.Miles) {
				return distance;
			} else {
				return 0;
			}
		}
	}
	
	static getDurationSeconds(unit: DurationUnit, value: number) : number {
		if (DurationUnitHelper.isDistance(unit)) {
			return 0;
		} else {
			var time = value;
			if (unit == DurationUnit.Hours) {
				return TimeUnitHelper.convertTo(value, TimeUnit.Hours, TimeUnit.Seconds); 
			} else if (unit == DurationUnit.Minutes) {
				return TimeUnitHelper.convertTo(value, TimeUnit.Minutes, TimeUnit.Seconds);
			} else if (unit == DurationUnit.Seconds) {
				return time;
			} else {
				return 0;
			}
		}
	}	
}

export class Duration {
	private value: number;
	private unit: DurationUnit;
	private estimatedDurationInSeconds: number;
	private estimatedDistanceInMiles : number;	
	
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
		
	getUnit() : DurationUnit {
		return this.unit;
	}
	
	getValue() : number {
		return this.value;
	}
	
	getSeconds() : number {
		return this.estimatedDurationInSeconds;
	}
	
	getDistanceInMiles() : number {
		return this.estimatedDistanceInMiles;
	}
	
	toStringDistance(unitTo : DistanceUnit = DistanceUnit.Unknown) : string {
		if (DurationUnitHelper.isDistance(this.unit)) {
			if (unitTo == DistanceUnit.Unknown) {
				return MyMath.round10(this.value, -1) + getStringFromDurationUnit(this.unit);	
			} else {
				if (unitTo == DistanceUnit.Yards) {
					var yards = DistanceUnitHelper.convertTo(this.getDistanceInMiles(), DistanceUnit.Miles, DistanceUnit.Yards);
					return MyMath.round10(yards, -1) + getStringFromDurationUnit(DurationUnit.Yards);
				} else {
					// Not implemented yet
					console.assert(false, stringFormat("Not implemted distance unit {0}", unitTo));
				}
			}
		} else {
			return MyMath.round10(this.estimatedDistanceInMiles, -1) + getStringFromDurationUnit(DurationUnit.Miles);	
		}
	}
	
	getTimeComponents() : any {
		var hours = (this.estimatedDurationInSeconds / 3600) | 0;
		return {
			hours: hours,
			minutes: ((this.estimatedDurationInSeconds - hours*3600) / 60) | 0,
			seconds: (this.estimatedDurationInSeconds % 60) | 0	
		};
	}
	
	toTimeStringLong() : string {
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
	
	toStringShort() : string {		
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
	
	toString(): string {
		if (DurationUnitHelper.isTime(this.unit)) {
			return this.toTimeStringLong();
		} else {
			return this.toStringDistance();
		}
	}
		
	static combine(dur1: Duration, dur2: Duration) : Duration {
		var estTime = dur1.getSeconds() + dur2.getSeconds();
		var estDistance = dur1.getDistanceInMiles() + dur2.getDistanceInMiles();
		
		if (DurationUnitHelper.isTime(dur1.getUnit())) {
			if (DurationUnitHelper.isTime(dur2.getUnit())) {
				// Both are Time
				// Convert both to seconds
				var time1 = DurationUnitHelper.getDurationSeconds(dur1.getUnit(), dur1.getValue());
				var time2 = DurationUnitHelper.getDurationSeconds(dur2.getUnit(), dur2.getValue());
				return new Duration(DurationUnit.Seconds, time1+time2, estTime, estDistance);
			} else {
				// Use the unit of time in case is different
				return new Duration(DurationUnit.Seconds, estTime, estTime, estDistance);
			}
		} else {
			if (DurationUnitHelper.isTime(dur2.getUnit())) {
				// Use the unit of time in case is different
				return new Duration(DurationUnit.Seconds, estTime, estTime, estDistance);
			} else {
				var distance1 = DurationUnitHelper.getDistanceMiles(dur1.getUnit(), dur1.getValue());
				var distance2 = DurationUnitHelper.getDistanceMiles(dur2.getUnit(), dur2.getValue());
				return new Duration(DurationUnit.Miles, distance1+distance2, estTime, estDistance);
			}
		}
	}
}

function getStringFromIntensityUnit(unit: IntensityUnit) {
	switch(unit) {
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

function getDurationUnitFromString(unit: string) : DurationUnit {
	var conversionMap = {
		"mi": DurationUnit.Miles,
		"km": DurationUnit.Kilometers,
		"m": DurationUnit.Meters,
		"meter": DurationUnit.Meters,
		"meters": DurationUnit.Meters,
		"h" : DurationUnit.Hours,
		"hr" : DurationUnit.Hours,
		"hour" : DurationUnit.Hours,
		"hours" : DurationUnit.Hours,
		"min" : DurationUnit.Minutes,
		"sec" : DurationUnit.Seconds,
		"s" : DurationUnit.Seconds,
		"yards": DurationUnit.Yards,
		"y": DurationUnit.Yards,
		"yrd": DurationUnit.Yards,
	};
	if (unit in conversionMap) {
		return conversionMap[unit];	
	} else {
		return DurationUnit.Unknown;
	}
}

function getIntensityUnitFromString(unit: string) : IntensityUnit {
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
	} else {
		return IntensityUnit.Unknown;
	}
}


function getIntensityUnit(unit: IntensityUnit) {
	if (unit == IntensityUnit.Watts) {
		return "w";
	} else if (unit == IntensityUnit.IF) {
		return "%";
	} else if (unit == IntensityUnit.MinMi) {
		return "min/mi";
	} else if (unit == IntensityUnit.Mph) {
		return "mi/h";
	} else if (unit == IntensityUnit.MinKm) {
		return "min/km";
	} else if (unit == IntensityUnit.Kmh) {
		return "km/h";
	} else if (unit == IntensityUnit.Per100Yards) {
		return "/100yards";
	} else if (unit == IntensityUnit.Per100Meters) {
		return "/100m";
	} else {
		console.assert(false, stringFormat("Invalid intensity unit {0}", unit));
	}
}

function isDurationUnit(value: string) {
	return getDurationUnitFromString(value) != DurationUnit.Unknown;
}

function isIntensityUnit(value: string) {
	return getIntensityUnitFromString(value) != IntensityUnit.Unknown;
}

function stringFormat(format : string, ...args: any[]) {
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
}

export class IntensityUnitHelper {
	static convertTo(value: number, unitFrom: IntensityUnit, unitTo: IntensityUnit) : number {
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
			speedMph = DistanceUnitHelper.convertTo(6000/value, DistanceUnit.Yards, DistanceUnit.Miles);
		} else if (unitFrom == IntensityUnit.Per100Meters) {
			speedMph = DistanceUnitHelper.convertTo(6000/value, DistanceUnit.Meters, DistanceUnit.Miles);	
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
		} else {
			console.assert(false, stringFormat("Unknown intensity unit {0}", unitTo));
			throw new Error("Unknown IntensityUnit!");
		}
		
		return result;
	} 
};

export class Intensity {
	private ifValue: number;

	private originalValue: number;
	private originalUnit: IntensityUnit;
	
	constructor(ifValue:number = 0, value: number = 0, unit:IntensityUnit = IntensityUnit.IF) {
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

	toString() : string {
		if (this.originalUnit == IntensityUnit.IF) {
			return MyMath.round10(100*this.originalValue, -1) + "%";
		} else {
			if (this.originalUnit == IntensityUnit.MinMi) {
				return WorkoutTextVisitor.formatNumber(this.originalValue, 60, ":", getIntensityUnit(IntensityUnit.MinMi));
			} else if (this.originalUnit == IntensityUnit.Per100Yards || this.originalUnit == IntensityUnit.Per100Meters) {
				return WorkoutTextVisitor.formatNumber(this.originalValue, 60, ":", getIntensityUnit(this.originalUnit));
			} else {
				return MyMath.round10(this.originalValue, -1) + getStringFromIntensityUnit(this.originalUnit);
			}
		}
	}

    getOriginalUnit(): number {
		return this.originalUnit;
    }
    getOriginalValue(): number {
		return this.originalValue;
    }
	
	static combine(intensities: Intensity[], weights: number[]) : Intensity {
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
		
		return new Intensity(Math.sqrt(sum1/sum2));
	}
}

export interface Interval {
	getTitle() : string;
	getIntensity(): Intensity;	
	getDuration() : Duration;
}

export class BaseInterval implements Interval {
	private title: string;
	
	constructor(title: string) {
		this.title = title;
	}
	getTitle() : string {
		return this.title;
	}
	getIntensity(): Intensity {
		// not aware that typescript supports abstract methods
		throw new Error("not implemented");
	}
	getDuration() : Duration {
		// not aware that typescript supports abstract methods
		throw new Error("not implemented");
	}
}

export class SimpleInterval extends BaseInterval {
	private intensity: Intensity;
	private duration: Duration;

	constructor(title: string, intensity: Intensity, duration: Duration) {
		super(title);
		this.intensity = intensity;
		this.duration = duration;
	}
	getIntensity() : Intensity {
		return this.intensity;
	}
	getDuration(): Duration {
		return this.duration;
	}
}

export class RampBuildInterval extends BaseInterval {
	private startIntensity : Intensity;
	private endIntensity: Intensity;
	private duration:Duration;

	constructor(title: string, startIntensity: Intensity, endIntensity: Intensity, duration: Duration) {
		super(title);
		this.startIntensity = startIntensity;
		this.endIntensity = endIntensity;
		this.duration = duration;
	}
	getIntensity() : Intensity {
		return RampBuildInterval.computeAverageIntensity(this.startIntensity, this.endIntensity);
	}
	getDuration(): Duration {
		return this.duration;
	}
	getStartIntensity() : Intensity {
		return this.startIntensity;
	}
	getEndIntensity() : Intensity {
		return this.endIntensity;
	}
	
	static computeAverageIntensity(intensity1: Intensity, intensity2: Intensity) : Intensity {
		return Intensity.combine([intensity1, intensity2], [1,1]);
	}
}

export class Point {
	x : Duration;
	y : Intensity;
	label: string;
	
	constructor(x: Duration, y: Intensity, label: string) {
		this.x = x;
		this.y = y;
		this.label = label;
	}
}

export class ArrayInterval implements Interval {
	protected title: string;
	protected intervals: Interval[];
	
	constructor(title: string, intervals: Interval[]) {
		this.title = title;
		this.intervals = intervals;
	}
	
	getIntensity() : Intensity {
		var intensities : Intensity[] = this.intervals.map(function(value, index, array) {
			return value.getIntensity();
		});
		var weights : number[] = this.intervals.map(function(value, index, array) {
			return value.getDuration().getSeconds();
		});

		return Intensity.combine(intensities, weights);
	}
	getDuration() : Duration {
		// If the interval is empty lets bail right away otherwise reducing the array will cause an
		// exception
		if (this.intervals.length == 0) {
			return new Duration(DurationUnit.Seconds, 0, 0, 0);
		}

		// It will create dummy intervals along the way so that I can use
		// the reduce abstraction		
		var res = this.intervals.reduce(function(previousValue, currentValue) {
			var duration = Duration.combine(previousValue.getDuration(), currentValue.getDuration());
			
			// Create a dummy interval with the proper duration
			return new SimpleInterval("", new Intensity(0), duration);
		});
		return res.getDuration();
	}
	
	getTitle() : string {
		return this.title;
	}
	
	getIntervals() : Interval[] {
		return this.intervals;
	}
	
	getTSS() : number {
		var tssVisitor = new TSSVisitor();
		VisitorHelper.visit(tssVisitor, this);
		return tssVisitor.getTSS();
	}
	
	getTSSFromIF() : number {
		var tss_from_if = (this.getIntensity().getValue() * this.getIntensity().getValue() * this.getDuration().getSeconds()) / 36;
		return MyMath.round10(tss_from_if, -1);
	}

	getIntensities(): Intensity[] {
		var iv = new IntensitiesVisitor();
		VisitorHelper.visit(iv, this);
		return iv.getIntensities();
	}
	
	getTimeSeries() : any {
		var pv = new DataPointVisitor();
		
		VisitorHelper.visit(pv, this); 
		
		// TODO: Massaging the data here to show in minutes
		return pv.data.map(function(item) {
			return {
				x: item.x.getSeconds() / 60,
				y: Math.round(item.y.getValue() * 100),
			};
		});
	}
	
	getTimeInZones(sportType: SportType) {
		var zv = new ZonesVisitor(sportType);
		VisitorHelper.visit(zv, this);
		return zv.getTimeInZones();
	}
}

export class RepeatInterval extends ArrayInterval {
	private repeatCount: number;

	constructor(title: string, mainInterval: Interval, restInterval: Interval, repeatCount: number) {
		var intervals : Interval[] = [];
		if (mainInterval != null) {
			intervals.push(mainInterval);
		}
		if (restInterval != null) {
			intervals.push(restInterval);
		}
		super(title, intervals);
		
		this.repeatCount = repeatCount;
	}
	
	getDuration(): Duration {
		var baseDuration = super.getDuration();
		var durationRaw = baseDuration.getValue() * this.repeatCount;
		var durationSecs = baseDuration.getSeconds() * this.repeatCount;
		var durationMiles = baseDuration.getDistanceInMiles() * this.repeatCount;
		return new Duration(baseDuration.getUnit(), durationRaw, durationSecs, durationMiles);
	}
	
	getRepeatCount() : number {
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
		var intensities : Intensity[] = this.intervals.map(function(value, index, array) {
			return value.getIntensity();
		});
		var repeatCount = this.getRepeatCount();
		var weights : number[] = this.intervals.map(function(value, index, array) {
			return value.getDuration().getSeconds() * repeatCount;
		});

		return Intensity.combine(intensities, weights);
	}
	getRepeatCount() : number {
		return this.intervals.length - 1;
	}
	getStepInterval(idx : number) : Interval {
		return this.intervals[idx];
	}
	getRestInterval() : Interval {
		return this.intervals[this.intervals.length - 1];
	}
	areAllIntensitiesSame() : boolean {
		var prev_intensity = this.intervals[0].getIntensity().getValue();
		for (var i = 1; i < this.intervals.length - 1; i++) {
			var cur_intensity = this.intervals[i].getIntensity().getValue();
			if (cur_intensity != prev_intensity) {
				return false;
			}
			prev_intensity = cur_intensity;
		}
		return true;
	}
	getDuration(): Duration {
		var durations = [];
		for (var i = 0; i < this.intervals.length; i++) {
			durations[i] = this.intervals[i].getDuration();
		}
		if (durations.length < 2) {
			return durations[0];
		} else if (durations.length <= 2) {
			return Duration.combine(durations[0], durations[1]);
		} else {
			var duration = Duration.combine(durations[0], durations[1]);
			for (var i = 2 ; i < durations.length - 1; i++) {
				duration = Duration.combine(duration, durations[i]);
			}
			for (var i = 0 ; i < this.getRepeatCount(); i++) {
				duration = Duration.combine(duration, durations[durations.length-1]);
			}
			return duration;
		}
	}
}

export interface Parser {
	evaluate(input: string, pos: number) : number;
}

export class NumberParser implements Parser {
	private value: number;

	evaluate(input: string, i: number) : number {
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
	getValue() : number {
		return this.value;
	}
}

export class StringChunkParser implements Parser {
	private value: string;

	evaluate(input: string, i: number) : number {
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
	}

	getValue() : string {
		return this.value;
	}
}

export class IntensityParser implements Parser {
	private value: number;
	private unit: string;
	
	evaluate(input: string, i: number) : number {
		var num_parser = new NumberParser();
		i = num_parser.evaluate(input, i);
		this.value = num_parser.getValue();
		
		// Parse the unit
		// Check for :
		if (i+1 < input.length && input[i+1]==":") {
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
		for (var j = i+1; j < input.length; j++) {
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
			} else {
				break;
			}
		}	
		
		return i + this.unit.length;			
	}
	
	getValue() : number {
		return this.value;
	}	
	
	getUnit() : string { 
		return this.unit;
	}
}

export class IntervalParser {
	static getCharVal(ch: string) : number {
		if (ch.length == 1) {
			return ch.charCodeAt(0);
		} else {
			return 0;
		}
	}
	static isDigit(ch: string) : boolean {
		return ch.length == 1 &&
			IntervalParser.getCharVal(ch) >= IntervalParser.getCharVal("0") &&
			IntervalParser.getCharVal(ch) <= IntervalParser.getCharVal("9");
	}
	static isLetter(ch: string) : boolean {
		return ch.length == 1 &&
			IntervalParser.getCharVal(ch) >= IntervalParser.getCharVal("a") &&
			IntervalParser.getCharVal(ch) <= IntervalParser.getCharVal("z");
	}

	static parseDouble(input: string, i: number) {
		var p = new NumberParser();
		var pos = p.evaluate(input, i)
		return {i: pos, value: p.getValue()} ;
	}

	static isWhitespace(ch: string) : boolean {
		return ch.length == 1 && (ch == " " || ch == "\t" || ch == "\n");
	}
	static throwParserError(column : number, msg : string) : void {
		throw Error("Error while parsing input on column " + column + "-  Error: " + msg);
	}

	static parse(factory: ObjectFactory, input: string) : ArrayInterval{
		var result = new ArrayInterval("Workout", []);
		
		var stack = [];
		stack.push(result);

		for (var i = 0 ; i < input.length; i++) {
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
						// simple workout completed, pop element from stack and create
						var interval : Interval;
						var durationValues : number[] = [];
						var durationUnits : DurationUnit[] = [];
						var intensities : Intensity[] = [];
						
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
									} else {
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
							} else if (nums[k] > 0) {
								var intensityUnit = IntensityUnit.IF;
								if (isIntensityUnit(units[k])) {
									intensityUnit = getIntensityUnitFromString(units[k]);
								}
								intensities.push(factory.createIntensity(nums[k], intensityUnit));
							} else if (nums[k] == -1) {
								// Rest interval. Lets assume as intensity = 0 
								intensities.push(factory.createIntensity(0, IntensityUnit.IF));
							} else {
								var unit = getIntensityUnitFromString(units[k]);
								if (unit == IntensityUnit.OffsetSeconds) {
									intensities.push(factory.createIntensity(nums[k], IntensityUnit.OffsetSeconds));
								}
							}
						}
						
						// Take a peek at the top of the stack
						if (stack[stack.length-1] instanceof RepeatInterval) {
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
									|| durationValues.length == repeatInterval.getRepeatCount())) {
								// OK this should not be a RepeatInterval, it should be
								// a StepBuildInterval instead

								// Remove the ArrayInterval from the top and from the parent
								stack.pop();
								stack[stack.length-1].getIntervals().pop();

								// add the new intervals
								var step_intervals = [];
								for (var k = 0 ; k < repeatInterval.getRepeatCount(); k++) {
									var durationUnit = k < durationUnits.length ? durationUnits[k] : durationUnits[0];
									var durationValue = k < durationValues.length ? durationValues[k] : durationValues[0];
									var intensity = k < intensities.length ? intensities[k] : intensities[0];
									var step_duration = factory.createDuration(intensity, durationUnit, durationValue);
									step_intervals.push(new SimpleInterval("", intensity, step_duration));
								}

								var bsi = new StepBuildInterval("", step_intervals);

								// put back to the parent and top of the stack
								stack[stack.length-1].getIntervals().push(bsi);
								stack.push(bsi);
								break;
							}
						}
	
						if (intensities.length == 2) {
							var startIntensity = intensities[0];
							var endIntensity = intensities[1]
							var intensity = RampBuildInterval.computeAverageIntensity(startIntensity, endIntensity);
							var duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
							interval = new RampBuildInterval(title.trim(), startIntensity, endIntensity, duration);
						} else if (intensities.length == 1) {
							var intensity = intensities[0];
							var duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
							interval = new SimpleInterval(title.trim(), intensity, duration);
						} else {
							// assume a default intensity of 55%
							var intensity = factory.createIntensity(55, IntensityUnit.IF);
							var duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
							interval = new SimpleInterval("", intensity, duration);
						}

						stack[stack.length-1].getIntervals().push(interval);
						break;
					} else if (ch == ",") {
						numIndex++;
					} else {
						var string_parser = new StringChunkParser();
						i = string_parser.evaluate(input, i);
						var value = string_parser.getValue();
						
						// We have to distinguish between title and intensity
						if (value == "rest") {
							// HACK! this used
							nums[numIndex] = -1;
							units[numIndex] = "";
						} else if (IntervalParser.isDigit(value[0])) {
							var intensity_parser = new IntensityParser();
							intensity_parser.evaluate(string_parser.getValue(), 0);
							nums[numIndex] = intensity_parser.getValue();
							units[numIndex] = intensity_parser.getUnit();
						} else if (value[0] == "+" || value[0] == "-") {
							var integer_parser = new NumberParser();
							integer_parser.evaluate(value, 1);
							nums[numIndex] = integer_parser.getValue();
							if (value[0] == "-") {
								nums[numIndex] = -1 * nums[numIndex];
							}
							// HACK: we want to put the final unit here to avoid creating
							// imaginary units
							units[numIndex] = "offset";
						} else {
							// Set the value for the title and a dummy value in the units
							title = string_parser.getValue();
							units[numIndex] = "";
						}
					}
				}
			// end simple workout
			} else if (ch == "[") {
				var ai = new ArrayInterval("", []);
				stack[stack.length-1].getIntervals().push(ai);
				stack.push(ai);	
			} else if (ch == "]") {
				stack.pop();
			} else if (IntervalParser.isDigit(ch)) {
				var res = IntervalParser.parseDouble(input, i);
				i = res.i;
				var ri = new RepeatInterval("", null, null, res.value);
				stack[stack.length-1].getIntervals().push(ri);
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
	}
}

export class VisitorHelper {
	static visit(visitor: Visitor, interval:Interval) : any {
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
	    } else {
	      return null;
	    }
	}
}

export interface Visitor {
	visitSimpleInterval(interval: SimpleInterval) : void;
	visitStepBuildInterval(interval: StepBuildInterval): void;
	visitRampBuildInterval(interval: RampBuildInterval) : void;
	visitRepeatInterval(interval: RepeatInterval) : void;
	visitArrayInterval(interval: ArrayInterval) : void;
}

export class BaseVisitor implements Visitor {

	visitSimpleInterval(interval: SimpleInterval) : void {
		// not aware that typescript supports abstract methods
		throw new Error("not implemented");
	}
	visitStepBuildInterval(interval: StepBuildInterval) : void {
		// Generic implementation
		for (var i = 0; i < interval.getRepeatCount() ; i++) {
			// step interval
			VisitorHelper.visit(this, interval.getStepInterval(i));

			// rest interval
			VisitorHelper.visit(this, interval.getRestInterval());
		}
	}
	visitRampBuildInterval(interval: RampBuildInterval) : void {
		// not aware that typescript supports abstract methods
		throw new Error("not implemented");
	}

	visitRepeatInterval(interval: RepeatInterval) {
		for (var i = 0 ; i < interval.getRepeatCount(); i++) {
			this.visitArrayInterval(interval);
		}
	}
	visitArrayInterval(interval: ArrayInterval) {
		for (var i = 0; i < interval.getIntervals().length; i++) {
			VisitorHelper.visit(this, interval.getIntervals()[i]);
		}
	}
}

// TSS = [(s x NP x IF) / (FTP x 3600)] x 100
// IF = NP / FTP
// TSS = [(s x NP x NP/FTP) / (FTP x 3600)] x 100
// TSS = [s x (NP / FTP) ^ 2] / 36
export class TSSVisitor extends BaseVisitor {
	private tss : number = 0;
	
	visitSimpleInterval(interval: SimpleInterval) : void {
		var duration = interval.getDuration().getSeconds();
		var intensity = interval.getIntensity().getValue();
		var val = duration * Math.pow(intensity, 2);
		this.tss += val;
	}
	visitRampBuildInterval(interval: RampBuildInterval) : void {
		var startIntensity = interval.getStartIntensity().getValue();
		var endIntensity = interval.getEndIntensity().getValue();
		var duration = interval.getDuration().getSeconds();
		
		// Right way to estimate the intensity is by doing incremental of 1 sec
		for (var t = 0; t < duration; t++) {
			var intensity = startIntensity + (endIntensity-startIntensity)*(t/duration);
			var val = 1 * Math.pow(intensity, 2);
			this.tss += val;
		}
	}
	
	getTSS(): number {
		return MyMath.round10(this.tss / 36, -1);
	}
}

export class DateHelper {
	public static getDayOfWeek() : string {
		var d = new Date();
		var weekday = new Array(7);
		weekday[0]=  "Sunday";
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
		// TODO: Use same zones as bike for now
		if (sportType == SportType.Bike || sportType == SportType.Swim) {
			return {
				1: {name: "z1", low: 0.00, high: 0.55},
				2: {name: "z2", low: 0.55, high: 0.75},
				3: {name: "z3", low: 0.75, high: 0.90},
				4: {name: "z4", low: 0.90, high: 1.05},
				5: {name: "z5", low: 1.05, high: 1.2},
				6: { name: "z6", low: 1.20, high: 10 },
			};
		} else if (sportType == SportType.Run) {
			return {
				1: {name: "z1", low: 0.00, high: 0.76},
				2: {name: "z2", low: 0.76, high: 0.87},
				3: {name: "z3", low: 0.87, high: 0.94},
				4: {name: "z4", low: 0.94, high: 1.01},
				5: {name: "z5", low: 1.01, high: 1.10},
				6: { name: "z6", low: 1.10, high: 10 },
			};
		}
	}
}

export class ZonesVisitor extends BaseVisitor {
	private zones = {};
	private sportType : SportType;

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
		for (var zone = 1 ; zone <= 6; zone++) {
			var zone_obj = zone_map[zone];
			this.zones[zone] = {
				name: zone_obj.name,
				range: "[" + Math.floor(zone_obj.low*100) + "%;" + Math.floor(zone_obj.high*100) + "%)",
				value: 0,
			};
		}
	}

	public static getZone(sportType : SportType, intensity: number) : number {
		var zone_map = ZonesMap.getZoneMap(sportType);
		for (var zone = 1 ; zone <= 5; zone++) {
			var zone_obj = zone_map[zone];
			if (intensity >= zone_obj.low && intensity < zone_obj.high) {
				return zone;
			}
		}
		return 6;
	}

	incrementZoneTime(intensity: number, numberOfSeconds: number) {
		var zone : number = ZonesVisitor.getZone(this.sportType, intensity);
		this.zones[zone].value += numberOfSeconds;
	}

	visitSimpleInterval(interval: SimpleInterval) : void {
		this.incrementZoneTime(interval.getIntensity().getValue(), interval.getDuration().getSeconds());			
	}
	visitRampBuildInterval(interval: RampBuildInterval) : void {
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
					duration: new Duration(DurationUnit.Seconds, zone.value, 0, 0)
				});
			}
		}
		return result;
	}
}

export class IntensitiesVisitor extends BaseVisitor {
	private intensities = {};

	visitSimpleInterval(interval: SimpleInterval) : void {
		this.intensities[interval.getIntensity().getValue()] = interval.getIntensity();		
	}
	visitRampBuildInterval(interval: RampBuildInterval) : void {
		this.intensities[interval.getStartIntensity().getValue()] = interval.getStartIntensity();
		this.intensities[interval.getEndIntensity().getValue()] = interval.getEndIntensity();
	}
	
	getIntensities() : Intensity[] {
		var result = [];
		for (var intensityValue in this.intensities) {
			result.push(this.intensities[intensityValue]);
		}
		result.sort(function(left: Intensity, right: Intensity) {
			return left.getValue() - right.getValue();
		});
		return result;
	}
}

export class DataPointVisitor extends BaseVisitor {
	private x : Duration = null;
	data : Point[] = [];

	initX(duration: Duration) {
		if (this.x == null) {
			this.x = new Duration(duration.getUnit(), 0, 0, 0);
		}
	}

	incrementX(duration: Duration) {
		this.x = Duration.combine(this.x, duration);
	}

	visitSimpleInterval(interval: SimpleInterval) {
		var title = WorkoutTextVisitor.getIntervalTitle(interval);
		this.initX(interval.getDuration());
		this.data.push(new Point(this.x, interval.getIntensity(), title));
		this.incrementX(interval.getDuration());
		this.data.push(new Point(this.x, interval.getIntensity(), title));
	}
	visitRampBuildInterval(interval: RampBuildInterval) {
		var title = WorkoutTextVisitor.getIntervalTitle(interval);
		this.initX(interval.getDuration());
		this.data.push(new Point(this.x, interval.getStartIntensity(), title));
		this.incrementX(interval.getDuration());
		this.data.push(new Point(this.x, interval.getEndIntensity(), title));
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
	visitSimpleInterval(interval: SimpleInterval) {
		var duration = interval.getDuration().getSeconds();
		var intensity = interval.getIntensity().getValue();
		var title = this.getIntervalTitle(interval);
		this.content += `\t\t<SteadyState Duration='${duration}' Power='${intensity}'>\n`;
		this.content += `\t\t\t<textevent timeoffset='0' message='${title}'/>\n`;
		this.content += `\t\t</SteadyState>\n`;
	}
	visitRampBuildInterval(interval: RampBuildInterval) {
		var duration = interval.getDuration().getSeconds();
		var intensityStart = interval.getStartIntensity().getValue();
		var intensityEnd = interval.getEndIntensity().getValue();
		if (intensityStart < intensityEnd) {
			this.content += `\t\t<Warmup Duration='${duration}' PowerLow='${intensityStart}' PowerHigh='${intensityEnd}'/>\n`;
		} else {
			this.content += `\t\t<Cooldown Duration='${duration}' PowerLow='${intensityStart}' PowerHigh='${intensityEnd}'/>\n`;
		}
	}
	getContent() : string {
		return this.content;
	}
}

export class MRCCourseDataVisitor extends BaseVisitor {
	private courseData : string = "";
	private time : number = 0;
	private idx : number = 0;
	private perfPRODescription : string = "";

	processCourseData(intensity: Intensity, durationInSeconds: number) {
		this.time += durationInSeconds;
		// Course Data has to be in minutes
		this.courseData += (this.time/60) + "\t" + Math.round(intensity.getValue() * 100) + "\n";
	}

	processTitle(interval: Interval) {
		var title = interval.getTitle();
		if (title.length == 0) {
			title = WorkoutTextVisitor.getIntervalTitle(interval);
		}
		this.perfPRODescription += "Desc" + this.idx++ + "=" + title + "\n";
	}

	getCourseData() : string {
		return this.courseData;
	}

	getPerfPRODescription() {
		return this.perfPRODescription;
	}

	visitSimpleInterval(interval: SimpleInterval) {
		this.processCourseData(interval.getIntensity(), 0);
		this.processCourseData(interval.getIntensity(), interval.getDuration().getSeconds());
		this.processTitle(interval);
	}
	visitRampBuildInterval(interval: RampBuildInterval) {
		this.processCourseData(interval.getStartIntensity(), 0);
		this.processCourseData(interval.getEndIntensity(), interval.getDuration().getSeconds());
		this.processTitle(interval);
	}
}

export class FileNameHelper {
	private intervals: ArrayInterval;

	constructor(intervals: ArrayInterval) {
		this.intervals = intervals;
	}

	getFileName() : string {
		var mainInterval = null;
		var duration = this.intervals.getDuration().getSeconds();

		var intensity_string = DateHelper.getDayOfWeek() + " - IF" + Math.round(this.intervals.getIntensity().getValue()*100) + " - ";
	
		this.intervals.getIntervals().forEach(function(interval) {            
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
		} else {
			return intensity_string;
		}
	}
}

const EASY_THRESHOLD = 0.60;
 
export class WorkoutTextVisitor implements Visitor {
	result : string = "";
	userProfile: UserProfile = null;
	sportType: SportType = SportType.Unknown;
	outputUnit: IntensityUnit = IntensityUnit.Unknown;

	constructor(userProfile: UserProfile = null,
				sportType: SportType = SportType.Unknown,
				outputUnit: IntensityUnit = IntensityUnit.Unknown) {
		this.userProfile = userProfile;
		this.sportType = sportType;
		this.outputUnit = outputUnit;
	}
	
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

	static formatNumber(value: number, decimalMultiplier : number, separator : string, unit : string, round_val : number = 0) {
	    var integerPart = Math.floor(value);
	    var fractionPart = WorkoutTextVisitor.roundNumberDown(Math.round(decimalMultiplier * (value - integerPart)), round_val);
	    return integerPart + separator + WorkoutTextVisitor.enforceDigits(fractionPart, 2) + unit;
	}
	
	private static enforceDigits(value: number, digits: number) {
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
	
	static getIntervalTitle(interval: Interval,
							userProfile: UserProfile = null,
							sportType: SportType = SportType.Unknown,
							outputUnit: IntensityUnit = IntensityUnit.Unknown) : string {
		// TODO: instantiating visitor is a bit clowny
		var f = new WorkoutTextVisitor(userProfile, sportType, outputUnit);
		VisitorHelper.visit(f, interval);

		return f.result;
	}
	
	visitRestInterval(interval: Interval) : void {
		if (interval.getIntensity().getValue() <= EASY_THRESHOLD) {
			this.result += interval.getDuration().toStringShort() + " easy";
		} else {
			this.result += interval.getDuration().toStringShort() + " rest @ " + this.getIntensityPretty(interval.getIntensity());
		}
	}

	// ArrayInterval
	visitArrayInterval(interval: ArrayInterval) {
		this.visitArrayIntervalInternal(interval, false);
	}
	visitArrayIntervalInternal(interval: ArrayInterval, always_add_parenthesis : boolean) {
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
				for (var i = 0 ; i < length - 1; i++) {
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
				for (var i = 0 ; i < length; i++) {
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
	visitRepeatInterval(interval: RepeatInterval) {
		this.result += interval.getRepeatCount() + " x ";
		this.visitArrayIntervalInternal(interval, true);
	}
	
	// RampBuildInterval
	visitRampBuildInterval(interval: RampBuildInterval) : any {
		if (interval.getStartIntensity().getValue() <= EASY_THRESHOLD) {
			this.result += interval.getDuration().toStringShort() + " build to " + this.getIntensityPretty(interval.getEndIntensity());	
		} else {
			this.result += interval.getDuration().toStringShort() + " build from " + this.getIntensityPretty(interval.getStartIntensity()) + " to " + this.getIntensityPretty(interval.getEndIntensity());	
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
				this.result += interval.getStepInterval(i).getDuration().toStringShort();
				this.result += ", ";
			}
				
			// remove extra ", "
			this.result = this.result.slice(0, this.result.length - 2);
			this.result += ")";
		} else {
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
	visitSimpleInterval(interval: SimpleInterval) : any {
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
			} else {
				this.result += " easy";	
			}
		} else {
			this.result += " @ " + this.getIntensityPretty(interval.getIntensity())	
		}		
	}

	getIntensityPretty(intensity: Intensity): string {
		if (this.outputUnit == IntensityUnit.Unknown || this.sportType == SportType.Unknown) {
			return intensity.toString();
		}
		if (this.outputUnit == IntensityUnit.IF) {
			return intensity.toString();
		}
		if (this.sportType == SportType.Bike) {
			if (this.outputUnit == IntensityUnit.Watts) {
				return WorkoutTextVisitor.roundNumberUp(Math.round(this.userProfile.getBikeFTP() * intensity.getValue()), 5) + "w";
			} else {
				return intensity.toString();
			}			
		} else if (this.sportType == SportType.Run) {
			var minMi = this.userProfile.getPaceMinMi(intensity);
			var outputValue = IntensityUnitHelper.convertTo(minMi, IntensityUnit.MinMi, this.outputUnit); 
			if (this.outputUnit == IntensityUnit.Kmh || this.outputUnit == IntensityUnit.Mph) {
				return MyMath.round10(outputValue, -1) + getIntensityUnit(this.outputUnit);
			} else {
				return WorkoutTextVisitor.formatNumber(outputValue, 60, ":", getIntensityUnit(this.outputUnit), 5);
			}
		} else if (this.sportType == SportType.Swim) {
			if (this.outputUnit == IntensityUnit.Mph) {
				return MyMath.round10(this.userProfile.getSwimPaceMph(intensity), -1) + getIntensityUnit(this.outputUnit);	
			} else if (this.outputUnit == IntensityUnit.Per100Yards || this.outputUnit == IntensityUnit.Per100Meters) {
				var swim_pace_per_100 = this.userProfile.getSwimPace(this.outputUnit, intensity);
				return WorkoutTextVisitor.formatNumber(swim_pace_per_100, 60, ":", getIntensityUnit(this.outputUnit));	
			} else {
				console.assert(false, stringFormat("Invalid output unit {0}", this.outputUnit));
			}
		} else {
			console.assert(false, stringFormat("Invalid sport type {0}", this.sportType));
		}
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
			} else if (speed.indexOf("min/400m") != -1) {
				res = (60 / (this._extractNumber(speed, 60, ":", "min/400m") * 2.5 * 1.609344));
			} else if (speed.indexOf("/100yards") != -1) {
				var pace_per_100_yards = this._extractNumber(speed, 60, ":", "/100yards");
				res = IntensityUnitHelper.convertTo(pace_per_100_yards, IntensityUnit.Per100Yards, IntensityUnit.Mph);
			} else if (speed.indexOf("/100meters") != -1) {
				var pace_per_100_meters = this._extractNumber(speed, 60, ":", "/100meters");
				res = IntensityUnitHelper.convertTo(pace_per_100_meters, IntensityUnit.Per100Meters, IntensityUnit.Mph);
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
	
	getBikeFTP() {
		return this.bikeFTP;
	}
	
	getRunningTPaceMinMi() {
		return this.runningTPaceMinMi;
	}

	getEmail() : string {
		return this.email;
	}
	
	getPaceMph(intensity: Intensity) {
		var estPaceMinMi = this.getPaceMinMi(intensity);
		return 60 / estPaceMinMi;
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
	
	getSwimCSSMph() : number {
		var css_mph = IntensityUnitHelper.convertTo(this.swimmingCSSMinPer100Yards, IntensityUnit.Per100Yards, IntensityUnit.Mph);
		return css_mph;
	}
	
	getSwimPaceMph(intensity: Intensity) : number {
		var css_mph = IntensityUnitHelper.convertTo(this.swimmingCSSMinPer100Yards, IntensityUnit.Per100Yards, IntensityUnit.Mph);
		return css_mph * intensity.getValue();
	}
	
	getSwimPace(intensity_unit_result: IntensityUnit, intensity: Intensity) : number {
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
	
	getBikeSpeedMphForIntensity(intensity: Intensity) : number {
		// TODO: simplifying it for now
		var actualSpeedMph = 0;
		if (intensity.getValue() < 0.65) {
			actualSpeedMph = 15;
		} else  {
			actualSpeedMph = 20;
		}
		return actualSpeedMph;
	}
		
	createIntensity(value: number, unit: IntensityUnit) {
		var ifValue = 0;
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
				speed_per_100_yards += value/60;
				var speed_mph = IntensityUnitHelper.convertTo(speed_per_100_yards, IntensityUnit.Per100Yards, IntensityUnit.Mph);
				ifValue = speed_mph / this.userProfile.getSwimCSSMph();
			} else {
				console.assert(false, stringFormat("Invalid intensity unit {0}", unit));
			}
		} else {
			console.assert(false, stringFormat("Invalid sport type {0}", this.sportType));
		}
		return new Intensity(ifValue, value, unit);
	}
	
	createDuration(intensity: Intensity, unit: DurationUnit, value: number) : Duration {
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
			console.assert(false, stringFormat("Invalid sport type {0}", this.sportType));
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

export class StopWatch {
	startTime: number;
	stoppedTime: number;
	
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
    getIsStarted() {
        return this.startTime !== null;
    }
	getElapsedTime() {
    	if (this.startTime !== null) {
        	return (Date.now() - this.startTime) + this.stoppedTime;
		} else {
        	return this.stoppedTime;
		}
    }
	reset() {
		this.startTime = null;
        this.stoppedTime = 0;
	}
}

export class ArrayIterator {
	array: any[];
	index: number;

	constructor(array) {
		this.array = array;
	}
	
	reset() {
		this.index = -1;
	}
	
	getCurrent() {
		return this.array[this.index];
	}
	
    getCurrentIndex() {
        return this.index;
    }
	
    tryGettingNext() {
        if (this.index+1 < this.array.length) {
            return this.array[this.index+1];
        } else {
            return null;
        }
    }
	
	getIsValid() : boolean {
		return this.index >= 0 && this.index < this.array.length;
	}
	
	moveNext() : boolean {
		this.index++;
        return this.getIsValid();
	}	
}

export class WorkoutBuilder {
	private userProfile: UserProfile;
	private sportType: SportType;
	private outputUnit: IntensityUnit;
	private intervals: ArrayInterval;
	private workoutDefinition: string;
	
	constructor(userProfile: UserProfile, sportType: SportType, outputUnit: IntensityUnit) {
		this.userProfile = userProfile;
		this.sportType = sportType;
		this.outputUnit = outputUnit;
	}
	
	getInterval() : ArrayInterval {
		return this.intervals;
	}

	getSportType() : SportType {
		return this.sportType;
	}

	withDefinition(workoutDefinition: string) : WorkoutBuilder {
		this.intervals = IntervalParser.parse(
			new ObjectFactory(this.userProfile, this.sportType),
			workoutDefinition
		);
		this.workoutDefinition = workoutDefinition;
		return this;
	}
	
	getIntensityFriendly(intensity: Intensity) {
		var f = new WorkoutTextVisitor(this.userProfile, this.sportType, this.outputUnit);
		return f.getIntensityPretty(intensity);
	}

	getTSS() : number {
		return this.intervals.getTSS();
	}

	getTSSFromIF() : number {
		return this.intervals.getTSSFromIF();
	}

	getTimePretty() : string {
		return this.intervals.getDuration().toTimeStringLong();
	}

	getIF() : number {
		return MyMath.round10(this.intervals.getIntensity().getValue() * 100, -1);
	}

	getAveragePower() : number {
		return MyMath.round10(this.userProfile.getBikeFTP() * this.intervals.getIntensity().getValue(), -1);
	}

	getIntervalPretty(interval: Interval) {
		return WorkoutTextVisitor.getIntervalTitle(interval, this.userProfile, this.sportType, this.outputUnit);
	}

	getEstimatedDistancePretty() : string {
		if (this.sportType == SportType.Swim) {
			return this.intervals.getDuration().toStringDistance(DistanceUnit.Yards);
		} else {
			return this.intervals.getDuration().toStringDistance(DistanceUnit.Miles);
		}
	}

	getAveragePace() : string {
		var minMi = this.userProfile.getPaceMinMi(this.intervals.getIntensity());
		var outputValue = IntensityUnitHelper.convertTo(minMi, IntensityUnit.MinMi, this.outputUnit); 
		if (this.outputUnit == IntensityUnit.Kmh || this.outputUnit == IntensityUnit.Mph) {
			return MyMath.round10(outputValue, -1) + getIntensityUnit(this.outputUnit);
		} else {
			return WorkoutTextVisitor.formatNumber(outputValue, 60, ":", getIntensityUnit(this.outputUnit));
		}
	}
	
	getPrettyPrint(new_line : string = "\n") : string {
		var intensities = this.intervals.getIntensities();

		var distanceInMiles = 0;
		var result = new_line;
        this.intervals.getIntervals().forEach(function(interval) {
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
		} else {
			result += ("\t* Distance: " + this.getEstimatedDistancePretty());
		}
		
		result += (new_line);		
		result += ("\t* IF: " + this.getIF());
		result += (new_line);

		result += ("Zones:");
		result += (new_line);
        var zones = this.intervals.getTimeInZones(this.sportType);
        zones.forEach(function(zone) {
            result += ("\t* "+zone.name + " " + zone.range +" : " + zone.duration.toString());
			result += (new_line);
        });

		if (this.sportType == SportType.Bike) {
			result += ("\t* Avg Pwr: " + this.getAveragePower() + "w");
			result += (new_line);
		}

		result += (new_line);
		result += ("Paces:");
		result += (new_line);
		intensities.forEach(function(intensity: Intensity) {
			result += ("\t* " + Math.round(intensity.getValue()*100) + "% (" + this.getIntensityFriendly(intensity) + ")");
			result += (new_line);
		}, this);


		result += (new_line);
		result += ("Workout Definition: " + this.workoutDefinition);
		result += (new_line);

		return result
	}

	getMRCFile() : string {
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
	}

	getZWOFile() : string {
		var fileNameHelper = new FileNameHelper(this.intervals);
		var workout_name = fileNameHelper.getFileName();

		var zwift = new ZwiftDataVisitor(workout_name);
		VisitorHelper.visit(zwift, this.intervals);
		zwift.finalize();
		return zwift.getContent();
	}

	getZWOFileName() : string {
		var fileNameHelper = new FileNameHelper(this.intervals);
		return fileNameHelper.getFileName() + ".zwo";
	}
	getMRCFileName(): string {
		var fileNameHelper = new FileNameHelper(this.intervals);
		return fileNameHelper.getFileName() + ".mrc";
	}
};

}

export = Model;