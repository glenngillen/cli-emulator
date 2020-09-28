import React from "react";
import styled from "styled-components"

import Window from './Window'
import Terminal from './Terminal'
const Bottom = styled.span``

class TerminalWindow extends React.Component {
  term: React.RefObject<Terminal>
  wnd: React.RefObject<Window>
  bottom: React.RefObject<typeof Bottom>
  constructor(props) {
    super(props)
    this.term = React.createRef()
    this.wnd = React.createRef()
    this.bottom = React.createRef()
    this.click = this.click.bind(this)
    this.updated = this.updated.bind(this)
  }
  click() {
    this.term?.current?.handleClick()
  }
  updated() {
    if (this.bottom.current) this.bottom.current.scrollIntoView()
  }
  componentDidMount() {
  }
  render() {
    return <Window onClick={this.click} ref={this.wnd}>
      <Terminal ref={this.term} updated={this.updated}/>
      <Bottom ref={this.bottom} />
    </Window>
  }
}

export default TerminalWindow;