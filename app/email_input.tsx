/// <reference path="../type_definitions/react.d.ts" />

import * as React from 'react';
import * as UI from '../ui';
import ErrorLabel from './error_label';

export default class EmailInput extends React.Component <any, any> {
  constructor(props: any) {
     super(props);
	 this.state = {
       value: props.value,
 	 };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: ''+ nextProps.value})
  }

  render() {
    var props = this.props
      , value = this.state.value || props.value

    return (
	  <span>
      	<input {...props} type='string' value={this.state.value} onChange={e => this._change(e)} onBlur={e => this._blur(e)} />
	  	<ErrorLabel ref='errorLabel' message=''></ErrorLabel>
	  </span>
    );
  }

  _change(e){
    var val = e.target.value
      , current = this.props.value
      , number = parseFloat(val)
	
	this.setState({ value: val })
  }

  _blur(e){
    if (UI.FieldValidator.validateEmail(e.target.value)) {
		this.setError("Enter a valid email");
	} else {
	  this.setError("");
      this.props.onChange(email);
	}
  }

  setError(msg: string){
	var errorLabel : ErrorLabel = this.refs['errorLabel'] as ErrorLabel;
	errorLabel.setError(msg);
  }
}
