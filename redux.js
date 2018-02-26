import { applyMiddleware, createStore } from "redux"
import { combineReducers } from "redux"
import logger from "redux-logger"
import thunk from "redux-thunk"
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider, connect } from 'react-redux'

const reducerValue = (state=0, action) => {
    if (action.type === "INCREMENT") {
        return state + action.payload;
    }
    return state;
}

const reducer = combineReducers({
  value: reducerValue,
})

const middleware = applyMiddleware(thunk, logger);
const store = createStore(reducer, middleware);

store.dispatch((dispatch) =>{
    dispatch({type: "INCREMENT", payload: 10});
});


// class Layout extends React.Component {
//   componentWillMount() {
//   }

//   render() {
//     const { counter } = this.props;

//     return <div>
//       <h1>Counter</h1>
//       <ul>{counter}</ul>
//     </div>
//   }
// }

const app = document.getElementById('app');
ReactDOM.render(<Provider store={store}>
  <Layout />
</Provider>, app);