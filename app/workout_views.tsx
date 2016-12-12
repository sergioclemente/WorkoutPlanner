/// <reference path="../type_definitions/react.d.ts" />
/// <reference path="../type_definitions/canvasjs.d.ts" />
/// <reference path="../type_definitions/fixed-data-table.d.ts" />

import * as React from 'react';
import {Table, Column, Cell} from 'fixed-data-table';
import * as UI from '../ui';
import * as Model from '../model';

class CustomCell extends React.Component<any,any> {
  render() {
    return (
      <Cell {...this.props}>
        {this.props.data[this.props.rowIndex][this.props.field]}
      </Cell>
    );
  }
}

class TitleCell extends React.Component<any,any> {
  render() {
	var title = this.props.data[this.props.rowIndex][this.props.field];
	var link = this.props.data[this.props.rowIndex][this.props.link];
    return (
      <Cell {...this.props}>
        <a href={link}>{title}</a>
      </Cell>
    );
  }
}

class SportTypeCell extends React.Component<any,any> {
  render() {
	let sportType : Model.SportType = this.props.data[this.props.rowIndex][this.props.field];
    let sportTypeString : string = Model.SportTypeHelper.convertToString(sportType);
	return (
      <Cell {...this.props}>
        {sportTypeString}
      </Cell>
    );
  }
}

class DurationCell extends React.Component<any,any> {
  render() {
	let durationSec = this.props.data[this.props.rowIndex][this.props.field];
	let duration = new Model.Duration(Model.TimeUnit.Seconds, durationSec, durationSec, 0);
    return (
      <Cell {...this.props}>
        {duration.toStringShort()}
      </Cell>
    );
  }
}

export default class WorkoutViews extends React.Component<any, any> {
	private _rows : any;

	constructor(params: any) {
		super(params);

		this.state = this.getState(params);
		this._rows = [];
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ value: '' + nextProps.value })
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

	_onWorkoutsLoaded(req : XMLHttpRequest) {
		if (req.status == 200) {
			this._rows = JSON.parse(req.responseText);

			for (let i = 0 ; i < this._rows.length; i++) {
				var params = new UI.QueryParams();
				params.workout_text = this._rows[i].value;
				params.workout_title =  this._rows[i].title;
				this._rows[i].link = "/" + params.getURL();
				this._setExtraRowFields(params, i);
			}

			// force a re-render
			this.forceUpdate();
		} else {
			console.error("Error while shortening url");
		}
	}

	_setExtraRowFields(params : UI.QueryParams, i : number) : void {
			// HACK: Lets override the output unit to IF since we want to get the IF
			params.output_unit = Model.IntensityUnit.IF.toString();
			let intervals = Model.IntervalParser.parse(
				new Model.ObjectFactory(params.createUserProfile(), this._rows[i].sport_type),
				params.workout_text
			);
			this._rows[i].if = intervals.getIntensity().toString();
			this._rows[i].tss = intervals.getTSS().toString();
	}

	getState(params: UI.QueryParams) : any {
        return (
            {
            }
        );
	}


	render() {
		return (<div>Workouts
			<Table
				ref="tbl"
				rowsCount={this._rows.length}
				rowHeight={50}
				headerHeight={50}
				width={1000}
				height={800}>
				<Column
					header={<Cell>Sport Type</Cell>}
					cell={<SportTypeCell data={this._rows} field="sport_type"> </SportTypeCell>}
					width={50}
				/>
				<Column
					header={<Cell>Duration</Cell>}
					cell={<DurationCell data={this._rows} field="duration_sec"> </DurationCell>}
					width={80}
				/>
				<Column
					header={<Cell>IF</Cell>}
					cell={<CustomCell data={this._rows} field="if"> </CustomCell>}
					width={60}
				/>		
				<Column
					header={<Cell>TSS</Cell>}
					cell={<CustomCell data={this._rows} field="tss"> </CustomCell>}
					width={80}
				/>									
				<Column
					header={<Cell>Title</Cell>}
					cell={<TitleCell data={this._rows} field="title" link="link"> </TitleCell>}
					width={400}
				/>
				<Column
					header={<Cell>Workout</Cell>}
					cell={<CustomCell data={this._rows} field="value"> </CustomCell>}
					width={600}
				/>
			</Table>
				</div>);
	}
}
