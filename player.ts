import { ObjectFactory } from "./user";
import { AbsoluteTimeInterval, AbsoluteTimeIntervalVisitor, VisitorHelper } from "./visitor";
import { Interval } from "./core";

export class StopWatch {
	startTimeMillis: number;
	stoppedDurationMillis: number;

	constructor() {
		this.startTimeMillis = null;
		this.stoppedDurationMillis = null;
	}
	start(): void {
		if (this.startTimeMillis === null) {
			this.startTimeMillis = Date.now();
		}
	}
	stop(): void {
		if (this.startTimeMillis !== null) {
			this.stoppedDurationMillis += Date.now() - this.startTimeMillis;
			this.startTimeMillis = null;
		}
	}
	reset(): void {
		this.startTimeMillis = null;
		this.stoppedDurationMillis = 0;
	}
	getIsStarted(): boolean {
		return this.startTimeMillis !== null;
	}
	getElapsedTimeMillis(): number {
		if (this.startTimeMillis !== null) {
			return (Date.now() - this.startTimeMillis) + this.stoppedDurationMillis;
		} else {
			return this.stoppedDurationMillis;
		}
	}
	// Moves the start time so that durationMillis will be 
	// the result of getElapsedTimeMillis.
	moveStartTime(durationMillis: number) {
		if (this.startTimeMillis != null) {
			// now() - start = durationMillis
			// start = now() - durationMillis
			this.startTimeMillis = Date.now() - durationMillis;
		} else {
			// Change stopped so that when we start again
			// elapsed == durationMillis.
			this.stoppedDurationMillis = durationMillis;
		}
	}
}

// PlayerHelper is the main helper used on the player.tsx view file.
export class PlayerHelper {
	private data_: AbsoluteTimeInterval[] = [];
	private durationTotalSeconds_: number = 0;

	constructor(of: ObjectFactory, interval: Interval) {
		// Create the visitor for the AbsoluteTimeInterval.
		var pv = new AbsoluteTimeIntervalVisitor(of);

		VisitorHelper.visitAndFinalize(pv, interval);

		this.data_ = pv.getIntervalArray();
		this.durationTotalSeconds_ = interval.getTotalDuration().getSeconds();
	}

	get(ts: number): AbsoluteTimeInterval {
		// TODO: Can potentially do a binary search here.
		for (let i = 0; i < this.data_.length; i++) {
			let bei = this.data_[i];
			if (ts >= bei.getBeginSeconds() && ts <= bei.getEndSeconds()) {
				return bei;
			}
		}
		return null;
	}

	getNext(ts: number): AbsoluteTimeInterval {
		// TODO: Can potentially do a binary search here.
		for (let i = 0; i < this.data_.length; i++) {
			let bei = this.data_[i];
			if (ts >= bei.getBeginSeconds() && ts <= bei.getEndSeconds()) {
				if (i < this.data_.length - 1) {
					return this.data_[i + 1];
				}
			}
		}
		return null;
	}

	getDurationTotalSeconds(): number {
		return this.durationTotalSeconds_;
	}
}