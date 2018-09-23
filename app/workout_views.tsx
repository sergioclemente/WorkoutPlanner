/// <reference path="../node_modules/@types/fixed-data-table/index.d.ts" />
/// <reference path="../type_definitions/canvasjs.d.ts" />

import * as React from 'react';
import { Table, Column, Cell } from 'fixed-data-table';
import Select from './select';
import SelectOption from './select_option';
import * as UI from '../ui';
import * as Model from '../model';

class TitleCell extends React.Component<any, any> {
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

class SportTypeCell extends React.Component<any, any> {
	render() {
		let sportType: Model.SportType = this.props.data[this.props.rowIndex][this.props.field];
		let sportTypeString: string = Model.SportTypeHelper.convertToString(sportType);
		return (
			<Cell {...this.props}>
				{sportTypeString}
			</Cell>
		);
	}
}

class TagsCell extends React.Component<any, any> {
	render() {
		var tags : Set<string> = this.props.data[this.props.rowIndex][this.props.field];
		var tags_string = "";
		var prefix = "";
		tags.forEach((v : string) => {
			tags_string += prefix + v;
			prefix = ", ";
		});
		return (
			<Cell {...this.props}>
				{tags_string}
			</Cell>
		);
	}
}

class DurationCell extends React.Component<any, any> {
	render() {
		let duration_sec = this.props.data[this.props.rowIndex][this.props.field];
		let duration = new Model.Duration(Model.TimeUnit.Seconds, duration_sec, duration_sec, 0);
		let time_component = duration.getTimeComponents();
		let format_str = "";
		// Do even a shorter version of duration.toStringShort().
		if (time_component.hours > 0) {
			format_str = Model.MyMath.round10(time_component.hours + time_component.minutes/60.0, -1) + "hr"
		} else {
			format_str = time_component.minutes + "min";
		}
		return (
			<Cell {...this.props}>
				{format_str}
			</Cell>
		);
	}
}

export default class WorkoutViews extends React.Component<any, any> {
	private _rows: any;
	private _global_tags: Set<string>;
	private _params: UI.QueryParamsList;

	constructor(params: any) {
		super(params);

		this._rows = [];
		this._global_tags = new Set<string>();
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
		var url = "workouts";

		var req = new XMLHttpRequest();
		req.addEventListener("load", this._onWorkoutsLoaded.bind(this, req));
		req.open("GET", url);
		req.send();
	}

	_onWorkoutsLoaded(req: XMLHttpRequest) {
		if (req.status == 200) {
			var rows = JSON.parse(req.responseText);

			for (let i = 0; i < rows.length; i++) {
				let params = new UI.QueryParams();
				params.workout_text = rows[i].value;
				params.workout_title = rows[i].title;
				params.sport_type = rows[i].sport_type.toString();
				params.page = "wv";
				// Tags are separated by comma. e.g. speed, awc
				let tags_array = rows[i].tags.split(",").map(x => x.trim());
				for (let j = 0; j < tags_array.length; j++) {
					if (tags_array[j].length > 0) {
						this._global_tags.add(tags_array[j]);
					}
				}
				rows[i].tags = new Set(tags_array);
				rows[i].link = params.getURL();
			}

			this._rows = rows;

			// filter initially.
			this._filterData();

			// force a re-render
			this.forceUpdate();
		} else {
			alert("Error while fetching workouts");
		}
	}

	_onSportTypeChange(sportTypeStr: string) {
		this._filterData();
	}

	_onTextFilterChange(e: React.ChangeEvent<HTMLInputElement>) {
		this._filterData();
	}

	_filterData() {
		let sportTypeComp: Select = this.refs["sportType"] as Select;
		let filterTextComp: HTMLInputElement = this.refs["text"] as HTMLInputElement;

		var sportTypeEnum: Model.SportType = parseInt(sportTypeComp.getSelectedValue());
		var filterText = filterTextComp.value;
		var filteredRows = [];

		// I am not a UI guy, so lets do things a bit implict here. If the user types
		// something that matches the global tags, then we use the tags for filtering
		// otherwise we simply filter on the title.
		var shouldIncludeInResult : (row: any) => boolean;
		if (filterText.length == 0) {
			// Lets include all results.
			shouldIncludeInResult = () : boolean => { return true; }
		} else if (this._global_tags.has(filterText)) {
			// Lets filter by tag.
			shouldIncludeInResult = (row: any) : boolean => {
				return row.tags.has(filterText.toLowerCase());
			}
		} else {
			// Lets filter by title.
			shouldIncludeInResult = (row: any) : boolean => {
				return row.title.toLowerCase().indexOf(filterText.toLowerCase()) >= 0;
			}
		}

		for (let i = 0; i < this._rows.length; i++) {
			var row = this._rows[i];
			if ((sportTypeEnum == Model.SportType.Unknown || row.sport_type == sportTypeEnum)
				&& shouldIncludeInResult(row)) {
				filteredRows.push(row);
			}
		}

		// Update the sport type (And url)
		this._params.setSportType(sportTypeEnum.toString());
		this._params.setTitle(filterText);
		this._params.pushToHistory();


		this.setState({ filteredRows: filteredRows });
	}

	render() {

		var { filteredRows } = this.state;
		return (<div>Workouts
			<Select ref="sportType" defaultValue={this.props.sport_type} onChange={e => this._onSportTypeChange(e)}>
				<SelectOption value={Model.SportType.Unknown}>All</SelectOption>
				<SelectOption value={Model.SportType.Swim}>Swim</SelectOption>
				<SelectOption value={Model.SportType.Bike}>Bike</SelectOption>
				<SelectOption value={Model.SportType.Run}>Run</SelectOption>
				<SelectOption value={Model.SportType.Other}>Other</SelectOption>
			</Select> <br />
			Filter: <input ref="text" value={this._params.getTitle()} onChange={e => this._onTextFilterChange(e)}></input>
			<Table
				ref="tbl"
				rowsCount={filteredRows.length}
				rowHeight={50}
				headerHeight={50}
				width={900}
				height={800}>
				<Column
					header={<Cell>Type</Cell>}
					cell={<SportTypeCell data={filteredRows} field="sport_type"> </SportTypeCell>}
					width={60}
				/>
				<Column
					header={<Cell>Title</Cell>}
					cell={<TitleCell data={filteredRows} field="title" link="link"> </TitleCell>}
					width={300}
				/>
				<Column
					header={<Cell>Duration</Cell>}
					cell={<DurationCell data={filteredRows} field="duration_sec"> </DurationCell>}
					width={80}
				/>
				<Column
					header={<Cell>Tags</Cell>}
					cell={<TagsCell data={filteredRows} field="tags"> </TagsCell>}
					width={200}
				/>
			</Table>
		</div>);
	}
}
