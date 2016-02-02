/// <reference path="MyMath.ts" />

export class MailSender {
	host: string;
	port: number;
	use_ssl: boolean;
	user: string;
	password: string;

	constructor(host: string,
				port: number,
				use_ssl: boolean,
				user: string,
				password: string) {
		this.host = host;
		this.port = port;
		this.use_ssl = use_ssl;
		this.user = user;
		this.password = password;
	}

	send(to: string, subject: string, body: string, attachment: any) : void {
		var smtpConfig = {
		  host: this.host,
			 port: this.port,
			 secure: this.use_ssl,
			 auth: {
			     user: this.user,
			     pass: this.password
		  }
		};
		var mailOptions = {
			from: this.user, // sender address
			to: to, // list of receivers
			subject: subject, // Subject line
			text: body, // plaintext body
			html: body, // html body
			attachments: [{ 'filename': attachment.name, 'content': attachment.data}]
		};

		// send mail with defined transport object
		var nodemailer = require('nodemailer');
		var transporter = nodemailer.createTransport(smtpConfig);
		transporter.sendMail(mailOptions, function(error, info) {
			if (error) {
				return console.log(error);
			}
			console.log('Message sent: ' + info.response);
		});
	}
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

export enum TimeUnit {
	Unknown,
	Seconds,
	Minutes,
	Hours
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
		default:
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
	
	toStringDistance() : string {
		if (DurationUnitHelper.isDistance(this.unit)) {
			return MyMath.round10(this.value, -1) + getStringFromDurationUnit(this.unit); 
		} else {
			return MyMath.round10(this.estimatedDistanceInMiles, -1) + getStringFromDurationUnit(DurationUnit.Miles);	
		}
	}
	
	toStringTime() : string {
		var result = "";
		
		var hours = (this.estimatedDurationInSeconds / 3600) | 0;
		var minutes = ((this.estimatedDurationInSeconds - hours*3600) / 60) | 0;
		var seconds = (this.estimatedDurationInSeconds % 60) | 0;
		
		if (hours != 0) {
			result += hours + "hr";
		}
		
		if (minutes != 0) {
			result += minutes + "min";
		}
		
		if (seconds != 0) {
			result += seconds + "sec";
		}
		
		return result;
	}
	
	toString(): string {
		if (DurationUnitHelper.isTime(this.unit)) {
			return this.toStringTime();
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
		default:
			return "unknown";
	}
}

function getDurationUnitFromString(unit: string) : DurationUnit {
	var conversionMap = {
		"mi": DurationUnit.Miles,
		"km": DurationUnit.Kilometers,
		"m": DurationUnit.Meters,
		"h" : DurationUnit.Hours,
		"hr" : DurationUnit.Hours,
		"hour" : DurationUnit.Hours,
		"hours" : DurationUnit.Hours,
		"min" : DurationUnit.Minutes,
		"sec" : DurationUnit.Seconds,
		"s" : DurationUnit.Seconds,	
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
	} else {
		throw new Error("Invalid IntensityUnit");
		return "";
	}
}

function isDurationUnit(value: string) {
	return getDurationUnitFromString(value) != DurationUnit.Unknown;
}

function isIntensityUnit(value: string) {
	return getIntensityUnitFromString(value) != IntensityUnit.Unknown;
}

export enum DurationUnit {
	Unknown=-1,
	Seconds=0,
	Minutes=1,
	Hours=2,
	Meters=3,
	Miles=4,
	Kilometers=5
}

export enum IntensityUnit {
	Unknown=-1,
	IF=0,
	Watts=1,
	MinMi=2,
	Mph=3,
	Kmh=4,
	MinKm=5
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
				throw new Error("Invalid unitFrom or unitTo for conversion");
			}
			
		var speedMph = 0;
		if (unitFrom == IntensityUnit.Mph) {
			speedMph = value;
		} else if (unitFrom == IntensityUnit.MinMi) {
			speedMph = 60 / value;
		} else if (unitFrom == IntensityUnit.Kmh) {
			speedMph = DistanceUnitHelper.convertTo(value, DistanceUnit.Kilometers, DistanceUnit.Miles);
		} else if (unitFrom == IntensityUnit.MinKm) {
			speedMph = 60 / DistanceUnitHelper.convertTo(value, DistanceUnit.Kilometers, DistanceUnit.Miles);
		} else {
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
		} else {
			throw new Error("Unknown IntensityUnit!");
		}
		
		return result;
	} 
};

export class Intensity {
	// Sums which can be helpful when combining intensities
	// Otherwise it might lose a lot of precision
	private sum1: number;
	private sum2: number;

	private originalValue: number;
	private originalUnit: IntensityUnit;
	
	constructor(ifValue:number = 0, value: number = 0, unit:IntensityUnit = IntensityUnit.IF) {
		// HACK: Find a better way of doing this
		if (ifValue > 10) {
			ifValue = ifValue / 100;
		}

		if (unit == IntensityUnit.IF) {
			// HACK: Find a vetter way of doing this
			if (value > 10) {
				value = value / 100;
			}
			
			this.sum1 = Math.pow(ifValue, 4);
			this.sum2 = 1;
			this.originalUnit = IntensityUnit.IF;
			this.originalValue = value;
		} else {
			this.sum1 = ifValue;
			this.sum2 = 1;
			this.originalUnit = unit;
			this.originalValue = value;
		}
	}
	
	getValue() : number {
		return Math.sqrt(Math.sqrt(this.sum1 / this.sum2));
	}

	toString() : string {
		if (this.originalUnit == IntensityUnit.IF) {
			return MyMath.round10(100*this.originalValue, -1) + "%";
		} else {
			if (this.originalUnit == IntensityUnit.MinMi) {
				return Formatter.formatNumber(this.originalValue, 60, ":", "min/mi");
			} else {
				return MyMath.round10(this.originalValue, -1) + getStringFromIntensityUnit(this.originalUnit);
			}
		}
	}
	
	static combine(intensities: Intensity[], weights: number[]) : Intensity {
		if (weights.length != intensities.length) {
			throw new Error("The size of intensities and weights should be the same");
		}
		// do a weighed sum
		var sum1 = 0;
		var sum2 = 0;

		for (var i = 0; i < intensities.length; i++) {
			sum1 += intensities[i].sum1 * weights[i];
			sum2 += intensities[i].sum2 * weights[i];
		}
		
		// TODO: Cleanup Intensity creation
		var res = new Intensity(sum1/sum2);
		res.sum1 = sum1;
		res.sum2 = sum2;
		return res;
	}
}

interface Interval {
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
	private duration:Duration;

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

export class BuildInterval extends BaseInterval {
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
		return BuildInterval.computeAverageIntensity(this.startIntensity, this.endIntensity);
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
	
	constructor(x: Duration, y: Intensity) {
		this.x = x;
		this.y = y;
	}
}

export class ArrayInterval implements Interval {
	private title: string;
	private intervals: Interval[];
	
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
	getDuration(): Duration {
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
		return MyMath.round10(tssVisitor.getTSS(), -1);
	}
	
	getIntensities() : Intensity[] {
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
				y: Math.round(item.y.getValue() * 100)
			};
		});
	}
	
	getTimeInZones() {
		var zv = new ZonesVisitor();
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
		return new Duration(baseDuration.getUnit(), baseDuration.getValue() * this.repeatCount, baseDuration.getSeconds() * this.getRepeatCount(), baseDuration.getDistanceInMiles() * this.getRepeatCount());
	}
	
	getRepeatCount() : number {
		return this.repeatCount;
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
		var value = 0;
		for (; i < input.length; i++) {
			var ch = input[i];
			if (IntervalParser.isDigit(ch)) {
				value = value * 10 + IntervalParser.getCharVal(ch) - IntervalParser.getCharVal("0"); 
			} else if (ch == ".") {
				i++;
				var base = 10;
				for (; i < input.length; i++) {
					var ch = input[i];
					if (IntervalParser.isDigit(ch)) {
						value = value + (IntervalParser.getCharVal(ch) - IntervalParser.getCharVal("0")) / base; 
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
		
		// points to the last valid char
		return {i: i - 1, value: value} ;
	}
	static isWhitespace(ch: string) : boolean {
		return ch.length == 1 && (ch == " " || ch == "\t" || ch == "\n");
	}
	static throwParserError(column : number, msg : string) : void {
		throw Error("Error while parsing input on column " + column + "-  Error: " + msg);
	}
	static shouldParse(input: string) {
		if (input.length > 0) {
			var lastChar = input[input.length-1];
			return lastChar == "," || lastChar == ")" || lastChar == "]" || lastChar == "\n";
		} else {
			return false;
		}
	}
	static parse(factory: ObjectFactory, input: string) : ArrayInterval{
		var result = new ArrayInterval("Workout", []);
		
		var stack = [result];

		for (var i = 0 ; i < input.length; i++) {
			var ch = input[i];
			
			if (ch == "(") { // parse simple workout
				i++;
				var nums = {
					0: 0,
					1: 0,
					2: 0,
				};
				var units = {
					0: "",
					1: "",
					2: "",	
				};
				var title = "";
				var numIndex = 0;
				var isInTitle = false;

				for (; i < input.length; i++) {
					ch = input[i];
					if (ch == ")") {
						// simple workout completed, pop element from stack and create
						var interval : Interval;
						var durationValue : number;
						var durationUnit : DurationUnit;
						var intensities : Intensity[] = [];
						
						// Do we have the units?
						var containsUnit = units[0] != "" ||
							units[1] != "" ||
							units[2] != "";

						// Tries to be forgiving by guessing the unit by using the biggest value
						// TODO: not working with build intervals
						if (!containsUnit) {
							if (nums[0] < nums[1]) {
								units[0] = "min";
								units[1] = "%";
							} else {
								units[0] = "%";
								units[1] = "min";
							}
						}
						
						// Handle properly the duration unit
						for (var k = 0; k < 3; k++) {
							if (isDurationUnit(units[k])) {
								durationUnit = getDurationUnitFromString(units[k]);
								durationValue = nums[k];
							} else if (nums[k] != 0) {
								var intensityUnit = IntensityUnit.IF;
								if (isIntensityUnit(units[k])) {
									intensityUnit = getIntensityUnitFromString(units[k]);
								}
								intensities.push(factory.createIntensity(nums[k], intensityUnit));
							}
						}
						
						if (intensities.length == 2) {
							var startIntensity = intensities[0];
							var endIntensity = intensities[1]
							var intensity = BuildInterval.computeAverageIntensity(startIntensity, endIntensity);
							var duration = factory.createDuration(intensity, durationUnit, durationValue);
							interval = new BuildInterval(title.trim(), startIntensity, endIntensity, duration);
						} else if (intensities.length == 1) {
							var intensity = intensities[0];
							var duration = factory.createDuration(intensity, durationUnit, durationValue);
							interval = new SimpleInterval(title.trim(), intensity, duration);
						} else {
							IntervalParser.throwParserError(i, "Cannot have less than 1 intensity");
						}
						
						stack[stack.length-1].getIntervals().push(interval);
						break;
					} else if (ch == ",") {
						numIndex++;
						isInTitle = false;
					} else {
						if (IntervalParser.isDigit(ch) && !isInTitle) {
							var res = IntervalParser.parseDouble(input, i);
							i = res.i;
							nums[numIndex] = res.value;
							
							// look for a unit
							var unitStr = "";
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
									unitStr += input[j];
								} else {
									break;
								}
							}
							units[numIndex] = unitStr;
							i += unitStr.length;
						} else {
							// just enter in title mode if its not a whitespace
							if (!isInTitle && !IntervalParser.isWhitespace(ch)) {
								isInTitle = true;
							}

							if (isInTitle) {
								title += ch;
							}
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

		return result;
	}
}

export class VisitorHelper {
	static visit(visitor: Visitor, interval:Interval) : any {
		if (interval instanceof SimpleInterval) {
	      return visitor.visitSimpleInterval(<SimpleInterval>interval);
	    } else if (interval instanceof BuildInterval) {
	      return visitor.visitBuildInterval(<BuildInterval>interval);
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
	visitBuildInterval(interval: BuildInterval) : void;
	visitRepeatInterval(interval: RepeatInterval) : void;
	visitArrayInterval(interval: ArrayInterval) : void;
}

export class BaseVisitor implements Visitor {

	visitSimpleInterval(interval: SimpleInterval) : void {
		// not aware that typescript supports abstract methods
		throw new Error("not implemented");
	}
	visitBuildInterval(interval: BuildInterval) : void {
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

export class ZonesVisitor extends BaseVisitor {
	private zones = {
		1 : {name:"Z1", range:"(0,55%]", value:0},
		2 : {name:"Z2", range:"(55%;75%]", value:0},
		3 : {name:"Z3", range:"(75%;90%]", value:0},
		4 : {name:"Z4", range:"(90%;105%]", value:0},
		5 : {name:"Z5", range:"(105%;120%]", value:0},
		6 : {name:"Z6+", range:"(120%;+oo)", value:0},
	};

	private static getZone(intensity: number) : number {
		if (intensity < 0.55) {
			return 1;
		} else if (intensity <= 0.75) {
			return 2;
		} else if (intensity <= 0.90) {
			return 3;
		} else if (intensity <= 1.05) {
			return 4;
		} else if (intensity <= 1.2) {
			return 5;
		} else {
			return 6;
		}
	}

	incrementZoneTime(intensity: number, numberOfSeconds: number) {
		var zone : number = ZonesVisitor.getZone(intensity);
		this.zones[zone].value += numberOfSeconds;
	}

	visitSimpleInterval(interval: SimpleInterval) : void {
		this.incrementZoneTime(interval.getIntensity().getValue(), interval.getDuration().getSeconds());
				
	}
	visitBuildInterval(interval: BuildInterval) : void {
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
	visitBuildInterval(interval: BuildInterval) : void {
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

// TSS = [(s x NP x IF) / (FTP x 3600)] x 100
// IF = NP / FTP
// TSS = [(s x NP x NP/FTP) / (FTP x 3600)] x 100
// TSS = [s x (NP / FTP) ^ 2] / 36
export class TSSVisitor extends BaseVisitor {
	private tss : number = 0;
	
	visitSimpleInterval(interval: SimpleInterval) : void {
		var duration = interval.getDuration().getSeconds();
		var intensity = interval.getIntensity().getValue();
		this.tss += duration * (intensity * intensity);
		var tmp = (duration * (intensity * intensity)) / 36;
	}
	visitBuildInterval(interval: BuildInterval) : void {
		var startIntensity = interval.getStartIntensity().getValue();
		var endIntensity = interval.getEndIntensity().getValue();
		var duration = interval.getDuration().getSeconds();
		
		// Right way to estimate the intensity is by doing incremental of 1 sec
		var intensity = startIntensity;
		var intensityIncrement = (endIntensity - startIntensity) / duration;
		for (var t = 0; t < duration; t++) {
			this.tss += 1 * (intensity * intensity);
			intensity += intensityIncrement;
		}
	}
	
	getTSS(): number {
		return this.tss / 36;
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
		this.initX(interval.getDuration());
		this.data.push(new Point(this.x, interval.getIntensity()));
		this.incrementX(interval.getDuration());
		this.data.push(new Point(this.x, interval.getIntensity()));
	}
	visitBuildInterval(interval: BuildInterval) {
		this.initX(interval.getDuration());
		this.data.push(new Point(this.x, interval.getStartIntensity()));
		this.incrementX(interval.getDuration());
		this.data.push(new Point(this.x, interval.getEndIntensity()));
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
			title = Formatter.getIntervalTitle(interval);
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
	visitBuildInterval(interval: BuildInterval) {
		this.processCourseData(interval.getStartIntensity(), 0);
		this.processCourseData(interval.getEndIntensity(), interval.getDuration().getSeconds());
		this.processTitle(interval);
	}
}

export class MRCFileNameHelper {
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
			var filename = intensity_string + Formatter.getIntervalTitle(mainInterval) + ".mrc";

			// Avoid really long filenames since its not very helpful
			if (filename.length < 50) {
				return filename;
			}
		}
		
		// TODO: do something here if the main set its too big. Some ideas:
		// 1) Long Ride
		
		var timeInZones = this.intervals.getTimeInZones();

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
			var duration_hr = Math.floor(TimeUnitHelper.convertTo(duration, TimeUnit.Seconds, TimeUnit.Hours));
			return intensity_string + duration_hr + "hour-" + zoneMaxName + ".mrc";
		} else {
			return intensity_string + ".mrc";
		}
	}
}

export class Formatter implements Visitor {
	result : string = "";
	
	static formatNumber(value: number, decimalMultiplier : number, separator : string, unit : string) {
	    var integerPart = Math.floor(value);
	    var fractionPart = Math.round(decimalMultiplier * (value - integerPart));
	    return Formatter.enforceDigits(integerPart, 2) + separator + Formatter.enforceDigits(fractionPart, 2) + unit;
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
	
	static getIntervalTitle(interval: Interval) : string {
		// TODO: instantiating visitor is a bit clowny
		var f = new Formatter();
		VisitorHelper.visit(f, interval);

		return f.result;
	}
	
	// ArrayInterval
	visitArrayInterval(interval: ArrayInterval) {
		// Detect which subtype is. Couple of possibilities:
		// * Last interval is the minimum (rest interval)
		// * A combination with both
		
		var prevIntensity = interval.getIntervals()[0].getIntensity();
		var prevDuration = interval.getIntervals()[0].getDuration();
		var isIncreasing = true;
		var isEqualDuration = true;
		var isRestIncluded = false;
		for (var i = 1 ; i < interval.getIntervals().length; i++) {
			var curIntensity = interval.getIntervals()[i].getIntensity();
			var curDuration = interval.getIntervals()[i].getDuration();
			
			if (prevIntensity.getValue() > curIntensity.getValue()) {
				// Ignore the last interval
				if (i != interval.getIntervals().length - 1) {
					isIncreasing = false;
				} else {
					isRestIncluded = true;
				}
			}
			prevIntensity = curIntensity;
			
			if (prevDuration.getSeconds() == curDuration.getSeconds() ||
				prevDuration.getDistanceInMiles() == curDuration.getDistanceInMiles()) {
				if (i != interval.getIntervals().length - 1 || !isRestIncluded) {
					isEqualDuration = false;
				}
			}
			prevDuration = curDuration;
		}

		for (var i = 0 ; i < interval.getIntervals().length; i++) {
			var subInterval = interval.getIntervals()[i];
			
			if (i == interval.getIntervals().length - 1 && isRestIncluded) {
				this.result = this.result.slice(0, this.result.length - 2);
				this.result += " w/ " + subInterval.getDuration().toString() + " rest at " + subInterval.getIntensity().toString();
			} else {
				this.result += Formatter.getIntervalTitle(subInterval);
			}
			this.result += ", ";
		}
		
		this.result = this.result.slice(0, this.result.length - 2);
	}
	
	// RepeatInterval
	visitRepeatInterval(interval: RepeatInterval) {
		this.result += interval.getRepeatCount() + "x (";
		this.visitArrayInterval(interval);
		this.result += ")";
	}
	
	// BuildInterval
	visitBuildInterval(interval: BuildInterval) : any {
		this.result += "Build from " + interval.getStartIntensity().toString() + " to " + interval.getEndIntensity().toString() + " for " + interval.getDuration().toString();
	}
	
	// SimpleInterval
	visitSimpleInterval(interval: SimpleInterval) : any {
		this.result += interval.getIntensity().toString() + " for " + interval.getDuration().toString(); 
		var title = interval.getTitle();
		if (title.length > 0) {
			this.result += " (" + title + ")";
		}
	}
}

export enum RunningPaceUnit {
	Unknown,
	MinMi,
	Mph,
	MinKm,
	KmHr,
}

export class RunningPaceHelper {
	static convertToMph(value: number, unit: RunningPaceUnit) {
		if (unit == RunningPaceUnit.Mph) {
			return value;
		} else if (unit == RunningPaceUnit.MinMi) {
			return 60 / unit;
		} else if (unit == RunningPaceUnit.KmHr) {
			return value / 1.609344;
		} else if (unit == RunningPaceUnit.MinKm) {
			return (60 / value) / 1.609344;
		} else {
			throw new Error("Unknown running pace unit");
		}
	}	
};

export class UserProfile {
	private bikeFTP: number;
	private runningTPaceMinMi: number;
	private email: string;
	
	constructor(bikeFTP: number, runningTPaceMinMi: number, email: string) {
		this.bikeFTP = bikeFTP;
		this.runningTPaceMinMi = runningTPaceMinMi;
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
	
	getPaceMinMi(intensity: Intensity) {
		var pace_mph = IntensityUnitHelper.convertTo(
			this.getRunningTPaceMinMi(),
			IntensityUnit.MinMi,
			IntensityUnit.Mph) * intensity.getValue();
		return IntensityUnitHelper.convertTo(pace_mph,
			IntensityUnit.Mph,
			IntensityUnit.MinMi);
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
	
	getRunPaceMphForIntensity(intensity: Intensity) : number {
		var estPaceMinMi = this.userProfile.getPaceMinMi(intensity);
		return 60 / estPaceMinMi;
	}
	
	createIntensity(value: number, unit: IntensityUnit) {
		var ifValue = 0;
		if (this.sportType == SportType.Bike) {
			if (unit == IntensityUnit.Watts) {
				ifValue = value / this.userProfile.getBikeFTP();
			} else if (unit == IntensityUnit.IF) {
				ifValue = value;
			} else {
				throw new Error("Invalid unit : " + unit);
			}
		} else {
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
			} else {
				throw new Error("Not implemented");
			}
		}
		return new Intensity(ifValue, value, unit);
	}
	
	createDuration(intensity: Intensity, unit: DurationUnit, value: number) : Duration {
		var estimatedDistanceInMiles = 0;
		var estimatedTimeInSeconds = 0;
		
		var estimatedSpeedMph;
		if (this.sportType == SportType.Bike) {
			estimatedSpeedMph = this.getBikeSpeedMphForIntensity(intensity);
		} else {
			estimatedSpeedMph = this.getRunPaceMphForIntensity(intensity);
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

export class PersistedItem {
	id : string;
	constructor(id : string) {
		this.id = id;
	}
	save(value : string) : void {
		if (window.localStorage) {
			window.localStorage.setItem(this.id, value);
		}
	}
	
	load() : string {
		if (window.localStorage) {
			var result = window.localStorage.getItem(this.id);
			return result ? result.trim() : "";
		} else {
			return null;
		}
	}
}

export class WorkoutBuilder {
	private userProfile: UserProfile;
	private sportType: SportType;
	private intervals: ArrayInterval;
	private workoutDefinition: string;
	private outputUnit: IntensityUnit;
	
	constructor(userProfile: UserProfile, sportType: SportType, outputUnit: IntensityUnit) {
		this.userProfile = userProfile;
		this.sportType = sportType;
		this.outputUnit = outputUnit;
	}
	
	getInterval() : ArrayInterval {
		return this.intervals;
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
		if (this.sportType == SportType.Bike) {
			return Math.round(this.userProfile.getBikeFTP() * intensity.getValue()) + "w";
		} else if (this.sportType == SportType.Run) {
			var minMi = this.userProfile.getPaceMinMi(intensity);
			var outputValue = IntensityUnitHelper.convertTo(minMi, IntensityUnit.MinMi, this.outputUnit); 
			if (this.outputUnit == IntensityUnit.Kmh || this.outputUnit == IntensityUnit.Mph) {
				return MyMath.round10(outputValue, -1) + getIntensityUnit(this.outputUnit);
			} else {
				return Formatter.formatNumber(outputValue, 60, ":", getIntensityUnit(this.outputUnit));
			}
		} else {
			throw new Error("Not implemented.");
		}
	}
	
	getPrettyPrint(new_line : string = "\n") : string {
		var intensities = this.intervals.getIntensities();

		var distanceInMiles = 0;
		var result = new_line;
        this.intervals.getIntervals().forEach(function(interval) {
            result += ("* " + Formatter.getIntervalTitle(interval) + new_line);
            if (interval.getDuration().getDistanceInMiles() > 0) {
                distanceInMiles += interval.getDuration().getDistanceInMiles();
            }
        });
		
		result += (new_line);
		result += ("Stats:");
		result += (new_line);
		result += ("TSS: " + this.intervals.getTSS());
		result += (new_line);
		var tss_from_if = (this.intervals.getIntensity().getValue() * this.intervals.getIntensity().getValue() * this.intervals.getDuration().getSeconds()) / 36;
		result += ("TSS (From IF): " + MyMath.round10(tss_from_if, -1));
		result += (new_line);
		result += ("\t* Time: " + this.intervals.getDuration().toStringTime());
		result += (new_line);
		result += ("\t* Distance: " + this.intervals.getDuration().toStringDistance());
		result += (new_line);		
		result += ("\t* IF: " + MyMath.round10(this.intervals.getIntensity().getValue()*100, -1));
		result += (new_line);

		result += ("Zones:");
		result += (new_line);
        var zones = this.intervals.getTimeInZones();
        zones.forEach(function(zone) {
            result += ("\t* "+zone.name + " " + zone.range +" : " + zone.duration.toString());
			result += (new_line);
        });

		if (this.sportType == SportType.Bike) {
			result += ("\t* Avg Pwr: " + MyMath.round10(this.userProfile.getBikeFTP()*this.intervals.getIntensity().getValue(), -1) + "w");
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

	getMRCFileName() : string {
		var mrcFileNameHelper = new MRCFileNameHelper(this.intervals);
		return mrcFileNameHelper.getFileName();
	}
};

