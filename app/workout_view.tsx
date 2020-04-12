/// <reference path="../type_definitions/canvasjs.d.ts" />

import * as React from 'react';
import * as UI from '../ui';
import * as Core from '../core';
import * as Visitor from '../visitor';

export default class WorkoutView extends React.Component<any, any> {
	constructor(params: any) {
		super(params);

		this.state = this.getState(UI.QueryParams.createCopy(params));
	}

	// TODO: Clean this dupe
	getTimeInZones(sportType: Core.SportType, intervals: Core.Interval) {
		var zv = new Visitor.ZonesVisitor(sportType);
		Visitor.VisitorHelper.visitAndFinalize(zv, intervals);
		return zv.getTimeInZones();
	}

	getTimeSeries(intervals: Core.Interval): any {
		var pv = new Visitor.DataPointVisitor();

		Visitor.VisitorHelper.visitAndFinalize(pv, intervals);

		// - Massaging the time component
		var list = pv.data.map(function (item) {
			return {
				x: item.x.getSeconds() / 60,
				y: Math.round(item.y.getValue() * 100),
				tag: item.tag
			}
		});

		// Separate into one list per tag
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
					tagToPoints[item.tag].push({ x: item.x, y: 0 })
				}
			}
			tagToPoints[item.tag].push(item);
			lastItemTag = item.tag;
		}

		return tagToPoints;
	}

	getState(params: UI.QueryParams): any {
		try {
			var builder = params.createWorkoutBuilder();

			var time_in_zones_data = this.getTimeInZones(builder.getSportType(), builder.getInterval()).map(
				function (zone) {
					return {
						y: zone.duration.getSeconds(),
						legendText: zone.name + "(" + zone.duration.toString() + ")",
						indexLabel: zone.name
					}
				}
			);

			var workout_steps = builder.getInterval().getIntervals().map(function (value: Core.Interval, index: number) {
				return builder.getIntervalPretty(value, params.should_round == "true");
			}.bind(this));

			var avg_pace = builder.getSportType() == Core.SportType.Run ?
				builder.getAveragePace() : "";

			return (
				{
					tss: builder.getTSS(),
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
				}
			);
		} catch (err) {
			console.log("error:" + err.message);
			return (
				{
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
				}
			);
		}
	}

	refresh(params: UI.QueryParams) {
		var new_state = this.getState(params);

		this.setState(
			new_state
		);

		// charts is outside react world, lets pass in the state as the update is done asynchronously
		this.renderCharts(new_state);
	}

	renderPower() {
		if (this.state.sport_type == Core.SportType.Bike) {
			return (<tr>
				<td>Average Power</td>
				<td>{this.state.avg_power}</td>
			</tr>);
		} else {
			return null;
		}
	}

	renderDistance() {
		return (<tr>
			<td>Distance</td>
			<td>{this.state.distance}</td>
		</tr>);
	}

	renderPace() {
		if (this.state.sport_type == Core.SportType.Run) {
			return (<tr>
				<td>Pace</td>
				<td>{this.state.avg_pace}</td>
			</tr>);
		} else {
			return null;
		}
	}

	renderWorkoutSteps() {
		return this.state.workout_steps.map(function (step: string, index: number) {
			return <li key={index}>{step}</li>;
		}.bind(this));
	}

	componentDidMount() {
		// Put here which is guaranteed for the DOM tree to be created
		this.renderCharts(this.state);

		document.getElementById("id_clipboard").addEventListener('click', function () {
			UI.ClipboardHelper.copyText(this.state.workout_pretty);
		}.bind(this));
	}

	getChartData(state: any) {
		var result = [];

		for (let key in state.time_series_data) {
			result.push(
				{
					type: "area",
					fillOpacity: 0.3,
					markerType: "none",
					dataPoints: state.time_series_data[key]
				}
			);
		}

		return result;
	}

	renderCharts(state: any) {
		// Timeline chart
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
					minimum: 40,
					suffix: "%",
					gridThickness: 0,
				},
				data: this.getChartData(state)
			});

			chartTimeline.render();
		}

		// Zones chart
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
		return (<div>
			<h2>Steps</h2>
			<ul>
				{this.renderWorkoutSteps()}
			</ul>
			<h2>Summary</h2>
			<button id="id_clipboard">Copy to clipboard</button>
			<table>
				<tbody>
					<tr>
						<td><b>Metric</b></td>
						<td><b>Value</b></td>
					</tr>
					<tr>
						<td>TSS</td>
						<td>{this.state.tss}</td>
					</tr>
					<tr>
						<td>TSS&reg;</td>
						<td>{this.state.tss_from_if}</td>
					</tr>
					<tr>
						<td>Time</td>
						<td>{this.state.time}</td>
					</tr>
					<tr>
						<td>IF</td>
						<td>{this.state.intensity}</td>
					</tr>
					{this.renderPower()}
					{this.renderDistance()}
					{this.renderPace()}
				</tbody>
			</table>
			<div id="chartTimeline" style={{ height: "300px", width: "100%" }}>
			</div>
			<div id="chartZones" style={{ height: "200px", width: "100%" }}>
			</div>
		</div>);
	}
}
