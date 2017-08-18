/// <reference path="../type_definitions/react.d.ts" />
/// <reference path="../type_definitions/canvasjs.d.ts" />
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
const Model = require('../model');
const workout_view_1 = require('./workout_view');
class PlayerView extends React.Component {
    constructor(params) {
        super(params);
        this.stopWatch_ = null;
        this.params_ = null;
        this.playerHelper_ = null;
        this.intervalId_ = null;
        this.stopWatch_ = new Model.StopWatch();
        this.params_ = UI.QueryParams.createCopy(params);
        let builder = this.params_.createWorkoutBuilder();
        this.playerHelper_ = new Model.PlayerHelper(builder.getInterval());
        this.state = this.getState();
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ value: '' + nextProps.value });
    }
    getState() {
        let bei = this.playerHelper_.get(this._getElapsedTimeSeconds());
        if (bei == null) {
            return {};
        }
        return {
            current_title: bei.getInterval().getTitle(),
            elapsed_time: Model.FormatterHelper.formatTime(this._getElapsedTimeMilliseconds(bei)),
            remaining_time: Model.FormatterHelper.formatTime(this._getRemainingTimeMilliseconds(bei)),
            total_time_elapsed: Model.FormatterHelper.formatTime(this.stopWatch_.getElapsedTime()),
            total_time_workout: Model.FormatterHelper.formatTime(this.playerHelper_.getDurationTotalSeconds() * 1000)
        };
    }
    _getElapsedTimeMilliseconds(bei) {
        return this.stopWatch_.getElapsedTime() - bei.getBeginSeconds() * 1000;
    }
    _getRemainingTimeMilliseconds(bei) {
        return bei.getEndSeconds() * 1000 - this.stopWatch_.getElapsedTime();
    }
    _getElapsedTimeSeconds() {
        return this.stopWatch_.getElapsedTime() / 1000;
    }
    _start(e) {
        this.stopWatch_.start();
        if (this.intervalId_ === null) {
            this.intervalId_ = setInterval(this._onIntervalElapsed.bind(this), 100);
        }
    }
    _pauseAudioElement(elementName, pause) {
        var element = this.refs[elementName];
        if (pause) {
            if (!element.paused) {
                element.pause();
            }
        }
        else {
            if (element.paused) {
                element.play();
            }
        }
    }
    _onIntervalElapsed() {
        // Update state.
        this.setState(this.getState());
        // Check current interval duration and play sound accordingly.
        let bei = this.playerHelper_.get(this._getElapsedTimeSeconds());
        if (bei == null) {
            return;
        }
        let durationIntervalMilliseconds = bei.getDurationSeconds() * 1000;
        // If the interval lasts more than 20s, we will plan the countdown, otherwise the ding (for rest).
        if (durationIntervalMilliseconds > 20000 && this._getRemainingTimeMilliseconds(bei) < 11600) {
            this._pauseAudioElement("countdown", false);
        }
        else {
            if (this._getRemainingTimeMilliseconds(bei) < 100) {
                this._pauseAudioElement("ding", false);
            }
        }
    }
    _pause(e) {
        if (this.intervalId_ !== null) {
            clearInterval(this.intervalId_);
            this.intervalId_ = null;
            this.stopWatch_.stop();
        }
    }
    _next(e) {
        console.log("not implemented");
    }
    _reset(e) {
        this.stopWatch_.reset();
        if (this.intervalId_ != null) {
            clearInterval(this.intervalId_);
            this.intervalId_ = null;
        }
    }
    _onKeyPress(e) {
        switch (e.which) {
            case 115:
                this._start(e);
                break;
            case 112:
                this._pause(e);
                break;
            case 110:
                this._next(e);
                break;
            case 114:
                this._reset(e);
                break;
        }
    }
    componentDidMount() {
        window.addEventListener("keypress", this._onKeyPress.bind(this));
        // Get the WorkoutView and fill with the parameters.
        var view = this.refs['view'];
        view.refresh(this.params_);
    }
    render() {
        return (React.createElement("div", null, 
            React.createElement("h1", null, 
                " Title: ", 
                React.createElement("span", null, this.state.current_title)), 
            React.createElement("h2", null, 
                " Elapsed: ", 
                React.createElement("span", null, this.state.elapsed_time)), 
            React.createElement("h2", null, 
                " Remaining: ", 
                React.createElement("span", null, this.state.remaining_time)), 
            React.createElement("hr", null), 
            React.createElement("div", null, 
                " Total workout duration: ", 
                React.createElement("span", null), 
                this.state.total_time_workout), 
            React.createElement("div", null, 
                " Total workout elapsed: ", 
                React.createElement("span", null, this.state.total_time_elapsed)), 
            React.createElement("table", {ref: "workout_summary"}), 
            React.createElement("form", null, 
                React.createElement("input", {type: "button", value: "Start", onClick: e => this._start(e)}), 
                React.createElement("input", {type: "button", value: "Pause", onClick: e => this._pause(e)}), 
                React.createElement("input", {type: "button", value: "Next Set", onClick: e => this._next(e)}), 
                React.createElement("input", {type: "button", value: "Reset", onClick: e => this._reset(e)}), 
                React.createElement("br", null)), 
            React.createElement(workout_view_1.default, __assign({}, this.props, {ref: 'view'})), 
            React.createElement("audio", {ref: "countdown", hidden: false}, 
                React.createElement("source", {src: "countdown.wav", type: "audio/wav", preload: "auto"}), 
                "Your browser does not support the audio element."), 
            React.createElement("audio", {ref: "ding", hidden: false}, 
                React.createElement("source", {src: "ding.wav", type: "audio/wav", preload: "auto"})
            )));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PlayerView;
