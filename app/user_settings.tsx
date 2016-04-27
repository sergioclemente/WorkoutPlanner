/// <reference path="../type_definitions/react.d.ts" />

import * as React from 'react';
import * as UI from '../ui';
import * as Model from '../model';
import ErrorLabel from './error_label';
import NumberInput from './number_input';
import EmailInput from './email_input';
import TextInput from './text_input';

export default class UserProperty extends React.Component<any, any> {
	private ftp: number;
	private t_pace: string;
	private swim_css: string;
	private email: string;

	constructor(params: any) {
		super(params);

		this.ftp = parseInt(params.ftp_watts);
		this.email = params.email;
		this.t_pace = params.t_pace;
		this.swim_css = params.swim_css;
	}

	onFtpChange(ftp) {
		var ftpInput: NumberInput = this.refs['ftp'] as NumberInput;
		if (ftp < 100 || ftp > 500) {
			ftpInput.setError("Set a value between 100 and 500");
		} else {
			ftpInput.setError("");
		}
		this.ftp = ftp;

		if (this.props.onChange) {
			this.props.onChange(this.ftp, this.t_pace, this.swim_css, this.email);
		}
	}
	onTPaceChange(t_pace) {
		var tPaceInput: NumberInput = this.refs['t_pace'] as NumberInput;
		var t_pace_mph = Model.SpeedParser.getSpeedInMph(t_pace);
		if (t_pace != null && t_pace_mph > 0) {
			tPaceInput.setError("");
		} else {
			tPaceInput.setError("Enter a value speed for your running t-pace. Allowed units are: min/mi, km/h, mi/h, min/km");
		}
		this.t_pace = t_pace;

		if (this.props.onChange) {
			this.props.onChange(this.ftp, this.t_pace, this.swim_css, this.email);
		}
	}
	onSwimCSSChange(swim_css) {
		var tSwimCss: NumberInput = this.refs['swim_css'] as NumberInput;
		var swim_css_mph = Model.SpeedParser.getSpeedInMph(swim_css)
		if (swim_css != null && swim_css_mph) {
			tSwimCss.setError("");
		} else {
			tSwimCss.setError("Enter a value for the swim css. Allowed units are: mph, /100yards");
		}
		this.swim_css = swim_css;

		if (this.props.onChange) {
			this.props.onChange(this.ftp, this.t_pace, this.swim_css, this.email);
		}
	}
	onEmailChange(email) {
		this.email = email;

		if (this.props.onChange) {
			this.props.onChange(this.ftp, this.t_pace, this.swim_css, this.email);
		}
	}
	render() {
		return (
			<div>
				<h1> User Settings </h1>
				Swim CSS: <TextInput ref="swim_css" width="20" placeholder="1:30 min/100yards" value={this.swim_css} onChange={this.onSwimCSSChange.bind(this) }></TextInput> <br />				
				Bike FTP: <NumberInput ref="ftp" width="20" placeholder="245" value={this.ftp} onChange={this.onFtpChange.bind(this) }></NumberInput><br />
				Run T-Pace: <TextInput ref="t_pace" width="20" placeholder="7:30 min/mi" value={this.t_pace} onChange={this.onTPaceChange.bind(this) }></TextInput> <br />
				Email: <EmailInput ref="email" width="20" placeholder="foo@gmail.com" value={this.email} onChange={this.onEmailChange.bind(this) }></EmailInput> <br />
				<br />
			</div>);
	}
}
