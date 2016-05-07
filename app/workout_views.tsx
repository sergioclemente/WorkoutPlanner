/// <reference path="../type_definitions/react.d.ts" />
/// <reference path="../type_definitions/canvasjs.d.ts" />

import * as React from 'react';
import * as UI from '../ui';
import * as Model from '../model';

export default class WorkoutViews extends React.Component<any, any> {
	constructor(params: any) {
		super(params);

		this.state = this.getState(params);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ value: '' + nextProps.value })
	}

	getState(params: UI.QueryParams) : any {
        return (
            {
            }
        );
	}

	render() {
		return (<div>Workouts
				</div>);
	}
}
