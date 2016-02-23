/// <reference path="../type_definitions/react.d.ts" />

import * as React from 'react';
import * as UI from '../ui';
import ErrorLabel from './error_label';
import NumberInput from './number_input';

module UserSettings {

export class UserPropertyElement extends React.Component<UI.QueryParams, any> {
	private ftp: number;

	constructor(params: UI.QueryParams) {
		super(params);

		this.state = {
			email: params.email,
			t_pace: params.t_pace,
		};
		this.ftp = parseFloat(params.ftp_watts);
	}
	
	onFtpChange(ftp) {
		var errorLabel : NumberInput = this.refs['ftp'] as NumberInput;
		if (ftp < 100 || ftp > 500) {
			errorLabel.setError("Set a value between 100 and 500");
		} else {
			errorLabel.setError("");
		}
		this.ftp = ftp;
	}
	onTPaceChange(e) {
		this.setState({t_pace: e.target.value});
	}
	onEmailChange(e) {
		this.setState({email: e.target.value});
	}
	public getFTP() : number {
		return this.ftp;
	}
	public getTPace() : string {
		return this.state.t_pace;
	}
	public getEmail() : string {
		return this.state.email;
	}
	render() {
		return (
			<div>
				<h1> User Settings </h1>
				Bike FTP: <NumberInput ref="ftp" width="20" placeholder="245" value={this.ftp} onChange={this.onFtpChange.bind(this)}></NumberInput><br />
				Run T-Pace: <input id="txtTPace" width="20" placeholder="7:30 min/mi" value={this.state.t_pace} onChange={this.onTPaceChange.bind(this)}></input> <br />
				Email: <input id="txtEmail" width="20" placeholder="foo@gmail.com" value={this.state.email} onChange={this.onEmailChange.bind(this)}></input> <br />
				<br />
			</div>);
	}
}

}

export = UserSettings;