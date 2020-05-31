"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectFactory = exports.UserProfile = void 0;
const core_1 = require("./core");
class UserProfile {
    constructor(bikeFTPWatts, runningTPace, swimmingFTP, swimCSS, email) {
        this.bikeFTP_ = bikeFTPWatts;
        var speed_mph = core_1.SpeedParser.getSpeedInMph(runningTPace);
        this.runningTPaceMinMi_ = core_1.IntensityUnitHelper.convertTo(speed_mph, core_1.IntensityUnit.Mph, core_1.IntensityUnit.MinMi);
        this.swimFTP_ = swimmingFTP;
        var swim_css_mph = core_1.SpeedParser.getSpeedInMph(swimCSS);
        this.swimmingCSSMinPer100Yards_ = core_1.IntensityUnitHelper.convertTo(swim_css_mph, core_1.IntensityUnit.Mph, core_1.IntensityUnit.Per100Yards);
        this.email_ = email;
    }
    set efficiency_factor(value) {
        this.efficiencyFactor_ = value;
    }
    get efficiency_factor() {
        return this.efficiencyFactor_;
    }
    get bike_ftp() {
        return this.bikeFTP_;
    }
    get running_tpace_min_mi() {
        return this.runningTPaceMinMi_;
    }
    get swim_ftp() {
        return this.swimFTP_;
    }
    get email() {
        return this.email_;
    }
    getRunningTPaceMph() {
        return core_1.IntensityUnitHelper.convertTo(this.running_tpace_min_mi, core_1.IntensityUnit.MinMi, core_1.IntensityUnit.Mph);
    }
    getRunningPaceMph(intensity) {
        var estPaceMinMi = this.getRunningPaceMinMi(intensity);
        return 60 / estPaceMinMi;
    }
    getRunningPace(intensity, outputUnit) {
        let pace_mph = this.getRunningPaceMph(intensity);
        return core_1.IntensityUnitHelper.convertTo(pace_mph, core_1.IntensityUnit.Mph, outputUnit);
    }
    getRunningPaceMinMi(intensity) {
        var pace_mph = core_1.IntensityUnitHelper.convertTo(this.running_tpace_min_mi, core_1.IntensityUnit.MinMi, core_1.IntensityUnit.Mph) * intensity.getValue();
        return core_1.IntensityUnitHelper.convertTo(pace_mph, core_1.IntensityUnit.Mph, core_1.IntensityUnit.MinMi);
    }
    getSwimCSSMph() {
        var css_mph = core_1.IntensityUnitHelper.convertTo(this.swimmingCSSMinPer100Yards_, core_1.IntensityUnit.Per100Yards, core_1.IntensityUnit.Mph);
        return css_mph;
    }
    getSwimPaceMph(intensity) {
        var css_mph = core_1.IntensityUnitHelper.convertTo(this.swimmingCSSMinPer100Yards_, core_1.IntensityUnit.Per100Yards, core_1.IntensityUnit.Mph);
        return css_mph * intensity.getValue();
    }
    getSwimPace(intensity_unit_result, intensity) {
        var pace_mph = this.getSwimCSSMph() * intensity.getValue();
        return core_1.IntensityUnitHelper.convertTo(pace_mph, core_1.IntensityUnit.Mph, intensity_unit_result);
    }
}
exports.UserProfile = UserProfile;
class ObjectFactory {
    constructor(userProfile, sportType) {
        this.userProfile_ = userProfile;
        this.sportType_ = sportType;
    }
    get sport_type() {
        return this.sportType_;
    }
    get user_profile() {
        return this.userProfile_;
    }
    createIntensity(value, unit) {
        var ifValue = 0;
        if (unit == core_1.IntensityUnit.FreeRide) {
            return new core_1.Intensity(value, 0, core_1.IntensityUnit.FreeRide);
        }
        if (this.sportType_ == core_1.SportType.Bike) {
            if (unit == core_1.IntensityUnit.Watts) {
                ifValue = value / this.userProfile_.bike_ftp;
            }
            else if (unit == core_1.IntensityUnit.IF) {
                ifValue = value;
            }
            else {
                console.assert(false, core_1.stringFormat("Invalid unit {0}", unit));
                throw new Error("Invalid unit : " + unit);
            }
        }
        else if (this.sportType_ == core_1.SportType.Run) {
            var running_tpace_mph = core_1.IntensityUnitHelper.convertTo(this.userProfile_.running_tpace_min_mi, core_1.IntensityUnit.MinMi, core_1.IntensityUnit.Mph);
            if (unit == core_1.IntensityUnit.IF) {
                ifValue = value;
            }
            else if (unit == core_1.IntensityUnit.MinMi) {
                var running_mph = core_1.IntensityUnitHelper.convertTo(value, core_1.IntensityUnit.MinMi, core_1.IntensityUnit.Mph);
                ifValue = running_mph / running_tpace_mph;
            }
            else if (unit == core_1.IntensityUnit.Mph) {
                ifValue = value / running_tpace_mph;
            }
            else if (unit == core_1.IntensityUnit.MinKm) {
                var running_mph = core_1.IntensityUnitHelper.convertTo(value, core_1.IntensityUnit.MinKm, core_1.IntensityUnit.Mph);
                ifValue = running_mph / running_tpace_mph;
            }
            else if (unit == core_1.IntensityUnit.Per400Meters) {
                var running_mph = core_1.IntensityUnitHelper.convertTo(value, core_1.IntensityUnit.Per400Meters, core_1.IntensityUnit.Mph);
                ifValue = running_mph / running_tpace_mph;
            }
            else {
                console.assert(false, core_1.stringFormat("Unit {0} is not implemented"));
                throw new Error("Not implemented");
            }
        }
        else if (this.sportType_ == core_1.SportType.Swim) {
            if (unit == core_1.IntensityUnit.Watts) {
                ifValue = value / this.userProfile_.swim_ftp;
            }
            else if (unit == core_1.IntensityUnit.IF) {
                ifValue = value;
            }
            else if (unit == core_1.IntensityUnit.Per100Yards || unit == core_1.IntensityUnit.Per100Meters || unit == core_1.IntensityUnit.Per25Yards) {
                var swimming_mph = core_1.IntensityUnitHelper.convertTo(value, unit, core_1.IntensityUnit.Mph);
                var swimming_mph_css = this.userProfile_.getSwimCSSMph();
                ifValue = swimming_mph / swimming_mph_css;
            }
            else if (unit == core_1.IntensityUnit.Mph) {
                ifValue = value / this.userProfile_.getSwimCSSMph();
            }
            else if (unit == core_1.IntensityUnit.OffsetSeconds) {
                var speed_per_100_yards = this.userProfile_.getSwimPace(core_1.IntensityUnit.Per100Yards, new core_1.Intensity(1));
                speed_per_100_yards += value / 60;
                var speed_mph = core_1.IntensityUnitHelper.convertTo(speed_per_100_yards, core_1.IntensityUnit.Per100Yards, core_1.IntensityUnit.Mph);
                ifValue = speed_mph / this.userProfile_.getSwimCSSMph();
            }
            else {
                console.assert(false, core_1.stringFormat("Invalid intensity unit {0}", unit));
            }
        }
        else {
            console.assert(this.sportType_ == core_1.SportType.Other);
            console.assert(unit == core_1.IntensityUnit.IF);
            ifValue = value;
        }
        return new core_1.Intensity(ifValue, value, unit);
    }
    createDuration(intensity, unit, value) {
        core_1.PreconditionsCheck.assertTrue(typeof (intensity) != 'undefined');
        core_1.PreconditionsCheck.assertIsNumber(value, "value");
        var estimatedDistanceInMiles = 0;
        var estimatedTimeInSeconds = 0;
        var estimatedSpeedMph;
        if (this.sportType_ == core_1.SportType.Bike) {
            estimatedSpeedMph = ObjectFactory.getBikeSpeedMphForIntensity(intensity);
        }
        else if (this.sportType_ == core_1.SportType.Run) {
            estimatedSpeedMph = this.userProfile_.getRunningPaceMph(intensity);
        }
        else if (this.sportType_ == core_1.SportType.Swim) {
            estimatedSpeedMph = this.userProfile_.getSwimPaceMph(intensity);
        }
        else {
            console.assert(this.sportType_ == core_1.SportType.Other);
            estimatedSpeedMph = 0;
        }
        if (core_1.DurationUnitHelper.isTime(unit)) {
            estimatedTimeInSeconds = core_1.DurationUnitHelper.getDurationSeconds(unit, value);
            estimatedDistanceInMiles = estimatedSpeedMph * (estimatedTimeInSeconds / 3600);
        }
        else {
            estimatedDistanceInMiles = core_1.DurationUnitHelper.getDistanceMiles(unit, value);
            estimatedTimeInSeconds = 3600 * (estimatedDistanceInMiles / estimatedSpeedMph);
        }
        return new core_1.Duration(unit, value, estimatedTimeInSeconds, estimatedDistanceInMiles);
    }
    static getBikeSpeedMphForIntensity(intensity) {
        var actualSpeedMph = 0;
        if (intensity.getValue() < 0.65) {
            actualSpeedMph = 15;
        }
        else {
            actualSpeedMph = 20;
        }
        return actualSpeedMph;
    }
}
exports.ObjectFactory = ObjectFactory;
