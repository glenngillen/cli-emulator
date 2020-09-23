import React from "react";

import Window from './Window'
import Terminal from './Terminal'

class TerminalWindow extends React.Component {
  term: any
  constructor(props) {
    super(props)
    this.click = this.click.bind(this)
  }
  click() {
    this.term.handleClick()
  }
  render() {
    return <Window onClick={this.click}>
      <Terminal ref={(ref) => this.term = ref}/>
    </Window>
  }
}

export default TerminalWindow;