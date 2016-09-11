/// <reference path="../type_definitions/react.d.ts" />
/// <reference path="../type_definitions/canvasjs.d.ts" />
"use strict";
const React = require('react');
class WorkoutViews extends React.Component {
    constructor(params) {
        super(params);
        this.state = this.getState(params);
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ value: '' + nextProps.value });
    }
    getState(params) {
        return ({});
    }
    render() {
        return (React.createElement("div", null, "Workouts"));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WorkoutViews;
