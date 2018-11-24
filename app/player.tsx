/// <reference path="../type_definitions/canvasjs.d.ts" />

import * as React from 'react';
import * as UI from '../ui';
import * as Model from '../model';
import WorkoutView from './workout_view';

export default class PlayerView extends React.Component<any, any> {
	private stopWatch_: Model.StopWatch = null;
	private params_: UI.QueryParams = null;
	private playerHelper_: Model.PlayerHelper = null;
	private intervalId_: number = null;

	constructor(params: any) {
		super(params);

		this.stopWatch_ = new Model.StopWatch();
		this.params_ = UI.QueryParams.createCopy(params);

		let builder = this.params_.createWorkoutBuilder();
		this.playerHelper_ = new Model.PlayerHelper(builder.getInterval());

		this.state = this.getState();
	}

	getState(): any {
		let bei: Model.AbsoluteTimeInterval = this.playerHelper_.get(this._getElapsedTimeSeconds());
		if (bei == null) {
			return {};
		}
		console.log("Elapsed on get: " + this._getElapsedTimeSeconds() + " bei: " + bei.getInterval().getTitle());
		// TODO: Do a better job getting the title. I think it can be
		// as simple as the title plus rep number (for repeat intervals)
		let s = {
			current_title: bei.getInterval().getTitle(),
			elapsed_time: Model.FormatterHelper.formatTime(this._getElapsedTimeMilliseconds(bei)),
			remaining_time: Model.FormatterHelper.formatTime(this._getRemainingTimeMilliseconds(bei)),
			total_time_elapsed: Model.FormatterHelper.formatTime(this.stopWatch_.getElapsedTimeMillis()),
			total_time_workout: Model.FormatterHelper.formatTime(this.playerHelper_.getDurationTotalSeconds() * 1000)
		};
		// TODO: Remove this here.
		console.log(JSON.stringify(s));
		return s;
	}

	_getElapsedTimeMilliseconds(bei: Model.AbsoluteTimeInterval): number {
		return this.stopWatch_.getElapsedTimeMillis() - bei.getBeginSeconds() * 1000;
	}

	_getRemainingTimeMilliseconds(bei: Model.AbsoluteTimeInterval): number {
		return bei.getEndSeconds() * 1000 - this.stopWatch_.getElapsedTimeMillis();
	}

	_getElapsedTimeSeconds(): number {
		return this.stopWatch_.getElapsedTimeMillis() / 1000;
	}

	_start(e) {
		this.stopWatch_.start();

		if (this.intervalId_ === null) {
			this.intervalId_ = setInterval(this._onIntervalElapsed.bind(this), 100);
		}
	}

	_pauseAudioElement(elementName: string, pause: boolean) {
		var element = this.refs[elementName] as HTMLAudioElement;
		if (pause) {
			if (!element.paused) {
				element.pause();
			}
		} else {
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
		} else {
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
		let bei = this.playerHelper_.getNext(this._getElapsedTimeSeconds());
		if (bei == null) {
			return;
		}
		this.stopWatch_.moveStartTime(bei.getBeginSeconds() * 1000);

		// Update state.
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
			case 115: // s
				this._start(e);
				break;
			case 112: // p
				this._pause(e);
				break;
			case 110: // n
				this._next(e);
				break;
			case 114: // r
				this._reset(e);
				break;
		}
	}

	componentDidMount() {
		window.addEventListener("keypress", this._onKeyPress.bind(this));

		// Get the WorkoutView and fill with the parameters.
		var view: WorkoutView = this.refs['view'] as WorkoutView;
		view.refresh(this.params_);
	}

	render() {
		return (<div>
			<h1> Title: <span>{this.state.current_title}</span></h1>
			<h2> Elapsed: <span>{this.state.elapsed_time}</span></h2>
			<h2> Remaining: <span>{this.state.remaining_time}</span></h2>
			<hr />
			<div> Total workout duration: <span />{this.state.total_time_workout}</div>
			<div> Total workout elapsed: <span>{this.state.total_time_elapsed}</span></div>
			<table ref="workout_summary" ></table>
			<form>
				<input type="button" value="Start (S)" onClick={e => this._start(e)} />
				<input type="button" value="Pause (P)" onClick={e => this._pause(e)} />
				<input type="button" value="Next Set (N)" onClick={e => this._next(e)} />
				<input type="button" value="Reset (R)" onClick={e => this._reset(e)} />
				<br />
			</form>
			<WorkoutView {...this.props} ref='view'></WorkoutView>
			<audio ref="countdown" hidden={false}>
				<source src="countdown.wav" type="audio/wav" />
				Your browser does not support the audio element.
					</audio>
			<audio ref="ding" hidden={false}>
				<source src="ding.wav" type="audio/wav" />
			</audio>
		</div>);
	}
}
