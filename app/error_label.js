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
class ErrorLabel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: props.message || "",
        };
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ value: '' + nextProps.value });
    }
    render() {
        return (React.createElement("span", __assign({}, this.props, {style: { marginLeft: "10px", color: "#a94442" }}), this.state.message));
    }
    setError(msg) {
        this.setState({ message: msg });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ErrorLabel;
