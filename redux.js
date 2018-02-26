"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// node_modules/webpack/bin/webpack.js  redux.js --output-filename redux.min.js
const redux_1 = require("redux");
const redux_2 = require("redux");
const redux_logger_1 = require("redux-logger");
const redux_thunk_1 = require("redux-thunk");
const React = require("react");
const ReactDOM = require("react-dom");
const react_redux_1 = require("react-redux");
const reducerValue = (state = 0, action) => {
    if (action.type === "INCREMENT") {
        return state + action.payload;
    }
    else if (action.type === "DECREMENT") {
        return state - action.payload;
    }
    return state;
};
const reducer = redux_2.combineReducers({
    value: reducerValue,
});
const middleware = redux_1.applyMiddleware(redux_thunk_1.default, redux_logger_1.default);
const store = redux_1.createStore(reducer, middleware);
store.dispatch((dispatch) => {
    dispatch({ type: "INCREMENT", payload: 30 });
});
store.dispatch((dispatch) => {
    dispatch({ type: "DECREMENT", payload: 10 });
});
var mapStateToProps = function (state) {
    console.log("MapStateToProps");
    return {
        counter: state.value
    };
};
let Layout = ({ counter }) => {
    return (React.createElement("div", null,
        React.createElement("h1", null, "Counter"),
        React.createElement("ul", null, counter)));
};
var LayoutContainer = react_redux_1.connect(mapStateToProps)(Layout);
const app = document.getElementById('app');
console.log(app);
ReactDOM.render(React.createElement(react_redux_1.Provider, { store: store },
    React.createElement(LayoutContainer, null)), app);
