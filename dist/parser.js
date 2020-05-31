"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntervalParser = exports.NumberAndUnitParser = exports.TokenParser = exports.NumberParser = void 0;
const core_1 = require("./core");
const visitor_1 = require("./visitor");
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
exports.NumberParser = NumberParser;
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
exports.TokenParser = TokenParser;
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
exports.NumberAndUnitParser = NumberAndUnitParser;
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
        let step_build_set = new Set();
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
                                intensities.length > 0 && durationValues.length > 0 &&
                                (intensities.length == repeatInterval.getRepeatCount() && durationValues.length == 1 ||
                                    core_1.DurationUnitHelper.areDurationUnitsSame(durationUnits) && durationValues.length == repeatInterval.getRepeatCount() && intensities.length == 1)) {
                                stack.pop();
                                stack[stack.length - 1].getIntervals().pop();
                                let step_intervals = [];
                                if (intensities.length == 1) {
                                    console.assert(durationValues.length == repeatInterval.getRepeatCount());
                                    console.assert(durationUnits.length == repeatInterval.getRepeatCount());
                                    for (let k = 0; k < repeatInterval.getRepeatCount(); k++) {
                                        var durationUnit = durationUnits[k];
                                        var durationValue = durationValues[k];
                                        var intensity = intensities[0];
                                        var step_duration = factory.createDuration(intensity, durationUnit, durationValue);
                                        step_intervals.push(new core_1.SimpleInterval(title.trim(), intensity, step_duration, core_1.Duration.ZeroDuration));
                                    }
                                }
                                else if (durationValues.length == 1) {
                                    console.assert(intensities.length == repeatInterval.getRepeatCount());
                                    for (let k = 0; k < repeatInterval.getRepeatCount(); k++) {
                                        var durationUnit = durationUnits[0];
                                        var durationValue = durationValues[0];
                                        var intensity = intensities[k];
                                        var step_duration = factory.createDuration(intensity, durationUnit, durationValue);
                                        step_intervals.push(new core_1.SimpleInterval(title.trim(), intensity, step_duration, core_1.Duration.ZeroDuration));
                                    }
                                }
                                else {
                                    console.assert(false);
                                }
                                var bsi = new core_1.ArrayInterval(title.trim(), step_intervals);
                                stack[stack.length - 1].getIntervals().push(bsi);
                                stack.push(bsi);
                                step_build_set.add(bsi);
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
                            let work_duration = factory.createDuration(intensity, durationUnits[0], durationValues[0]);
                            let rest_duration = core_1.Duration.ZeroDuration;
                            if (durationUnits.length > 1 && durationValues.length > 1) {
                                rest_duration = factory.createDuration(intensity, durationUnits[1], durationValues[1]);
                            }
                            interval = new core_1.RampBuildInterval(title.trim(), startIntensity, endIntensity, work_duration, rest_duration);
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
                        let parent = (stack[stack.length - 1]);
                        if (step_build_set.has(parent)) {
                            let old_intervals = [...parent.getIntervals()];
                            parent.getIntervals().length = 0;
                            for (let i = 0; i < old_intervals.length; i += 1) {
                                parent.getIntervals().push(old_intervals[i]);
                                parent.getIntervals().push(interval);
                            }
                        }
                        else {
                            stack[stack.length - 1].getIntervals().push(interval);
                        }
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
exports.IntervalParser = IntervalParser;
