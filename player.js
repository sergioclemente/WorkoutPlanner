// make the commonjs happy
window.exports = {}

var UI = require("./ui");
var PlayerView = require("./app/player").default;

var React = require('react');
var ReactDOM = require('react-dom');

function _init() {
    // Use params as react expects a plain object
    var params = Object.assign(new Object(), new UI.QueryParams());    
    ReactDOM.render(
        React.createElement(PlayerView, params),
        document.getElementById('player')
    );
}

window.onload = _init;	