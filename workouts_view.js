// make the commonjs happy
window.exports = {}

var UI = require("./ui");
var WorkoutViews = require("./app/workout_views").default;

var React = require('react');
var ReactDOM = require('react-dom');

function _init() {
    ReactDOM.render(
        React.createElement(WorkoutViews),
        document.getElementById('workout_views')
    );
}

window.onload = _init;	