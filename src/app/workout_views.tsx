import * as React from 'react';
import { Table, Column, Cell } from 'fixed-data-table-2';
import Select from './select';
import SelectOption from './select_option';
import * as UI from '../ui';
import * as Core from '../core';

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
		let sportType: Core.SportType = this.props.data[this.props.rowIndex][this.props.field];
		let sportTypeString: string = UI.SportTypeHelper.convertToString(sportType);
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
		let duration = new Core.Duration(Core.TimeUnit.Seconds, duration_sec, duration_sec, 0);
		let time_component = duration.getTimeComponents();
		let format_str = "";
		// Do even a shorter version of duration.toStringShort().
		if (time_component.hours > 0) {
			format_str = Core.MyMath.round10(time_component.hours + time_component.minutes/60.0, -1) + "hr"
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

class DeleteCell extends React.Component<any, any> {
	render() {
		const workoutId = this.props.data[this.props.rowIndex][this.props.field];
		const onDelete = this.props.onDelete;
		return (
			<Cell {...this.props}>
				<button onClick={(e) => { e.preventDefault(); if (typeof onDelete === 'function') { onDelete(workoutId); } }}>Delete</button>
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
				let params = new UI.QueryParamsWorkoutView();
				params.workout_text.value = rows[i].value;
				params.workout_title.value = rows[i].title;
				params.sport_type.value = rows[i].sport_type.toString();
				params.workout_id.value = rows[i].id != null ? rows[i].id.toString() : "";
				params.page.value = "wv";
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

		var sportTypeEnum: Core.SportType = parseInt(sportTypeComp.getSelectedValue());
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
			if ((sportTypeEnum == Core.SportType.Unknown || row.sport_type == sportTypeEnum)
				&& shouldIncludeInResult(row)) {
				filteredRows.push(row);
			}
		}

		// Update the sport type (And url)
		this._params.sport_type.value = sportTypeEnum.toString();
		this._params.title.value = filterText;
		this._params.pushToHistory();


		this.setState({ filteredRows: filteredRows });
	}

	_onDeleteWorkout(workoutId: number) {
		if (workoutId == null || isNaN(workoutId)) {
			return;
		}
		if (!confirm("Delete this workout?")) {
			return;
		}

		var req = new XMLHttpRequest();
		req.addEventListener("load", this._onWorkoutDeleted.bind(this, req, workoutId));
		req.open("DELETE", "delete_workout?wid=" + encodeURIComponent(workoutId.toString()));
		req.send();
	}

	_onWorkoutDeleted(req: XMLHttpRequest, workoutId: number) {
		if (req.status == 200) {
			this._rows = this._rows.filter(row => row.id !== workoutId);
			this._filterData();
		} else {
			alert("Error while deleting workout");
		}
	}

	render() {

		var { filteredRows } = this.state;
		return (<div>Workouts
			<Select ref="sportType" defaultValue={this.props.sport_type} onChange={e => this._onSportTypeChange(e)}>
				<SelectOption value={Core.SportType.Unknown}>All</SelectOption>
				<SelectOption value={Core.SportType.Swim}>Swim</SelectOption>
				<SelectOption value={Core.SportType.Bike}>Bike</SelectOption>
				<SelectOption value={Core.SportType.Run}>Run</SelectOption>
				<SelectOption value={Core.SportType.Other}>Other</SelectOption>
			</Select> <br />
			Filter: <input ref="text" value={this._params.title.value} onChange={e => this._onTextFilterChange(e)}></input>
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
				<Column
					header={<Cell>Actions</Cell>}
					cell={<DeleteCell data={filteredRows} field="id" onDelete={(id) => this._onDeleteWorkout(id)}> </DeleteCell>}
					width={120}
				/>
			</Table>
		</div>);
	}
}
