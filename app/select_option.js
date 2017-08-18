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
class SelectOption extends React.Component {
    render() {
        return (React.createElement("option", __assign({ref: "opt"}, this.props), this.props.children));
    }
    setEnabled(value) {
        var option = this.refs["opt"];
        option.hidden = !value;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SelectOption;
