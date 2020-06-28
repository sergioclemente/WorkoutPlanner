"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerHelper = exports.StopWatch = void 0;
const visitor_1 = require("./visitor");
class StopWatch {
    constructor() {
        this.startTimeMillis = null;
        this.stoppedDurationMillis = null;
    }
    start() {
        if (this.startTimeMillis === null) {
            this.startTimeMillis = Date.now();
        }
    }
    stop() {
        if (this.startTimeMillis !== null) {
            this.stoppedDurationMillis += Date.now() - this.startTimeMillis;
            this.startTimeMillis = null;
        }
    }
    reset() {
        this.startTimeMillis = null;
        this.stoppedDurationMillis = 0;
    }
    getIsStarted() {
        return this.startTimeMillis !== null;
    }
    getElapsedTimeMillis() {
        if (this.startTimeMillis !== null) {
            return (Date.now() - this.startTimeMillis) + this.stoppedDurationMillis;
        }
        else {
            return this.stoppedDurationMillis;
        }
    }
    moveStartTime(durationMillis) {
        if (this.startTimeMillis != null) {
            this.startTimeMillis = Date.now() - durationMillis;
        }
        else {
            this.stoppedDurationMillis = durationMillis;
        }
    }
}
exports.StopWatch = StopWatch;
class PlayerHelper {
    constructor(of, interval) {
        this.data_ = [];
        this.durationTotalSeconds_ = 0;
        var pv = new visitor_1.AbsoluteTimeIntervalVisitor(of);
        visitor_1.VisitorHelper.visitAndFinalize(pv, interval);
        this.data_ = pv.getIntervalArray();
        this.durationTotalSeconds_ = interval.getTotalDuration().getSeconds();
    }
    get(ts) {
        for (let i = 0; i < this.data_.length; i++) {
            let bei = this.data_[i];
            if (ts >= bei.getBeginSeconds() && ts <= bei.getEndSeconds()) {
                return bei;
            }
        }
        return null;
    }
    getNext(ts) {
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
    getDurationTotalSeconds() {
        return this.durationTotalSeconds_;
    }
}
exports.PlayerHelper = PlayerHelper;
