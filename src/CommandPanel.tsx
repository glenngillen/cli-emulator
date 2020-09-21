import React from "react";
import { Box, Button, Footer, Layer, FormField, TextInput, TextArea, Grid } from "grommet";
import styled, { keyframes } from "styled-components";
import { theme } from "./Theme";

interface PanelProps {
  gridArea?: string
  admin: any
}
interface MatchedCommand {
  cmd: string
  output: string
  active?: boolean
}
interface PanelState {
  showAdd: boolean
  newCmd?: string
  newOutput?: string
  cmds: Array<MatchedCommand>
}

const highlight = keyframes`
  from { background: yellow; }
  to { background: initial; }
`
const Cmd = styled(Box)`
  font-family: ${theme['code-font-family']};
  font-size: ${theme['font-size']};
  background: #ddd;
  color: #333;
  padding: ${theme['grid-base-spacing']};
  border-bottom: 1px solid #aaa;

  &.active {
    animation: ${highlight} 2s;
  }
  
`
const Output = styled(Box)`
  font-family: ${theme['code-font-family']};
  font-size: ${theme['font-size']};
  background: #ddd;
  color: #333;
  padding: ${theme['grid-base-spacing']};
  border-bottom: 1px solid #aaa;

  &.active {
    animation: ${highlight} 2s;
  }
`
class CommandPanel extends React.Component<PanelProps, PanelState> {
  constructor(props) {
    super(props)
    this.state = { showAdd: false, cmds: [] }
    this.showAdd = this.showAdd.bind(this)
    this.hideAdd = this.hideAdd.bind(this)
    this.addCommand = this.addCommand.bind(this)
    this.saveCommands = this.saveCommands.bind(this)
    this.loadCommands = this.loadCommands.bind(this)
    this.processInput = this.processInput.bind(this)
  }

  showAdd() {
    this.setState({ showAdd: true })
  }

  hideAdd() {
    this.setState({ showAdd: false })
  }

  loadCommands() {
    let storedCmds = window.localStorage.getItem('cmds')
    let cmds: Array<MatchedCommand> = []
    if (storedCmds) {
      let data = JSON.parse(storedCmds)
      data.forEach(element => {
        cmds.push({cmd: element.cmd, output: element.output})
      })
    }
    this.setState({ cmds: cmds })
  }
  saveCommands() {
    let cmds = this.state.cmds
    window.localStorage.setItem('cmds', JSON.stringify(cmds))
  }

  processInput(cmd) {
    let idx = this.state.cmds.findIndex((item) => {
      return cmd == item.cmd
    })
    if (idx >= 0) {
      let cmds = this.state.cmds
      let resp = cmds[idx]
      cmds[idx].active = true
      this.setState({ cmds: cmds })
      let self = this
      setTimeout(() => {
        cmds[idx].active = false
        self.setState({ cmds: cmds })
      },2000)
      this.props.admin.sendOutput(resp.output)
    }
  }

  componentDidMount() {
    this.loadCommands()
  }

  addCommand() {
    let cmds = this.state.cmds
    if (this.state.newCmd && this.state.newOutput) {
      cmds.push({cmd: this.state.newCmd, output: this.state.newOutput})
    }
    this.setState({
      cmds: cmds,
      newCmd: '',
      newOutput: ''
    })
    this.saveCommands()
    this.hideAdd()
  }

  render() {
    return <Box gridArea={this.props.gridArea} fill={true} direction="column">
      {this.state.showAdd && (
        <Layer onEsc={this.hideAdd} full={true}>
          <Box pad="medium">
            <FormField label="Command to match">
              <TextInput onChange={event => this.setState({newCmd: event.target.value})}/>
            </FormField>
            <FormField label="Command output">
              <TextArea onChange={event => this.setState({newOutput: event.target.value})}/>
            </FormField>
            <Box direction="row-reverse">
              <Button primary label="Add command" onClick={this.addCommand}/>
            </Box>
          </Box>
        </Layer>
      )}
      <Box flex="grow">
        {this.state.cmds.map((item, idx) => (
          <Grid columns={['small','flex']} areas={[['cmd','output']]} gap="none" pad="none" >
            <Cmd gridArea="cmd" className={item.active ? 'active' : ''}>
              {item.cmd}
            </Cmd>
            <Output gridArea="output" className={item.active ? 'active' : ''}>
              {item.output}
            </Output>
          </Grid>
        ))}
      </Box>
      <Footer pad="small" align="end" direction="row-reverse">
        <Button primary alignSelf="end" label="Add new command" onClick={this.showAdd}/>
      </Footer>
    </Box>
  }
}

export default CommandPanel