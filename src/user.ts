import { SpeedParser, Intensity, IntensityUnit, IntensityUnitHelper, SportType, stringFormat, PreconditionsCheck, DurationUnit, Duration, DurationUnitHelper } from "./core";

export class UserProfile {
	private bikeFTP_: number;
	private runningTPaceMinMi_: number;
	private swimmingCSSMinPer100Yards_: number;
	private swimFTP_: number;
	private email_: string;
	private efficiencyFactor_: number;

	constructor(bikeFTPWatts: number,
				runningTPace: string,
				swimmingFTP: number,
				swimCSS: string,
				email: string) {
		this.bikeFTP_ = bikeFTPWatts;
		var speed_mph = SpeedParser.getSpeedInMph(runningTPace);
		this.runningTPaceMinMi_ = IntensityUnitHelper.convertTo(
			speed_mph,
			IntensityUnit.Mph,
			IntensityUnit.MinMi);
		this.swimFTP_ = swimmingFTP;
		var swim_css_mph = SpeedParser.getSpeedInMph(swimCSS);
		this.swimmingCSSMinPer100Yards_ = IntensityUnitHelper.convertTo(
			swim_css_mph,
			IntensityUnit.Mph,
			IntensityUnit.Per100Yards
		);
		this.email_ = email;
	}

	set efficiency_factor(value: number) {
		this.efficiencyFactor_ = value;
	}

	get efficiency_factor() : number {
		return this.efficiencyFactor_;
	}

	get bike_ftp() : number {
		return this.bikeFTP_;
	}

	get running_tpace_min_mi() : number {
		return this.runningTPaceMinMi_;
	}

	get swim_ftp(): number {
		return this.swimFTP_;
	}

	get email(): string {
		return this.email_;
	}

	getRunningTPaceMph() {
		return IntensityUnitHelper.convertTo(
			this.running_tpace_min_mi,
			IntensityUnit.MinMi,
			IntensityUnit.Mph);
	}

	getRunningPaceMph(intensity: Intensity) {
		var estPaceMinMi = this.getRunningPaceMinMi(intensity);
		return 60 / estPaceMinMi;
	}

	getRunningPace(intensity: Intensity, outputUnit: IntensityUnit) {
		let pace_mph = this.getRunningPaceMph(intensity);
		return IntensityUnitHelper.convertTo(pace_mph, IntensityUnit.Mph, outputUnit);
	}

	getRunningPaceMinMi(intensity: Intensity) {
		var pace_mph = IntensityUnitHelper.convertTo(
			this.running_tpace_min_mi,
			IntensityUnit.MinMi,
			IntensityUnit.Mph) * intensity.getValue();
		return IntensityUnitHelper.convertTo(pace_mph,
			IntensityUnit.Mph,
			IntensityUnit.MinMi);
	}

	getSwimCSSMph(): number {
		var css_mph = IntensityUnitHelper.convertTo(this.swimmingCSSMinPer100Yards_, IntensityUnit.Per100Yards, IntensityUnit.Mph);
		return css_mph;
	}

	getSwimPaceMph(intensity: Intensity): number {
		var css_mph = IntensityUnitHelper.convertTo(this.swimmingCSSMinPer100Yards_, IntensityUnit.Per100Yards, IntensityUnit.Mph);
		return css_mph * intensity.getValue();
	}

	getSwimPace(intensity_unit_result: IntensityUnit, intensity: Intensity): number {
		var pace_mph = this.getSwimCSSMph() * intensity.getValue();
		return IntensityUnitHelper.convertTo(pace_mph, IntensityUnit.Mph, intensity_unit_result);
	}
}

export class ObjectFactory {
	private userProfile_: UserProfile;
	private sportType_: SportType;

	constructor(userProfile: UserProfile, sportType: SportType) {
		this.userProfile_ = userProfile;
		this.sportType_ = sportType;
	}

	get sport_type(): SportType {
		return this.sportType_;
	}

	get user_profile(): UserProfile {
		return this.userProfile_;
	}

	createIntensity(value: number, unit: IntensityUnit) {
		var ifValue = 0;

		// HACK here for now
		if (unit == IntensityUnit.FreeRide) {
			return new Intensity(value, 0, IntensityUnit.FreeRide);
		}

		if (this.sportType_ == SportType.Bike) {
			if (unit == IntensityUnit.Watts) {
				ifValue = value / this.userProfile_.bike_ftp;
			} else if (unit == IntensityUnit.IF) {
				ifValue = value;
			} else {
				console.assert(false, stringFormat("Invalid unit {0}", unit));
				throw new Error("Invalid unit : " + unit);
			}
		} else if (this.sportType_ == SportType.Run) {
			var running_tpace_mph = IntensityUnitHelper.convertTo(
				this.userProfile_.running_tpace_min_mi,
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
		} else if (this.sportType_ == SportType.Swim) {
			// For swimming we support 4 IntensityUnits
			if (unit == IntensityUnit.Watts) {
				ifValue = value / this.userProfile_.swim_ftp;
			} else if (unit == IntensityUnit.IF) {
				ifValue = value;
			} else if (unit == IntensityUnit.Per100Yards || unit == IntensityUnit.Per100Meters || unit == IntensityUnit.Per25Yards) {
				var swimming_mph = IntensityUnitHelper.convertTo(value, unit, IntensityUnit.Mph);
				var swimming_mph_css = this.userProfile_.getSwimCSSMph();
				ifValue = swimming_mph / swimming_mph_css;
			} else if (unit == IntensityUnit.Mph) {
				ifValue = value / this.userProfile_.getSwimCSSMph();
			} else if (unit == IntensityUnit.OffsetSeconds) {
				// TODO: not handling if user specified speed in profile / meters
				var speed_per_100_yards = this.userProfile_.getSwimPace(IntensityUnit.Per100Yards, new Intensity(1));
				speed_per_100_yards += value / 60;
				var speed_mph = IntensityUnitHelper.convertTo(speed_per_100_yards, IntensityUnit.Per100Yards, IntensityUnit.Mph);
				ifValue = speed_mph / this.userProfile_.getSwimCSSMph();
			} else {
				console.assert(false, stringFormat("Invalid intensity unit {0}", unit));
			}
		} else {
			console.assert(this.sportType_ == SportType.Other);
			console.assert(unit == IntensityUnit.IF);
			ifValue = value;
		}

		return new Intensity(ifValue, value, unit);
	}

	createDuration(intensity: Intensity, unit: DurationUnit, value: number): Duration {
		PreconditionsCheck.assertTrue(typeof(intensity) != 'undefined');
		PreconditionsCheck.assertIsNumber(value, "value");

		var estimatedDistanceInMiles = 0;
		var estimatedTimeInSeconds = 0;

		var estimatedSpeedMph;
		if (this.sportType_ == SportType.Bike) {
			estimatedSpeedMph = ObjectFactory.getBikeSpeedMphForIntensity(intensity);
		} else if (this.sportType_ == SportType.Run) {
			estimatedSpeedMph = this.userProfile_.getRunningPaceMph(intensity);
		} else if (this.sportType_ == SportType.Swim) {
			estimatedSpeedMph = this.userProfile_.getSwimPaceMph(intensity);
		} else {
			console.assert(this.sportType_ == SportType.Other);
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

	private static getBikeSpeedMphForIntensity(intensity: Intensity): number {
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
}