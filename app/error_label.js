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
var ErrorLabel = (function (_super) {
    __extends(ErrorLabel, _super);
    function ErrorLabel(props) {
        _super.call(this, props);
        this.state = {
            message: props.message || "",
        };
    }
    ErrorLabel.prototype.componentWillReceiveProps = function (nextProps) {
        this.setState({ value: '' + nextProps.value });
    };
    ErrorLabel.prototype.render = function () {
        return (React.createElement("span", __assign({}, this.props, {style: { marginLeft: "10px", color: "#a94442" }}), this.state.message));
    };
    ErrorLabel.prototype.setError = function (msg) {
        this.setState({ message: msg });
    };
    return ErrorLabel;
}(React.Component));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ErrorLabel;
