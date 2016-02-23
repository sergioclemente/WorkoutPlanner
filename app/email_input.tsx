/// <reference path="../type_definitions/react.d.ts" />

import * as React from 'react';
import * as UI from '../ui';
import ErrorLabel from './error_label';

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

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
    var email = e.target.value;

    if (email == null || email.trim() === '' || !validateEmail(email)) {
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
