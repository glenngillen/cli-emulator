import React from "react";
import { Grid, Box } from "grommet";
import Window from "./Window"
import CommandPanel from "./CommandPanel"
import Notepad from "./Notepad"
import Output from "./Output"
import { RealtimeClient } from "./WebRTCHost";
import styled from "styled-components";

const Command = styled.p`
  &:before {
    content: '$ '
  }
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
  }

  newOutput(out) {
    let history = this.state.history
    history.push({type: 'output', display: out})
    this.setState({
      history: history
    })
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
          {this.state.history.map(item => (
            <Command>{item.display}</Command>
          ))}
        </Window>
      </Box>
      <Output gridArea="output" client={this.state.client} admin={this}/>
      <CommandPanel gridArea="commands"/>
      <Notepad gridArea="notes"/>
    </Grid>
  }
}

export default Admin;