import * as React from 'react';
import ErrorLabel from './error_label';

export default class TextInput extends React.Component<any, any> {
	private input = React.createRef<HTMLInputElement>();
	private errorLabel = React.createRef<ErrorLabel>();

	constructor(props: any) {
		super(props);

		this.state = {
			value: props.value,
		};
	}

	render() {
		return (<span>
			<input ref={this.input} {...this.props} value={this.state.value} onChange={e => this._change(e)} onBlur={e => this._blur(e)} />
			<ErrorLabel ref={this.errorLabel} message=''></ErrorLabel>
		</span>
		);
	}

	_change(e) {
		this.setState({ value: e.target.value })
	}

	_blur(e) {
		this.props.onChange(e.target.value);
	}

	setError(msg: string) {
		this.errorLabel.current?.setError(msg);
	}

	getValue() {
		return this.state.value;
	}
}
