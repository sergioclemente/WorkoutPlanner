/// <reference path="../type_definitions/canvasjs.d.ts" />

import * as React from 'react';
import * as UI from '../ui';
import * as Core from '../core';
import * as User from '../user';
import * as Player from '../player';
import * as Visitor from '../visitor';
import WorkoutView from './workout_view';

export default class PlayerView extends React.Component<any, any> {
	private stopWatch_: Player.StopWatch = null;
	private params_: UI.QueryParamsWorkoutView = null;
	private playerHelper_: Player.PlayerHelper = null;
	private intervalId_: NodeJS.Timeout = null;

	constructor(params: any) {
		super(params);

		this.stopWatch_ = new Player.StopWatch();
		this.params_ = UI.QueryParamsWorkoutView.createCopy(params);

		let builder = this.params_.createWorkoutBuilder();

		let of = new User.ObjectFactory(this.params_.createUserProfile(), builder.getSportType());
		this.playerHelper_ = new Player.PlayerHelper(of, builder.getInterval());

		this.state = this.getState();
	}

	getState(): any {
		let bei: Visitor.AbsoluteTimeInterval = this.playerHelper_.get(this._getElapsedTimeSeconds());
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

	_getElapsedTimeMilliseconds(bei: Visitor.AbsoluteTimeInterval): number {
		return this.stopWatch_.getElapsedTimeMillis() - bei.getBeginSeconds() * 1000;
	}

	_getRemainingTimeMilliseconds(bei: Visitor.AbsoluteTimeInterval): number {
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
			this._pauseAudioElement("end", false);
			clearInterval(this.intervalId_);
			this.intervalId_ = null;
			return;
		}

		let durationIntervalMilliseconds = bei.getDurationSeconds() * 1000;
		// If the interval lasts more than 3.5, we will plan the countdown.
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
			<audio ref="end" hidden={false}>
				<source src="end.wav" type="audio/wav" />
				Your browser does not support the audio element.
			</audio>
		</div>);
	}
}
