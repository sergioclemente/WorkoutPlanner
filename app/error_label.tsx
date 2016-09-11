/// <reference path="../type_definitions/react.d.ts" />

import * as React from 'react';
import * as UI from '../ui';

export default class ErrorLabel extends React.Component <any, any> {
  constructor(props: any) {
     super(props);
	 this.state = {
	   message: props.message || "",
 	 };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: ''+ nextProps.value})
  }

  render() {
    return (
      <span style={{marginLeft: "10px", color: "#a94442"}}>{this.state.message}</span>
    )
  }

  setError(msg: string){
	this.setState({message: msg});
  }
}
