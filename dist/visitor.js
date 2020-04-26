"use strict";
const core_1 = require("./core");
var Model;
(function (Model) {
    class VisitorHelper {
        static visitAndFinalize(visitor, interval) {
            this.visit(visitor, interval);
            visitor.finalize();
        }
        static visit(visitor, interval) {
            if (interval instanceof core_1.SimpleInterval) {
                return visitor.visitSimpleInterval(interval);
            }
            else if (interval instanceof core_1.StepBuildInterval) {
                return visitor.visitStepBuildInterval(interval);
            }
            else if (interval instanceof core_1.RampBuildInterval) {
                return visitor.visitRampBuildInterval(interval);
            }
            else if (interval instanceof core_1.RepeatInterval) {
                return visitor.visitRepeatInterval(interval);
            }
            else if (interval instanceof core_1.ArrayInterval) {
                return visitor.visitArrayInterval(interval);
            }
            else if (interval instanceof core_1.CommentInterval) {
                return visitor.visitCommentInterval(interval);
            }
            else {
                console.assert(false, "invalid type!");
                return null;
            }
        }
    }
    Model.VisitorHelper = VisitorHelper;
    class TreePrinterVisitor {
        constructor() {
            this.output = "";
            this.indentation = 0;
        }
        visitCommentInterval(interval) {
            this.indent();
            this.output += core_1.stringFormat("Comment({0})\n", interval.getTitle());
        }
        visitSimpleInterval(interval) {
            this.indent();
            if (interval.getRestDuration().getValue() > 0) {
                this.output += core_1.stringFormat("SimpleInterval({0}, {1}, {2}, {3})\n", interval.getWorkDuration().toString(), TreePrinterVisitor.getIntensityPretty(interval.getIntensity()), interval.getTitle(), interval.getRestDuration().toString());
            }
            else {
                this.output += core_1.stringFormat("SimpleInterval({0}, {1}, {2})\n", interval.getWorkDuration().toString(), TreePrinterVisitor.getIntensityPretty(interval.getIntensity()), interval.getTitle());
            }
        }
        visitStepBuildInterval(interval) {
            this.indent();
            this.output += "StepBuildInterval(\n";
            this.indentation++;
            for (var i = 0; i < interval.getIntervals().length; i++) {
                VisitorHelper.visit(this, interval.getIntervals()[i]);
            }
            this.indentation--;
            this.indent();
            this.output += ")\n";
        }
        visitRampBuildInterval(interval) {
            this.indent();
            this.output += core_1.stringFormat("RampBuildInterval({0}, {1}, {2}, {3}, {4})\n", interval.getWorkDuration().toString(), TreePrinterVisitor.getIntensityPretty(interval.getStartIntensity()), TreePrinterVisitor.getIntensityPretty(interval.getEndIntensity()), interval.getTitle(), interval.getRestDuration().toString());
        }
        visitRepeatInterval(interval) {
            this.indent();
            this.output += core_1.stringFormat("RepeatInterval(count={0}, {1}\n", interval.getRepeatCount(), interval.getTitle());
            this.indentation++;
            for (var i = 0; i < interval.getIntervals().length; i++) {
                VisitorHelper.visit(this, interval.getIntervals()[i]);
            }
            this.indentation--;
            this.indent();
            this.output += ")\n";
        }
        visitArrayInterval(interval) {
            this.indent();
            this.indentation++;
            this.output += "ArrayInterval(\n";
            for (var i = 0; i < interval.getIntervals().length; i++) {
                VisitorHelper.visit(this, interval.getIntervals()[i]);
            }
            this.indentation--;
            this.indent();
            this.output += ")\n";
        }
        finalize() {
        }
        indent() {
            for (let i = 0; i < this.indentation; i++) {
                this.output += "\t";
            }
        }
        getOutput() {
            return this.output;
        }
        static getIntensityPretty(intensity) {
            if (intensity.isEasy()) {
                return "";
            }
            else {
                return intensity.toString();
            }
        }
        static Print(interval) {
            let tree_printer = new TreePrinterVisitor();
            VisitorHelper.visitAndFinalize(tree_printer, interval);
            return tree_printer.getOutput();
        }
    }
    Model.TreePrinterVisitor = TreePrinterVisitor;
    class BaseVisitor {
        visitCommentInterval() {
        }
        visitStepBuildInterval(interval) {
            for (var i = 0; i < interval.getRepeatCount(); i++) {
                VisitorHelper.visit(this, interval.getStepInterval(i));
                VisitorHelper.visit(this, interval.getRestInterval());
            }
        }
        visitRepeatInterval(interval) {
            for (var i = 0; i < interval.getRepeatCount(); i++) {
                this.visitArrayInterval(interval);
            }
        }
        visitArrayInterval(interval) {
            for (var i = 0; i < interval.getIntervals().length; i++) {
                VisitorHelper.visit(this, interval.getIntervals()[i]);
            }
        }
        finalize() {
        }
    }
    Model.BaseVisitor = BaseVisitor;
    class MovingAverage {
        constructor(window_size) {
            this.values = [];
            this.window_size = 0;
            this.end = 0;
            core_1.PreconditionsCheck.assertTrue(window_size > 0);
            this.window_size = window_size;
        }
        insert(v) {
            if (this.values.length < this.window_size) {
                this.values.push(v);
            }
            else {
                this.values[this.end] = v;
                this.end = (this.end + 1) % this.values.length;
            }
        }
        get_moving_average() {
            if (this.values.length == 0) {
                return null;
            }
            let sum = 0;
            for (let i = 0; i < this.values.length; i++) {
                sum += this.values[i];
            }
            return sum / this.values.length;
        }
        is_full() {
            return this.values.length == this.window_size;
        }
    }
    Model.MovingAverage = MovingAverage;
    Model.FTP = 256;
    class NPVisitor extends BaseVisitor {
        constructor() {
            super(...arguments);
            this.sum = 0;
            this.count = 0;
            this.ma = new MovingAverage(30);
            this.np = 0;
        }
        visitSimpleInterval(interval) {
            var duration = interval.getWorkDuration().getSeconds();
            var watts_pow_4 = Math.pow(interval.getIntensity().getValue() * Model.FTP, 4);
            for (let t = 0; t < duration; t++) {
                this._insert_and_flush(watts_pow_4);
            }
        }
        visitRampBuildInterval(interval) {
            var start_watts = interval.getStartIntensity().getValue() * Model.FTP;
            var end_watts = interval.getEndIntensity().getValue() * Model.FTP;
            var duration = interval.getWorkDuration().getSeconds();
            for (var t = 0; t < duration; t++) {
                var current_watts = start_watts + (end_watts - start_watts) * (t / duration);
                var current_watts_pow_4 = 1 * Math.pow(current_watts, 4);
                this._insert_and_flush(current_watts_pow_4);
            }
        }
        _insert_and_flush(value) {
            this.ma.insert(value);
            if (this.ma.is_full()) {
                this.sum += this.ma.get_moving_average();
                this.count += 1;
            }
        }
        finalize() {
            if (!this.ma.is_full()) {
                this.sum += this.ma.get_moving_average();
                this.count += 1;
            }
            this.np = core_1.MyMath.round10(Math.sqrt(Math.sqrt(this.sum / this.count)), -1);
        }
        getIF() {
            return core_1.MyMath.round10(this.np / Model.FTP, -1);
        }
    }
    Model.NPVisitor = NPVisitor;
    class DominantUnitVisitor extends BaseVisitor {
        constructor() {
            super(...arguments);
            this.intensity_unit = null;
            this.duration_unit = null;
        }
        visitSimpleInterval(interval) {
            this.updateIntensity(interval.getIntensity());
            this.updateDuration(interval.getWorkDuration());
        }
        visitRampBuildInterval(interval) {
            this.updateIntensity(interval.getStartIntensity());
            this.updateIntensity(interval.getEndIntensity());
            this.updateDuration(interval.getWorkDuration());
        }
        updateIntensity(intensity) {
            if (this.intensity_unit == null) {
                this.intensity_unit = intensity.getOriginalUnit();
            }
            else {
                if (this.intensity_unit != intensity.getOriginalUnit()) {
                    this.intensity_unit = core_1.IntensityUnit.Unknown;
                }
            }
        }
        updateDuration(duration) {
            if (this.duration_unit == null) {
                this.duration_unit = duration.getUnit();
            }
            else {
                if (this.duration_unit != duration.getUnit()) {
                    this.duration_unit = core_1.DistanceUnit.Unknown;
                }
            }
        }
        static computeIntensity(interval) {
            let dominant = new DominantUnitVisitor();
            VisitorHelper.visit(dominant, interval);
            return dominant.intensity_unit == null ? core_1.IntensityUnit.Unknown : dominant.intensity_unit;
        }
        static computeDuration(interval) {
            let dominant = new DominantUnitVisitor();
            VisitorHelper.visit(dominant, interval);
            return dominant.duration_unit == null ? core_1.DistanceUnit.Unknown : dominant.duration_unit;
        }
    }
    Model.DominantUnitVisitor = DominantUnitVisitor;
    class ZonesMap {
        static getZoneMap(sportType) {
            if (sportType == core_1.SportType.Bike || sportType == core_1.SportType.Other) {
                return {
                    1: { name: "z1", low: 0.00, high: 0.55 },
                    2: { name: "z2", low: 0.55, high: 0.75 },
                    3: { name: "z3", low: 0.75, high: 0.90 },
                    4: { name: "z4", low: 0.90, high: 1.05 },
                    5: { name: "z5", low: 1.05, high: 1.2 },
                    6: { name: "z6", low: 1.20, high: 10 },
                };
            }
            else if (sportType == core_1.SportType.Run) {
                return {
                    1: { name: "z1", low: 0.00, high: 0.76 },
                    2: { name: "z2", low: 0.76, high: 0.87 },
                    3: { name: "z3", low: 0.87, high: 0.94 },
                    4: { name: "z4", low: 0.94, high: 1.01 },
                    5: { name: "z5", low: 1.01, high: 1.10 },
                    6: { name: "z6", low: 1.10, high: 10 },
                };
            }
            else if (sportType == core_1.SportType.Swim) {
                return {
                    1: { name: "z1", low: 0.00, high: 0.84 },
                    2: { name: "z2", low: 0.84, high: 0.89 },
                    3: { name: "z3", low: 0.89, high: 0.95 },
                    4: { name: "z4", low: 0.95, high: 1.01 },
                    5: { name: "z5", low: 1.01, high: 1.05 },
                    6: { name: "z6", low: 1.05, high: 10 },
                };
            }
            else {
                return {};
            }
        }
    }
    Model.ZonesMap = ZonesMap;
    class ZonesVisitor extends BaseVisitor {
        constructor(sportType) {
            super();
            this.zones = {};
            this.zones = {};
            this.sportType = sportType;
            var zone_map = ZonesMap.getZoneMap(this.sportType);
            for (var zone = 1; zone <= 6; zone++) {
                var zone_obj = zone_map[zone];
                this.zones[zone] = {
                    name: zone_obj.name,
                    range: "[" + Math.floor(zone_obj.low * 100) + "%;" + Math.floor(zone_obj.high * 100) + "%)",
                    value: 0,
                };
            }
        }
        static getZone(sportType, intensity) {
            var zone_map = ZonesMap.getZoneMap(sportType);
            for (var zone = 1; zone <= 5; zone++) {
                var zone_obj = zone_map[zone];
                if (intensity >= zone_obj.low && intensity < zone_obj.high) {
                    return zone;
                }
            }
            return 6;
        }
        incrementZoneTime(intensity, numberOfSeconds) {
            var zone = ZonesVisitor.getZone(this.sportType, intensity);
            this.zones[zone].value += numberOfSeconds;
        }
        visitSimpleInterval(interval) {
            this.incrementZoneTime(interval.getIntensity().getValue(), interval.getWorkDuration().getSeconds());
        }
        visitRampBuildInterval(interval) {
            var startIntensity = interval.getStartIntensity().getValue();
            var endIntensity = interval.getEndIntensity().getValue();
            var duration = interval.getWorkDuration().getSeconds();
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
                        duration: new core_1.Duration(core_1.TimeUnit.Seconds, zone.value, 0, 0)
                    });
                }
            }
            return result;
        }
    }
    Model.ZonesVisitor = ZonesVisitor;
    class Point {
        constructor(x, y, label, tag) {
            this.x = x;
            this.y = y;
            this.label = label;
            this.tag = tag;
        }
    }
    Model.Point = Point;
    class DataPointVisitor extends BaseVisitor {
        constructor() {
            super(...arguments);
            this.x = null;
            this.data = [];
        }
        initX(duration) {
            if (this.x == null) {
                this.x = new core_1.Duration(duration.getUnit(), 0, 0, 0);
            }
        }
        incrementX(duration) {
            this.x = core_1.Duration.combine(this.x, duration);
        }
        getIntervalTag(interval) {
            if (interval.getIntensity().getOriginalUnit() == core_1.IntensityUnit.FreeRide) {
                return "free-ride";
            }
            else {
                return "if";
            }
        }
        visitSimpleInterval(interval) {
            var title = WorkoutTextVisitor.getIntervalTitle(interval);
            this.initX(interval.getWorkDuration());
            this.data.push(new Point(this.x, interval.getIntensity(), title, this.getIntervalTag(interval)));
            this.incrementX(interval.getWorkDuration());
            this.data.push(new Point(this.x, interval.getIntensity(), title, this.getIntervalTag(interval)));
            this.visitRestPart(interval, title);
        }
        visitRampBuildInterval(interval) {
            var title = WorkoutTextVisitor.getIntervalTitle(interval);
            this.initX(interval.getWorkDuration());
            this.data.push(new Point(this.x, interval.getStartIntensity(), title, this.getIntervalTag(interval)));
            this.incrementX(interval.getWorkDuration());
            this.data.push(new Point(this.x, interval.getEndIntensity(), title, this.getIntervalTag(interval)));
            this.visitRestPart(interval, title);
        }
        visitRestPart(interval, title) {
            if (interval.getRestDuration().getValue() > 0) {
                this.initX(interval.getRestDuration());
                this.data.push(new Point(this.x, core_1.Intensity.ZeroIntensity, title, "rest"));
                this.incrementX(interval.getRestDuration());
                this.data.push(new Point(this.x, core_1.Intensity.ZeroIntensity, title, "rest"));
            }
        }
    }
    Model.DataPointVisitor = DataPointVisitor;
    class ZwiftDataVisitor extends BaseVisitor {
        constructor(name) {
            super();
            this.content = "";
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
        getIntervalTitle(interval) {
            var title = interval.getTitle();
            if (title.length == 0) {
                title = WorkoutTextVisitor.getIntervalTitle(interval);
            }
            return title;
        }
        escapeString(input) {
            return input.replace(/"/g, "");
        }
        visitSimpleInterval(interval) {
            var duration = interval.getWorkDuration().getSeconds();
            var title = this.escapeString(this.getIntervalTitle(interval));
            if (interval.getIntensity().getOriginalUnit() == core_1.IntensityUnit.FreeRide) {
                this.content += `\t\t<FreeRide Duration="${duration}">\n`;
                this.content += `\t\t\t<textevent timeoffset="0" message="${title}"/>\n`;
                this.content += `\t\t</FreeRide>\n`;
            }
            else {
                var intensity = interval.getIntensity().getValue();
                this.content += `\t\t<SteadyState Duration="${duration}" Power="${intensity}">\n`;
                this.content += `\t\t\t<textevent timeoffset="0" message="${title}"/>\n`;
                this.content += `\t\t</SteadyState>\n`;
            }
        }
        visitRampBuildInterval(interval) {
            var duration = interval.getWorkDuration().getSeconds();
            var intensityStart = interval.getStartIntensity().getValue();
            var intensityEnd = interval.getEndIntensity().getValue();
            if (intensityStart < intensityEnd) {
                this.content += `\t\t<Warmup Duration="${duration}" PowerLow="${intensityStart}" PowerHigh="${intensityEnd}"/>\n`;
            }
            else {
                this.content += `\t\t<Cooldown Duration="${duration}" PowerLow="${intensityStart}" PowerHigh="${intensityEnd}"/>\n`;
            }
        }
        visitRepeatInterval(interval) {
            if (interval.getIntervals().length == 2 ||
                interval.getIntervals()[0].getIntensity().getValue() > interval.getIntervals()[1].getIntensity().getValue()) {
                let repeat_count = interval.getIntervals().length;
                let on_duration = interval.getIntervals()[0].getWorkDuration().getSeconds();
                let off_duration = interval.getIntervals()[1].getWorkDuration().getSeconds();
                let on_power = interval.getIntervals()[0].getIntensity().getValue();
                let off_power = interval.getIntervals()[1].getIntensity().getValue();
                this.content += `\t\t<IntervalsT Repeat="${repeat_count}" OnDuration="${on_duration}" OffDuration="${off_duration}" OnPower="${on_power}" OffPower="${off_power}" />\n`;
            }
            else {
                super.visitRepeatInterval(interval);
            }
        }
        getContent() {
            return this.content;
        }
    }
    Model.ZwiftDataVisitor = ZwiftDataVisitor;
    class MRCCourseDataVisitor extends BaseVisitor {
        constructor(fileName) {
            super();
            this.courseData = "";
            this.time = 0;
            this.idx = 0;
            this.fileName = "";
            this.perfPRODescription = "";
            this.content = "";
            this.repeatIntervals = [];
            this.repeatIteration = [];
            this.fileName = fileName;
        }
        processCourseData(intensity, durationInSeconds) {
            this.time += durationInSeconds;
            this.courseData += (this.time / 60) + "\t" + Math.round(intensity.getValue() * 100) + "\n";
        }
        processTitle(interval) {
            var title = interval.getTitle();
            if (title.length == 0) {
                title = WorkoutTextVisitor.getIntervalTitle(interval);
            }
            var suffix = "";
            if (this.repeatIntervals.length > 0) {
                console.assert(this.repeatIteration.length > 0);
                var iteration = 1 + this.repeatIteration[this.repeatIteration.length - 1];
                var total = this.repeatIntervals[this.repeatIntervals.length - 1].getRepeatCount();
                suffix = " | " + iteration + " of " + total;
            }
            this.perfPRODescription += "Desc" + this.idx++ + "=" + title + suffix + "\n";
        }
        visitSimpleInterval(interval) {
            this.processCourseData(interval.getIntensity(), 0);
            this.processCourseData(interval.getIntensity(), interval.getWorkDuration().getSeconds());
            this.processTitle(interval);
        }
        visitRampBuildInterval(interval) {
            this.processCourseData(interval.getStartIntensity(), 0);
            this.processCourseData(interval.getEndIntensity(), interval.getWorkDuration().getSeconds());
            this.processTitle(interval);
        }
        visitRepeatInterval(interval) {
            this.repeatIntervals.push(interval);
            for (var i = 0; i < interval.getRepeatCount(); i++) {
                this.repeatIteration.push(i);
                this.visitArrayInterval(interval);
                this.repeatIteration.pop();
            }
            this.repeatIntervals.pop();
        }
        finalize() {
            this.content = "";
            this.content += "[COURSE HEADER]\n";
            this.content += "VERSION=2\n";
            this.content += "UNITS=ENGLISH\n";
            this.content += core_1.stringFormat("FILE NAME={0}\n", this.fileName);
            this.content += "MINUTES\tPERCENT\n";
            this.content += "[END COURSE HEADER]\n";
            this.content += "[COURSE DATA]\n";
            this.content += this.courseData;
            this.content += "[END COURSE DATA]\n";
            this.content += "[PERFPRO DESCRIPTIONS]\n";
            this.content += this.perfPRODescription;
            this.content += "[END PERFPRO DESCRIPTIONS]\n";
        }
        getContent() {
            return this.content;
        }
    }
    Model.MRCCourseDataVisitor = MRCCourseDataVisitor;
    class PPSMRXCourseDataVisitor extends BaseVisitor {
        constructor(title) {
            super();
            this.title = "";
            this.content = "";
            this.groupId = 1;
            this.currentRepeatIteration = [];
            this.repeatCountMax = [];
            this.title = title;
        }
        getTitlePretty(interval) {
            var title = interval.getTitle();
            if (title.length == 0) {
                title = WorkoutTextVisitor.getIntervalTitle(interval);
            }
            if (this.isGroupActive()) {
                title += " (" + (this.currentRepeatIteration[this.currentRepeatIteration.length - 1] + 1) + "/" + this.repeatCountMax[this.repeatCountMax.length - 1] + ")";
            }
            return title;
        }
        getGroupId() {
            if (this.isGroupActive()) {
                return this.groupId;
            }
            else {
                return 0;
            }
        }
        getMode(interval) {
            if (interval.getIntensity().getOriginalUnit() == core_1.IntensityUnit.FreeRide) {
                return "T";
            }
            else {
                return "M";
            }
        }
        getIntensity(interval) {
            if (interval.getIntensity().getOriginalUnit() == core_1.IntensityUnit.FreeRide) {
                return 0;
            }
            else {
                return Math.round(interval.getIntensity().getValue() * 100);
            }
        }
        visitSimpleInterval(interval) {
            this.content += core_1.stringFormat(`\t\t["{0}",{1},{2},{2},"{3}",1,{4},0,90],\n`, this.getTitlePretty(interval), interval.getWorkDuration().getSeconds(), this.getIntensity(interval), this.getMode(interval), this.getGroupId());
        }
        visitRampBuildInterval(interval) {
            this.content += core_1.stringFormat(`\t\t["{0}",{1},{2},{3},"M",1,{3},0,90],\n`, this.getTitlePretty(interval), interval.getWorkDuration().getSeconds(), Math.round(interval.getStartIntensity().getValue() * 100), Math.round(interval.getEndIntensity().getValue() * 100), this.getGroupId());
        }
        visitRepeatInterval(interval) {
            this.repeatCountMax.push(interval.getRepeatCount());
            for (var i = 0; i < interval.getRepeatCount(); i++) {
                this.currentRepeatIteration.push(i);
                this.visitArrayInterval(interval);
                this.currentRepeatIteration.pop();
            }
            this.repeatCountMax.pop();
            this.groupId++;
        }
        isGroupActive() {
            return this.repeatCountMax.length > 0;
        }
        finalize() {
            if (this.content.length > 0) {
                this.content = this.content.substr(0, this.content.length - 2);
                this.content += "\n";
            }
            this.content = core_1.stringFormat(`{
	"type":"json",
	"createdby":"PerfPRO Studio v5.80.25",
	"version":5.00,
	"name":"{0}",
	"workoutType":"",
	"comments":"",
	"isLocked":0,
	"videoFile":"",
	"showCountDown":0,
	"showStep":0,
	"movieMode":0,
	"startMinute":0,
	"set_fields":["description","seconds","start","finish","mode","intervals","group","autolap","targetcad"],
	"sets":[
`, this.title) + this.content +
                `	]
}`;
        }
        getContent() {
            return this.content;
        }
    }
    Model.PPSMRXCourseDataVisitor = PPSMRXCourseDataVisitor;
    class WorkoutTextVisitor {
        constructor(userProfile, sportType, outputUnit, roundValues) {
            this.result = "";
            this.userProfile = null;
            this.sportType = core_1.SportType.Unknown;
            this.outputUnit = core_1.IntensityUnit.Unknown;
            this.disableEasyTitle = false;
            this.roundValues = false;
            core_1.PreconditionsCheck.assertIsNumber(sportType, "sportType");
            core_1.PreconditionsCheck.assertIsNumber(outputUnit, "outputUnit");
            this.userProfile = userProfile;
            this.sportType = sportType;
            this.outputUnit = outputUnit;
            this.roundValues = roundValues;
        }
        static getIntervalTitle(interval, userProfile = null, sportType = core_1.SportType.Unknown, outputUnit = core_1.IntensityUnit.Unknown, roundValues = true) {
            var f = new WorkoutTextVisitor(userProfile, sportType, outputUnit, roundValues);
            VisitorHelper.visitAndFinalize(f, interval);
            return f.result;
        }
        visitCommentInterval(interval) {
            this.result += this.getIntervalTitle(interval);
        }
        visitRestInterval(interval) {
            if (interval.getIntensity().isEasy()) {
                let title = this.getIntervalTitle(interval);
                if (title == null || title.trim().length == 0) {
                    title = "easy";
                }
                this.result += interval.getWorkDuration().toStringShort(this.sportType == core_1.SportType.Swim) + " " + title;
            }
            else {
                this.result += interval.getWorkDuration().toStringShort(this.sportType == core_1.SportType.Swim) + " @ " + this.getIntensityPretty(interval.getIntensity());
            }
        }
        visitArrayInterval(interval) {
            this.visitArrayIntervalInternal(interval, false);
        }
        visitArrayIntervalInternal(interval, always_add_parenthesis) {
            var length = interval.getIntervals().length;
            var firstInterval = interval.getIntervals()[0];
            var lastInterval = interval.getIntervals()[length - 1];
            var isRestIncluded = lastInterval.getIntensity().getValue() <
                firstInterval.getIntensity().getValue() &&
                !(lastInterval instanceof core_1.CommentInterval);
            if (length == 2) {
                if (isRestIncluded) {
                    var oldFlag = this.disableEasyTitle;
                    this.disableEasyTitle = true;
                    VisitorHelper.visit(this, firstInterval);
                    this.disableEasyTitle = oldFlag;
                    this.result += " - ";
                    this.visitRestInterval(lastInterval);
                }
                else {
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
            }
            else {
                if (isRestIncluded) {
                    this.result += "(";
                    for (var i = 0; i < length - 1; i++) {
                        var subInterval = interval.getIntervals()[i];
                        VisitorHelper.visit(this, subInterval);
                        this.result += ", ";
                    }
                    this.result = this.result.slice(0, this.result.length - 2);
                    this.result += ") - w/ ";
                    this.visitRestInterval(lastInterval);
                }
                else {
                    if (length >= 2) {
                        this.result += "(";
                    }
                    for (var i = 0; i < length; i++) {
                        var subInterval = interval.getIntervals()[i];
                        VisitorHelper.visit(this, subInterval);
                        this.result += ", ";
                    }
                    this.result = this.result.slice(0, this.result.length - 2);
                    if (length >= 2) {
                        this.result += ")";
                    }
                }
            }
        }
        visitRepeatInterval(interval) {
            this.result += interval.getRepeatCount() + " x ";
            this.visitArrayIntervalInternal(interval, true);
        }
        visitRampBuildInterval(interval) {
            if (interval.getStartIntensity().isEasy()) {
                this.result += interval.getWorkDuration().toStringShort(this.sportType == core_1.SportType.Swim) + " warm up to " + this.getIntensityPretty(interval.getEndIntensity());
            }
            else {
                if (interval.getStartIntensity().getValue() < interval.getEndIntensity().getValue()) {
                    this.result += interval.getWorkDuration().toStringShort(this.sportType == core_1.SportType.Swim) + " build from " + this.getIntensityPretty(interval.getStartIntensity()) + " to " + this.getIntensityPretty(interval.getEndIntensity());
                }
                else {
                    this.result += interval.getWorkDuration().toStringShort(this.sportType == core_1.SportType.Swim) + " warm down from " + this.getIntensityPretty(interval.getStartIntensity()) + " to " + this.getIntensityPretty(interval.getEndIntensity());
                }
            }
        }
        visitStepBuildInterval(interval) {
            this.result += interval.getRepeatCount() + " x ";
            if (interval.areAllIntensitiesSame()) {
                this.result += this.getIntensityPretty(interval.getStepInterval(0).getIntensity());
                this.result += " - w/ ";
                this.visitRestInterval(interval.getRestInterval());
                this.result += " (";
                for (var i = 0; i < interval.getRepeatCount(); i++) {
                    this.result += interval.getStepInterval(i).getWorkDuration().toStringShort(this.sportType == core_1.SportType.Swim);
                    this.result += ", ";
                }
                this.result = this.result.slice(0, this.result.length - 2);
                this.result += ")";
            }
            else {
                this.result += interval.getStepInterval(0).getWorkDuration().toStringShort(this.sportType == core_1.SportType.Swim);
                this.result += " - w/ ";
                this.visitRestInterval(interval.getRestInterval());
                this.result += " (";
                for (var i = 0; i < interval.getRepeatCount(); i++) {
                    this.result += this.getIntensityPretty(interval.getStepInterval(i).getIntensity());
                    this.result += ", ";
                }
                this.result = this.result.slice(0, this.result.length - 2);
                this.result += ")";
            }
        }
        visitSimpleInterval(interval) {
            this.result += interval.getWorkDuration().toStringShort(this.sportType == core_1.SportType.Swim);
            let title = this.getIntervalTitle(interval);
            if (title != null && title.length > 0) {
                this.result += " " + title;
            }
            if (interval.getIntensity().getOriginalUnit() == core_1.IntensityUnit.FreeRide) {
                return;
            }
            if (interval.getIntensity().getValue() == 0) {
                this.result += " rest";
            }
            else if (interval.getIntensity().isEasy() && !this.disableEasyTitle) {
                let title = interval.getTitle();
                if (title == null || title.trim().length == 0) {
                    this.result += " easy";
                }
                if (interval.getRestDuration().getSeconds() > 0) {
                    this.result += " w/ " + interval.getRestDuration().toStringShort(this.sportType == core_1.SportType.Swim) + " rest";
                    return;
                }
            }
            else {
                if (this.sportType == core_1.SportType.Swim && this.outputUnit != core_1.IntensityUnit.Watts) {
                    var total_duration = interval.getTotalDuration();
                    if (total_duration.getSeconds() != interval.getWorkDuration().getSeconds()) {
                        this.result += " on " + interval.getWorkDuration().toTimeStringShort() + " off " + total_duration.toTimeStringShort();
                    }
                    else {
                        this.result += " on " + interval.getWorkDuration().toTimeStringShort();
                    }
                    if (!((interval.getWorkDuration().getUnit() == core_1.DistanceUnit.Yards ||
                        interval.getWorkDuration().getUnit() == core_1.DistanceUnit.Meters) &&
                        interval.getWorkDuration().getValue() == 100) &&
                        this.outputUnit != core_1.IntensityUnit.IF) {
                        this.result += " (" + this.getIntensityPretty(interval.getIntensity()) + ")";
                    }
                }
                else {
                    this.result += " @ " + this.getIntensityPretty(interval.getIntensity());
                    if (interval.getRestDuration().getSeconds() > 0) {
                        this.result += " w/ " + interval.getRestDuration().toStringShort(false) + " rest";
                        return;
                    }
                }
            }
        }
        getIntensityPretty(intensity) {
            if (this.outputUnit == core_1.IntensityUnit.HeartRate) {
                var bpm = 0;
                if (this.sportType == core_1.SportType.Bike) {
                    bpm = this.userProfile.getBikeFTP() / this.userProfile.getEfficiencyFactor();
                }
                else if (this.sportType == core_1.SportType.Run) {
                    bpm = (1760 * this.userProfile.getRunnintTPaceMph()) / (60 * this.userProfile.getEfficiencyFactor());
                }
                return Math.round(intensity.getValue() * bpm) + "bpm";
            }
            if (this.outputUnit == core_1.IntensityUnit.FreeRide) {
                return "Free Ride";
            }
            if (this.outputUnit == core_1.IntensityUnit.Unknown ||
                this.sportType == core_1.SportType.Unknown ||
                this.outputUnit == core_1.IntensityUnit.IF) {
                return intensity.toString();
            }
            if (this.outputUnit == core_1.IntensityUnit.Watts) {
                let ftp = 0;
                if (this.sportType == core_1.SportType.Bike) {
                    ftp = this.userProfile.getBikeFTP();
                }
                else if (this.sportType == core_1.SportType.Swim) {
                    ftp = this.userProfile.getSwimFTP();
                }
                else {
                    console.assert(false, core_1.stringFormat("Invalid sportType {0}", this.sportType));
                }
                let value = Math.round(ftp * intensity.getValue());
                if (this.roundValues) {
                    return core_1.FormatterHelper.roundNumberUp(value, 5) + "w";
                }
                else {
                    return value + "w";
                }
            }
            if (this.sportType == core_1.SportType.Bike) {
                return intensity.toString();
            }
            else if (this.sportType == core_1.SportType.Run) {
                var minMi = this.userProfile.getPaceMinMi(intensity);
                var outputValue = core_1.IntensityUnitHelper.convertTo(minMi, core_1.IntensityUnit.MinMi, this.outputUnit);
                if (this.outputUnit == core_1.IntensityUnit.Kmh || this.outputUnit == core_1.IntensityUnit.Mph) {
                    return core_1.MyMath.round10(outputValue, -1) + core_1.IntensityUnitHelper.toString(this.outputUnit);
                }
                else {
                    if (this.outputUnit == core_1.IntensityUnit.MinMi || this.outputUnit == core_1.IntensityUnit.MinKm) {
                        let roundIncrement = 5;
                        if (!this.roundValues) {
                            roundIncrement = 0;
                        }
                        return core_1.FormatterHelper.formatNumber(outputValue, 60, ":", core_1.IntensityUnitHelper.toString(this.outputUnit), roundIncrement);
                    }
                    else {
                        let pace_per_400m = this.userProfile.getRunningPace(intensity, this.outputUnit);
                        return core_1.FormatterHelper.formatNumber(pace_per_400m, 60, ":", "") + core_1.IntensityUnitHelper.toString(this.outputUnit);
                    }
                }
            }
            else if (this.sportType == core_1.SportType.Swim) {
                if (this.outputUnit == core_1.IntensityUnit.Mph) {
                    return core_1.MyMath.round10(this.userProfile.getSwimPaceMph(intensity), -1) + core_1.IntensityUnitHelper.toString(this.outputUnit);
                }
                else if (this.outputUnit == core_1.IntensityUnit.Per100Yards || this.outputUnit == core_1.IntensityUnit.Per100Meters || this.outputUnit == core_1.IntensityUnit.Per25Yards) {
                    var swim_pace_per_100 = this.userProfile.getSwimPace(this.outputUnit, intensity);
                    return core_1.FormatterHelper.formatNumber(swim_pace_per_100, 60, ":", "") + core_1.IntensityUnitHelper.toString(this.outputUnit);
                }
                else if (this.outputUnit == core_1.IntensityUnit.OffsetSeconds) {
                    console.assert(intensity.getOriginalUnit() == core_1.IntensityUnit.OffsetSeconds);
                    if (intensity.getOriginalValue() > 0) {
                        return "+" + intensity.getOriginalValue();
                    }
                    else {
                        return "" + intensity.getOriginalValue();
                    }
                }
                else {
                    console.assert(false, core_1.stringFormat("Invalid output unit {0}", this.outputUnit));
                    return "";
                }
            }
            else {
                console.assert(this.sportType == core_1.SportType.Other);
                return "";
            }
        }
        getIntervalTitle(interval) {
            let title = interval.getTitle();
            if (title == null || title.length == 0) {
                return null;
            }
            return title;
        }
        finalize() {
        }
    }
    Model.WorkoutTextVisitor = WorkoutTextVisitor;
    class UnparserVisitor {
        constructor() {
            this.output = "";
            this.level = 0;
        }
        getDurationPretty(d) {
            if (core_1.DurationUnitHelper.isDistance(d.getUnit())) {
                return d.toString();
            }
            return d.toTimeStringLong();
        }
        getIntensityPretty(i) {
            if (i.getOriginalUnit() == core_1.IntensityUnit.OffsetSeconds) {
                return "+" + i.getOriginalValue() + "s";
            }
            else if (i.getOriginalUnit() == core_1.IntensityUnit.FreeRide) {
                return "*";
            }
            else {
                return core_1.MyMath.round10(i.getValue() * 100, -1).toString();
            }
        }
        getTitlePretty(i) {
            if (i.getTitle().length != 0) {
                return ", " + i.getTitle();
            }
            else {
                return "";
            }
        }
        visitCommentInterval(interval) {
            this.output += core_1.stringFormat("\"{0}\"", interval.getTitle());
            this.addSeparator();
        }
        visitSimpleInterval(interval) {
            let params = [];
            let duration_pretty = this.getDurationPretty(interval.getWorkDuration());
            console.assert(duration_pretty.length > 0, "" + interval.getWorkDuration());
            params.push(duration_pretty);
            if (!interval.getIntensity().isEasy()) {
                let intensity_pretty = this.getIntensityPretty(interval.getIntensity());
                params.push(intensity_pretty);
                console.assert(intensity_pretty.length > 0, "" + interval.getIntensity());
            }
            if (interval.getTitle().length != 0) {
                params.push(interval.getTitle());
            }
            if (interval.getRestDuration().getValue() != 0) {
                let duration_rest_pretty = this.getDurationPretty(interval.getRestDuration());
                console.assert(duration_rest_pretty.length > 0, "" + interval.getRestDuration());
                params.push(duration_rest_pretty);
            }
            this.output += core_1.stringFormat("({0})", params.join(", "));
            this.addSeparator();
        }
        visitStepBuildInterval(interval) {
            this.level++;
            this.output += interval.getRepeatCount().toString();
            this.output += "[";
            if (interval.areAllIntensitiesSame()) {
                this.output += "(";
                this.output += this.getIntensityPretty(interval.getStepInterval(0).getIntensity());
                for (let i = 0; i < interval.getRepeatCount(); i++) {
                    this.output += ", ";
                    this.output += this.getDurationPretty(interval.getStepInterval(i).getTotalDuration());
                }
                this.output += ")";
                this.addSeparator();
                VisitorHelper.visit(this, interval.getRestInterval());
            }
            else {
                console.assert(interval.areAllDurationsSame());
                let params = [];
                params.push(this.getDurationPretty(interval.getStepInterval(0).getTotalDuration()));
                for (let i = 0; i < interval.getRepeatCount(); i++) {
                    params.push(this.getIntensityPretty(interval.getStepInterval(i).getIntensity()));
                }
                this.output += core_1.stringFormat("({0})", params.join(", "));
                this.addSeparator();
                VisitorHelper.visit(this, interval.getRestInterval());
            }
            this.trimSeparator();
            this.output += "]";
            this.level--;
            this.addSeparator();
        }
        visitRampBuildInterval(interval) {
            this.level++;
            let params = [];
            params.push(this.getDurationPretty(interval.getWorkDuration()));
            params.push(this.getIntensityPretty(interval.getStartIntensity()));
            params.push(this.getIntensityPretty(interval.getEndIntensity()));
            if (interval.getTitle().length != 0) {
                params.push(interval.getTitle());
            }
            this.output += core_1.stringFormat("({0})", params.join(", "));
            this.level--;
            this.addSeparator();
        }
        visitRepeatInterval(interval) {
            this.level++;
            this.output += interval.getRepeatCount().toString();
            this.output += "[";
            for (let i = 0; i < interval.getIntervals().length; i++) {
                VisitorHelper.visit(this, interval.getIntervals()[i]);
            }
            this.trimSeparator();
            this.output += "]";
            this.level--;
            this.addSeparator();
        }
        visitArrayInterval(interval) {
            this.level++;
            if (this.level > 1) {
                this.output += "[";
            }
            for (var i = 0; i < interval.getIntervals().length; i++) {
                VisitorHelper.visit(this, interval.getIntervals()[i]);
            }
            this.trimSeparator();
            if (this.level > 1) {
                this.output += "]";
            }
            this.level--;
            this.addSeparator();
        }
        finalize() {
            this.trimNewLine();
            this.trimSeparator();
            this.trimNewLine();
            if (this.output[0] == "[" && this.output[this.output.length - 1] == "]") {
                this.output = this.output.slice(1, this.output.length - 1);
            }
        }
        addSeparator() {
            if (this.level == 1) {
                this.output += "\n";
                return;
            }
            this.output += ", ";
        }
        trimSeparator() {
            while (this.output.endsWith(", ")) {
                this.output = this.output.slice(0, this.output.length - 2);
            }
            while (this.output.endsWith(",")) {
                this.output = this.output.slice(0, this.output.length - 1);
            }
        }
        trimNewLine() {
            while (this.output.endsWith("\n")) {
                this.output = this.output.slice(0, this.output.length - 1);
            }
        }
    }
    Model.UnparserVisitor = UnparserVisitor;
    class AbsoluteTimeInterval {
        constructor(begin, end, interval, title) {
            this.begin_ = begin;
            this.end_ = end;
            this.interval_ = interval;
            this.title_ = title;
        }
        getBeginSeconds() {
            return this.begin_;
        }
        getEndSeconds() {
            return this.end_;
        }
        getDurationSeconds() {
            return this.end_ - this.begin_;
        }
        getInterval() {
            return this.interval_;
        }
        getTitle() {
            return this.title_;
        }
    }
    Model.AbsoluteTimeInterval = AbsoluteTimeInterval;
    class AbsoluteTimeIntervalVisitor extends BaseVisitor {
        constructor(of) {
            super();
            this.time_ = 0;
            this.data_ = [];
            this.repeat_stack_ = [];
            this.iteration_stack_ = [];
            this.of_ = of;
        }
        getTitle(interval) {
            let title = interval.getTitle();
            if (this.of_.getSportType() == core_1.SportType.Swim) {
                title += " " + (interval.getIntensity().getValue() * this.of_.getUserProfile().getSwimFTP()) + "w";
            }
            else if (this.of_.getSportType() == core_1.SportType.Bike) {
                title += " " + (interval.getIntensity().getValue() * this.of_.getUserProfile().getBikeFTP()) + "w";
            }
            else if (this.of_.getSportType() == core_1.SportType.Run) {
                title += " " + (interval.getIntensity().getValue() * this.of_.getUserProfile().getRunnintTPaceMph()) + "mph";
            }
            else {
                title += interval.getIntensity().toString();
            }
            if (this.repeat_stack_.length > 0) {
                console.assert(this.repeat_stack_.length == this.iteration_stack_.length);
                title += " " + this.iteration_stack_[this.iteration_stack_.length - 1] + "/" + this.repeat_stack_[this.repeat_stack_.length - 1];
            }
            return title;
        }
        visitSimpleInterval(interval) {
            var duration_seconds = interval.getWorkDuration().getSeconds();
            this.data_.push(new AbsoluteTimeInterval(this.time_, this.time_ + duration_seconds, interval, this.getTitle(interval)));
            this.time_ += duration_seconds;
            this.visitRestInterval(interval);
        }
        visitRampBuildInterval(interval) {
            var duration_seconds = interval.getWorkDuration().getSeconds();
            this.data_.push(new AbsoluteTimeInterval(this.time_, this.time_ + duration_seconds, interval, this.getTitle(interval)));
            this.time_ += duration_seconds;
            this.visitRestInterval(interval);
        }
        visitRestInterval(interval) {
            if (interval.getRestDuration().getSeconds() > 0) {
                let rest_seconds = interval.getRestDuration().getSeconds();
                this.data_.push(new AbsoluteTimeInterval(this.time_, this.time_ + rest_seconds, interval, "rest"));
                this.time_ += rest_seconds;
            }
        }
        getIntervalArray() {
            return this.data_;
        }
        visitRepeatInterval(interval) {
            this.repeat_stack_.push(interval.getRepeatCount());
            for (let i = 0; i < interval.getRepeatCount(); i++) {
                this.iteration_stack_.push(i + 1);
                for (let j = 0; j < interval.getIntervals().length; j++) {
                    VisitorHelper.visit(this, interval.getIntervals()[j]);
                }
                this.iteration_stack_.pop();
            }
            this.repeat_stack_.pop();
        }
    }
    Model.AbsoluteTimeIntervalVisitor = AbsoluteTimeIntervalVisitor;
})(Model || (Model = {}));
module.exports = Model;
