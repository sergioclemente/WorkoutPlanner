"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDOM = require("react-dom");
const workout_1 = require("./app/workout");
const workout_views_1 = require("./app/workout_views");
const player_1 = require("./app/player");
const ui_1 = require("./ui");
function _init() {
    let params = new ui_1.QueryParamsWorkoutView();
    var params_wrapper = Object.assign(new Object(), params);
    if (params.page.value == 'list') {
        ReactDOM.render(React.createElement(workout_views_1.default), document.getElementById('main'));
    }
    else if (params.page.value == 'player') {
        ReactDOM.render(React.createElement(player_1.default, params_wrapper), document.getElementById('main'));
    }
    else {
        ReactDOM.render(React.createElement(workout_1.default, params_wrapper), document.getElementById('main'));
    }
}
window.onload = _init;
