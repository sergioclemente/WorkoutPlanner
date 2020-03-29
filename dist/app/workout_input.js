"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Model = require("../model");
const select_1 = require("./select");
const select_option_1 = require("./select_option");
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
    setOutputUnit(unit) {
        let selectUnit = this.refs["unit"];
        selectUnit.setSelectedValue(unit.toString());
    }
    getWorkoutText() {
        var workoutText = this.refs['workout_text'];
        return workoutText.value;
    }
    setWorkoutText(v) {
        var workoutText = this.refs['workout_text'];
        workoutText.value = v;
    }
    getWorkoutTitle() {
        var workoutTitle = this.refs['workout_title'];
        return workoutTitle.value;
    }
    _onSportTypeChange(sport_type_str) {
        this._enableCompatibleOutputUnits(sport_type_str);
        this._loadWorkout();
    }
    _enableCompatibleOutputUnits(sportType) {
        if (sportType == null || sportType.trim() == "") {
            return;
        }
        var sportTypeEnum = parseInt(sportType);
        let selectUnit = this.refs["unit"];
        if (sportTypeEnum == Model.SportType.Run) {
            selectUnit.setSelectedValue(Model.IntensityUnit.MinMi.toString());
        }
        else if (sportTypeEnum == Model.SportType.Bike) {
            selectUnit.setSelectedValue(Model.IntensityUnit.Watts.toString());
        }
        else if (sportTypeEnum == Model.SportType.Swim) {
            selectUnit.setSelectedValue(Model.IntensityUnit.Per100Yards.toString());
        }
        else {
            console.assert(sportTypeEnum == Model.SportType.Other);
            selectUnit.setSelectedValue(Model.IntensityUnit.IF.toString());
        }
        var units = ["yards", "meters", "watts", "if", "hr", "minmi", "mih", "minkm", "kmh", "hr", "per400m"];
        for (let idx in units) {
            let selectOption = this.refs[units[idx]];
            selectOption.setEnabled(false);
        }
        let map = {};
        map[Model.SportType.Swim.toString()] = ["watts", "yards", "meters"];
        map[Model.SportType.Bike.toString()] = ["watts", "if", "hr"];
        map[Model.SportType.Run.toString()] = ["minmi", "mih", "minkm", "kmh", "hr", "per400m"];
        map[Model.SportType.Other.toString()] = ["if", "hr"];
        for (let idx in map[sportType]) {
            let selectOption = this.refs[map[sportType][idx]];
            selectOption.setEnabled(true);
        }
    }
    _onUnitChanged(e) {
        this._loadWorkout();
    }
    _onWorkoutTextChange(e) {
        let workoutText = this.refs['workout_text'];
        let wp = new Model.TextPreprocessor(this.getSportType());
        workoutText.value = wp.process(workoutText.value);
        if (workoutText.value == "") {
            let workoutTitle = this.refs['workout_title'];
            workoutTitle.value = "";
        }
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
    componentDidMount() {
        this._enableCompatibleOutputUnits(this.props.sport_type);
    }
    render() {
        return (React.createElement("div", null,
            React.createElement("h1", null, " Workout Settings "),
            React.createElement("form", null,
                "Title: ",
                React.createElement("input", { ref: "workout_title", defaultValue: this.props.workout_title, onChange: e => this._onWorkoutTitleChange(e) }),
                React.createElement("br", null),
                "Sport type:",
                React.createElement(select_1.default, { ref: "sportType", defaultValue: this.props.sport_type, onChange: e => this._onSportTypeChange(e) },
                    React.createElement(select_option_1.default, { value: Model.SportType.Swim }, "Swim"),
                    React.createElement(select_option_1.default, { value: Model.SportType.Bike }, "Bike"),
                    React.createElement(select_option_1.default, { value: Model.SportType.Run }, "Run"),
                    React.createElement(select_option_1.default, { value: Model.SportType.Other }, "Other")),
                React.createElement("br", null),
                "Unit:",
                React.createElement(select_1.default, { ref: "unit", defaultValue: this.props.output_unit, onChange: e => this._onUnitChanged(e) },
                    React.createElement(select_option_1.default, { ref: "watts", value: Model.IntensityUnit.Watts }, "Watts"),
                    React.createElement(select_option_1.default, { ref: "minmi", value: Model.IntensityUnit.MinMi }, "min/mi"),
                    React.createElement(select_option_1.default, { ref: "mih", value: Model.IntensityUnit.Mph }, "mi/h"),
                    React.createElement(select_option_1.default, { ref: "minkm", value: Model.IntensityUnit.MinKm }, "min/km"),
                    React.createElement(select_option_1.default, { ref: "kmh", value: Model.IntensityUnit.Kmh }, "km/h"),
                    React.createElement(select_option_1.default, { ref: "if", value: Model.IntensityUnit.IF }, "IF"),
                    React.createElement(select_option_1.default, { ref: "yards", value: Model.IntensityUnit.Per100Yards }, "/100yards"),
                    React.createElement(select_option_1.default, { ref: "meters", value: Model.IntensityUnit.Per100Meters }, "/100m"),
                    React.createElement(select_option_1.default, { ref: "hr", value: Model.IntensityUnit.HeartRate }, "Heart rate"),
                    React.createElement(select_option_1.default, { ref: "per400m", value: Model.IntensityUnit.Per400Meters }, "/400m")),
                React.createElement("br", null),
                React.createElement("textarea", { ref: "workout_text", defaultValue: this.props.workout_text, style: { height: "200px", width: "100%" }, onChange: e => this._onWorkoutTextChange(e) }),
                React.createElement("br", null))));
    }
}
exports.default = WorkoutInput;
