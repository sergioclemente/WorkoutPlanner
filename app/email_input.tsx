import * as React from "react";
import * as UI from "../ui";
import ErrorLabel from "./error_label";

export default class EmailInput extends React.Component<any, any> {
	constructor(props: any) {
		super(props);
		this.state = {
			value: props.value,
		};
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
			this._setError("Enter a valid email");
		} else {
			this._setError("");
			this.props.onChange(e.target.value);
		}
	}

	_setError(msg: string) {
		var errorLabel: ErrorLabel = this.refs['errorLabel'] as ErrorLabel;
		errorLabel.setError(msg);
	}
}
