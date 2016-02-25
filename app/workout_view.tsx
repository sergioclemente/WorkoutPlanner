/// <reference path="../type_definitions/react.d.ts" />
/// <reference path="../type_definitions/canvasjs.d.ts" />

import * as React from 'react';
import * as UI from '../ui';
import * as Model from '../model';

export default class WorkoutView extends React.Component<any, any> {
	constructor(params: any) {
		super(params);

		this.state = this.getState(params);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ value: '' + nextProps.value })
	}

	getState(params: UI.QueryParams) {
		// TODO: Fix this clowny parseInt()
		var userProfile = new Model.UserProfile(parseInt(params.ftp_watts), params.t_pace, params.email);
		var builder = new Model.WorkoutBuilder(
			userProfile, parseInt(params.sport_type), parseInt(params.output_unit)).withDefinition(params.workout_text);


		var time_in_zones_data = builder.getInterval().getTimeInZones(builder.getSportType()).map(
			function(zone) {
				return {
					y: zone.duration.getSeconds(),
					legendText: zone.name + "(" + zone.duration.toString() + ")",
					indexLabel: zone.name
				}
			}
		);

		var workout_steps = builder.getInterval().getIntervals().map(function(value: Model.Interval, index: number) {
			return builder.getIntervalPretty(value);
		}.bind(this));

		return (
			{
				tss: builder.getTSS(),
				time: builder.getTimePretty(),
				intensity: builder.getIF(),
				avg_power: builder.getAveragePower(),
				sport_type: builder.getSportType(),
				time_series_data: builder.getInterval().getTimeSeries(),
				time_in_zones_data: time_in_zones_data,
				workout_steps: workout_steps,
			}
		);
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
		if (this.state.sport_type == Model.SportType.Bike) {
			return (<tr>
						<td>Average Power</td>
						<td>{this.state.avg_power}w</td>
					</tr>);
		} else {
			return;
		}
	}

	renderWorkoutSteps() {
		return this.state.workout_steps.map(function(step: string, index: number) {
			return <li key={index}>{step}</li>;
		}.bind(this));
	}

	componentDidMount() {
		// Put here which is guaranteed for the DOM tree to be created
		this.renderCharts(this.state);
	}

	renderCharts(state: any) {
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
	}

	render() {
		return (<div>
					<h2>Steps</h2>
					<ul>
						{this.renderWorkoutSteps()}
					</ul>
					<h2>Summary</h2>
					<table>
						<tbody>
							<tr>
								<td><b>Metric</b></td>
								<td><b>Value</b></td>
								</tr>
							<tr>
								<td>TSS</td>
								<td>{this.state.tss }</td>
							</tr>
							<tr>
								<td>Time</td>
								<td>{this.state.time }</td>
							</tr>
							<tr>
								<td>IF</td>
								<td>{this.state.intensity }</td>
							</tr>
							{ this.renderPower() }
						</tbody>
					</table>
					<div id="chartTimeline" style={{ height: "300px", width: "100%" }}>
					</div>
					<div id="chartZones" style={{ height: "200px", width: "100%" }}>
					</div>
				</div>);
	}
}
