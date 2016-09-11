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
class Select extends React.Component {
    render() {
        return (React.createElement("select", __assign({ref: "sel"}, this.props, {onChange: e => this._change(e)}), this.props.children));
    }
    _change(e) {
        if (this.props.onChange) {
            this.props.onChange(this.getSelectedValue());
        }
    }
    getSelectedValue() {
        var selectOption = this.refs['sel'];
        return selectOption.value;
    }
    setSelectedValue(val) {
        var selectOption = this.refs['sel'];
        selectOption.value = val;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Select;
