import * as React from 'react';
import * as Core from '../core';
import NumberInput from './number_input';
import EmailInput from './email_input';
import TextInput from './text_input';
import { QueryParams } from '../ui';

export default class UserProperty extends React.Component<any, any> {
	private ftp: number;
	private t_pace: string;
	private swim_ftp: string;
	private swim_css: string;
	private email: string;
	private efficiency_factor: string;

	constructor(params: any) {
		super(params);
		let query_params = QueryParams.createCopy(params);

		this.ftp = parseInt(query_params.ftp_watts.value);
		this.email = query_params.email.value;
		this.t_pace = query_params.t_pace.value;
		this.swim_ftp = query_params.swim_ftp.value;
		this.swim_css = query_params.swim_css.value;
		this.efficiency_factor = query_params.efficiency_factor.value;
	}

	_onFtpChange(ftp) {
		var ftpInput: NumberInput = this.refs['ftp'] as NumberInput;
		if (ftp < 100 || ftp > 500) {
			ftpInput.setError("Set a value between 100 and 500");
		} else {
			ftpInput.setError("");
		}
		this.ftp = ftp;
		this._fireOnChange();
	}
	_onTPaceChange(t_pace) {
		var tPaceInput: NumberInput = this.refs['t_pace'] as NumberInput;
		var t_pace_mph = Core.SpeedParser.getSpeedInMph(t_pace);
		if (t_pace != null && t_pace_mph > 0) {
			tPaceInput.setError("");
		} else {
			tPaceInput.setError("Enter a value speed for your running t-pace. Allowed units are: min/mi, km/h, mi/h, min/km");
		}
		this.t_pace = t_pace;
		this._fireOnChange();
	}
	_onSwimFtpChange(swim_ftp) {
		var swimFtpInput: NumberInput = this.refs['swim_ftp'] as NumberInput;
		if (swim_ftp < 30 || swim_ftp > 200) {
			swimFtpInput.setError("Set a value between 30 and 200");
		} else {
			swimFtpInput.setError("");
		}
		this.swim_ftp = swim_ftp;
		this._fireOnChange();
	}
	_onSwimCSSChange(swim_css) {
		var tSwimCss: NumberInput = this.refs['swim_css'] as NumberInput;
		var swim_css_mph = Core.SpeedParser.getSpeedInMph(swim_css)
		if (swim_css != null && swim_css_mph) {
			tSwimCss.setError("");
		} else {
			tSwimCss.setError("Enter a value for the swim css. Allowed units are: mph, /100yards");
		}
		this.swim_css = swim_css;
		this._fireOnChange();
	}
	_onEmailChange(email) {
		this.email = email;
		this._fireOnChange();
	}
	_onEfficiencyFactorChange(efficiency_factor) {
		this.efficiency_factor = efficiency_factor;
		this._fireOnChange();
	}
	_fireOnChange() {
		if (this.props.onChange) {
			this.props.onChange(this.ftp, this.t_pace, this.swim_css, this.swim_ftp, this.email, this.efficiency_factor);
		}
	}
	render() {
		return (
			<div>
				<h1> User Settings </h1>
				Swim CSS: <TextInput ref="swim_css" width="20" placeholder="1:30 min/100yards" value={this.swim_css} onChange={this._onSwimCSSChange.bind(this)}></TextInput> <br />
				Swim FTP: <TextInput ref="swim_ftp" width="20" placeholder="100" value={this.swim_ftp} onChange={this._onSwimFtpChange.bind(this)}></TextInput> <br />
				Bike FTP: <NumberInput ref="ftp" width="20" placeholder="245" value={this.ftp} onChange={this._onFtpChange.bind(this)}></NumberInput><br />
				Run T-Pace: <TextInput ref="t_pace" width="20" placeholder="7:30 min/mi" value={this.t_pace} onChange={this._onTPaceChange.bind(this)}></TextInput> <br />
				Email: <EmailInput ref="email" width={20} defaultValue="foo@gmail.com" value={this.email} onChange={this._onEmailChange.bind(this)}></EmailInput> <br />
				Efficiency Factor: <NumberInput ref="efficiency_factor" width="20" placeholder="1.2" value={this.efficiency_factor} onChange={this._onEfficiencyFactorChange.bind(this)}></NumberInput> <br />
				<br />
			</div>);
	}
}
