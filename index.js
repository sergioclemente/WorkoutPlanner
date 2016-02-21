var Model = require("./model");
var UI = require("./ui");

function _onKeyChanged(e) {
	var ch = String.fromCharCode(e.keyCode);
	if (!IntervalParser.shouldParse(ch)) {
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

	var sportType = _getValue("sltSportType");

	var email = _getValue("txtEmail");
	var tPace = _getValue("txtTPace");
	var ftp = _getValue("txtFtp");
	var outputUnit = _getValue("sltOutputUnit");

	var iframe = document.getElementById("workout_frame");
	var download_anchor = document.getElementById("download_mrc");
	var download_anchor_zwo = document.getElementById("download_zwo");
	var email_send_workout_anchor = document.getElementById("email_send_workout");

	var qp = new UI.QueryParams(workoutText, ftp, tPace, sportType, outputUnit, email);
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
	_setValue("sltSportType", qp.workout_type);
	_setValue("txtFtp", qp.ftp_watts);
	_setValue("txtTPace", qp.t_pace);
	_setValue("sltOutputUnit", qp.output_unit)
	_setValue("txtEmail", qp.email);

	// Load workouts
	var btnLoadWorkout = document.getElementById("btnLoadWorkout");
	btnLoadWorkout.addEventListener("click", _onButtonPressed);

	// Selection changed
	var sltSportTypeOnChange = document.getElementById("sltSportType");
	sltSportTypeOnChange.addEventListener("change", _onButtonPressed);

	// Key Pressed
	var workout = document.getElementById("workout");
	workout.addEventListener("keypress", _onKeyChanged);

	_initOutputUnit();
}

function _initOutputUnit() {
	var sltOutputUnitElement = document.getElementById("sltOutputUnit");
	var sltSportTypeElement = document.getElementById("sltSportType");

	var isBike = sltSportTypeElement.value == 1;
	var styleHide = "none";
	var styleShow = "";
	sltOutputUnitElement.options[0].style.display = isBike ? styleShow : styleHide;
	sltOutputUnitElement.options[1].style.display = isBike ? styleHide : styleShow;
	sltOutputUnitElement.options[2].style.display = isBike ? styleHide : styleShow;
	sltOutputUnitElement.options[3].style.display = isBike ? styleHide : styleShow;
	sltOutputUnitElement.options[4].style.display = isBike ? styleHide : styleShow;
	sltOutputUnitElement.value = isBike ? "1" : "2";

	var z = {};
	if (isBike) {
		z = Model.ZonesMap.getZoneMap(Model.SportType.Bike);
	} else {
		z = Model.ZonesMap.getZoneMap(Model.SportType.Run);
	}

	var chart = new CanvasJS.Chart("chartContainer", {
		title: {
			text: "Zones",
		},
		axisY: {
			includeZero: false,
			title: "",
			interval: 5,
			minimum: 0,
		},
		axisX: {
			minimum: 0,
			interval: 1,
			title: "",
		},
		data: [{
			type: "rangeBar",
			showInLegend: false,
			yValueFormatString: "#0.##%",
			indexLabel: "{y[#index]}",
			dataPoints: [ // Y: [Low, High]
				{
					x: 1,
					y: [z[1].low, z[1].high],
					label: z[1].name
				}, {
					x: 2,
					y: [z[2].low, z[2].high],
					label: z[2].name
				}, {
					x: 3,
					y: [z[3].low, z[3].high],
					label: z[3].name
				}, {
					x: 4,
					y: [z[4].low, z[4].high],
					label: z[4].name
				}, {
					x: 5,
					y: [z[5].low, z[5].high],
					label: z[5].name
				},
			]
		}]
	});
	chart.render();
}

window.onload = _init;

