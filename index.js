// make the commonjs happy
window.exports = {}

var UI = require("./ui");
var Workout = require("./app/workout").default;
var WorkoutViews = require("./app/workout_views").default;
var PlayerView = require("./app/player").default;

var React = require('react');
var ReactDOM = require('react-dom');

function _init() {
    // Use params as react expects a plain object
    let params = new UI.QueryParams();
    var params_wrapper = Object.assign(new Object(), params);
    if (params.page == 'list') {
        ReactDOM.render(
            React.createElement(WorkoutViews),
            document.getElementById('main')
        );
    } else if (params.page == 'player') {
        ReactDOM.render(
            React.createElement(PlayerView, params_wrapper),
            document.getElementById('main')
        );
    } else {
        ReactDOM.render(
            React.createElement(Workout, params_wrapper),
            document.getElementById('main')
        );
    }
}

window.onload = _init;