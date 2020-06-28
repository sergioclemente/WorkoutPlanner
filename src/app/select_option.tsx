import * as React from 'react';

export default class SelectOption extends React.Component<any, any> {

	render() {
		return (<option ref="opt" {...this.props}>
			{this.props.children}
		</option>);
	}

	setEnabled(value: boolean): void {
		var option: HTMLOptionElement = this.refs["opt"] as HTMLOptionElement;
		option.hidden = !value;
	}
}

