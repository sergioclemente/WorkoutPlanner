/// <reference path="../node_modules/@types/react/index.d.ts" />

import * as React from 'react';
import * as UI from '../ui';
import * as Model from '../model';
import Select from './select';
import SelectOption from './select_option';
import { SportType } from '../model';

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
		if (sportType == null || sportType.trim() == "") {
			return;
		}
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
			console.assert(sportTypeEnum == Model.SportType.Other);
			selectUnit.setSelectedValue(Model.IntensityUnit.IF.toString());
		}

		// Disable all options.
		// TODO: Not sure how to fix this hack.
		var units =  ["yards", "meters", "watts", "if", "hr", "minmi", "mih", "minkm", "kmh", "hr", "per400m"];
		for (let idx in units) {
			let selectOption : SelectOption = this.refs[units[idx]] as SelectOption;
			selectOption.setEnabled(false);
		}

		// Enable just the ones that make sense.
		let map = {};
		map[Model.SportType.Swim.toString()] = ["yards", "meters"];
		map[Model.SportType.Bike.toString()] = ["watts", "if", "hr"];
		map[Model.SportType.Run.toString()] = ["minmi", "mih", "minkm", "kmh", "hr", "per400m"];
		map[Model.SportType.Other.toString()] = ["if", "hr"];
		for (let idx in map[sportType]) {
			let selectOption : SelectOption = this.refs[map[sportType][idx]] as SelectOption;
			selectOption.setEnabled(true);
		}		
	}

	_onUnitChanged(e) {
		this._loadWorkout();
	}

	// BEGIN: Make this more generic
	rand(min: number, max: number) : number {
		return Math.floor(Math.random() * (max - min) + min);
	}

	randElement(array : any) : string {
		if (array.length > 0) {
			return array[this.rand(0, array.length)] + "\n";
		} else {
			return "";
		}
	}

	// NOT USED FOR NOW
	shuffleInPlace<T>(array: T[]): T[] {
		// if it's 1 or 0 items, just return
		if (array.length <= 1) return array;
	  
		// For each index in array
		for (let i = 0; i < array.length; i++) {
	  
		  // choose a random not-yet-placed item to place there
		  // must be an item AFTER the current item, because the stuff
		  // before has all already been placed
		  const randomChoiceIndex = this.rand(i, array.length);
	  
		  // place our random choice in the spot by swapping
		  [array[i], array[randomChoiceIndex]] = [array[randomChoiceIndex], array[i]];
		}
	  
		return array;
	  }

	preProcess(text : string) : string {
		let warmup_text = "";
		let warmup_groups = [];
		if (this.getSportType() == SportType.Bike) {
			warmup_groups = [
				// 9 min (warmup)
				[
					"(3min, 55), (3min, 65), (3min, 75)",
					"(9min, 55, 75)"
				],
				// 4 min (drill)
				[
					"2[(45s, 45, Single leg - left), (15s, 45, both), (45s, 45, Single leg - right), (15s, 45, both)]",
					"8[(15s, 55, spin ups), (15s, 55)]",
					"4[(30s, cadence 80/90/100/110, 55), (30s, 55)]"
				],
				// 4 min (build)
				[
					"4[(15s, *, build), (45s, 55)]",
					"4[(5s, *, MAX), (55s, 55)]",
					"4[(45s, 75, 100), (15s, 55)]",
					"4[(30s, 85, 90, 95, 100), (30s, 55)]"
				],
				// static (3min)
				["(3min, 55)"]
			];
		} else if (this.getSportType() == SportType.Run) {
			warmup_groups = [
				[
					"3[(10s, 0, arm swings)]",	
					"3[(10s, 0, high knees)]",
					"3[(10s, 0, ham kicks)]",
					"3[(10s, 0, a-skips)]",
					"3[(10s, 0, crossover side to sides)]",
				],
				[
					"3[(10s, 0, 10 lunges - 5 each side)]",
					"3[(10s, 0, 10 reverse lunges - 5 each side)]",
					"3[(10s, 0, 10 lunges with rotation - 5 each side)]",
					"3[(10s, 0, sumo squat)]",
				]				
			];
		}
		for (let i = 0; i < warmup_groups.length; i++) {
			warmup_text += this.randElement(warmup_groups[i]);
		}

		if (warmup_text.length > 0) {
			return text.replace("#wu", warmup_text);
		} else {
			return text;
		}
	}
	// END: Make this more generic
	
	_onWorkoutTextChange(e) {
		var workoutText = this.refs['workout_text'] as HTMLTextAreaElement;
		workoutText.value = this.preProcess(workoutText.value);		
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
						<SelectOption value={Model.SportType.Other}>Other</SelectOption>
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
						<SelectOption ref="per400m" value={Model.IntensityUnit.Per400Meters}>/400m</SelectOption>
					</Select>
					<br />	
					<textarea ref="workout_text" defaultValue={this.props.workout_text} style={{ height: "200px", width: "100%" }} onChange={e => this._onWorkoutTextChange(e) }>
					</textarea>
					<br />
				</form>
			</div>);
	}
}
