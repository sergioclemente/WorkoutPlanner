/// <reference path="../type_definitions/react.d.ts" />

import * as React from 'react';

export default class SelectOption extends React.Component<any, any> {

	render() {
		return (<option {...this.props}>
						{this.props.children}
			</option>);
	}
}

