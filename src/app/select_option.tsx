import * as React from 'react';

export default class SelectOption extends React.Component<any, any> {
	private opt = React.createRef<HTMLOptionElement>();

	render() {
		return (<option ref={this.opt} {...this.props}>
			{this.props.children}
		</option>);
	}

	setEnabled(value: boolean): void {
		if (this.opt.current) {
			this.opt.current.hidden = !value;
		}
	}
}

