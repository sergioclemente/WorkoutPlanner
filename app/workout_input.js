/// <reference path="../type_definitions/react.d.ts" />
"use strict";
const React = require('react');
const Model = require('../model');
const select_1 = require('./select');
const select_option_1 = require('./select_option');
class WorkoutInput extends React.Component {
    constructor(props) {
        super(props);
    }
    getSportType() {
        var sltSportType = this.refs['sportType'];
        return parseInt(sltSportType.getSelectedValue());
    }
    getUnitType() {
        var sltUnit = this.refs['unit'];
        return parseInt(sltUnit.getSelectedValue());
    }
    getWorkoutText() {
        var workoutText = this.refs['workout_text'];
        return workoutText.value;
    }
    getWorkoutTitle() {
        var workoutTitle = this.refs['workout_title'];
        return workoutTitle.value;
    }
    _onSportTypeChange(sport_type_str) {
        var sport_type = parseInt(sport_type_str);
        var sltUnit = this.refs['unit'];
        if (sport_type == Model.SportType.Run) {
            sltUnit.setSelectedValue(Model.IntensityUnit.MinMi.toString());
        }
        else if (sport_type == Model.SportType.Bike) {
            sltUnit.setSelectedValue(Model.IntensityUnit.Watts.toString());
        }
        else if (sport_type == Model.SportType.Swim) {
            sltUnit.setSelectedValue(Model.IntensityUnit.IF.toString());
        }
        this._loadWorkout();
    }
    _onUnitChanged(e) {
        this._loadWorkout();
    }
    _onWorkoutTextChange(e) {
        this._loadWorkout();
    }
    _onWorkoutTitleChange(e) {
        this._loadWorkout();
    }
    _loadWorkout() {
        if (this.props.onChange) {
            this.props.onChange(this.getSportType(), this.getUnitType(), this.getWorkoutTitle(), this.getWorkoutText());
        }
    }
    render() {
        return (React.createElement("div", null, React.createElement("h1", null, " Workout Settings "), React.createElement("form", null, "Title: ", React.createElement("input", {ref: "workout_title", defaultValue: this.props.workout_title, onChange: e => this._onWorkoutTitleChange(e)}), React.createElement("br", null), "Sport type:", React.createElement(select_1.default, {ref: "sportType", defaultValue: this.props.sport_type, onChange: e => this._onSportTypeChange(e)}, React.createElement(select_option_1.default, {value: Model.SportType.Swim}, "Swim"), React.createElement(select_option_1.default, {value: Model.SportType.Bike}, "Bike"), React.createElement(select_option_1.default, {value: Model.SportType.Run}, "Run")), React.createElement("br", null), "Unit:", React.createElement(select_1.default, {ref: "unit", defaultValue: this.props.output_unit, onChange: e => this._onUnitChanged(e)}, React.createElement(select_option_1.default, {value: Model.IntensityUnit.Watts}, "Watts"), React.createElement(select_option_1.default, {value: Model.IntensityUnit.MinMi}, "min/mi"), React.createElement(select_option_1.default, {value: Model.IntensityUnit.Mph}, "mi/h"), React.createElement(select_option_1.default, {value: Model.IntensityUnit.MinKm}, "min/km"), React.createElement(select_option_1.default, {value: Model.IntensityUnit.Kmh}, "km/h"), React.createElement(select_option_1.default, {value: Model.IntensityUnit.IF}, "IF"), React.createElement(select_option_1.default, {value: Model.IntensityUnit.Per100Yards}, "/100yards"), React.createElement(select_option_1.default, {value: Model.IntensityUnit.Per100Meters}, "/100m"), React.createElement(select_option_1.default, {value: Model.IntensityUnit.HeartRate}, "Heart rate")), React.createElement("br", null), React.createElement("textarea", {ref: "workout_text", defaultValue: this.props.workout_text, style: { height: "200px", width: "100%" }, onChange: e => this._onWorkoutTextChange(e)}), React.createElement("br", null))));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WorkoutInput;
