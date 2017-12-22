"use strict";
/// <reference path="./node_modules/@types/node/index.d.ts"/>
/// <reference path="./node_modules/@types/mysql/index.d.ts"/>
const Model = require("./model");
var zlib = require('zlib');
var UI;
(function (UI) {
    class PersistedItem {
        constructor(id) {
            this.id = id;
        }
        save(value) {
            if (window.localStorage) {
                window.localStorage.setItem(this.id, value);
            }
        }
        load() {
            if (window.localStorage) {
                var result = window.localStorage.getItem(this.id);
                return result ? result.trim() : "";
            }
            else {
                return null;
            }
        }
    }
    UI.PersistedItem = PersistedItem;
    class QueryParamsList {
        constructor() {
            this.loadFromURL();
        }
        loadFromURL() {
            var params = getQueryParams();
            this.sport_type_ = params.st;
            return this.validate();
        }
        validate() {
            return typeof (this.sport_type_) != 'undefined' && this.sport_type_ != "";
        }
        getURL() {
            return "?st=" + encodeURIComponent(this.sport_type_);
        }
        getSportType() {
            return this.sport_type_;
        }
        setSportType(st) {
            this.sport_type_ = st;
            window.history.pushState('Object', 'Title', this.getURL());
        }
    }
    UI.QueryParamsList = QueryParamsList;
    class QueryParams {
        constructor() {
            if (!this.validate()) {
                this.loadFromStorage();
                this.loadFromURL();
            }
        }
        static createCopy(params) {
            var ret = new QueryParams();
            ret.workout_title = params.workout_title;
            ret.workout_text = params.workout_text;
            ret.ftp_watts = params.ftp_watts;
            ret.t_pace = params.t_pace;
            ret.swim_css = params.swim_css;
            ret.efficiency_factor = params.efficiency_factor;
            ret.sport_type = params.sport_type;
            ret.output_unit = params.output_unit;
            ret.email = params.email;
            ret.page = params.page;
            ret.should_round = params.should_round;
            return ret;
        }
        loadFromURL() {
            var params = getQueryParams();
            if (params.t != null && params.t.trim() != 0) {
                this.workout_title = params.t;
            }
            if (params.w != null && params.w.trim() != 0) {
                this.workout_text = params.w;
            }
            if (params.ftp != null && params.ftp.trim() != 0) {
                this.ftp_watts = params.ftp;
            }
            if (params.tpace != null && params.tpace.trim() != 0) {
                this.t_pace = params.tpace;
            }
            if (params.css != null && params.css.trim() != 0) {
                this.swim_css = params.css;
            }
            if (params.ef != null && params.ef.trim() != 0) {
                this.efficiency_factor = params.ef;
            }
            if (params.st != null && params.st.trim() != 0) {
                this.sport_type = params.st;
            }
            if (params.ou != null && params.ou.trim() != 0) {
                this.output_unit = params.ou;
            }
            if (params.email != null && params.email.trim() != 0) {
                this.email = params.email;
            }
            // Load the workout when its encoded
            if (params.wh != null) {
                if (params.wh.startsWith("web+wp://")) {
                    var workout_hash = params.wh.substr(9, params.wh.length);
                    var buffer = zlib.inflateSync(new Buffer(workout_hash, 'base64')).toString('utf8');
                    console.assert(buffer != null);
                    this.workout_text = buffer;
                }
            }
            if (params.page != null && params.page.trim() != 0) {
                this.page = params.page;
            }
            if (params.should_round != null && params.should_round.trim() != 0) {
                this.should_round = params.should_round;
            }
        }
        loadFromStorage() {
            {
                let value = new PersistedItem("title").load();
                if (value != null && value.trim().length != 0) {
                    this.workout_title = value;
                }
            }
            {
                let value = new PersistedItem("workout").load();
                if (value != null && value.trim().length != 0) {
                    this.workout_text = value;
                }
            }
            {
                let value = new PersistedItem("ftp_watts").load();
                if (value != null && value.trim().length != 0) {
                    this.ftp_watts = value;
                }
            }
            {
                let value = new PersistedItem("t_pace").load();
                if (value != null && value.trim().length != 0) {
                    this.t_pace = value;
                }
            }
            {
                let value = new PersistedItem("swim_css").load();
                if (value != null && value.trim().length != 0) {
                    this.swim_css = value;
                }
            }
            {
                let value = new PersistedItem("ef").load();
                if (value != null && value.trim().length != 0) {
                    this.efficiency_factor = value;
                }
            }
            {
                let value = new PersistedItem("sport_type").load();
                if (value != null && value.trim().length != 0) {
                    this.sport_type = value;
                }
            }
            {
                let value = new PersistedItem("output_unit").load();
                if (value != null && value.trim().length != 0) {
                    this.output_unit = value;
                }
            }
            {
                let value = new PersistedItem("email").load();
                if (value != null && value.trim().length != 0) {
                    this.email = value;
                }
            }
            {
                let value = new PersistedItem("efficiency_factor").load();
                if (value != null && value.trim().length != 0) {
                    this.efficiency_factor = value;
                }
            }
            {
                let value = new PersistedItem("page").load();
                if (value != null && value.trim().length != 0) {
                    this.page = value;
                }
            }
            {
                let value = new PersistedItem("should_round").load();
                if (value != null && value.trim().length != 0) {
                    this.should_round = value;
                }
            }
        }
        saveToStorage() {
            if (this.hasWorkoutTitle()) {
                new PersistedItem("title").save(this.workout_title);
            }
            if (this.hasWorkoutText()) {
                new PersistedItem("workout").save(this.workout_text);
            }
            if (this.hasFtpWatts()) {
                new PersistedItem("ftp_watts").save(this.ftp_watts);
            }
            if (this.hasTPace()) {
                new PersistedItem("t_pace").save(this.t_pace);
            }
            if (this.hasSwimCSS()) {
                new PersistedItem("swim_css").save(this.swim_css);
            }
            if (this.hasEfficiencyFactor()) {
                new PersistedItem("ef").save(this.efficiency_factor);
            }
            if (this.hasSportType()) {
                new PersistedItem("sport_type").save(this.sport_type);
            }
            if (this.hasOutputUnit()) {
                new PersistedItem("output_unit").save(this.output_unit);
            }
            if (this.hasEmail()) {
                new PersistedItem("email").save(this.email);
            }
            if (this.hasEfficiencyFactor()) {
                new PersistedItem("efficiency_factor").save(this.efficiency_factor);
            }
            if (this.hasPage()) {
                new PersistedItem("page").save(this.page);
            }
            if (this.hasShouldRound()) {
                new PersistedItem("should_round").save(this.should_round);
            }
        }
        hasWorkoutTitle() {
            return typeof (this.workout_title) != 'undefined' && this.workout_title != "";
        }
        hasWorkoutText() {
            return typeof (this.workout_text) != 'undefined' && this.workout_text != "";
        }
        hasFtpWatts() {
            return typeof (this.ftp_watts) != 'undefined' && this.ftp_watts != "";
        }
        hasTPace() {
            return typeof (this.t_pace) != 'undefined' && this.t_pace != "";
        }
        hasSwimCSS() {
            return typeof (this.swim_css) != 'undefined' && this.swim_css != "";
        }
        hasEfficiencyFactor() {
            return typeof (this.efficiency_factor) != 'undefined' && this.efficiency_factor != "";
        }
        hasSportType() {
            return typeof (this.sport_type) != 'undefined' && this.sport_type != "";
        }
        hasOutputUnit() {
            return typeof (this.output_unit) != 'undefined' && this.output_unit != "";
        }
        hasEmail() {
            return typeof (this.email) != 'undefined' && this.email != "";
        }
        hasPage() {
            return typeof (this.page) != 'undefined' && this.page != "";
        }
        hasShouldRound() {
            return typeof (this.should_round) != 'undefined' && this.should_round != "";
        }
        validate() {
            return this.hasWorkoutText() &&
                this.hasFtpWatts() &&
                this.hasTPace() &&
                this.hasSwimCSS() &&
                this.hasEfficiencyFactor() &&
                this.hasSportType() &&
                this.hasOutputUnit() &&
                this.hasEmail();
            // intentially missed the title, page and should_round. the default will be the main page
        }
        getURL() {
            let res = "?";
            if (this.hasWorkoutTitle()) {
                res += "t=" + encodeURIComponent(this.workout_title);
            }
            if (this.hasWorkoutText()) {
                res += "&w=" + encodeURIComponent(this.workout_text);
            }
            if (this.hasSportType()) {
                res += "&st=" + encodeURIComponent(this.sport_type);
            }
            if (this.hasFtpWatts()) {
                res += "&ftp=" + encodeURIComponent(this.ftp_watts);
            }
            if (this.hasTPace()) {
                res += "&tpace=" + encodeURIComponent(this.t_pace);
            }
            if (this.hasSwimCSS()) {
                res += "&css=" + encodeURIComponent(this.swim_css);
            }
            if (this.hasEfficiencyFactor()) {
                res += "&ef=" + encodeURIComponent(this.efficiency_factor);
            }
            if (this.hasOutputUnit()) {
                res += "&ou=" + encodeURIComponent(this.output_unit);
            }
            if (this.hasEmail()) {
                res += "&email=" + encodeURIComponent(this.email);
            }
            if (this.hasPage()) {
                res += "&page=" + encodeURIComponent(this.page);
            }
            if (this.hasShouldRound()) {
                res += "&sr=" + encodeURIComponent(this.should_round);
            }
            return res;
        }
        createUserProfile() {
            if (this.validate()) {
                let result = new Model.UserProfile(parseInt(this.ftp_watts), this.t_pace, this.swim_css, this.email);
                result.setEfficiencyFactor(parseFloat(this.efficiency_factor));
                return result;
            }
            else {
                return null;
            }
        }
        createWorkoutBuilder() {
            if (this.validate()) {
                let result = new Model.WorkoutBuilder(this.createUserProfile(), parseInt(this.sport_type), parseInt(this.output_unit));
                result.withDefinition(this.workout_title, this.workout_text);
                return result;
            }
            else {
                return null;
            }
        }
    }
    UI.QueryParams = QueryParams;
    function getQueryParams() {
        var qs = document.location.search;
        qs = qs.split("+").join(" ");
        var params = {}, tokens, re = /[?&]?([^=]+)=([^&]*)/g;
        while (tokens = re.exec(qs)) {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }
        return params;
    }
    class FieldValidator {
        static validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
        static validateNumber(num) {
            if (num == null || num.trim().length == 0) {
                return false;
            }
            else {
                var num_val = parseFloat(num);
                return !isNaN(num_val);
            }
        }
    }
    UI.FieldValidator = FieldValidator;
    class ClipboardHelper {
        static copyText(text) {
            var textArea = document.createElement("textarea");
            // Place in top-left corner of screen regardless of scroll position.
            textArea.style.position = 'fixed';
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.width = '2em';
            textArea.style.height = '2em';
            textArea.style.padding = "0";
            textArea.style.border = 'none';
            textArea.style.outline = 'none';
            textArea.style.boxShadow = 'none';
            textArea.style.background = 'transparent';
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                var successful = document.execCommand('copy');
                var msg = successful ? 'successful' : 'unsuccessful';
                console.log('Copying text command was ' + msg);
            }
            catch (err) {
                console.log('Oops, unable to copy');
            }
            document.body.removeChild(textArea);
        }
    }
    UI.ClipboardHelper = ClipboardHelper;
    let ArgType;
    (function (ArgType) {
        ArgType[ArgType["Number"] = 0] = "Number";
        ArgType[ArgType["String"] = 1] = "String";
    })(ArgType || (ArgType = {}));
    ;
    // Class that processes the input like #wu and replaces with macros. It might belong in the model
    class TextPreprocessor {
        constructor(sport_type) {
            this.sport_type = sport_type;
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
        // TODO: total_duration_min: number
        _warmup() {
            let warmup_text = "";
            let warmup_groups = [];
            if (this.sport_type == Model.SportType.Bike) {
                warmup_groups = [
                    // 9 min (warmup)
                    [
                        "(3min, 55), (3min, 65), (3min, 75)",
                        "(9min, 55, 75)"
                    ],
                    // 4 min (drill)
                    [
                        "2[(45s, 45, Single leg - left), (15s, 45, both), (45s, 45, Single leg - right), (15s, 45, both)]",
                        "8[(15s, 55, spin ups), (15s, 55)]",
                        "4[(30s, cadence 80/90/100/110, 55), (30s, 55)]"
                    ],
                    // 4 min (build)
                    [
                        "4[(15s, *, build), (45s, 55)]",
                        "4[(5s, *, MAX), (55s, 55)]",
                        "4[(45s, 75, 100), (15s, 55)]",
                        "4[(30s, 85, 90, 95, 100), (30s, 55)]"
                    ],
                    // static (3min)
                    ["(3min, 55)"]
                ];
            }
            else if (this.sport_type == Model.SportType.Run) {
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
            }
            for (let i = 0; i < warmup_groups.length; i++) {
                warmup_text += this._randElement(warmup_groups[i]);
            }
            return warmup_text;
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
        // TODO: number_repeats: number, work_duration_sec: number, rest_duration_sec: number
        _cadence_intervals() {
            // Not sure yet how to model this.
            // 2x(2-2-1 Spin Ups @ 75% 90-100-110 rpm)
            // 5x30s Highest Sustainable Cadence @ L2 - rest 30s very easy
            // 4[(4min, 60, cadence 80rpm), (3min, 65, cadence 90rpm), (2min, 70, cadence 100rpm), (1min, 75, cadence 110rpm)]
            //
            // (3min, 55, cadence @ 65rpm)
            // (2min, 55, cadence @ 95rpm)
            // (3min, 55, cadence @ 70rpm)
            // (2min, 55, cadence @ 100rpm)
            //
            // (3min, 55, cadence @ 75rpm)
            // (2min, 55, cadence @ 105rpm)
            // (3min, 55, cadence @ 80rpm)
            // (2min, 55, cadence @ 110rpm)
            return "<cd>";
        }
        process(input) {
            let funcs = [
                { regex: /#wu\((\d*)\)/, callback: this._warmup, params: [], description: "Warm up" },
                { regex: /#sl\((\d*),(\d*)\)/, callback: this._single_leg, params: [ArgType.Number, ArgType.Number], description: "Single Leg Drills." },
                { regex: /#o\((\d*),(\d*)\)/, callback: this._open_intervals, params: [ArgType.Number, ArgType.Number], description: "Open Power Intervals." },
                { regex: /#c\((\d*),(\d*)\)/, callback: this._cadence_intervals, params: [ArgType.Number, ArgType.Number], description: "Cadence Intervals." }
            ];
            for (let i = 0; i < funcs.length; i++) {
                let regex = funcs[i].regex;
                // Try seeing if this function matches the input.
                if (regex.test(input)) {
                    var instance_params = input.match(regex);
                    // Parse all parameters from the regex.
                    var func_params = [];
                    if (instance_params.length - 1 != funcs[i].params.length) {
                        console.log("Function call " + input + " is not matching definition.");
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
                    console.log("regex " + regex + " failed to match " + input);
                }
            }
            return input;
        }
    }
    UI.TextPreprocessor = TextPreprocessor;
})(UI || (UI = {}));
module.exports = UI;
