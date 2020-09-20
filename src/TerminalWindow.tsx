import React from "react";

import Window from './Window'
import Terminal from './Terminal'
import TerminalCommandOutput from "./TerminalCommandOutput"
import TerminalCommand from "./TerminalCommand"
import WindowTitleBar from "./WindowTitleBar"
import './terminal.scss';

class TerminalWindow extends React.Component {
  render() {
    return <Window>
      <Terminal />
    </Window>
  }
}

export default TerminalWindow;