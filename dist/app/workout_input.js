"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Core = require("../core");
const PreProcessor = require("../preprocessor");
const UI = require("../ui");
const select_1 = require("./select");
const select_option_1 = require("./select_option");
class WorkoutInput extends React.Component {
    constructor(props) {
        super(props);
        let params = UI.QueryParamsWorkoutView.createCopy(props);
        this.sport_type = parseInt(params.sport_type.value);
        this.output_unit = parseInt(params.output_unit.value);
        this.workout_title = params.workout_title.value;
        this.workout_text = params.workout_text.value;
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
        if (sportTypeEnum == Core.SportType.Run) {
            selectUnit.setSelectedValue(Core.IntensityUnit.MinMi.toString());
        }
        else if (sportTypeEnum == Core.SportType.Bike) {
            selectUnit.setSelectedValue(Core.IntensityUnit.Watts.toString());
        }
        else if (sportTypeEnum == Core.SportType.Swim) {
            selectUnit.setSelectedValue(Core.IntensityUnit.Per100Yards.toString());
        }
        else {
            console.assert(sportTypeEnum == Core.SportType.Other);
            selectUnit.setSelectedValue(Core.IntensityUnit.IF.toString());
        }
        var units = ["yards", "meters", "watts", "if", "hr", "minmi", "mih", "minkm", "kmh", "hr", "per400m"];
        for (let idx in units) {
            let selectOption = this.refs[units[idx]];
            selectOption.setEnabled(false);
        }
        let map = {};
        map[Core.SportType.Swim.toString()] = ["watts", "yards", "meters"];
        map[Core.SportType.Bike.toString()] = ["watts", "if", "hr"];
        map[Core.SportType.Run.toString()] = ["minmi", "mih", "minkm", "kmh", "hr", "per400m"];
        map[Core.SportType.Other.toString()] = ["if", "hr"];
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
        let wp = new PreProcessor.TextPreprocessor(this.getSportType());
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
                React.createElement("input", { ref: "workout_title", defaultValue: this.workout_title, onChange: e => this._onWorkoutTitleChange(e) }),
                React.createElement("br", null),
                "Sport type:",
                React.createElement(select_1.default, { ref: "sportType", defaultValue: this.sport_type, onChange: e => this._onSportTypeChange(e) },
                    React.createElement(select_option_1.default, { value: Core.SportType.Swim }, "Swim"),
                    React.createElement(select_option_1.default, { value: Core.SportType.Bike }, "Bike"),
                    React.createElement(select_option_1.default, { value: Core.SportType.Run }, "Run"),
                    React.createElement(select_option_1.default, { value: Core.SportType.Other }, "Other")),
                React.createElement("br", null),
                "Unit:",
                React.createElement(select_1.default, { ref: "unit", defaultValue: this.output_unit, onChange: e => this._onUnitChanged(e) },
                    React.createElement(select_option_1.default, { ref: "watts", value: Core.IntensityUnit.Watts }, "Watts"),
                    React.createElement(select_option_1.default, { ref: "minmi", value: Core.IntensityUnit.MinMi }, "min/mi"),
                    React.createElement(select_option_1.default, { ref: "mih", value: Core.IntensityUnit.Mph }, "mi/h"),
                    React.createElement(select_option_1.default, { ref: "minkm", value: Core.IntensityUnit.MinKm }, "min/km"),
                    React.createElement(select_option_1.default, { ref: "kmh", value: Core.IntensityUnit.Kmh }, "km/h"),
                    React.createElement(select_option_1.default, { ref: "if", value: Core.IntensityUnit.IF }, "IF"),
                    React.createElement(select_option_1.default, { ref: "yards", value: Core.IntensityUnit.Per100Yards }, "/100yards"),
                    React.createElement(select_option_1.default, { ref: "meters", value: Core.IntensityUnit.Per100Meters }, "/100m"),
                    React.createElement(select_option_1.default, { ref: "hr", value: Core.IntensityUnit.HeartRate }, "Heart rate"),
                    React.createElement(select_option_1.default, { ref: "per400m", value: Core.IntensityUnit.Per400Meters }, "/400m")),
                React.createElement("br", null),
                React.createElement("textarea", { ref: "workout_text", defaultValue: this.workout_text, style: { height: "200px", width: "100%" }, onChange: e => this._onWorkoutTextChange(e) }),
                React.createElement("br", null))));
    }
}
exports.default = WorkoutInput;
