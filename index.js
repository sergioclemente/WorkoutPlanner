// make the commonjs happy
window.exports = {}

var UI = require("./ui");
var Workout = require("./app/workout").default;

var React = require('react');
var ReactDOM = require('react-dom');

function _init() {
    // Use params as react expects a plain object
    var params = Object.assign(new Object(), new UI.QueryParams());
    ReactDOM.render(
        React.createElement(Workout, params),
        document.getElementById('workout')
    );
}

window.onload = _init;