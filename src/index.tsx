import ReactDOM from 'react-dom';
import './index.css';
import { App } from './App/App';
document.oncontextmenu = function () {
  return false;
};
ReactDOM.render(<App />, document.getElementById('root'));
