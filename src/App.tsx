import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import { Box, Grommet } from 'grommet'
import TerminalWindow from './TerminalWindow';
import Admin from './Admin';

class App extends React.Component {
  render() {
    return <Router>
      <Grommet style={{height: '100%'}}>
        <Switch>
          <Route path="/admin">
            <Admin />
          </Route>
          <Route path="/">
            <Box fill={true} alignSelf="stretch" alignContent="center" pad="xlarge" align="center" justify="center">
              <TerminalWindow />
            </Box>
          </Route>
        </Switch>
      </Grommet>
    </Router>
  }
}

export default App;
