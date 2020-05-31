"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SportTypeHelper = exports.ClipboardHelper = exports.FieldValidator = exports.QueryParams = exports.QueryParamsList = void 0;
const Core = require("./core");
const Model = require("./model");
const Visitor = require("./visitor");
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
exports.QueryParamsList = QueryParamsList;
class ParamArg {
    constructor(property_name, url_name, required) {
        this.property_name = property_name;
        this.url_name = url_name;
        this.required = required;
    }
    hasValue() {
        return typeof (this.value) != 'undefined' && (this.value != "" && this.value.trim().length > 0);
    }
    validate() {
        return !this.required || this.hasValue();
    }
    getValue() {
        if (this.hasValue()) {
            return this.value;
        }
        else {
            return null;
        }
    }
    encodeUrl() {
        return `${this.url_name}=${encodeURIComponent(this.value)}`;
    }
}
class QueryParams {
    constructor() {
        this.ftp_watts_ = new ParamArg("ftp_watts", "ftp", true);
        this.t_pace_ = new ParamArg("t_pace", "tpace", true);
        this.swim_ftp_ = new ParamArg("swim_ftp", "swim_ftp", true);
        this.swim_css_ = new ParamArg("swim_css", "css", true);
        this.email_ = new ParamArg("email", "email", true);
        this.efficiency_factor_ = new ParamArg("efficiency_factor", "ef", true);
        this.workout_title_ = new ParamArg("workout_title", "t", false);
        this.workout_text_ = new ParamArg("workout_text", "w", false);
        this.sport_type_ = new ParamArg("sport_type", "st", true);
        this.output_unit_ = new ParamArg("output_unit", "ou", true);
        this.page_ = new ParamArg("page", "page", true);
        this.should_round_ = new ParamArg("should_round", "should_round", false);
        this.params = [
            this.ftp_watts_,
            this.t_pace_,
            this.swim_ftp_,
            this.swim_css_,
            this.email_,
            this.efficiency_factor_,
            this.workout_title_,
            this.workout_text_,
            this.sport_type_,
            this.output_unit_,
            this.page_,
            this.should_round_,
        ];
        if (!this.validate()) {
            this.loadFromStorage();
            this.loadFromURL();
        }
    }
    get ftp_watts() {
        return this.ftp_watts_;
    }
    get t_pace() {
        return this.t_pace_;
    }
    get swim_ftp() {
        return this.swim_ftp_;
    }
    get swim_css() {
        return this.swim_css_;
    }
    get email() {
        return this.email_;
    }
    get efficiency_factor() {
        return this.efficiency_factor_;
    }
    get workout_title() {
        return this.workout_title_;
    }
    get workout_text() {
        return this.workout_text_;
    }
    get sport_type() {
        return this.sport_type_;
    }
    get output_unit() {
        return this.output_unit_;
    }
    get page() {
        return this.page_;
    }
    get should_round() {
        return this.should_round_;
    }
    setUrlParamValue(url_name, value) {
        for (let i = 0; i < this.params.length; i++) {
            let qp = this.params[i];
            if (qp.url_name == url_name) {
                qp.value = value;
            }
        }
    }
    static createCopy(other) {
        var ret = new QueryParams();
        for (let i = 0; i < other.params.length; i++) {
            ret.params[i].value = other.params[i].value;
        }
        return ret;
    }
    loadFromStorage() {
        for (let i = 0; i < this.params.length; i++) {
            let qp = this.params[i];
            let value = loadPersistedValue(qp.property_name);
            if (value != null && value.trim().length != 0) {
                qp.value = value;
            }
        }
    }
    saveToStorage() {
        for (let i = 0; i < this.params.length; i++) {
            let qp = this.params[i];
            if (qp.hasValue()) {
                setPersistedValue(qp.property_name, qp.value);
            }
        }
    }
    loadFromURL() {
        var query_params = getQueryParams();
        for (let key in query_params) {
            let value = query_params[key];
            if (value != 'undefined' && typeof (value) != 'undefined') {
                this.setUrlParamValue(key, value);
            }
        }
    }
    validate() {
        for (let i = 0; i < this.params.length; i++) {
            let qp = this.params[i];
            if (!qp.validate()) {
                return false;
            }
        }
        return true;
    }
    getURL() {
        let params_string = this.params.map(function (value) {
            return value.hasValue() ? value.encodeUrl() : null;
        });
        params_string = params_string.filter(v => v != null);
        return "?" + params_string.join("&");
    }
    createUserProfile() {
        if (this.validate()) {
            let result = new Core.UserProfile(parseInt(this.ftp_watts.value), this.t_pace.value, parseInt(this.swim_ftp.value), this.swim_css.value, this.email.value);
            result.setEfficiencyFactor(parseFloat(this.efficiency_factor.value));
            return result;
        }
        else {
            return null;
        }
    }
    createWorkoutBuilder() {
        if (this.validate()) {
            let result = new Model.WorkoutBuilder(this.createUserProfile(), parseInt(this.sport_type.value), parseInt(this.output_unit.value));
            result.withDefinition(this.workout_title.value, this.workout_text.value);
            return result;
        }
        else {
            return null;
        }
    }
    getDominantUnit() {
        try {
            let workout_builder = this.createWorkoutBuilder();
            return workout_builder != null ? Visitor.DominantUnitVisitor.computeIntensity(workout_builder.getInterval()) : null;
        }
        catch (Error) {
            return Core.IntensityUnit.Unknown;
        }
    }
}
exports.QueryParams = QueryParams;
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
exports.FieldValidator = FieldValidator;
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
exports.ClipboardHelper = ClipboardHelper;
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
exports.SportTypeHelper = SportTypeHelper;
