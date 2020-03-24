import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import TerminalWindow from './TerminalWindow';
import Admin from './Admin';
import './App.scss';
import { Hash } from 'crypto';

interface State {
  peer?: string
}
class App extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    let hash = window.location.hash
    if (Hash.length > 0) {
      this.state = {
        peer: hash.substring(1)
      }
    }
  }
  render() {
    return <Router>
      <div className="App">
        <Switch>
          <Route path="/admin">
            <Admin />
          </Route>
          <Route path="/">
            <TerminalWindow peer={this.state.peer} />
          </Route>
        </Switch>
      </div>
    </Router>
  }
}

export default App;
