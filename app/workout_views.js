/// <reference path="../type_definitions/react.d.ts" />
/// <reference path="../type_definitions/canvasjs.d.ts" />
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var WorkoutViews = (function (_super) {
    __extends(WorkoutViews, _super);
    function WorkoutViews(params) {
        _super.call(this, params);
        this.state = this.getState(params);
    }
    WorkoutViews.prototype.componentWillReceiveProps = function (nextProps) {
        this.setState({ value: '' + nextProps.value });
    };
    WorkoutViews.prototype.getState = function (params) {
        return ({});
    };
    WorkoutViews.prototype.render = function () {
        return (React.createElement("div", null, "Workouts"));
    };
    return WorkoutViews;
}(React.Component));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WorkoutViews;
