/// <reference path="../type_definitions/react.d.ts" />
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
const React = require('react');
const UI = require('../ui');
const error_label_1 = require('./error_label');
// inspired from react-formal/src/inputs/Number.jsx
class NumberInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
        };
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ value: '' + nextProps.value });
    }
    render() {
        return (React.createElement("span", null, React.createElement("input", __assign({}, this.props, {type: 'number', value: this.state.value, onChange: e => this._change(e), onBlur: e => this._blur(e)})), React.createElement(error_label_1.default, {ref: 'errorLabel', message: ''})));
    }
    _change(e) {
        this.setState({ value: e.target.value });
    }
    _blur(e) {
        if (!UI.FieldValidator.validateNumber(e.target.value)) {
            this.props.onChange(null);
        }
        else {
            this.props.onChange(e.target.value);
        }
    }
    setError(msg) {
        var errorLabel = this.refs['errorLabel'];
        errorLabel.setError(msg);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NumberInput;
