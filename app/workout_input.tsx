/// <reference path="../type_definitions/react.d.ts" />

import * as React from 'react';
import * as UI from '../ui';
import * as Model from '../model';
import Select from './select';
import SelectOption from './select_option';

export default class WorkoutInput extends React.Component<any, any> {
	constructor(props: any) {
		super(props);
	}

	getSportType(): Model.SportType {
		var sltSportType = this.refs['sportType'] as Select;
		return parseInt(sltSportType.getSelectedValue());
	}

	getUnitType(): Model.IntensityUnit {
		var sltUnit = this.refs['unit'] as Select;
		return parseInt(sltUnit.getSelectedValue());
	}

	getWorkoutText() : string {
		var workoutText = this.refs['workout_text'] as HTMLTextAreaElement;
		return workoutText.value;
	}

	getWorkoutTitle() : string {
		var workoutTitle = this.refs['workout_title'] as HTMLInputElement;
		return workoutTitle.value;
	}

	_onSportTypeChange(sport_type_str) {
		this._enableCompatibleOutputUnits(sport_type_str);
		this._loadWorkout();
	}

	_enableCompatibleOutputUnits(sportType : string) {
		// Select the default unit.
		var sportTypeEnum: Model.SportType = parseInt(sportType);
		let selectUnit : Select = this.refs["unit"] as Select;
		if (sportTypeEnum == Model.SportType.Run) {
			selectUnit.setSelectedValue(Model.IntensityUnit.MinMi.toString());
		} else if (sportTypeEnum == Model.SportType.Bike) {
			selectUnit.setSelectedValue(Model.IntensityUnit.Watts.toString());
		} else if (sportTypeEnum == Model.SportType.Swim) {
			selectUnit.setSelectedValue(Model.IntensityUnit.Per100Yards.toString());
		} else {
			console.assert(false);
		}

		// Disable all options.
		// TODO: Not sure how to fix this hack.
		var units =  ["yards", "meters", "watts", "if", "hr", "minmi", "mih", "minkm", "kmh", "hr"];
		for (let idx in units) {
			let selectOption : SelectOption = this.refs[units[idx]] as SelectOption;
			selectOption.setEnabled(false);
		}

		// Enable just the ones that make sense.
		let map = {};
		map[Model.SportType.Swim.toString()] = ["yards", "meters"];
		map[Model.SportType.Bike.toString()] = ["watts", "if", "hr"];
		map[Model.SportType.Run.toString()] = ["minmi", "mih", "minkm", "kmh", "hr"];
		for (let idx in map[sportType]) {
			let selectOption : SelectOption = this.refs[map[sportType][idx]] as SelectOption;
			selectOption.setEnabled(true);
		}		
	}

	_onUnitChanged(e) {
		this._loadWorkout();
	}

	_onWorkoutTextChange(e) {
		this._loadWorkout();
	}

	_onWorkoutTitleChange(e) {
		this._loadWorkout();
	}

	_loadWorkout() {
		if (this.props.onChange) {
			this.props.onChange(this.getSportType(), this.getUnitType(), this.getWorkoutTitle(), this.getWorkoutText());
		}
	}

	componentDidMount() {
		this._enableCompatibleOutputUnits(this.props.sport_type);
	}	

	render() {
		return (<div>
					<h1> Workout Settings </h1>
					<form>
					Title: <input ref="workout_title" defaultValue={this.props.workout_title} onChange={e => this._onWorkoutTitleChange(e)} />
					<br />
					Sport type:
					<Select ref="sportType" defaultValue={this.props.sport_type} onChange={e => this._onSportTypeChange(e) }>
						<SelectOption value={Model.SportType.Swim}>Swim</SelectOption>
						<SelectOption value={Model.SportType.Bike}>Bike</SelectOption>
						<SelectOption value={Model.SportType.Run}>Run</SelectOption>
					</Select>
					<br />
					Unit:
					<Select ref="unit" defaultValue={this.props.output_unit} onChange={e => this._onUnitChanged(e)}>
						<SelectOption ref="watts" value={Model.IntensityUnit.Watts}>Watts</SelectOption>
						<SelectOption ref="minmi" value={Model.IntensityUnit.MinMi}>min/mi</SelectOption>
						<SelectOption ref="mih" value={Model.IntensityUnit.Mph}>mi/h</SelectOption>
						<SelectOption ref="minkm" value={Model.IntensityUnit.MinKm}>min/km</SelectOption>
						<SelectOption ref="kmh" value={Model.IntensityUnit.Kmh}>km/h</SelectOption>
						<SelectOption ref="if" value={Model.IntensityUnit.IF}>IF</SelectOption>
						<SelectOption ref="yards" value={Model.IntensityUnit.Per100Yards}>/100yards</SelectOption>
						<SelectOption ref="meters" value={Model.IntensityUnit.Per100Meters}>/100m</SelectOption>
						<SelectOption ref="hr" value={Model.IntensityUnit.HeartRate}>Heart rate</SelectOption>
					</Select>
					<br />	
					<textarea ref="workout_text" defaultValue={this.props.workout_text} style={{ height: "200px", width: "100%" }} onChange={e => this._onWorkoutTextChange(e) }>
					</textarea>
					<br />
				</form>
			</div>);
	}
}
