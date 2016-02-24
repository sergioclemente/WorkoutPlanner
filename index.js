var Model = require("./model");
var UI = require("./ui");
var UserSettings = require("./app/user_settings");
var WorkoutInput = require("./app/workout_input");

var React = require('react');
var ReactDOM = require('react-dom');

var user_react_instance = null;
var workout_input_instance = null;

function _onKeyChanged(e) {
	var ch = String.fromCharCode(e.keyCode);
	if (!Model.IntervalParser.shouldParse(ch)) {
		return;
	}
	_loadWorkout(ch);
}

function _onButtonPressed(e) {
	_loadWorkout("");
}

function _loadWorkout(ch) {
	// TODO: this is incorrect (specially if you type in the middle of the text)
	var workoutText = _getValue("workout") + ch;

	var iframe = document.getElementById("workout_frame");
	var download_anchor = document.getElementById("download_mrc");
	var download_anchor_zwo = document.getElementById("download_zwo");
	var email_send_workout_anchor = document.getElementById("email_send_workout");

	var qp = new UI.QueryParams();
	qp.ftp_watts = user_react_instance.getFTP();
	qp.email = user_react_instance.getEmail();
	qp.t_pace = user_react_instance.getTPace();
	qp.sport_type = workout_input_instance.getSportType();
	qp.output_unit = workout_input_instance.getUnitType();
	qp.workout_text = workoutText;

	var params = qp.getURL();

	var url = "workout_view.html" + params;
	var mrc_url = "workout.mrc" + params;
	var zwo_url = "workout.zwo" + params;
	var email_url = "send_mail" + params;

	iframe.src = url;
	download_anchor.href = mrc_url;
	download_anchor_zwo.href = zwo_url;
	email_send_workout_anchor.href = email_url;

	qp.saveToStorage();
}

function _setValue(element_id, text) {
	if (!text) {
		return;
	}
	var element = document.getElementById(element_id);
	if (element) {
		element.value = text;
	} else {
		console.log("element " + element_id + " does not exist!");
	}
}

function _getValue(element_id) {
	var element = document.getElementById(element_id);
	if (element) {
		return element.value;
	} else {
		console.log("element " + element_id + " does not exist!");
	}
}

function _init() {
	// Initialize the fields
	var qp = new UI.QueryParams();
	_setValue("workout", qp.workout_text);

	// Load workouts
	var btnLoadWorkout = document.getElementById("btnLoadWorkout");
	btnLoadWorkout.addEventListener("click", _onButtonPressed);

	// Key Pressed
	var workout = document.getElementById("workout");
	workout.addEventListener("keypress", _onKeyChanged);

	var user_react_type = React.createElement(UserSettings.UserPropertyElement, qp);
	user_react_instance = ReactDOM.render(
	  user_react_type,
	  document.getElementById('user_prop')
	);

	var workout_input_type = React.createElement(WorkoutInput.WorkoutInputElement, qp);
	workout_input_instance = ReactDOM.render(
	  workout_input_type,
	  document.getElementById('workout_settings')
	);

	_loadWorkout("");
}

window.onload = _init;

