import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import './semantic-ui/semantic.min.css';
import routes from './routes';
import {Router, browserHistory} from 'react-router';
import $ from 'jquery';

ReactDOM.render(
  <Router history={browserHistory} routes={routes}/>,
  document.getElementById('root')
);
registerServiceWorker();
