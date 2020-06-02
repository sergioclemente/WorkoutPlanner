import * as Parser from './parser';
import * as Visitor from './visitor';
import * as Core from './core';
import * as User from './user'

export class WorkoutBuilder {
	private userProfile: User.UserProfile;
	private sportType: Core.SportType;
	private outputUnit: Core.IntensityUnit;
	private intervals: Core.ArrayInterval;
	private workoutDefinition: string;
	private workoutTitle: string;

	constructor(userProfile: User.UserProfile, sportType: Core.SportType, outputUnit: Core.IntensityUnit) {
		Core.PreconditionsCheck.assertIsNumber(sportType, "sportType");
		Core.PreconditionsCheck.assertIsNumber(outputUnit, "outputUnit");

		this.userProfile = userProfile;
		this.sportType = sportType;
		this.outputUnit = outputUnit;
	}

	getInterval(): Core.ArrayInterval {
		return this.intervals;
	}

	getSportType(): Core.SportType {
		return this.sportType;
	}

	getWorkoutTitle(): string {
		return this.workoutTitle;
	}

	getNormalizedWorkoutDefinition(): string {
		let object_factory = new User.ObjectFactory(this.userProfile, this.sportType);
		return Parser.IntervalParser.normalize(object_factory, this.workoutDefinition);
	}

	withDefinition(workoutTitle: string, workoutDefinition: string): WorkoutBuilder {
		let object_factory = new User.ObjectFactory(this.userProfile, this.sportType);
		this.intervals = Parser.IntervalParser.parse(
			object_factory,
			workoutDefinition
		);
		this.workoutTitle = workoutTitle;
		this.workoutDefinition = workoutDefinition;
		return this;
	}

	getIntensityFriendly(intensity: Core.Intensity, roundValues: boolean) {
		var f = new Visitor.WorkoutTextVisitor(this.userProfile, this.sportType, this.outputUnit, roundValues);
		return f.getIntensityPretty(intensity);
	}

	getTSS(): number {
		return Visitor.TSSCalculator.compute(this.intervals);
	}

	getTimePretty(): string {
		return this.intervals.getTotalDuration().toTimeStringLong();
	}

	getIF(): number {
		return Core.MyMath.round10(this.intervals.getIntensity().getValue() * 100, -1);
	}

	getAveragePower(): number {
		return Core.MyMath.round10(this.userProfile.bike_ftp * this.intervals.getIntensity().getValue(), -1);
	}

	getIntervalPretty(interval: Core.Interval, roundValues: boolean) {
		return Visitor.WorkoutTextVisitor.getIntervalTitle(interval, this.userProfile, this.sportType, this.outputUnit, roundValues);
	}

	getEstimatedDistancePretty(): string {
		if (this.sportType == Core.SportType.Swim) {
			return this.intervals.getWorkDuration().toStringDistance(Core.DistanceUnit.Yards);
		} else {
			return this.intervals.getWorkDuration().toStringDistance(Core.DistanceUnit.Miles);
		}
	}

	getAveragePace(): string {
		var minMi = this.userProfile.getRunningPaceMinMi(this.intervals.getIntensity());
		let outputUnit = this.outputUnit;
		if (outputUnit == Core.IntensityUnit.HeartRate) {
			outputUnit = Core.IntensityUnit.MinMi;
		}
		var outputValue = Core.IntensityUnitHelper.convertTo(minMi, Core.IntensityUnit.MinMi, outputUnit);
		if (outputUnit == Core.IntensityUnit.Kmh || outputUnit == Core.IntensityUnit.Mph) {
			return Core.MyMath.round10(outputValue, -1) + Core.IntensityUnitHelper.toString(outputUnit);
		} else {
			return Core.FormatterHelper.formatNumber(outputValue, 60, ":", Core.IntensityUnitHelper.toString(outputUnit));
		}
	}

	getStepsList(new_line: string): string {
		var result = "";

		this.intervals.getIntervals().forEach(function (interval: Core.Interval) {
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

		return result
	}

	getMRCFile(): string {
		let wfg = new Visitor.WorkoutFileGenerator(this.workoutTitle, this.intervals);
		return wfg.getMRCFile();
	}

	getZWOFile(): string {
		let wfg = new Visitor.WorkoutFileGenerator(this.workoutTitle, this.intervals);
		return wfg.getZWOFile();
	}

	getPPSMRXFile(): string {
		let wfg = new Visitor.WorkoutFileGenerator(this.workoutTitle, this.intervals);
		return wfg.getPPSMRXFile();
	}

	getZWOFileName(): string {
		let wfg = new Visitor.WorkoutFileGenerator(this.workoutTitle, this.intervals);
		return wfg.getZWOFileName();
	}
	getMRCFileName(): string {
		let wfg = new Visitor.WorkoutFileGenerator(this.workoutTitle, this.intervals);
		return wfg.getMRCFileName();
	}

	getPPSMRXFileName(): string {
		let wfg = new Visitor.WorkoutFileGenerator(this.workoutTitle, this.intervals);
		return wfg.getPPSMRXFileName();
	}
};