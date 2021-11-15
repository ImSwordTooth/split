import { applyMiddleware,createStore,compose } from "redux";
import thunk from 'redux-thunk'
import reducers from './reducer'
import { defaultState } from './state'
// 创建store实例
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
    reducers,
    defaultState,
    composeEnhancers(
        applyMiddleware(thunk), /* enhancer(middleware) */
    )
);

export default store
