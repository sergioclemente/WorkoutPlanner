/// <reference path="../type_definitions/react.d.ts" />
/// <reference path="../type_definitions/canvasjs.d.ts" />
/// <reference path="../type_definitions/fixed-data-table.d.ts" />
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
const React = require('react');
const fixed_data_table_1 = require('fixed-data-table');
const UI = require('../ui');
const Model = require('../model');
class CustomCell extends React.Component {
    render() {
        return (React.createElement(fixed_data_table_1.Cell, __assign({}, this.props), this.props.data[this.props.rowIndex][this.props.field]));
    }
}
class TitleCell extends React.Component {
    render() {
        var title = this.props.data[this.props.rowIndex][this.props.field];
        var link = this.props.data[this.props.rowIndex][this.props.link];
        return (React.createElement(fixed_data_table_1.Cell, __assign({}, this.props), 
            React.createElement("a", {href: link}, title)
        ));
    }
}
class SportTypeCell extends React.Component {
    render() {
        let sportType = this.props.data[this.props.rowIndex][this.props.field];
        let sportTypeString = Model.SportTypeHelper.convertToString(sportType);
        return (React.createElement(fixed_data_table_1.Cell, __assign({}, this.props), sportTypeString));
    }
}
class DurationCell extends React.Component {
    render() {
        let durationSec = this.props.data[this.props.rowIndex][this.props.field];
        let duration = new Model.Duration(Model.TimeUnit.Seconds, durationSec, durationSec, 0);
        return (React.createElement(fixed_data_table_1.Cell, __assign({}, this.props), duration.toStringShort()));
    }
}
class WorkoutViews extends React.Component {
    constructor(params) {
        super(params);
        this.state = this.getState(params);
        this._rows = [];
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ value: '' + nextProps.value });
    }
    componentDidMount() {
        // Put here which is guaranteed for the DOM tree to be created
        this._fetchWorkouts();
    }
    _fetchWorkouts() {
        var url = "/workouts";
        var req = new XMLHttpRequest();
        req.addEventListener("load", this._onWorkoutsLoaded.bind(this, req));
        req.open("GET", url);
        req.send();
    }
    _onWorkoutsLoaded(req) {
        if (req.status == 200) {
            this._rows = JSON.parse(req.responseText);
            for (let i = 0; i < this._rows.length; i++) {
                var params = new UI.QueryParams();
                params.workout_text = this._rows[i].value;
                params.workout_title = this._rows[i].title;
                this._rows[i].link = "/" + params.getURL();
                this._setExtraRowFields(params, i);
            }
            // force a re-render
            this.forceUpdate();
        }
        else {
            console.error("Error while shortening url");
        }
    }
    _setExtraRowFields(params, i) {
        // HACK: Lets override the output unit to IF since we want to get the IF
        params.output_unit = Model.IntensityUnit.IF.toString();
        let intervals = Model.IntervalParser.parse(new Model.ObjectFactory(params.createUserProfile(), this._rows[i].sport_type), params.workout_text);
        this._rows[i].if = intervals.getIntensity().toString();
        this._rows[i].tss = intervals.getTSS().toString();
    }
    getState(params) {
        return ({});
    }
    render() {
        return (React.createElement("div", null, 
            "Workouts", 
            React.createElement(fixed_data_table_1.Table, {ref: "tbl", rowsCount: this._rows.length, rowHeight: 50, headerHeight: 50, width: 1000, height: 800}, 
                React.createElement(fixed_data_table_1.Column, {header: React.createElement(fixed_data_table_1.Cell, null, "Sport Type"), cell: React.createElement(SportTypeCell, {data: this._rows, field: "sport_type"}, " "), width: 50}), 
                React.createElement(fixed_data_table_1.Column, {header: React.createElement(fixed_data_table_1.Cell, null, "Duration"), cell: React.createElement(DurationCell, {data: this._rows, field: "duration_sec"}, " "), width: 80}), 
                React.createElement(fixed_data_table_1.Column, {header: React.createElement(fixed_data_table_1.Cell, null, "IF"), cell: React.createElement(CustomCell, {data: this._rows, field: "if"}, " "), width: 60}), 
                React.createElement(fixed_data_table_1.Column, {header: React.createElement(fixed_data_table_1.Cell, null, "TSS"), cell: React.createElement(CustomCell, {data: this._rows, field: "tss"}, " "), width: 80}), 
                React.createElement(fixed_data_table_1.Column, {header: React.createElement(fixed_data_table_1.Cell, null, "Title"), cell: React.createElement(TitleCell, {data: this._rows, field: "title", link: "link"}, " "), width: 400}), 
                React.createElement(fixed_data_table_1.Column, {header: React.createElement(fixed_data_table_1.Cell, null, "Workout"), cell: React.createElement(CustomCell, {data: this._rows, field: "value"}, " "), width: 600}))));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WorkoutViews;
