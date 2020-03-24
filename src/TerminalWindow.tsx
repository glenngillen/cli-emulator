import React from "react";

import Terminal from './Terminal'
import TerminalCommandOutput from "./TerminalCommandOutput"
import TerminalCommand from "./TerminalCommand"
import './terminal.scss';

interface Props {
  peer?: string
}
class TerminalWindow extends React.Component<Props> {
  render() {
    return <div id="window">
      <div id="bar">
        <svg height="20" width="100">
          <circle cx="24" cy="14" fill="#bf616a" r="5" />
          <circle cx="44" cy="14" fill="#ebcb8b" r="5" />
          <circle cx="64" cy="14" fill="#a3be8c" r="5" />
        </svg>
      </div>
      <div id="main">
        <div className="holder">
          <div id="content">
            <Terminal peer={this.props.peer} />
          </div>
        </div>
      </div>
    </div>
  }
}

export default TerminalWindow;