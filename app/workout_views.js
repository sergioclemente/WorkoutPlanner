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
const select_1 = require('./select');
const select_option_1 = require('./select_option');
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
        return (React.createElement(fixed_data_table_1.Cell, __assign({}, this.props), duration.toStringShort(false)));
    }
}
class WorkoutViews extends React.Component {
    constructor(params) {
        super(params);
        this._rows = [];
        this.state = {
            filteredRows: this._rows,
        };
        this._params = new UI.QueryParamsList();
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
            var rows = JSON.parse(req.responseText);
            for (let i = 0; i < rows.length; i++) {
                var params = new UI.QueryParams();
                params.workout_text = rows[i].value;
                params.workout_title = rows[i].title;
                params.sport_type = rows[i].sport_type.toString();
                rows[i].link = "/" + params.getURL();
                if (params.validate()) {
                    this._setExtraRowFields(rows, params, i);
                }
            }
            this._rows = rows;
            // Check the ui parameters
            if (this._params.validate()) {
                this._onSportTypeChange(this._params.getSportType());
            }
            else {
                this.setState({ filteredRows: rows });
            }
            // force a re-render
            this.forceUpdate();
        }
        else {
            alert("Error while fetching workouts");
        }
    }
    _setExtraRowFields(rows, params, i) {
        console.assert(params.validate());
        // HACK: Lets override the output unit to IF since we want to get the IF
        params.output_unit = Model.IntensityUnit.IF.toString();
    }
    _onSportTypeChange(sportTypeStr) {
        var sportTypeEnum = parseInt(sportTypeStr);
        var filteredRows = [];
        // Nothing to be filtered if its unknown (All)
        if (sportTypeEnum != Model.SportType.Unknown) {
            for (let i = 0; i < this._rows.length; i++) {
                var row = this._rows[i];
                if (row.sport_type == sportTypeStr) {
                    filteredRows.push(row);
                }
            }
        }
        else {
            filteredRows = this._rows;
        }
        // Update the sport type (And url)
        this._params.setSportType(sportTypeStr);
        this.setState({ filteredRows: filteredRows });
    }
    render() {
        var { filteredRows } = this.state;
        return (React.createElement("div", null, 
            "Workouts", 
            React.createElement(select_1.default, {ref: "sportType", defaultValue: this.props.sport_type, onChange: e => this._onSportTypeChange(e)}, 
                React.createElement(select_option_1.default, {value: Model.SportType.Unknown}, "All"), 
                React.createElement(select_option_1.default, {value: Model.SportType.Swim}, "Swim"), 
                React.createElement(select_option_1.default, {value: Model.SportType.Bike}, "Bike"), 
                React.createElement(select_option_1.default, {value: Model.SportType.Run}, "Run"), 
                React.createElement(select_option_1.default, {value: Model.SportType.Other}, "Other")), 
            React.createElement(fixed_data_table_1.Table, {ref: "tbl", rowsCount: filteredRows.length, rowHeight: 50, headerHeight: 50, width: 900, height: 800}, 
                React.createElement(fixed_data_table_1.Column, {header: React.createElement(fixed_data_table_1.Cell, null, "Type"), cell: React.createElement(SportTypeCell, {data: filteredRows, field: "sport_type"}, " "), width: 100}), 
                React.createElement(fixed_data_table_1.Column, {header: React.createElement(fixed_data_table_1.Cell, null, "Duration"), cell: React.createElement(DurationCell, {data: filteredRows, field: "duration_sec"}, " "), width: 100}), 
                React.createElement(fixed_data_table_1.Column, {header: React.createElement(fixed_data_table_1.Cell, null, "TSS"), cell: React.createElement(CustomCell, {data: filteredRows, field: "tss"}, " "), width: 100}), 
                React.createElement(fixed_data_table_1.Column, {header: React.createElement(fixed_data_table_1.Cell, null, "Title"), cell: React.createElement(TitleCell, {data: filteredRows, field: "title", link: "link"}, " "), width: 400}), 
                React.createElement(fixed_data_table_1.Column, {header: React.createElement(fixed_data_table_1.Cell, null, "Tags"), cell: React.createElement(CustomCell, {data: filteredRows, field: "tags"}, " "), width: 200}))));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WorkoutViews;
