import React from "react";
import { Box, Button, Footer, Layer, FormField, TextInput, TextArea, Grid } from "grommet";
import { Trash } from 'grommet-icons';
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
const ActionTray = styled(Box)`
  background: #ddd;
  color: #333;
  padding: ${theme['grid-base-spacing']};
  border-bottom: 1px solid #aaa;
  align: right;
  cursor: pointer;
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
  white-space: pre;

  &.active {
    animation: ${highlight} 2s;
  }
`
const NewCmd = styled(TextInput)`
  font-family: ${theme['code-font-family']};
  font-size: ${theme['font-size']};
  font-weight: normal;
  background: #2b303b;
  color: #fff;
`
const NewOutput = styled(TextArea)`
  font-family: ${theme['code-font-family']};
  font-size: ${theme['font-size']};
  font-weight: normal;
  white-space: pre;
  background: #2b303b;
  color: #fff;
  overflow: auto;
  height: 300px;
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
    this.removeCommand = this.removeCommand.bind(this)
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
      return cmd === item.cmd
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

  removeCommand(cmd) {
    let cmds = this.state.cmds
    let idx = cmds.findIndex((item) => {
      return item.cmd === cmd.cmd && item.output === cmd.output
    })
    if (idx >= 0) {
      cmds.splice(idx, 1)
      this.setState({ cmds: cmds })
      this.saveCommands()
    }
  }

  render() {
    return <Box gridArea={this.props.gridArea} fill={true} direction="column">
      {this.state.showAdd && (
        <Layer onEsc={this.hideAdd} full={true}>
          <Box pad="medium">
            <FormField label="Command to match">
              <NewCmd onChange={event => this.setState({newCmd: event.target.value})}/>
            </FormField>
            <FormField label="Command output">
              <NewOutput onChange={event => this.setState({newOutput: event.target.value})}/>
            </FormField>
            <Box direction="row-reverse">
              <Button primary label="Add command" onClick={this.addCommand}/>
            </Box>
          </Box>
        </Layer>
      )}
      <Box flex="grow">
        {this.state.cmds.map((item, idx) => (
          <Grid columns={['small','flex','xsmall']} areas={[['cmd','output','icon']]} gap="none" pad="none" >
            <Cmd gridArea="cmd" className={item.active ? 'active' : ''}>
              {item.cmd}
            </Cmd>
            <Output gridArea="output" className={item.active ? 'active' : ''}>
              {item.output}
            </Output>
            <ActionTray gridArea='icon'>
              <Button onClick={() => { this.removeCommand(item) }}>
                <Trash />
              </Button>
            </ActionTray>
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