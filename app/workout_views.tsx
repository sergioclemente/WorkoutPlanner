/// <reference path="../type_definitions/react.d.ts" />
/// <reference path="../type_definitions/canvasjs.d.ts" />
/// <reference path="../type_definitions/fixed-data-table.d.ts" />

import * as React from 'react';
import {Table, Column, Cell} from 'fixed-data-table';
import Select from './select';
import SelectOption from './select_option';
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

		this._rows = [];
		this.state = {
			filteredRows: this._rows,
		};
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
			var rows = JSON.parse(req.responseText);

			for (let i = 0 ; i < rows.length; i++) {
				var params = new UI.QueryParams();
				params.workout_text = rows[i].value;
				params.workout_title =  rows[i].title;
				params.sport_type = rows[i].sport_type.toString();
				rows[i].link = "/" + params.getURL();
				this._setExtraRowFields(rows, params, i);
			}

			this._rows = rows;
			this.setState({filteredRows: rows});

			// force a re-render
			this.forceUpdate();
		} else {
			alert("Error while fetching workouts");
		}
	}

	_setExtraRowFields(rows: any, params : UI.QueryParams, i : number) : void {
			// HACK: Lets override the output unit to IF since we want to get the IF
			params.output_unit = Model.IntensityUnit.IF.toString();
			let intervals = Model.IntervalParser.parse(
				new Model.ObjectFactory(params.createUserProfile(), rows[i].sport_type),
				params.workout_text
			);
			rows[i].if = intervals.getIntensity().toString();
			rows[i].tss = intervals.getTSS().toString();
	}

	_onSportTypeChange(sport_type_str) {
		var sportTypeEnum: Model.SportType = parseInt(sport_type_str);
		var filteredRows = [];

		// nothing to be filtered if its unknown (All)
		if (sportTypeEnum != Model.SportType.Unknown) {
			for (let i = 0 ; i < this._rows.length; i++) {
				var row = this._rows[i];
				if (row.sport_type == sport_type_str) {
					filteredRows.push(row);
				}
			}
		} else {
			filteredRows = this._rows;
		}

		this.setState({filteredRows: filteredRows});
	}

	render() {

		var {filteredRows} = this.state;
		return (<div>Workouts
			<Select ref="sportType" defaultValue={this.props.sport_type} onChange={e => this._onSportTypeChange(e) }>
				<SelectOption value={Model.SportType.Unknown}>All</SelectOption>
				<SelectOption value={Model.SportType.Swim}>Swim</SelectOption>
				<SelectOption value={Model.SportType.Bike}>Bike</SelectOption>
				<SelectOption value={Model.SportType.Run}>Run</SelectOption>
				<SelectOption value={Model.SportType.Other}>Other</SelectOption>
			</Select>
			<Table
				ref="tbl"
				rowsCount={filteredRows.length}
				rowHeight={50}
				headerHeight={50}
				width={1000}
				height={800}>
				<Column
					header={<Cell>Type</Cell>}
					cell={<SportTypeCell data={filteredRows} field="sport_type"> </SportTypeCell>}
					width={50}
				/>
				<Column
					header={<Cell>IF</Cell>}
					cell={<CustomCell data={filteredRows} field="if"> </CustomCell>}
					width={60}
				/>
				<Column
					header={<Cell>Duration</Cell>}
					cell={<DurationCell data={filteredRows} field="duration_sec"> </DurationCell>}
					width={80}
				/>						
				<Column
					header={<Cell>TSS</Cell>}
					cell={<CustomCell data={filteredRows} field="tss"> </CustomCell>}
					width={70}
				/>									
				<Column
					header={<Cell>Title</Cell>}
					cell={<TitleCell data={filteredRows} field="title" link="link"> </TitleCell>}
					width={300}
				/>
				<Column
					header={<Cell>Workout</Cell>}
					cell={<CustomCell data={filteredRows} field="value"> </CustomCell>}
					width={800}
				/>
			</Table>
				</div>);
	}
}
