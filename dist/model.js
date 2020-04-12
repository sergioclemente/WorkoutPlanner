"use strict";
const core_1 = require("./core");
const visitor_1 = require("./visitor");
var Model;
(function (Model) {
    var zlib = require('zlib');
    class NumberParser {
        evaluate(input, i) {
            this.value = 0;
            for (; i < input.length; i++) {
                var ch = input[i];
                if (IntervalParser.isDigit(ch)) {
                    this.value = this.value * 10 + IntervalParser.getCharVal(ch) - IntervalParser.getCharVal("0");
                }
                else if (ch == ".") {
                    i++;
                    var base = 10;
                    for (; i < input.length; i++) {
                        var ch = input[i];
                        if (IntervalParser.isDigit(ch)) {
                            this.value = this.value + (IntervalParser.getCharVal(ch) - IntervalParser.getCharVal("0")) / base;
                            base = base * 10;
                        }
                        else {
                            break;
                        }
                    }
                    break;
                }
                else {
                    break;
                }
            }
            return i - 1;
        }
        getValue() {
            return this.value;
        }
    }
    Model.NumberParser = NumberParser;
    class TokenParser {
        constructor(delimiters) {
            this.delimiters = delimiters;
        }
        evaluate(input, i) {
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
            return i - 1;
        }
        getValue() {
            return this.value;
        }
    }
    Model.TokenParser = TokenParser;
    class NumberAndUnitParser {
        evaluate(input, i) {
            var num_parser = new NumberParser();
            i = num_parser.evaluate(input, i);
            this.value = num_parser.getValue();
            let original_i = i;
            if (i + 1 < input.length && input[i + 1] == ":") {
                i = i + 2;
                var res_temp = IntervalParser.parseDouble(input, i);
                i = res_temp.i;
                this.value = this.value + res_temp.value / 60;
                i++;
                while (i < input.length && input[i] == ' ') {
                    i++;
                }
                i--;
            }
            var unitMap = {
                "w": 1,
                "watts": 1,
                "%": 1,
                "min/mi": 1,
                "mi/hr": 1,
                "mph": 1,
                "km/hr": 1,
                "min/km": 1,
                "/25yards": 1,
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
                "km": 1,
                "meters": 1,
                "miles": 1,
                "yards": 1,
                "yrs": 1,
                "y": 1,
                "mi": 1,
                "": 1,
            };
            let nextToken = "";
            for (i++; i < input.length; i++) {
                if (input[i] == ',' || input[i] == ")") {
                    break;
                }
                else {
                    if (IntervalParser.isWhitespace(input[i])) {
                        nextToken = "<<invalid>>";
                        break;
                    }
                    nextToken += input[i];
                }
            }
            if (unitMap[nextToken] == undefined) {
                this.value = null;
                this.unit = "";
                i = original_i;
            }
            else {
                this.unit = nextToken;
            }
            return i - 1;
        }
        getValue() {
            return this.value;
        }
        getUnit() {
            return this.unit;
        }
    }
    Model.NumberAndUnitParser = NumberAndUnitParser;
    class IntervalParser {
        static getCharVal(ch) {
            if (ch.length == 1) {
                return ch.charCodeAt(0);
            }
            else {
                return 0;
            }
        }
        static isDigit(ch) {
            return ch.length == 1 &&
                IntervalParser.getCharVal(ch) >= IntervalParser.getCharVal("0") &&
                IntervalParser.getCharVal(ch) <= IntervalParser.getCharVal("9");
        }
        static isLetter(ch) {
            return ch.length == 1 &&
                IntervalParser.getCharVal(ch) >= IntervalParser.getCharVal("a") &&
                IntervalParser.getCharVal(ch) <= IntervalParser.getCharVal("z");
        }
        static parseDouble(input, i) {
            var p = new NumberParser();
            var pos = p.evaluate(input, i);
            return { i: pos, value: p.getValue() };
        }
        static isWhitespace(ch) {
            return ch.length == 1 && (ch == " " || ch == "\t" || ch == "\n");
        }
        static throwParserError(column, msg) {
            throw Error("Error while parsing input on column " + column + "-  Error: " + msg);
        }
        static parse(factory, input) {
            var result = new core_1.ArrayInterval("Workout", []);
            var stack = [];
            stack.push(result);
            for (var i = 0; i < input.length; i++) {
                var ch = input[i];
                if (ch == "(") {
                    i++;
                    var nums = {};
                    var units = {};
                    var title = "";
                    var numIndex = 0;
                    for (; i < input.length; i++) {
                        ch = input[i];
                        if (ch == ")") {
                            var interval;
                            var durationValues = [];
                            var durationUnits = [];
                            var intensities = [];
                            for (let ki = 0; ki < Object.keys(units).length; ki++) {
                                let k = Object.keys(units)[ki];
                                if (nums[k] >= 0 && units[k] == "") {
                                    units[k] = "%";
                                }
                            }
                            for (let ki = 0; ki < Object.keys(units).length; ki++) {
                                let k = Object.keys(units)[ki];
                                if (core_1.DurationUnitHelper.isDurationUnit(units[k])) {
                                    durationUnits.push(core_1.DurationUnitHelper.toDurationUnit(units[k]));
                                    durationValues.push(nums[k]);
                                }
                                else {
                                    var unit = core_1.IntensityUnitHelper.toIntensityUnit(units[k]);
                                    if (unit != core_1.IntensityUnit.Unknown) {
                                        if (unit == core_1.IntensityUnit.FreeRide) {
                                            intensities.push(factory.createIntensity(0.50, core_1.IntensityUnit.FreeRide));
                                        }
                                        else {
                                            intensities.push(factory.createIntensity(nums[k], unit));
                                        }
                                    }
                                }
                            }
                            if (stack[stack.length - 1] instanceof core_1.RepeatInterval) {
                                var repeatInterval = (stack[stack.length - 1]);
                                if (repeatInterval.getRepeatCount() > 1 &&
                                    (intensities.length == repeatInterval.getRepeatCount()
                                        || (core_1.DurationUnitHelper.areDurationUnitsSame(durationUnits) && durationValues.length == repeatInterval.getRepeatCount()))) {
                                    stack.pop();
                                    stack[stack.length - 1].getIntervals().pop();
                                    var step_intervals = [];
                                    for (let k = 0; k < repeatInterval.getRepeatCount(); k++) {
                                        var durationUnit = k < durationUnits.length ? durationUnits[k] : durationUnits[0];
                                        var durationValue = k < durationValues.length ? durationValues[k] : durationValues[0];
                                        var intensity = k < intensities.length ? intensities[k] : intensities[0];
                                        var step_duration = factory.createDuration(intensity, durationUnit, durationValue);
                                        step_intervals.push(new core_1.SimpleInterval(title.trim(), intensity, step_duration, core_1.Duration.ZeroDuration));
                                    }
                                    var bsi = new core_1.StepBuildInterval(title.trim(), step_intervals);
                                    stack[stack.length - 1].getIntervals().push(bsi);
                                    stack.push(bsi);
                                    break;
                                }
                            }
                            console.assert(durationValues.length >= 1);
                            console.assert(durationUnits.length >= 1);
                            let restDuration = core_1.Duration.ZeroDuration;
                            let zeroIntensity = core_1.Intensity.ZeroIntensity;
                            if (intensities.length == 2) {
                                let startIntensity = intensities[0];
                                let endIntensity = intensities[1];
                                let intensity = core_1.RampBuildInterval.computeAverageIntensity(startIntensity, endIntensity);
                                let duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
                                interval = new core_1.RampBuildInterval(title.trim(), startIntensity, endIntensity, duration);
                            }
                            else if (intensities.length == 1) {
                                let intensity = intensities[0];
                                let duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
                                if (durationUnits.length == 2 && durationValues.length == 2) {
                                    restDuration = factory.createDuration(zeroIntensity, durationUnits[1], durationValues[1]);
                                }
                                interval = new core_1.SimpleInterval(title.trim(), intensity, duration, restDuration);
                            }
                            else {
                                let intensity = core_1.Intensity.EasyIntensity;
                                let duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
                                if (durationUnits.length == 2 && durationValues.length == 2) {
                                    restDuration = factory.createDuration(zeroIntensity, durationUnits[1], durationValues[1]);
                                }
                                interval = new core_1.SimpleInterval(title.trim(), intensity, duration, restDuration);
                            }
                            stack[stack.length - 1].getIntervals().push(interval);
                            break;
                        }
                        else if (ch == ",") {
                            numIndex++;
                        }
                        else {
                            var string_parser = new TokenParser([',', ')']);
                            i = string_parser.evaluate(input, i);
                            var value = string_parser.getValue();
                            if (IntervalParser.isDigit(value[0])) {
                                var intensity_parser = new NumberAndUnitParser();
                                intensity_parser.evaluate(value, 0);
                                let unit = intensity_parser.getUnit().trim();
                                let intensity_value = intensity_parser.getValue();
                                if (intensity_value != null &&
                                    (unit.length == 0 || core_1.IntensityUnitHelper.isIntensityUnit(unit) || core_1.DurationUnitHelper.isDurationUnit(unit))) {
                                    nums[numIndex] = intensity_value;
                                    units[numIndex] = unit;
                                }
                                else {
                                    title = value;
                                    units[numIndex] = "";
                                }
                            }
                            else if (value[0] == "+" || value[0] == "-") {
                                var integer_parser = new NumberParser();
                                integer_parser.evaluate(value, 1);
                                nums[numIndex] = integer_parser.getValue();
                                if (value[0] == "-") {
                                    nums[numIndex] = -1 * nums[numIndex];
                                }
                                units[numIndex] = "offset";
                            }
                            else {
                                if (value == "*") {
                                    units[numIndex] = "free-ride";
                                }
                                else {
                                    title = value;
                                }
                            }
                        }
                    }
                }
                else if (ch == "[") {
                    var ai = new core_1.ArrayInterval("", []);
                    stack[stack.length - 1].getIntervals().push(ai);
                    stack.push(ai);
                }
                else if (ch == "]") {
                    stack.pop();
                }
                else if (IntervalParser.isDigit(ch)) {
                    var res = IntervalParser.parseDouble(input, i);
                    i = res.i;
                    var ri = new core_1.RepeatInterval("", null, null, res.value);
                    stack[stack.length - 1].getIntervals().push(ri);
                    stack.push(ri);
                    while (i < input.length && input[i] != "[") {
                        i++;
                    }
                }
                else if (ch == "\"") {
                    var scp = new TokenParser(["\""]);
                    i = scp.evaluate(input, i + 1) + 2;
                    stack[stack.length - 1].getIntervals().push(new core_1.CommentInterval(scp.getValue()));
                }
            }
            if (result.getIntervals().length == 0) {
                IntervalParser.throwParserError(0, "Invalid interval");
            }
            return result;
        }
        static normalize(factory, input) {
            let interval = IntervalParser.parse(factory, input);
            let visitor = new visitor_1.UnparserVisitor();
            visitor_1.VisitorHelper.visitAndFinalize(visitor, interval);
            return visitor.output;
        }
    }
    Model.IntervalParser = IntervalParser;
    class TSSCalculator {
        static compute(interval) {
            let np = new visitor_1.NPVisitor();
            visitor_1.VisitorHelper.visitAndFinalize(np, interval);
            let avg = interval.getIntensity().getValue() * visitor_1.FTP;
            let s = interval.getTotalDuration().getSeconds();
            return core_1.MyMath.round10((s * np.getIF() * visitor_1.FTP * avg) / (36 * visitor_1.FTP * visitor_1.FTP), -1);
        }
    }
    Model.TSSCalculator = TSSCalculator;
    class DateHelper {
        static getDayOfWeek() {
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
    Model.DateHelper = DateHelper;
    class FileNameHelper {
        constructor(intervals) {
            this.intervals = intervals;
        }
        getTimeInZones(sportType) {
            var zv = new visitor_1.ZonesVisitor(sportType);
            visitor_1.VisitorHelper.visitAndFinalize(zv, this.intervals);
            return zv.getTimeInZones();
        }
        getFileName() {
            var mainInterval = null;
            var duration = this.intervals.getTotalDuration().getSeconds();
            var intensity_string = DateHelper.getDayOfWeek() + " - IF" + Math.round(this.intervals.getIntensity().getValue() * 100) + " - ";
            this.intervals.getIntervals().forEach(function (interval) {
                if (interval.getTotalDuration().getSeconds() > duration / 2) {
                    mainInterval = interval;
                }
            });
            if (mainInterval != null) {
                var filename = intensity_string + visitor_1.WorkoutTextVisitor.getIntervalTitle(mainInterval);
                if (filename.length < 50) {
                    return filename;
                }
            }
            var timeInZones = this.getTimeInZones(core_1.SportType.Bike);
            var zoneMaxTime = 0;
            var zoneMaxName = -1;
            for (var id in timeInZones) {
                var zone = timeInZones[id];
                var zoneDuration = zone.duration.getSeconds();
                if (zoneDuration > zoneMaxTime) {
                    zoneMaxTime = zoneDuration;
                    zoneMaxName = zone.name;
                }
            }
            if (zoneMaxTime != 0) {
                var duration_hr = Math.round(core_1.TimeUnitHelper.convertTo(duration, core_1.TimeUnit.Seconds, core_1.TimeUnit.Hours));
                return intensity_string + duration_hr + "hour-" + zoneMaxName;
            }
            else {
                return intensity_string;
            }
        }
    }
    class WorkoutFileGenerator {
        constructor(workoutTitle, intervals) {
            this.workoutTitle = workoutTitle;
            this.intervals = intervals;
        }
        getMRCFile() {
            var dataVisitor = new visitor_1.MRCCourseDataVisitor(this.getMRCFileName());
            visitor_1.VisitorHelper.visitAndFinalize(dataVisitor, this.intervals);
            return dataVisitor.getContent();
        }
        getZWOFile() {
            var zwift = new visitor_1.ZwiftDataVisitor(this.getBaseFileName());
            visitor_1.VisitorHelper.visitAndFinalize(zwift, this.intervals);
            return zwift.getContent();
        }
        getPPSMRXFile() {
            var zwift = new visitor_1.PPSMRXCourseDataVisitor(this.getBaseFileName());
            visitor_1.VisitorHelper.visitAndFinalize(zwift, this.intervals);
            return zwift.getContent();
        }
        getZWOFileName() {
            return this.getBaseFileName() + ".zwo";
        }
        getMRCFileName() {
            return this.getBaseFileName() + ".mrc";
        }
        getPPSMRXFileName() {
            return this.getBaseFileName() + ".ppsmrx";
        }
        getBaseFileName() {
            if (typeof (this.workoutTitle) != 'undefined' && this.workoutTitle.length != 0) {
                return this.workoutTitle;
            }
            var fileNameHelper = new FileNameHelper(this.intervals);
            return fileNameHelper.getFileName();
        }
    }
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
            let object_factory = new core_1.ObjectFactory(this.userProfile, this.sportType);
            return IntervalParser.normalize(object_factory, this.workoutDefinition);
        }
        withDefinition(workoutTitle, workoutDefinition) {
            let object_factory = new core_1.ObjectFactory(this.userProfile, this.sportType);
            this.intervals = IntervalParser.parse(object_factory, workoutDefinition);
            this.workoutTitle = workoutTitle;
            this.workoutDefinition = workoutDefinition;
            return this;
        }
        getIntensityFriendly(intensity, roundValues) {
            var f = new visitor_1.WorkoutTextVisitor(this.userProfile, this.sportType, this.outputUnit, roundValues);
            return f.getIntensityPretty(intensity);
        }
        getTSS() {
            var tssVisitor = new visitor_1.TSSVisitor();
            visitor_1.VisitorHelper.visitAndFinalize(tssVisitor, this.intervals);
            let tss = tssVisitor.getTSS();
            if (isNaN(tss) || !isFinite(tss)) {
                return 0;
            }
            return tss;
        }
        getTSS2() {
            return TSSCalculator.compute(this.intervals);
        }
        getTimePretty() {
            return this.intervals.getTotalDuration().toTimeStringLong();
        }
        getIF() {
            return core_1.MyMath.round10(this.intervals.getIntensity().getValue() * 100, -1);
        }
        getAveragePower() {
            return core_1.MyMath.round10(this.userProfile.getBikeFTP() * this.intervals.getIntensity().getValue(), -1);
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
            var minMi = this.userProfile.getPaceMinMi(this.intervals.getIntensity());
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
            result += "web+wp://";
            result += zlib.deflateSync(this.workoutDefinition).toString('base64');
            return result;
        }
        getMRCFile() {
            let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
            return wfg.getMRCFile();
        }
        getZWOFile() {
            let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
            return wfg.getZWOFile();
        }
        getPPSMRXFile() {
            let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
            return wfg.getPPSMRXFile();
        }
        getZWOFileName() {
            let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
            return wfg.getZWOFileName();
        }
        getMRCFileName() {
            let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
            return wfg.getMRCFileName();
        }
        getPPSMRXFileName() {
            let wfg = new WorkoutFileGenerator(this.workoutTitle, this.intervals);
            return wfg.getPPSMRXFileName();
        }
    }
    Model.WorkoutBuilder = WorkoutBuilder;
    ;
    class StopWatch {
        constructor() {
            this.startTimeMillis = null;
            this.stoppedDurationMillis = null;
        }
        start() {
            if (this.startTimeMillis === null) {
                this.startTimeMillis = Date.now();
            }
        }
        stop() {
            if (this.startTimeMillis !== null) {
                this.stoppedDurationMillis += Date.now() - this.startTimeMillis;
                this.startTimeMillis = null;
            }
        }
        reset() {
            this.startTimeMillis = null;
            this.stoppedDurationMillis = 0;
        }
        getIsStarted() {
            return this.startTimeMillis !== null;
        }
        getElapsedTimeMillis() {
            if (this.startTimeMillis !== null) {
                return (Date.now() - this.startTimeMillis) + this.stoppedDurationMillis;
            }
            else {
                return this.stoppedDurationMillis;
            }
        }
        moveStartTime(durationMillis) {
            if (this.startTimeMillis != null) {
                this.startTimeMillis = Date.now() - durationMillis;
            }
            else {
                this.stoppedDurationMillis = durationMillis;
            }
        }
    }
    Model.StopWatch = StopWatch;
    class PlayerHelper {
        constructor(of, interval) {
            this.data_ = [];
            this.durationTotalSeconds_ = 0;
            var pv = new visitor_1.AbsoluteTimeIntervalVisitor(of);
            visitor_1.VisitorHelper.visitAndFinalize(pv, interval);
            this.data_ = pv.getIntervalArray();
            this.durationTotalSeconds_ = interval.getTotalDuration().getSeconds();
        }
        get(ts) {
            for (let i = 0; i < this.data_.length; i++) {
                let bei = this.data_[i];
                if (ts >= bei.getBeginSeconds() && ts <= bei.getEndSeconds()) {
                    return bei;
                }
            }
            return null;
        }
        getNext(ts) {
            for (let i = 0; i < this.data_.length; i++) {
                let bei = this.data_[i];
                if (ts >= bei.getBeginSeconds() && ts <= bei.getEndSeconds()) {
                    if (i < this.data_.length - 1) {
                        return this.data_[i + 1];
                    }
                }
            }
            return null;
        }
        getDurationTotalSeconds() {
            return this.durationTotalSeconds_;
        }
    }
    Model.PlayerHelper = PlayerHelper;
    let ArgType;
    (function (ArgType) {
        ArgType[ArgType["Number"] = 0] = "Number";
        ArgType[ArgType["String"] = 1] = "String";
    })(ArgType || (ArgType = {}));
    ;
    class TextPreprocessor {
        constructor(sport_type) {
            this.sport_type = sport_type;
        }
        _randBool() {
            return this._rand(0, 2) == 1;
        }
        _rand(min, max) {
            return Math.floor(Math.random() * (max - min) + min);
        }
        _randElement(array) {
            if (array.length > 0) {
                return array[this._rand(0, array.length)] + "\n";
            }
            else {
                return "";
            }
        }
        _warmup() {
            let warmup_text = "";
            let warmup_groups = [];
            if (this.sport_type == core_1.SportType.Bike) {
                if (this._randBool()) {
                    warmup_text = `(5min, *, 90rpm - Smooth pedaling)
(2min, *, 95rpm - Smooth pedaling)
(2min, *, 100rpm - Smooth pedaling)
(2min, *, 105rpm - Smooth pedaling)
(1:30min, *, 110rpm - Smooth pedaling)
(30sec, *, 120-130rpm - Maintain form)
(2min, *, 90rpm - Relax and recover)
(6sec, *, Max rev out)
(1min, *, 90rpm - Smooth pedaling)
(6sec, *, Max rev out)
(1min, *, 90rpm - Smooth pedaling)
(6sec, *, Max rev out)
(2:42min, *, 90 rpm - Relax and recover)
`;
                }
                else {
                    warmup_groups = [
                        [
                            "(3min, 55), (3min, 65), (3min, 75)",
                            "(9min, 55, 70)",
                            "(4min, 55), (3min, 65), (2min, 75)",
                        ],
                        [
                            "2[(45s, 45, Single leg - left), (15s, 45, both), (45s, 45, Single leg - right), (15s, 45, both)]",
                            "8[(15s, 55, Spin ups), (15s, 55)]",
                            "[(30s, 55, cadence 80), (30s, 55), (30s, 55, Cadence 90), (30s, 55), (30s, 55, Cadence 100), (30s, 55), (30s, 55, Cadence 110), (30s, 55)]"
                        ],
                        [
                            "4[(15s, *, Sprints), (45s, 55)]",
                            "4[(10sec, *, Max sprints), (50sec, 55, easy riding)]",
                            "4[(5s, *, MAX), (55s, 55)]",
                            "4[(45s, 75, 100), (15s, 55)]",
                            "3[(30sec, *, FAST), (1min, 55, easy)]",
                            "4[(30s, 85, 90, 95, 100), (30s, 55)]",
                            "4[(15s, 100, FTP), (45s, 55)]",
                        ],
                        ["(3min, 55)"]
                    ];
                    for (let i = 0; i < warmup_groups.length; i++) {
                        warmup_text += this._randElement(warmup_groups[i]);
                    }
                }
            }
            else if (this.sport_type == core_1.SportType.Run) {
                warmup_groups = [
                    [
                        "3[(10s, 0, arm swings)]",
                        "3[(10s, 0, high knees)]",
                        "3[(10s, 0, ham kicks)]",
                        "3[(10s, 0, a-skips)]",
                        "3[(10s, 0, crossover side to sides)]",
                    ],
                    [
                        "3[(10s, 0, 10 lunges - 5 each side)]",
                        "3[(10s, 0, 10 reverse lunges - 5 each side)]",
                        "3[(10s, 0, 10 lunges with rotation - 5 each side)]",
                        "3[(10s, 0, sumo squat)]",
                    ]
                ];
                for (let i = 0; i < warmup_groups.length; i++) {
                    warmup_text += this._randElement(warmup_groups[i]);
                }
            }
            else if (this.sport_type == core_1.SportType.Swim) {
                warmup_groups = [
                    [
                        "(300y, +10, free)",
                        "(400y, +10, free)",
                        "(500y, +10, free)"
                    ],
                    [
                        "(200y, kick, +10)",
                        "(300yards, as 50 kick w/ board - 50 free)",
                        "3[(100y, Butterfly on the back)]",
                        "(200y, Butterfly Kick with fins on your back)",
                        "6[(50, Streamline kick on left/side)]"
                    ],
                    [
                        "8[(50yards, Drill on first 25, free, build on second 50)]",
                        "4[(50yards, Swim GOLF - Descend each one), \"10s rest\"]",
                        "3[(100y, single arm freestyle right side, free, single arm freestyle left side, free)]",
                        "4[(75y, unco left; swim; unco right)]",
                        "4[(50yards, scull and free by 25)]",
                        "(200y, +10, pull)"
                    ],
                    [
                        "4[(25yards, sprint)]",
                        ""
                    ],
                    [
                        "8[(50y, +0, build 1-4)]",
                        "6[(50yards, 100, build)]",
                        "4[(50yards, Swim descend 1-4), \"10s rest\"]",
                        "4[(100yards, add 25yards of hard swimming on every 100)]",
                        "4[(100y, descend 1-4)]"
                    ]
                ];
                for (let i = 0; i < warmup_groups.length; i++) {
                    warmup_text += this._randElement(warmup_groups[i]);
                }
            }
            console.assert(warmup_text.length > 0);
            return warmup_text.substring(0, warmup_text.length - 1);
        }
        _single_leg(number_repeats, single_leg_duration_secs) {
            console.assert(single_leg_duration_secs >= 0);
            console.assert(single_leg_duration_secs <= 90);
            return number_repeats + "[(" + single_leg_duration_secs + "s,45,Left Leg), (15s,45,Both), (" + single_leg_duration_secs + "s,45,Right Leg), (15s,45,Both)]";
        }
        _open_intervals(number_repeats, work_duration_sec) {
            console.assert(work_duration_sec >= 0);
            console.assert(work_duration_sec <= 60);
            let title = work_duration_sec <= 10 ? "Max efforts" : "Build";
            let rest_duration_sec = work_duration_sec <= 30 ? 60 - work_duration_sec : work_duration_sec;
            return number_repeats + "[(" + work_duration_sec + "s,*," + title + "), (" + rest_duration_sec + "s,55,Relaxed)]";
        }
        _change_dd(dd_door) {
            return core_1.stringFormat("(10s, Change to DD{0})", dd_door);
        }
        _alternate_arm_pull(duration) {
            return core_1.stringFormat("({0}, Alternate arm pull)", duration);
        }
        _double_arm_pull(duration) {
            return core_1.stringFormat("({0}, Double arm pull)", duration);
        }
        _back_pull(duration) {
            return core_1.stringFormat("({0}, Back pull)", duration);
        }
        processOne(input) {
            let funcs = [
                { regex: /#wu/, callback: this._warmup, params: [], description: "Warm up" },
                { regex: /#sl\((\d*),(\d*)\)/, callback: this._single_leg, params: [ArgType.Number, ArgType.Number], description: "Single Leg Drills." },
                { regex: /#o\((\d*),(\d*)\)/, callback: this._open_intervals, params: [ArgType.Number, ArgType.Number], description: "Open Power Intervals." },
                { regex: /#dd(\d+)/, callback: this._change_dd, params: [ArgType.Number], description: "Change DD configuration." },
                { regex: /#alt(\d+\w+)/, callback: this._alternate_arm_pull, params: [ArgType.String], description: "Alternate arm pull." },
                { regex: /#dbl(\d+\w+)/, callback: this._double_arm_pull, params: [ArgType.String], description: "Double arm pull." },
                { regex: /#back(\d+\w+)/, callback: this._back_pull, params: [ArgType.String], description: "Back pull." },
            ];
            for (let i = 0; i < funcs.length; i++) {
                let regex = funcs[i].regex;
                if (regex.test(input)) {
                    var instance_params = input.match(regex);
                    var func_params = [];
                    if (instance_params.length - 1 != funcs[i].params.length) {
                        console.assert("Function call " + input + " is not matching definition.");
                    }
                    for (let j = 1; j < instance_params.length; j++) {
                        let instance_param = instance_params[j];
                        if (funcs[i].params[j - 1] == ArgType.Number) {
                            func_params.push(parseInt(instance_param));
                        }
                        else {
                            func_params.push(instance_param);
                        }
                    }
                    return funcs[i].callback.apply(this, func_params);
                }
                else {
                }
            }
            return input;
        }
        process(input) {
            let main_regexes = [/(#\w+\(\d*(?:,\d*)*\)())/, /(#\w+)/];
            for (let i = 0; i < main_regexes.length; i++) {
                input = input.replace(new RegExp(main_regexes[i], "g"), this.processOne.bind(this));
            }
            return input;
        }
    }
    Model.TextPreprocessor = TextPreprocessor;
})(Model || (Model = {}));
module.exports = Model;
