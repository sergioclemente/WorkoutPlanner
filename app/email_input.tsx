/// <reference path="../node_modules/@types/react/index.d.ts" />

import * as React from 'react';
import * as UI from '../ui';
import ErrorLabel from './error_label';

export default class EmailInput extends React.Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			value: props.value,
		};
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ value: '' + nextProps.value })
	}

	render() {
		return (<span>
			<input {...this.props} type='string' value={this.state.value} onChange={e => this._change(e)} onBlur={e => this._blur(e)} />
			<ErrorLabel ref='errorLabel' message=''></ErrorLabel>
		</span>);
	}

	_change(e) {
		this.setState({ value: e.target.value })
	}

	_blur(e) {
		if (!UI.FieldValidator.validateEmail(e.target.value)) {
			this.setError("Enter a valid email");
		} else {
			this.setError("");
			this.props.onChange(e.target.value);
		}
	}

	setError(msg: string) {
		var errorLabel: ErrorLabel = this.refs['errorLabel'] as ErrorLabel;
		errorLabel.setError(msg);
	}
}
