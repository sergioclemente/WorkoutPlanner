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
var Select = (function (_super) {
    __extends(Select, _super);
    function Select() {
        _super.apply(this, arguments);
    }
    Select.prototype.render = function () {
        var _this = this;
        return (React.createElement("select", __assign({ref: "sel"}, this.props, {onChange: function (e) { return _this._change(e); }}), this.props.children));
    };
    Select.prototype._change = function (e) {
        if (this.props.onChange) {
            this.props.onChange(this.getSelectedValue());
        }
    };
    Select.prototype.getSelectedValue = function () {
        var selectOption = this.refs['sel'];
        return selectOption.value;
    };
    Select.prototype.setSelectedValue = function (val) {
        var selectOption = this.refs['sel'];
        selectOption.value = val;
    };
    return Select;
}(React.Component));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Select;
