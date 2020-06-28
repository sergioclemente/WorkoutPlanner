"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutBuilder = void 0;
const Parser = require("./parser");
const Visitor = require("./visitor");
const Core = require("./core");
const User = require("./user");
class WorkoutBuilder {
    constructor(userProfile, sportType, outputUnit) {
        Core.PreconditionsCheck.assertIsNumber(sportType, "sportType");
        Core.PreconditionsCheck.assertIsNumber(outputUnit, "outputUnit");
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
        let object_factory = new User.ObjectFactory(this.userProfile, this.sportType);
        return Parser.IntervalParser.normalize(object_factory, this.workoutDefinition);
    }
    withDefinition(workoutTitle, workoutDefinition) {
        let object_factory = new User.ObjectFactory(this.userProfile, this.sportType);
        this.intervals = Parser.IntervalParser.parse(object_factory, workoutDefinition);
        this.workoutTitle = workoutTitle;
        this.workoutDefinition = workoutDefinition;
        return this;
    }
    getIntensityFriendly(intensity, roundValues) {
        var f = new Visitor.WorkoutTextVisitor(this.userProfile, this.sportType, this.outputUnit, roundValues);
        return f.getIntensityPretty(intensity);
    }
    getTSS() {
        return Visitor.TSSCalculator.compute(this.intervals);
    }
    getTimePretty() {
        return this.intervals.getTotalDuration().toTimeStringLong();
    }
    getIF() {
        return Core.MyMath.round10(this.intervals.getIntensity().getValue() * 100, -1);
    }
    getAveragePower() {
        return Core.MyMath.round10(this.userProfile.bike_ftp * this.intervals.getIntensity().getValue(), -1);
    }
    getIntervalPretty(interval, roundValues) {
        return Visitor.WorkoutTextVisitor.getIntervalTitle(interval, this.userProfile, this.sportType, this.outputUnit, roundValues);
    }
    getEstimatedDistancePretty() {
        if (this.sportType == Core.SportType.Swim) {
            return this.intervals.getWorkDuration().toStringDistance(Core.DistanceUnit.Yards);
        }
        else {
            return this.intervals.getWorkDuration().toStringDistance(Core.DistanceUnit.Miles);
        }
    }
    getAveragePace() {
        var minMi = this.userProfile.getRunningPaceMinMi(this.intervals.getIntensity());
        let outputUnit = this.outputUnit;
        if (outputUnit == Core.IntensityUnit.HeartRate) {
            outputUnit = Core.IntensityUnit.MinMi;
        }
        var outputValue = Core.IntensityUnitHelper.convertTo(minMi, Core.IntensityUnit.MinMi, outputUnit);
        if (outputUnit == Core.IntensityUnit.Kmh || outputUnit == Core.IntensityUnit.Mph) {
            return Core.MyMath.round10(outputValue, -1) + Core.IntensityUnitHelper.toString(outputUnit);
        }
        else {
            return Core.FormatterHelper.formatNumber(outputValue, 60, ":", Core.IntensityUnitHelper.toString(outputUnit));
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
        let wfg = new Visitor.WorkoutFileGenerator(this.workoutTitle, this.intervals);
        return wfg.getMRCFile();
    }
    getZWOFile() {
        let wfg = new Visitor.WorkoutFileGenerator(this.workoutTitle, this.intervals);
        return wfg.getZWOFile();
    }
    getPPSMRXFile() {
        let wfg = new Visitor.WorkoutFileGenerator(this.workoutTitle, this.intervals);
        return wfg.getPPSMRXFile();
    }
    getZWOFileName() {
        let wfg = new Visitor.WorkoutFileGenerator(this.workoutTitle, this.intervals);
        return wfg.getZWOFileName();
    }
    getMRCFileName() {
        let wfg = new Visitor.WorkoutFileGenerator(this.workoutTitle, this.intervals);
        return wfg.getMRCFileName();
    }
    getPPSMRXFileName() {
        let wfg = new Visitor.WorkoutFileGenerator(this.workoutTitle, this.intervals);
        return wfg.getPPSMRXFileName();
    }
}
exports.WorkoutBuilder = WorkoutBuilder;
;
