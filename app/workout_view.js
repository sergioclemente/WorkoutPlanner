/// <reference path="../type_definitions/react.d.ts" />
/// <reference path="../type_definitions/canvasjs.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var Model = require('../model');
var WorkoutView = (function (_super) {
    __extends(WorkoutView, _super);
    function WorkoutView(params) {
        _super.call(this, params);
        this.state = this.getState(params);
    }
    WorkoutView.prototype.componentWillReceiveProps = function (nextProps) {
        this.setState({ value: '' + nextProps.value });
    };
    WorkoutView.prototype.getState = function (params) {
        // TODO: Fix this clowny parseInt()
        var userProfile = new Model.UserProfile(parseInt(params.ftp_watts), params.t_pace, params.email);
        var builder = new Model.WorkoutBuilder(userProfile, parseInt(params.sport_type), parseInt(params.output_unit)).withDefinition(params.workout_text);
        var time_in_zones_data = builder.getInterval().getTimeInZones(builder.getSportType()).map(function (zone) {
            return {
                y: zone.duration.getSeconds(),
                legendText: zone.name + "(" + zone.duration.toString() + ")",
                indexLabel: zone.name
            };
        });
        var workout_steps = builder.getInterval().getIntervals().map(function (value, index) {
            return builder.getIntervalPretty(value);
        }.bind(this));
        return ({
            tss: builder.getTSS(),
            time: builder.getTimePretty(),
            intensity: builder.getIF(),
            avg_power: builder.getAveragePower(),
            sport_type: builder.getSportType(),
            time_series_data: builder.getInterval().getTimeSeries(),
            time_in_zones_data: time_in_zones_data,
            workout_steps: workout_steps,
        });
    };
    WorkoutView.prototype.refresh = function (params) {
        var new_state = this.getState(params);
        this.setState(new_state);
        // charts is outside react world, lets pass in the state as the update is done asynchronously
        this.renderCharts(new_state);
    };
    WorkoutView.prototype.renderPower = function () {
        if (this.state.sport_type == Model.SportType.Bike) {
            return (React.createElement("tr", null, React.createElement("td", null, "Average Power"), React.createElement("td", null, this.state.avg_power, "w")));
        }
        else {
            return;
        }
    };
    WorkoutView.prototype.renderWorkoutSteps = function () {
        return this.state.workout_steps.map(function (step, index) {
            return React.createElement("li", {"key": index}, step);
        }.bind(this));
    };
    WorkoutView.prototype.componentDidMount = function () {
        // Put here which is guaranteed for the DOM tree to be created
        this.renderCharts(this.state);
    };
    WorkoutView.prototype.renderCharts = function (state) {
        // Timeline chart
        var chartTimeline = new CanvasJS.Chart("chartTimeline", {
            title: {
                text: ""
            },
            axisX: {
                title: "time",
                suffix: "min",
                gridColor: "lightgray",
                gridThickness: 1,
            },
            axisY: {
                title: "intensity",
                labelAngle: 45,
                minimum: 45,
                suffix: "%",
                gridThickness: 0,
            },
            data: [{
                    type: "area",
                    fillOpacity: 0.3,
                    markerType: "none",
                    dataPoints: state.time_series_data
                }]
        });
        chartTimeline.render();
        // Zones chart
        var chartZones = new CanvasJS.Chart("chartZones", {
            title: {
                text: "Time in zones"
            },
            data: [{
                    type: "pie",
                    showInLegend: true,
                    dataPoints: state.time_in_zones_data
                }]
        });
        chartZones.render();
    };
    WorkoutView.prototype.render = function () {
        return (React.createElement("div", null, React.createElement("h2", null, "Steps"), React.createElement("ul", null, this.renderWorkoutSteps()), React.createElement("h2", null, "Summary"), React.createElement("table", null, React.createElement("tbody", null, React.createElement("tr", null, React.createElement("td", null, React.createElement("b", null, "Metric")), React.createElement("td", null, React.createElement("b", null, "Value"))), React.createElement("tr", null, React.createElement("td", null, "TSS"), React.createElement("td", null, this.state.tss)), React.createElement("tr", null, React.createElement("td", null, "Time"), React.createElement("td", null, this.state.time)), React.createElement("tr", null, React.createElement("td", null, "IF"), React.createElement("td", null, this.state.intensity)), this.renderPower())), React.createElement("div", {"id": "chartTimeline", "style": { height: "300px", width: "100%" }}), React.createElement("div", {"id": "chartZones", "style": { height: "200px", width: "100%" }})));
    };
    return WorkoutView;
})(React.Component);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WorkoutView;
