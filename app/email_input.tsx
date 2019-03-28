import * as React from "react";
import * as UI from "../ui";
import ErrorLabel from "./error_label";

export interface EmailInputProps {
	value: string,
	onChange: any,
	defaultValue: string,
	width: number
}

export default class EmailInput extends React.Component<EmailInputProps, any> {
	constructor(props: EmailInputProps) {
		super(props);
		this.state = {
			value: props.value,
		};
	}

	render() {
		const { value } = this.state;
		const { defaultValue, width } = this.props;
		return (<span>
			<input width={width} placeholder={defaultValue} type='string' value={value} onChange={e => this._change(e)} onBlur={e => this._blur(e)} />
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
			const { onChange } = this.props;
			onChange(e.target.value);
		}
	}

	_setError(msg: string) {
		var errorLabel: ErrorLabel = this.refs['errorLabel'] as ErrorLabel;
		errorLabel.setError(msg);
	}
}
