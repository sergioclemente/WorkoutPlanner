// node_modules/webpack/bin/webpack.js  redux.js --output-filename redux.min.js
import { applyMiddleware, createStore } from "redux"
import { combineReducers } from "redux"
import logger from "redux-logger"
import thunk from "redux-thunk"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { Provider, connect } from 'react-redux'

const reducerValue = (state=0, action) => {
    if (action.type === "INCREMENT") {
        return state + action.payload;
    } else if (action.type === "DECREMENT") {
        return state - action.payload;
    }
    return state;
}

const reducer = combineReducers({
  value: reducerValue,
})

const middleware = applyMiddleware(thunk, logger);
const store = createStore(reducer, middleware);

store.dispatch((dispatch) =>{
    dispatch({type: "INCREMENT", payload: 30});
});

store.dispatch((dispatch) =>{
    dispatch({type: "DECREMENT", payload: 10});
});

var mapStateToProps = function(state) {
    return {
        counter: state.value
    }
}

interface LayoutProps {
    counter: number;
}

class Layout extends React.Component<LayoutProps, any> {
  componentWillMount() {
  }

  render() {
    const { counter } = this.props;

    return <div>
      <h1>Counter</h1>
      <ul>{counter}</ul>
    </div>
  }
}

var LayoutContainer = connect(mapStateToProps)(Layout);

const app = document.getElementById('app');
console.log(app);
ReactDOM.render(<Provider store={store}>
  <LayoutContainer />
</Provider>, app);