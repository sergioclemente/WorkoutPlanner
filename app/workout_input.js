/// <reference path="../type_definitions/react.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var Model = require('../model');
var select_1 = require('./select');
var select_option_1 = require('./select_option');
var WorkoutInput = (function (_super) {
    __extends(WorkoutInput, _super);
    function WorkoutInput(props) {
        _super.call(this, props);
    }
    WorkoutInput.prototype.getSportType = function () {
        var sltSportType = this.refs['sportType'];
        return parseInt(sltSportType.getSelectedValue());
    };
    WorkoutInput.prototype.getUnitType = function () {
        var sltUnit = this.refs['unit'];
        return parseInt(sltUnit.getSelectedValue());
    };
    WorkoutInput.prototype.getWorkoutText = function () {
        var workoutText = this.refs['workout_text'];
        return workoutText.value;
    };
    WorkoutInput.prototype._onSportTypeChange = function (sport_type_str) {
        var sport_type = parseInt(sport_type_str);
        var sltUnit = this.refs['unit'];
        if (sport_type == Model.SportType.Run) {
            sltUnit.setSelectedValue(Model.IntensityUnit.MinMi.toString());
        }
        else if (sport_type == Model.SportType.Bike) {
            sltUnit.setSelectedValue(Model.IntensityUnit.Watts.toString());
        }
        this._loadWorkout();
    };
    WorkoutInput.prototype._onUnitChanged = function (e) {
        this._loadWorkout();
    };
    WorkoutInput.prototype._onWorkoutTextChange = function (e) {
        this._loadWorkout();
    };
    WorkoutInput.prototype._loadWorkout = function () {
        if (this.props.onChange) {
            this.props.onChange(this.getSportType(), this.getUnitType(), this.getWorkoutText());
        }
    };
    WorkoutInput.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", null, React.createElement("h1", null, " Workout Settings "), React.createElement("form", null, "Sport type:", React.createElement(select_1.default, {"ref": "sportType", "defaultValue": this.props.sport_type, "onChange": function (e) { return _this._onSportTypeChange(e); }}, React.createElement(select_option_1.default, {"value": Model.SportType.Bike}, "Bike"), React.createElement(select_option_1.default, {"value": Model.SportType.Run}, "Run")), React.createElement("br", null), "Unit:", React.createElement(select_1.default, {"ref": "unit", "defaultValue": this.props.output_unit, "onChange": function (e) { return _this._onUnitChanged(e); }}, React.createElement(select_option_1.default, {"value": Model.IntensityUnit.Watts}, "Watts"), React.createElement(select_option_1.default, {"value": Model.IntensityUnit.MinMi}, "min/mi"), React.createElement(select_option_1.default, {"value": Model.IntensityUnit.Mph}, "mi/h"), React.createElement(select_option_1.default, {"value": Model.IntensityUnit.MinKm}, "min/km"), React.createElement(select_option_1.default, {"value": Model.IntensityUnit.Kmh}, "km/h")), React.createElement("br", null), React.createElement("textarea", {"ref": "workout_text", "defaultValue": this.props.workout_text, "style": { height: "200px", width: "100%" }, "onChange": function (e) { return _this._onWorkoutTextChange(e); }}), React.createElement("br", null))));
    };
    return WorkoutInput;
})(React.Component);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WorkoutInput;
