var UI = require("./ui");
var Workout = require("./app/workout").default;

var React = require('react');
var ReactDOM = require('react-dom');

function _init() {
	// Initialize the fields
	var params = new UI.QueryParams();

	ReactDOM.render(
	  React.createElement(Workout, params),
	  document.getElementById('workout')
	);
}

window.onload = _init;
