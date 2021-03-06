import * as React from 'react';
import * as ReactDOM from 'react-dom'

import Workout from './app/workout'
import WorkoutViews from './app/workout_views'
import PlayerView from './app/player'
import {QueryParamsWorkoutView} from './ui';


function _init() {
    // Use params as react expects a plain object
    let params = new QueryParamsWorkoutView();
    var params_wrapper = Object.assign(new Object(), params);
    if (params.page.value == 'list') {
        ReactDOM.render(
            React.createElement(WorkoutViews),
            document.getElementById('main')
        );
    } else if (params.page.value == 'player') {
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