/// <reference path="../type_definitions/react.d.ts" />

import * as React from 'react';
import * as UI from '../ui';

module UserSettings {

export class UserPropertyElement extends React.Component<UI.QueryParams, any> {
	constructor(params: UI.QueryParams) {
		super(params);

		this.state = {
			email: params.email,
			ftp: params.ftp_watts,
			t_pace: params.t_pace,
		};
	}
	onFtpChange(e) {
		this.setState({ftp: e.target.value});
	}
	onTPaceChange(e) {
		this.setState({t_pace: e.target.value});
	}
	onEmailChange(e) {
		this.setState({email: e.target.value});
	}
	public getFTP() : string {
		return this.state.ftp;
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
				Bike FTP: <input id="txtFtp" width="20" placeholder="245" value={this.state.ftp} onChange={this.onFtpChange.bind(this)}></input><br />
				Run T-Pace: <input id="txtTPace" width="20" placeholder="7:30 min/mi" value={this.state.t_pace} onChange={this.onTPaceChange.bind(this)}></input> <br />
				Email: <input id="txtEmail" width="20" placeholder="foo@gmail.com" value={this.state.email} onChange={this.onEmailChange.bind(this)}></input> <br />
				<br />
			</div>);
	}
}

}

export = UserSettings;