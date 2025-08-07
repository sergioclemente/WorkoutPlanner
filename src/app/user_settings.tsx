import * as React from 'react';
import * as Core from '../core';
import NumberInput from './number_input';
import EmailInput from './email_input';
import TextInput from './text_input';
import { QueryParamsWorkoutView } from '../ui';

export default class UserProperty extends React.Component<any, any> {
	private ftpRef = React.createRef<NumberInput>();
	private tPaceRef = React.createRef<TextInput>();
	private swimFtpRef = React.createRef<TextInput>();
	private swimCssRef = React.createRef<TextInput>();
	private emailRef = React.createRef<EmailInput>();
	private efficiencyFactorRef = React.createRef<NumberInput>();

	private ftp: number;
	private t_pace: string;
	private swim_ftp: string;
	private swim_css: string;
	private email: string;
	private efficiency_factor: string;

	constructor(params: any) {
		super(params);
		let query_params = QueryParamsWorkoutView.createCopy(params);

		this.ftp = parseInt(query_params.ftp_watts.value);
		this.email = query_params.email.value;
		this.t_pace = query_params.t_pace.value;
		this.swim_ftp = query_params.swim_ftp.value;
		this.swim_css = query_params.swim_css.value;
		this.efficiency_factor = query_params.efficiency_factor.value;
	}

	_onFtpChange(ftp) {
		if (ftp < 100 || ftp > 500) {
			this.ftpRef.current?.setError("Set a value between 100 and 500");
		} else {
			this.ftpRef.current?.setError("");
		}
		this.ftp = ftp;
		this._fireOnChange();
	}
	_onTPaceChange(t_pace) {
		var t_pace_mph = Core.SpeedParser.getSpeedInMph(t_pace);
		if (t_pace != null && t_pace_mph > 0) {
			this.tPaceRef.current?.setError("");
		} else {
			this.tPaceRef.current?.setError("Enter a value speed for your running t-pace. Allowed units are: min/mi, km/h, mi/h, min/km");
		}
		this.t_pace = t_pace;
		this._fireOnChange();
	}
	_onSwimFtpChange(swim_ftp) {
		if (swim_ftp < 30 || swim_ftp > 200) {
			this.swimFtpRef.current?.setError("Set a value between 30 and 200");
		} else {
			this.swimFtpRef.current?.setError("");
		}
		this.swim_ftp = swim_ftp;
		this._fireOnChange();
	}
	_onSwimCSSChange(swim_css) {
		var swim_css_mph = Core.SpeedParser.getSpeedInMph(swim_css)
		if (swim_css != null && swim_css_mph) {
			this.swimCssRef.current?.setError("");
		} else {
			this.swimCssRef.current?.setError("Enter a value for the swim css. Allowed units are: mph, /100yards");
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
				Swim CSS: <TextInput ref={this.swimCssRef} width="20" placeholder="1:30 min/100yards" value={this.swim_css} onChange={this._onSwimCSSChange.bind(this)}></TextInput> <br />
				Swim FTP: <TextInput ref={this.swimFtpRef} width="20" placeholder="100" value={this.swim_ftp} onChange={this._onSwimFtpChange.bind(this)}></TextInput> <br />
				Bike FTP: <NumberInput ref={this.ftpRef} width="20" placeholder="245" value={this.ftp} onChange={this._onFtpChange.bind(this)}></NumberInput><br />
				Run T-Pace: <TextInput ref={this.tPaceRef} width="20" placeholder="7:30 min/mi" value={this.t_pace} onChange={this._onTPaceChange.bind(this)}></TextInput> <br />
				Email: <EmailInput ref={this.emailRef} width={20} defaultValue="foo@gmail.com" value={this.email} onChange={this._onEmailChange.bind(this)}></EmailInput> <br />
				Efficiency Factor: <NumberInput ref={this.efficiencyFactorRef} width="20" placeholder="1.2" value={this.efficiency_factor} onChange={this._onEfficiencyFactorChange.bind(this)}></NumberInput> <br />
				<br />
			</div>);
	}
}
