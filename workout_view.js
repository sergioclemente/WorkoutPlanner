var Model = require("./model");
var UI = require("./ui");

  function _loadWorkoutWithData(params) {
  	var userProfile = new Model.UserProfile(params.ftp_watts, params.t_pace, params.email);
  	var builder = new Model.WorkoutBuilder(userProfile, params.sport_type, params.output_unit).withDefinition(params.workout_text);
  	var workout_pretty = builder.getPrettyPrint();
  	_setInnerText("workout_pretty", workout_pretty);

  	// Timeline chart
  	var points = builder.getInterval().getTimeSeries();

  	var chartTimeline = new CanvasJS.Chart("chartTimelineContainer", {
  		title: {
  			text: ""
  		},
  		axisX: {
  			title: "time",
  			suffix: "min",
  			gridColor: "lightgray",
  			gridThickness: 1,
  		},
  		axisY: {
  			title: "intensity",
  			labelAngle: 45,
  			minimum: 45,
  			suffix: "%",
  			gridThickness: 0,
  		},
  		data: [{
  			type: "area",
  			fillOpacity: 0.3,
  			markerType: "none",
  			dataPoints: points
  		}]
  	});

  	chartTimeline.render();

  	// Zones chart
  	var dataPoints = builder.getInterval().getTimeInZones(builder.getSportType()).map(
  		function(zone) {
  			return {
  				y: zone.duration.getSeconds(),
  				legendText: zone.name + "(" + zone.duration.toString() + ")",
  				indexLabel: zone.name
  			}
  		}
  	);

  	var chartZones = new CanvasJS.Chart("chartZonesContainer", {
  		title: {
  			text: "Time in zones"
  		},
  		data: [{
  			type: "pie",
  			showInLegend: true,
  			dataPoints: dataPoints
  		}]
  	});
  	chartZones.render();
  }

  function _setInnerText(element_id, text) {
  	var element = document.getElementById(element_id);
  	if (element) {
  		element.innerText = text;
  	} else {
  		console.log("element " + element_id + " does not exist!");
  	}
  }

  function _init() {
  	var params = new UI.QueryParams();
  	if (params.validate()) {
  		_loadWorkoutWithData(params);
  	} else {
  		throw new Error("Could not load configuration, please type ftp, t-pace, email and the workout in the fields");
  	}
  }

  window.onload = _init;

  window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
  	_setInnerText("error_container", errorMsg);
  	return false;
  }