import React from "react";
import { Grid, Box } from "grommet";
import Window from "./Window"
import CommandPanel from "./CommandPanel"
import Notepad from "./Notepad"
import Output from "./Output"
import { RealtimeClient } from "./WebRTCHost";
import styled from "styled-components";
import { theme } from "./Theme"

const Command = styled.p`
  font-family: ${theme['code-font-family']};
  font-size: ${theme['font-size']};

  &:before {
    content: '$ '
  }
`
const CommandOutput = styled.p`
  font-family: ${theme['code-font-family']};
  font-size: ${theme['font-size']};
`
interface History {
  type: string
  display: string
}
interface State {
  client: any
  history: Array<History>
}
class Admin extends React.Component<{}, State> {
  commandPanel: any
  constructor(props) {
    super(props)
    let client = new RealtimeClient()
    this.state = {
      client: new RealtimeClient(),
      history: []
    }

    this.componentDidMount = this.componentDidMount.bind(this)

  }
  componentDidMount() {
    let self = this
    this.state.client.subscribeInput((data) => {
      self.newUserInput(data)
    })
  }

  newUserInput(cmd) {
    let history = this.state.history
    history.push({type: 'input', display: cmd})
    this.setState({ 
      history: history
    })
    this.commandPanel.processInput(cmd)
  }

  newOutput(out) {
    let history = this.state.history
    history.push({type: 'output', display: out})
    this.setState({
      history: history
    })
  }

  sendOutput(out) {
    this.newOutput(out)
    this.state.client.output(out)
  }

  render() {
    return <Grid
      rows={['50%', '50%']}
      columns={['50%', '50%']}
      gap="none"
      areas={[
        ['terminal','commands'],
        ['output','notes'],
      ]}
      fill={true}
    >
      <Box gridArea="terminal">
        <Window>
          {this.state.history.map(item => {
            if (item.type==='input') {
              return <Command>{item.display}</Command>
            } else if (item.type==='output') {
              return <CommandOutput>{item.display}</CommandOutput>
            }
          })}
        </Window>
      </Box>
      <Output gridArea="output" admin={this}/>
      <CommandPanel gridArea="commands" admin={this} ref={(ref) => this.commandPanel = ref}/>
      <Notepad gridArea="notes"/>
    </Grid>
  }
}

export default Admin;