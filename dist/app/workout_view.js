"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const UI = require("../ui");
const Core = require("../core");
const Visitor = require("../visitor");
class WorkoutView extends React.Component {
    constructor(params) {
        super(params);
        this.state = this.getState(UI.QueryParams.createCopy(params));
    }
    getTimeInZones(sportType, intervals) {
        var zv = new Visitor.ZonesVisitor(sportType);
        Visitor.VisitorHelper.visitAndFinalize(zv, intervals);
        return zv.getTimeInZones();
    }
    getTimeSeries(intervals) {
        var pv = new Visitor.DataPointVisitor();
        Visitor.VisitorHelper.visitAndFinalize(pv, intervals);
        var list = pv.data.map(function (item) {
            let duration = item.x;
            let intensity = item.y;
            let y = intensity.getValue();
            if (Core.Intensity.equals(intensity, Core.Intensity.ZeroIntensity)) {
                y = 0.4;
            }
            return {
                x: duration.getSeconds() / 60,
                y: Math.round(y * 100),
                tag: item.tag
            };
        });
        var tagToPoints = {};
        var lastItemTag = null;
        for (let i = 0; i < list.length; ++i) {
            let item = list[i];
            if (tagToPoints[item.tag] == null) {
                tagToPoints[item.tag] = [];
            }
            if (lastItemTag != null) {
                if (item.tag != lastItemTag) {
                    tagToPoints[lastItemTag].push({ x: item.x, y: 0 });
                    tagToPoints[item.tag].push({ x: item.x, y: 0 });
                }
            }
            tagToPoints[item.tag].push(item);
            lastItemTag = item.tag;
        }
        return tagToPoints;
    }
    getState(params) {
        try {
            var builder = params.createWorkoutBuilder();
            var time_in_zones_data = this.getTimeInZones(builder.getSportType(), builder.getInterval()).map(function (zone) {
                return {
                    y: zone.duration.getSeconds(),
                    legendText: zone.name + "(" + zone.duration.toString() + ")",
                    indexLabel: zone.name
                };
            });
            var workout_steps = builder.getInterval().getIntervals().map(function (value, index) {
                return builder.getIntervalPretty(value, params.should_round == "true");
            }.bind(this));
            var avg_pace = builder.getSportType() == Core.SportType.Run ?
                builder.getAveragePace() : "";
            return ({
                tss_from_if: builder.getTSS2(),
                time: builder.getTimePretty(),
                intensity: builder.getIF(),
                avg_power: builder.getAveragePower(),
                distance: builder.getEstimatedDistancePretty(),
                avg_pace: avg_pace,
                sport_type: builder.getSportType(),
                time_series_data: this.getTimeSeries(builder.getInterval()),
                time_in_zones_data: time_in_zones_data,
                workout_steps: workout_steps,
                workout_pretty: builder.getPrettyPrint(),
                workout_text: params.workout_text,
            });
        }
        catch (err) {
            console.log("error:" + err.message);
            return ({
                tss: 0,
                tss_from_if: 0,
                time: "",
                intensity: 0,
                avg_power: 0,
                distance: "",
                avg_pace: "",
                sport_type: Core.SportType.Bike,
                time_series_data: [],
                time_in_zones_data: [],
                workout_steps: [],
                workout_pretty: "",
                workout_text: "",
            });
        }
    }
    refresh(params) {
        var new_state = this.getState(params);
        this.setState(new_state);
        this.renderCharts(new_state);
    }
    renderPower() {
        if (this.state.sport_type == Core.SportType.Bike) {
            return (React.createElement("tr", null,
                React.createElement("td", null, "Average Power"),
                React.createElement("td", null, this.state.avg_power)));
        }
        else {
            return null;
        }
    }
    renderDistance() {
        return (React.createElement("tr", null,
            React.createElement("td", null, "Distance"),
            React.createElement("td", null, this.state.distance)));
    }
    renderPace() {
        if (this.state.sport_type == Core.SportType.Run) {
            return (React.createElement("tr", null,
                React.createElement("td", null, "Pace"),
                React.createElement("td", null, this.state.avg_pace)));
        }
        else {
            return null;
        }
    }
    renderWorkoutSteps() {
        return this.state.workout_steps.map(function (step, index) {
            return React.createElement("li", { key: index }, step);
        }.bind(this));
    }
    componentDidMount() {
        this.renderCharts(this.state);
        document.getElementById("id_clipboard").addEventListener('click', function () {
            UI.ClipboardHelper.copyText(this.state.workout_pretty);
        }.bind(this));
    }
    getChartData(state) {
        var result = [];
        for (let key in state.time_series_data) {
            result.push({
                type: "area",
                fillOpacity: 0.3,
                markerType: "none",
                bevelEnabled: true,
                dataPoints: state.time_series_data[key]
            });
        }
        return result;
    }
    renderCharts(state) {
        if (state.time_series_data.length != 0) {
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
                    minimum: 30,
                    suffix: "%",
                    gridThickness: 0,
                },
                data: this.getChartData(state)
            });
            chartTimeline.render();
        }
        if (state.time_in_zones_data.length != 0) {
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
        }
    }
    render() {
        return (React.createElement("div", null,
            React.createElement("h2", null, "Steps"),
            React.createElement("ul", null, this.renderWorkoutSteps()),
            React.createElement("h2", null, "Summary"),
            React.createElement("button", { id: "id_clipboard" }, "Copy to clipboard"),
            React.createElement("table", null,
                React.createElement("tbody", null,
                    React.createElement("tr", null,
                        React.createElement("td", null,
                            React.createElement("b", null, "Metric")),
                        React.createElement("td", null,
                            React.createElement("b", null, "Value"))),
                    React.createElement("tr", null,
                        React.createElement("td", null, "TSS\u00AE"),
                        React.createElement("td", null, this.state.tss_from_if)),
                    React.createElement("tr", null,
                        React.createElement("td", null, "Time"),
                        React.createElement("td", null, this.state.time)),
                    React.createElement("tr", null,
                        React.createElement("td", null, "IF"),
                        React.createElement("td", null, this.state.intensity)),
                    this.renderPower(),
                    this.renderDistance(),
                    this.renderPace())),
            React.createElement("div", { id: "chartTimeline", style: { height: "300px", width: "100%" } }),
            React.createElement("div", { id: "chartZones", style: { height: "200px", width: "100%" } })));
    }
}
exports.default = WorkoutView;
