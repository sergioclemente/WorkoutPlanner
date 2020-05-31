"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutBuilder = void 0;
const core_1 = require("./core");
const user_1 = require("./user");
const visitor_1 = require("./visitor");
const parser_1 = require("./parser");
class WorkoutBuilder {
    constructor(userProfile, sportType, outputUnit) {
        core_1.PreconditionsCheck.assertIsNumber(sportType, "sportType");
        core_1.PreconditionsCheck.assertIsNumber(outputUnit, "outputUnit");
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
        let object_factory = new user_1.ObjectFactory(this.userProfile, this.sportType);
        return parser_1.IntervalParser.normalize(object_factory, this.workoutDefinition);
    }
    withDefinition(workoutTitle, workoutDefinition) {
        let object_factory = new user_1.ObjectFactory(this.userProfile, this.sportType);
        this.intervals = parser_1.IntervalParser.parse(object_factory, workoutDefinition);
        this.workoutTitle = workoutTitle;
        this.workoutDefinition = workoutDefinition;
        return this;
    }
    getIntensityFriendly(intensity, roundValues) {
        var f = new visitor_1.WorkoutTextVisitor(this.userProfile, this.sportType, this.outputUnit, roundValues);
        return f.getIntensityPretty(intensity);
    }
    getTSS2() {
        return visitor_1.TSSCalculator.compute(this.intervals);
    }
    getTimePretty() {
        return this.intervals.getTotalDuration().toTimeStringLong();
    }
    getIF() {
        return core_1.MyMath.round10(this.intervals.getIntensity().getValue() * 100, -1);
    }
    getAveragePower() {
        return core_1.MyMath.round10(this.userProfile.bike_ftp * this.intervals.getIntensity().getValue(), -1);
    }
    getIntervalPretty(interval, roundValues) {
        return visitor_1.WorkoutTextVisitor.getIntervalTitle(interval, this.userProfile, this.sportType, this.outputUnit, roundValues);
    }
    getEstimatedDistancePretty() {
        if (this.sportType == core_1.SportType.Swim) {
            return this.intervals.getWorkDuration().toStringDistance(core_1.DistanceUnit.Yards);
        }
        else {
            return this.intervals.getWorkDuration().toStringDistance(core_1.DistanceUnit.Miles);
        }
    }
    getAveragePace() {
        var minMi = this.userProfile.getRunningPaceMinMi(this.intervals.getIntensity());
        let outputUnit = this.outputUnit;
        if (outputUnit == core_1.IntensityUnit.HeartRate) {
            outputUnit = core_1.IntensityUnit.MinMi;
        }
        var outputValue = core_1.IntensityUnitHelper.convertTo(minMi, core_1.IntensityUnit.MinMi, outputUnit);
        if (outputUnit == core_1.IntensityUnit.Kmh || outputUnit == core_1.IntensityUnit.Mph) {
            return core_1.MyMath.round10(outputValue, -1) + core_1.IntensityUnitHelper.toString(outputUnit);
        }
        else {
            return core_1.FormatterHelper.formatNumber(outputValue, 60, ":", core_1.IntensityUnitHelper.toString(outputUnit));
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
        return result;
    }
    getMRCFile() {
        let wfg = new visitor_1.WorkoutFileGenerator(this.workoutTitle, this.intervals);
        return wfg.getMRCFile();
    }
    getZWOFile() {
        let wfg = new visitor_1.WorkoutFileGenerator(this.workoutTitle, this.intervals);
        return wfg.getZWOFile();
    }
    getPPSMRXFile() {
        let wfg = new visitor_1.WorkoutFileGenerator(this.workoutTitle, this.intervals);
        return wfg.getPPSMRXFile();
    }
    getZWOFileName() {
        let wfg = new visitor_1.WorkoutFileGenerator(this.workoutTitle, this.intervals);
        return wfg.getZWOFileName();
    }
    getMRCFileName() {
        let wfg = new visitor_1.WorkoutFileGenerator(this.workoutTitle, this.intervals);
        return wfg.getMRCFileName();
    }
    getPPSMRXFileName() {
        let wfg = new visitor_1.WorkoutFileGenerator(this.workoutTitle, this.intervals);
        return wfg.getPPSMRXFileName();
    }
}
exports.WorkoutBuilder = WorkoutBuilder;
;
