import React from "react";
import { Grid, Box, Button } from "grommet";
import Window from "./Window"
import CommandPanel from "./CommandPanel"
import Notepad from "./Notepad"
import Output from "./Output"
import { RealtimeClient } from "./WebRTCHost";
import styled from "styled-components";
import replacePlaceholders from "./placeholders"
import { theme } from "./Theme"

const Command = styled.pre`
  font-family: ${theme['code-font-family']};
  font-size: ${theme['font-size']};
  white-space: pre-wrap;

  &:before {
    content: '$ '
  }
`
const CommandOutput = styled.pre`
  font-family: ${theme['code-font-family']};
  font-size: ${theme['font-size']};
  white-space: pre-wrap;
`
interface LoginPromptParams {
  password: string
  resetPassword: any
}
class LoginPrompt extends React.Component<LoginPromptParams> {
  render() { 
    return <Box>
    <CommandOutput>
      Have the other person enter the following password at the prompt: {this.props.password}
    </CommandOutput>
    <Button primary label="New session" onClick={this.props.resetPassword}/>
    </Box>
  }
}
interface History {
  type: string
  display: string
}
interface State {
  client: any
  history: Array<History>,
  password?: string
}
class Admin extends React.Component<{}, State> {
  commandPanel: any
  constructor(props) {
    super(props)
    this.state = {
      client: new RealtimeClient(),
      history: []
    }

    this.componentDidMount = this.componentDidMount.bind(this)
    this.getSessionPassword = this.getSessionPassword.bind(this)
    this.newUserInput = this.newUserInput.bind(this)
    this.resetPassword = this.resetPassword.bind(this)
    this.connect = this.connect.bind(this)
  }
  getSessionPassword() {
    if (!window.localStorage.getItem('password')) {
      let code = Math.random().toString(36).substring(2, 6)
      window.localStorage.setItem('password', code)
    }
    let password = window.localStorage.getItem('password')
    return password as string
  }
  connect() {
    if (this.state.password) {
      let self = this
      this.state.client.connect(this.state.password)
      this.state.client.subscribeInput((data) => {
        self.newUserInput(data)
      })
    }
  }
  componentDidMount() {
    let password: string = this.getSessionPassword()
    this.setState({ password: password }, () => {
      this.connect()
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
    history.push({type: 'output', display: replacePlaceholders(out)})
    this.setState({
      history: history
    })
  }

  resetPassword() {
    window.localStorage.removeItem('password')
    let password: string = this.getSessionPassword()
    this.setState({ password: password }, () => {
      this.connect()
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
          {this.state.password && (
            <LoginPrompt password={this.state.password} resetPassword={this.resetPassword}/>
          )}
          {this.state.history.map((item, idx) => {
            if (item.type==='input') {
              return <Command key={"cmd-"+idx}>{item.display}</Command>
            } else if (item.type==='output') {
              return <CommandOutput key={"cmdout-"+idx}>{item.display}</CommandOutput>
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