import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux'
import App from './views/App';
import store from "./store";
import './index.css'
import 'antd/dist/antd.css';

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
