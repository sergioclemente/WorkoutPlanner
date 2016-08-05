/// <reference path="../type_definitions/react.d.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var React = require('react');
var UI = require('../ui');
var error_label_1 = require('./error_label');
var EmailInput = (function (_super) {
    __extends(EmailInput, _super);
    function EmailInput(props) {
        _super.call(this, props);
        this.state = {
            value: props.value,
        };
    }
    EmailInput.prototype.componentWillReceiveProps = function (nextProps) {
        this.setState({ value: '' + nextProps.value });
    };
    EmailInput.prototype.render = function () {
        var _this = this;
        return (React.createElement("span", null, React.createElement("input", __assign({}, this.props, {type: 'string', value: this.state.value, onChange: function (e) { return _this._change(e); }, onBlur: function (e) { return _this._blur(e); }})), React.createElement(error_label_1.default, {ref: 'errorLabel', message: ''})));
    };
    EmailInput.prototype._change = function (e) {
        this.setState({ value: e.target.value });
    };
    EmailInput.prototype._blur = function (e) {
        if (!UI.FieldValidator.validateEmail(e.target.value)) {
            this.setError("Enter a valid email");
        }
        else {
            this.setError("");
            this.props.onChange(e.target.value);
        }
    };
    EmailInput.prototype.setError = function (msg) {
        var errorLabel = this.refs['errorLabel'];
        errorLabel.setError(msg);
    };
    return EmailInput;
}(React.Component));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = EmailInput;
