/// <reference path="../type_definitions/react.d.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var React = require('react');
var UI = require('../ui');
var user_settings_1 = require('./user_settings');
var workout_input_1 = require('./workout_input');
var workout_view_1 = require('./workout_view');
var Workout = (function (_super) {
    __extends(Workout, _super);
    function Workout(props) {
        _super.call(this, props);
        this.params = UI.QueryParams.createCopy(props);
    }
    Workout.prototype._onWorkoutInputChanged = function (sportType, outputUnit, workout_title, workout_text) {
        this.params.sport_type = sportType.toString();
        this.params.output_unit = outputUnit.toString();
        this.params.workout_text = workout_text;
        this.params.workout_title = workout_title;
        this.refresh();
    };
    Workout.prototype._onUserSettingsChanged = function (ftp, t_pace, swim_css, email) {
        this.params.ftp_watts = ftp.toString();
        this.params.t_pace = t_pace;
        this.params.swim_css = swim_css;
        this.params.email = email;
        this.refresh();
    };
    Workout.prototype.componentDidMount = function () {
        // Put here which is guaranteed for the DOM tree to be created
        this.refreshUrls();
    };
    Workout.prototype.refresh = function () {
        var view = this.refs['view'];
        view.refresh(this.params);
        this.refreshUrls();
        this.params.saveToStorage();
    };
    Workout.prototype.refreshUrls = function () {
        var url_parameters = this.params.getURL();
        this._setHref("download_mrc", "workout.mrc" + url_parameters);
        this._setHref("download_zwo", "workout.zwo" + url_parameters);
        this._setHref("email_send_workout", "send_mail" + url_parameters);
        this._setHref("save_workout", "save_workout" + url_parameters);
        this._setVisibility("save_workout", this.params.experimental);
        window.history.pushState('Object', 'Title', url_parameters);
    };
    Workout.prototype._setHref = function (element_ref, url) {
        var anchor = this.refs[element_ref];
        anchor.href = url;
    };
    Workout.prototype._setVisibility = function (element_ref, visible) {
        var anchor = this.refs[element_ref];
        anchor.hidden = !visible;
    };
    Workout.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", null, React.createElement(user_settings_1.default, __assign({}, this.props, {ref: 'settings', onChange: function (f, t, c, e) { return _this._onUserSettingsChanged(f, t, c, e); }})), React.createElement(workout_input_1.default, __assign({}, this.props, {ref: 'input', onChange: function (s, o, t, w) { return _this._onWorkoutInputChanged(s, o, t, w); }})), React.createElement("table", null, React.createElement("tbody", null, React.createElement("tr", null, React.createElement("td", null, React.createElement("a", {ref: "download_mrc"}, "Download MRC")), React.createElement("td", null, React.createElement("a", {ref: "download_zwo"}, "Download ZWO")), React.createElement("td", null, React.createElement("a", {ref: "email_send_workout"}, "Email Workout")), React.createElement("td", null, React.createElement("a", {ref: "save_workout"}, "Save Workout"))))), React.createElement(workout_view_1.default, __assign({}, this.props, {ref: 'view'}))));
    };
    return Workout;
}(React.Component));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Workout;
