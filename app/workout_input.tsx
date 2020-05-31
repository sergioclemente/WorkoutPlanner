import * as React from 'react';
import * as Core from '../core';
import * as PreProcessor from '../preprocessor'
import Select from './select';
import SelectOption from './select_option';

export default class WorkoutInput extends React.Component<any, any> {
	constructor(props: any) {
		super(props);
	}

	getSportType(): Core.SportType {
		var sltSportType = this.refs['sportType'] as Select;
		return parseInt(sltSportType.getSelectedValue());
	}

	getUnitType(): Core.IntensityUnit {
		var sltUnit = this.refs['unit'] as Select;
		return parseInt(sltUnit.getSelectedValue());
	}

	setOutputUnit(unit: Core.IntensityUnit) {
		let selectUnit: Select = this.refs["unit"] as Select;
		selectUnit.setSelectedValue(unit.toString());
	}

	getWorkoutText(): string {
		var workoutText = this.refs['workout_text'] as HTMLTextAreaElement;
		return workoutText.value;
	}

	setWorkoutText(v: string) {
		var workoutText = this.refs['workout_text'] as HTMLTextAreaElement;
		workoutText.value = v;
	}

	getWorkoutTitle(): string {
		var workoutTitle = this.refs['workout_title'] as HTMLInputElement;
		return workoutTitle.value;
	}

	_onSportTypeChange(sport_type_str) {
		this._enableCompatibleOutputUnits(sport_type_str);
		this._loadWorkout();
	}

	_enableCompatibleOutputUnits(sportType: string) {
		if (sportType == null || sportType.trim() == "") {
			return;
		}
		// Select the default unit.
		var sportTypeEnum: Core.SportType = parseInt(sportType);
		let selectUnit: Select = this.refs["unit"] as Select;
		if (sportTypeEnum == Core.SportType.Run) {
			selectUnit.setSelectedValue(Core.IntensityUnit.MinMi.toString());
		} else if (sportTypeEnum == Core.SportType.Bike) {
			selectUnit.setSelectedValue(Core.IntensityUnit.Watts.toString());
		} else if (sportTypeEnum == Core.SportType.Swim) {
			selectUnit.setSelectedValue(Core.IntensityUnit.Per100Yards.toString());
		} else {
			console.assert(sportTypeEnum == Core.SportType.Other);
			selectUnit.setSelectedValue(Core.IntensityUnit.IF.toString());
		}

		// Disable all options.
		// TODO: Not sure how to fix this hack.
		var units = ["yards", "meters", "watts", "if", "hr", "minmi", "mih", "minkm", "kmh", "hr", "per400m"];
		for (let idx in units) {
			let selectOption: SelectOption = this.refs[units[idx]] as SelectOption;
			selectOption.setEnabled(false);
		}

		// Enable just the ones that make sense.
		let map = {};
		map[Core.SportType.Swim.toString()] = ["watts", "yards", "meters"];
		map[Core.SportType.Bike.toString()] = ["watts", "if", "hr"];
		map[Core.SportType.Run.toString()] = ["minmi", "mih", "minkm", "kmh", "hr", "per400m"];
		map[Core.SportType.Other.toString()] = ["if", "hr"];
		for (let idx in map[sportType]) {
			let selectOption: SelectOption = this.refs[map[sportType][idx]] as SelectOption;
			selectOption.setEnabled(true);
		}
	}

	_onUnitChanged(e) {
		this._loadWorkout();
	}

	_onWorkoutTextChange(e) {
		let workoutText = this.refs['workout_text'] as HTMLTextAreaElement;
		let wp = new PreProcessor.TextPreprocessor(this.getSportType());
		workoutText.value = wp.process(workoutText.value);
		if (workoutText.value == "") {
			// clear the title if the user cleared the value. this
			// is assuming the workflow usually is writing the workout
			// then writing the title.
			let workoutTitle = this.refs['workout_title'] as HTMLInputElement;
			workoutTitle.value = "";
		}
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
					<Select ref="sportType" defaultValue={this.props.sport_type} onChange={e => this._onSportTypeChange(e)}>
					<SelectOption value={Core.SportType.Swim}>Swim</SelectOption>
					<SelectOption value={Core.SportType.Bike}>Bike</SelectOption>
					<SelectOption value={Core.SportType.Run}>Run</SelectOption>
					<SelectOption value={Core.SportType.Other}>Other</SelectOption>
				</Select>
				<br />
				Unit:
					<Select ref="unit" defaultValue={this.props.output_unit} onChange={e => this._onUnitChanged(e)}>
					<SelectOption ref="watts" value={Core.IntensityUnit.Watts}>Watts</SelectOption>
					<SelectOption ref="minmi" value={Core.IntensityUnit.MinMi}>min/mi</SelectOption>
					<SelectOption ref="mih" value={Core.IntensityUnit.Mph}>mi/h</SelectOption>
					<SelectOption ref="minkm" value={Core.IntensityUnit.MinKm}>min/km</SelectOption>
					<SelectOption ref="kmh" value={Core.IntensityUnit.Kmh}>km/h</SelectOption>
					<SelectOption ref="if" value={Core.IntensityUnit.IF}>IF</SelectOption>
					<SelectOption ref="yards" value={Core.IntensityUnit.Per100Yards}>/100yards</SelectOption>
					<SelectOption ref="meters" value={Core.IntensityUnit.Per100Meters}>/100m</SelectOption>
					<SelectOption ref="hr" value={Core.IntensityUnit.HeartRate}>Heart rate</SelectOption>
					<SelectOption ref="per400m" value={Core.IntensityUnit.Per400Meters}>/400m</SelectOption>
				</Select>
				<br />
				<textarea ref="workout_text" defaultValue={this.props.workout_text} style={{ height: "200px", width: "100%" }} onChange={e => this._onWorkoutTextChange(e)}>
				</textarea>
				<br />
			</form>
		</div>);
	}
}
