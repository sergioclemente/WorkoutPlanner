import * as React from 'react';
import { createRoot } from 'react-dom/client';

import Workout from './app/workout'
import WorkoutViews from './app/workout_views'
import PlayerView from './app/player'
import {QueryParamsWorkoutView} from './ui';


function _init() {
    const container = document.getElementById('main');
    const root = createRoot(container!);
    // Use params as react expects a plain object
    let params = new QueryParamsWorkoutView();
    var params_wrapper = Object.assign(new Object(), params);
    if (params.page.value == 'list') {
        root.render(
            React.createElement(WorkoutViews),
        );
    } else if (params.page.value == 'player') {
        root.render(
            React.createElement(PlayerView, params_wrapper),
        );
    } else {
        root.render(
            React.createElement(Workout, params_wrapper),
        );
    }
}
window.onload = _init;