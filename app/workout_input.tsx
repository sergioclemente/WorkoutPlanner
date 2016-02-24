/// <reference path="../type_definitions/react.d.ts" />

import * as React from 'react';
import * as UI from '../ui';
import * as Model from '../model';
import Select from './select';
import SelectOption from './select_option';

module WorkoutInput {
	export class WorkoutInputElement extends React.Component<any, any> {
		private workoutText: number;

		constructor(params: UI.QueryParams) {
			super(params);
		}

		getSportType() : Model.SportType {
			var sltSportType: Select = this.refs['sportType'] as Select;
			return parseInt(sltSportType.getSelectedValue());
		}

		getUnitType(): Model.IntensityUnit {
			var sltUnit: Select = this.refs['unit'] as Select;
			return parseInt(sltUnit.getSelectedValue());
		}

		_onSportTypeChange(sport_type_str) {
			var sport_type: Model.SportType = parseInt(sport_type_str);
			var sltUnit: Select = this.refs['unit'] as Select;
			if (sport_type == Model.SportType.Run) {
				sltUnit.setSelectedValue(Model.IntensityUnit.MinMi.toString());
			} else if (sport_type == Model.SportType.Bike) {
				sltUnit.setSelectedValue(Model.IntensityUnit.Watts.toString());
			}
		}

		render() {
			return (<div>
						<h1> Workout Settings </h1>
						Sport type:
						<Select ref="sportType" defaultValue={this.props.sport_type} onChange={e => this._onSportTypeChange(e) }>
							<SelectOption value={Model.SportType.Bike}>Bike</SelectOption>
							<SelectOption value={Model.SportType.Run}>Run</SelectOption>
						</Select>
						<br />
						Unit:
						<Select ref="unit" defaultValue={this.props.output_unit}>
							<SelectOption value={Model.IntensityUnit.Watts}>Watts</SelectOption>
							<SelectOption value={Model.IntensityUnit.MinMi}>min/mi</SelectOption>
							<SelectOption value={Model.IntensityUnit.Mph}>mi/h</SelectOption>
							<SelectOption value={Model.IntensityUnit.MinKm}>min/km</SelectOption>
							<SelectOption value={Model.IntensityUnit.Kmh}>km/h</SelectOption>
						</Select>
					</div>);
		}
	}

}

export = WorkoutInput;