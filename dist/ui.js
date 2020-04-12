"use strict";
const Core = require("./core");
const Model = require("./model");
const Visitor = require("./visitor");
var zlib = require('zlib');
var UI;
(function (UI) {
    function loadPersistedValue(id) {
        if (window.localStorage) {
            var result = window.localStorage.getItem(id);
            return result ? result.trim() : "";
        }
        else {
            return null;
        }
    }
    function setPersistedValue(id, value) {
        if (window.localStorage) {
            window.localStorage.setItem(id, value);
        }
    }
    class QueryParamsList {
        constructor() {
            this.loadFromURL();
        }
        loadFromURL() {
            var params = getQueryParams();
            this.sport_type_ = params.st;
            this.title_ = params.title || "";
            return this.validate();
        }
        validate() {
            return typeof (this.sport_type_) != 'undefined' && this.sport_type_ != "";
        }
        getURL() {
            return "?page=list&st=" + encodeURIComponent(this.sport_type_) + "&title=" + encodeURIComponent(this.title_);
        }
        getSportType() {
            return this.sport_type_;
        }
        setSportType(st) {
            this.sport_type_ = st;
        }
        setTitle(title) {
            this.title_ = title;
        }
        getTitle() {
            return this.title_;
        }
        pushToHistory() {
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
            ret.swim_ftp = params.swim_ftp;
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
            if (params.swim_ftp != null && params.swim_ftp.trim() != 0) {
                this.swim_ftp = params.swim_ftp;
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
                let value = loadPersistedValue("title");
                if (value != null && value.trim().length != 0) {
                    this.workout_title = value;
                }
            }
            {
                let value = loadPersistedValue("workout");
                if (value != null && value.trim().length != 0) {
                    this.workout_text = value;
                }
            }
            {
                let value = loadPersistedValue("ftp_watts");
                if (value != null && value.trim().length != 0) {
                    this.ftp_watts = value;
                }
            }
            {
                let value = loadPersistedValue("t_pace");
                if (value != null && value.trim().length != 0) {
                    this.t_pace = value;
                }
            }
            {
                let value = loadPersistedValue("swim_ftp");
                if (value != null && value.trim().length != 0) {
                    this.swim_ftp = value;
                }
            }
            {
                let value = loadPersistedValue("swim_css");
                if (value != null && value.trim().length != 0) {
                    this.swim_css = value;
                }
            }
            {
                let value = loadPersistedValue("ef");
                if (value != null && value.trim().length != 0) {
                    this.efficiency_factor = value;
                }
            }
            {
                let value = loadPersistedValue("sport_type");
                if (value != null && value.trim().length != 0) {
                    this.sport_type = value;
                }
            }
            {
                let value = loadPersistedValue("output_unit");
                if (value != null && value.trim().length != 0) {
                    this.output_unit = value;
                }
            }
            {
                let value = loadPersistedValue("email");
                if (value != null && value.trim().length != 0) {
                    this.email = value;
                }
            }
            {
                let value = loadPersistedValue("efficiency_factor");
                if (value != null && value.trim().length != 0) {
                    this.efficiency_factor = value;
                }
            }
            {
                let value = loadPersistedValue("page");
                if (value != null && value.trim().length != 0) {
                    this.page = value;
                }
            }
            {
                let value = loadPersistedValue("should_round");
                if (value != null && value.trim().length != 0) {
                    this.should_round = value;
                }
            }
        }
        saveToStorage() {
            if (this.hasWorkoutTitle()) {
                setPersistedValue("title", this.workout_title);
            }
            if (this.hasWorkoutText()) {
                setPersistedValue("workout", this.workout_text);
            }
            if (this.hasFtpWatts()) {
                setPersistedValue("ftp_watts", this.ftp_watts);
            }
            if (this.hasTPace()) {
                setPersistedValue("t_pace", this.t_pace);
            }
            if (this.hasSwimFTP()) {
                setPersistedValue("swim_ftp", this.swim_ftp);
            }
            if (this.hasSwimCSS()) {
                setPersistedValue("swim_css", this.swim_css);
            }
            if (this.hasEfficiencyFactor()) {
                setPersistedValue("ef", this.efficiency_factor);
            }
            if (this.hasSportType()) {
                setPersistedValue("sport_type", this.sport_type);
            }
            if (this.hasOutputUnit()) {
                setPersistedValue("output_unit", this.output_unit);
            }
            if (this.hasEmail()) {
                setPersistedValue("email", this.email);
            }
            if (this.hasEfficiencyFactor()) {
                setPersistedValue("efficiency_factor", this.efficiency_factor);
            }
            if (this.hasPage()) {
                setPersistedValue("page", this.page);
            }
            if (this.hasShouldRound()) {
                setPersistedValue("should_round", this.should_round);
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
        hasSwimFTP() {
            return typeof (this.swim_ftp) != 'undefined' && this.swim_ftp != "";
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
                this.hasSwimFTP() &&
                this.hasSwimCSS() &&
                this.hasEfficiencyFactor() &&
                this.hasSportType() &&
                this.hasOutputUnit() &&
                this.hasEmail();
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
            if (this.hasSwimFTP()) {
                res += "&swim_ftp=" + encodeURIComponent(this.swim_ftp);
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
                let result = new Core.UserProfile(parseInt(this.ftp_watts), this.t_pace, parseInt(this.swim_ftp), this.swim_css, this.email);
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
        getDominantUnit() {
            return Visitor.DominantUnitVisitor.computeIntensity(this.createWorkoutBuilder().getInterval());
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
    class SportTypeHelper {
        static convertToString(sportType) {
            if (sportType == Core.SportType.Bike) {
                return "Bike";
            }
            else if (sportType == Core.SportType.Run) {
                return "Run";
            }
            else if (sportType == Core.SportType.Swim) {
                return "Swim";
            }
            else if (sportType == Core.SportType.Other) {
                return "Other";
            }
            else {
                console.assert(false);
                return "";
            }
        }
    }
    UI.SportTypeHelper = SportTypeHelper;
})(UI || (UI = {}));
module.exports = UI;
