import * as React from 'react';

export default class Select extends React.Component<any, any> {
	private sel = React.createRef<HTMLSelectElement>();

	render() {
		return (<select ref={this.sel} {...this.props} onChange={e => this._change(e)}>
			{this.props.children}
		</select>);
	}

	_change(e) {
		if (this.props.onChange) {
			this.props.onChange(this.getSelectedValue());
		}
	}

	getSelectedValue(): string {
		return this.sel.current?.value || '';
	}

	setSelectedValue(val: string): void {
		if (this.sel.current) {
			this.sel.current.value = val;
		}
	}
}
