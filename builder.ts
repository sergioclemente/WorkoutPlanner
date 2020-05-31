import {SportType, DistanceUnit, Intensity, ArrayInterval, Interval, IntensityUnitHelper, IntensityUnit, MyMath, PreconditionsCheck, FormatterHelper} from './core';
import {ObjectFactory, UserProfile} from './user'
import {WorkoutTextVisitor, WorkoutFileGenerator, TSSCalculator} from './visitor';
import { IntervalParser } from './parser';

export class WorkoutBuilder {
	private userProfile: UserProfile;
	private sportType: SportType;
	private outputUnit: IntensityUnit;
	private intervals: ArrayInterval;
	private workoutDefinition: string;
	private workoutTitle: string;

	constructor(userProfile: UserProfile, sportType: SportType, outputUnit: IntensityUnit) {
		PreconditionsCheck.assertIsNumber(sportType, "sportType");
		PreconditionsCheck.assertIsNumber(outputUnit, "outputUnit");

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

	getNormalizedWorkoutDefinition(): string {
		let object_factory = new ObjectFactory(this.userProfile, this.sportType);
		return IntervalParser.normalize(object_factory, this.workoutDefinition);
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
		return TSSCalculator.compute(this.intervals);
	}

	getTimePretty(): string {
		return this.intervals.getTotalDuration().toTimeStringLong();
	}

	getIF(): number {
		return MyMath.round10(this.intervals.getIntensity().getValue() * 100, -1);
	}

	getAveragePower(): number {
		return MyMath.round10(this.userProfile.bike_ftp * this.intervals.getIntensity().getValue(), -1);
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
		var minMi = this.userProfile.getRunningPaceMinMi(this.intervals.getIntensity());
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

	getStepsList(new_line: string): string {
		var result = "";

		this.intervals.getIntervals().forEach(function (interval: Interval) {
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
