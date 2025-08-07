import * as React from 'react';
import * as Core from '../core';
import * as UI from '../ui';
import Select from './select';
import SelectOption from './select_option';

export default class WorkoutInput extends React.Component<any, any> {
	private sportTypeRef = React.createRef<Select>();
	private unitRef = React.createRef<Select>();
	private workoutTitleRef = React.createRef<HTMLInputElement>();
	private workoutTextRef = React.createRef<HTMLTextAreaElement>();
	private wattsRef = React.createRef<SelectOption>();
	private minmiRef = React.createRef<SelectOption>();
	private mihRef = React.createRef<SelectOption>();
	private minkmRef = React.createRef<SelectOption>();
	private kmhRef = React.createRef<SelectOption>();
	private ifRef = React.createRef<SelectOption>();
	private yardsRef = React.createRef<SelectOption>();
	private metersRef = React.createRef<SelectOption>();
	private hrRef = React.createRef<SelectOption>();
	private per400mRef = React.createRef<SelectOption>();

	private sport_type: Core.SportType;
	private output_unit: Core.IntensityUnit;
	private workout_title: string;
	private workout_text: string;

	constructor(props: any) {
		super(props);
		
		let params = UI.QueryParamsWorkoutView.createCopy(props);
		this.sport_type = parseInt(params.sport_type.value);
		this.output_unit = parseInt(params.output_unit.value);
		this.workout_title = params.workout_title.value;
		this.workout_text = params.workout_text.value;
	}

	// TODO: Clean this up
	getSportType(): Core.SportType {
		return parseInt(this.sportTypeRef.current?.getSelectedValue() || '0');
	}

	getUnitType(): Core.IntensityUnit {
		return parseInt(this.unitRef.current?.getSelectedValue() || '0');
	}

	setOutputUnit(unit: Core.IntensityUnit) {
		this.unitRef.current?.setSelectedValue(unit.toString());
	}

	getWorkoutText(): string {
		return this.workoutTextRef.current?.value || '';
	}

	setWorkoutText(v: string) {
		if (this.workoutTextRef.current) {
			this.workoutTextRef.current.value = v;
		}
	}

	getWorkoutTitle(): string {
		return this.workoutTitleRef.current?.value || '';
	}

	_onSportTypeChange(sport_type_str: string) {
		this._enableCompatibleOutputUnits(sport_type_str);
		this._loadWorkout();
	}

	_enableCompatibleOutputUnits(sportType: string) {
		if (sportType == null || sportType.trim() == "") {
			return;
		}
		// Select the default unit.
		var sportTypeEnum: Core.SportType = parseInt(sportType);
		if (sportTypeEnum == Core.SportType.Run) {
			this.unitRef.current?.setSelectedValue(Core.IntensityUnit.MinMi.toString());
		} else if (sportTypeEnum == Core.SportType.Bike) {
			this.unitRef.current?.setSelectedValue(Core.IntensityUnit.Watts.toString());
		} else if (sportTypeEnum == Core.SportType.Swim) {
			this.unitRef.current?.setSelectedValue(Core.IntensityUnit.Per100Yards.toString());
		} else {
			console.assert(sportTypeEnum == Core.SportType.Other);
			this.unitRef.current?.setSelectedValue(Core.IntensityUnit.IF.toString());
		}

		// Disable all options.
		this.yardsRef.current?.setEnabled(false);
		this.metersRef.current?.setEnabled(false);
		this.wattsRef.current?.setEnabled(false);
		this.ifRef.current?.setEnabled(false);
		this.hrRef.current?.setEnabled(false);
		this.minmiRef.current?.setEnabled(false);
		this.mihRef.current?.setEnabled(false);
		this.minkmRef.current?.setEnabled(false);
		this.kmhRef.current?.setEnabled(false);
		this.per400mRef.current?.setEnabled(false);


		// Enable just the ones that make sense.
		if (sportTypeEnum === Core.SportType.Swim) {
			this.wattsRef.current?.setEnabled(true);
			this.yardsRef.current?.setEnabled(true);
			this.metersRef.current?.setEnabled(true);
		} else if (sportTypeEnum === Core.SportType.Bike) {
			this.wattsRef.current?.setEnabled(true);
			this.ifRef.current?.setEnabled(true);
			this.hrRef.current?.setEnabled(true);
		} else if (sportTypeEnum === Core.SportType.Run) {
			this.minmiRef.current?.setEnabled(true);
			this.mihRef.current?.setEnabled(true);
			this.minkmRef.current?.setEnabled(true);
			this.kmhRef.current?.setEnabled(true);
			this.hrRef.current?.setEnabled(true);
			this.per400mRef.current?.setEnabled(true);
		} else if (sportTypeEnum === Core.SportType.Other) {
			this.ifRef.current?.setEnabled(true);
			this.hrRef.current?.setEnabled(true);
		}
	}

	_onUnitChanged() {
		this._loadWorkout();
	}

	_onWorkoutTextChange() {
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
				Title: <input ref={this.workoutTitleRef} defaultValue={this.workout_title} onChange={e => this._onWorkoutTitleChange(e)} />
				<br />
				Sport type:
					<Select ref={this.sportTypeRef} defaultValue={this.sport_type} onChange={e => this._onSportTypeChange(e)}>
					<SelectOption value={Core.SportType.Swim}>Swim</SelectOption>
					<SelectOption value={Core.SportType.Bike}>Bike</SelectOption>
					<SelectOption value={Core.SportType.Run}>Run</SelectOption>
					<SelectOption value={Core.SportType.Other}>Other</SelectOption>
				</Select>
				<br />
				Unit:
					<Select ref={this.unitRef} defaultValue={this.output_unit} onChange={e => this._onUnitChanged()}>
					<SelectOption ref={this.wattsRef} value={Core.IntensityUnit.Watts}>Watts</SelectOption>
					<SelectOption ref={this.minmiRef} value={Core.IntensityUnit.MinMi}>min/mi</SelectOption>
					<SelectOption ref={this.mihRef} value={Core.IntensityUnit.Mph}>mi/h</SelectOption>
					<SelectOption ref={this.minkmRef} value={Core.IntensityUnit.MinKm}>min/km</SelectOption>
					<SelectOption ref={this.kmhRef} value={Core.IntensityUnit.Kmh}>km/h</SelectOption>
					<SelectOption ref={this.ifRef} value={Core.IntensityUnit.IF}>IF</SelectOption>
					<SelectOption ref={this.yardsRef} value={Core.IntensityUnit.Per100Yards}>/100yards</SelectOption>
					<SelectOption ref={this.metersRef} value={Core.IntensityUnit.Per100Meters}>/100m</SelectOption>
					<SelectOption ref={this.hrRef} value={Core.IntensityUnit.HeartRate}>Heart rate</SelectOption>
					<SelectOption ref={this.per400mRef} value={Core.IntensityUnit.Per400Meters}>/400m</SelectOption>
				</Select>
				<br />
				<textarea ref={this.workoutTextRef} defaultValue={this.workout_text} style={{ height: "200px", width: "100%" }} onChange={e => this._onWorkoutTextChange()}>
				</textarea>
				<br />
			</form>
		</div>);
	}
}
