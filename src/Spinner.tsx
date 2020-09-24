import React from 'react'
import styled from "styled-components"

interface SpinnerState {
  step: number
}
const Spin = styled.span`
  white-space: pre;
`
class Spinner extends React.Component<{}, SpinnerState> {
  frames: Array<string>
  intervalId?: NodeJS.Timeout

  constructor(props) {
    super(props)
    this.frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    this.state = { step: 0 }
  }
  componentDidMount() {
    this.intervalId = setInterval(() => {
      let nextStep = this.state.step == (this.frames.length - 1) ? 0 : this.state.step + 1
      this.setState({ step: nextStep })
    }, 80)
  }
  componentWillUnmount() {
    if (this.intervalId) clearInterval(this.intervalId)
  }
  render() {
    return <Spin>
      {this.frames[this.state.step]}   
    </Spin>
  }
}
export default Spinner