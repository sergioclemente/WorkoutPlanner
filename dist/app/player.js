"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const UI = require("../ui");
const Core = require("../core");
const Model = require("../model");
const workout_view_1 = require("./workout_view");
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
        let of = new Core.ObjectFactory(this.params_.createUserProfile(), builder.getSportType());
        this.playerHelper_ = new Model.PlayerHelper(of, builder.getInterval());
        this.state = this.getState();
    }
    getState() {
        let bei = this.playerHelper_.get(this._getElapsedTimeSeconds());
        if (bei == null) {
            return {};
        }
        return {
            current_title: bei.getTitle(),
            elapsed_time: Core.FormatterHelper.formatTime(this._getElapsedTimeMilliseconds(bei)),
            remaining_time: Core.FormatterHelper.formatTime(this._getRemainingTimeMilliseconds(bei)),
            total_time_elapsed: Core.FormatterHelper.formatTime(this.stopWatch_.getElapsedTimeMillis()),
            total_time_workout: Core.FormatterHelper.formatTime(this.playerHelper_.getDurationTotalSeconds() * 1000)
        };
    }
    _getElapsedTimeMilliseconds(bei) {
        return this.stopWatch_.getElapsedTimeMillis() - bei.getBeginSeconds() * 1000;
    }
    _getRemainingTimeMilliseconds(bei) {
        return bei.getEndSeconds() * 1000 - this.stopWatch_.getElapsedTimeMillis();
    }
    _getElapsedTimeSeconds() {
        return this.stopWatch_.getElapsedTimeMillis() / 1000;
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
        this.setState(this.getState());
        let bei = this.playerHelper_.get(this._getElapsedTimeSeconds());
        if (bei == null) {
            return;
        }
        let durationIntervalMilliseconds = bei.getDurationSeconds() * 1000;
        if (durationIntervalMilliseconds > 3500 && this._getRemainingTimeMilliseconds(bei) < 3500) {
            this._pauseAudioElement("countdown", false);
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
        let bei = this.playerHelper_.getNext(this._getElapsedTimeSeconds());
        if (bei == null) {
            return;
        }
        this.stopWatch_.moveStartTime(bei.getBeginSeconds() * 1000);
        this.setState(this.getState());
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
            React.createElement("table", { ref: "workout_summary" }),
            React.createElement("form", null,
                React.createElement("input", { type: "button", value: "Start (S)", onClick: e => this._start(e) }),
                React.createElement("input", { type: "button", value: "Pause (P)", onClick: e => this._pause(e) }),
                React.createElement("input", { type: "button", value: "Next Set (N)", onClick: e => this._next(e) }),
                React.createElement("input", { type: "button", value: "Reset (R)", onClick: e => this._reset(e) }),
                React.createElement("br", null)),
            React.createElement(workout_view_1.default, Object.assign({}, this.props, { ref: 'view' })),
            React.createElement("audio", { ref: "countdown", hidden: false },
                React.createElement("source", { src: "countdown.wav", type: "audio/wav" }),
                "Your browser does not support the audio element.")));
    }
}
exports.default = PlayerView;
