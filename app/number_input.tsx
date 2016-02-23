/// <reference path="../type_definitions/react.d.ts" />

import * as React from 'react';
import * as UI from '../ui';
import ErrorLabel from './error_label';

// inspired from react-formal/src/inputs/Number.jsx

let isValid = num => typeof num === 'number' && !isNaN(num);

let isAtDelimiter = (num, str) =>{
  var next = str.length <= 1 ? false : parseFloat(str.substr(0, str.length - 1))
  return typeof next === 'number' && !isNaN(next) && next === num
}

export default class NumberInput extends React.Component <any, any> {
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
      	<input {...props} type='number' value={this.state.value} onChange={e => this._change(e)} onBlur={e => this._blur(e)} />
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
    if (UI.FieldValidator.validateNumber(e.target.value)) {
	  this.props.onChange(null);
	} else {     
      this.props.onChange(number);
	}
  }

  setError(msg: string){
	var errorLabel : ErrorLabel = this.refs['errorLabel'] as ErrorLabel;
	errorLabel.setError(msg);
  }
}
