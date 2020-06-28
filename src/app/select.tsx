import * as React from 'react';

export default class Select extends React.Component<any, any> {

	render() {
		return (<select ref="sel" {...this.props} onChange={e => this._change(e)}>
			{this.props.children}
		</select>);
	}

	_change(e) {
		if (this.props.onChange) {
			this.props.onChange(this.getSelectedValue());
		}
	}

	getSelectedValue(): string {
		var selectOption: HTMLSelectElement = this.refs['sel'] as HTMLSelectElement;
		return selectOption.value;
	}

	setSelectedValue(val: string): void {
		var selectOption: HTMLSelectElement = this.refs['sel'] as HTMLSelectElement;
		selectOption.value = val;
	}
}
