import React from "react";
import { Box, Button, Footer, Layer, FormField, TextInput, TextArea, Grid } from "grommet";
import styled from "styled-components";

interface PanelProps {
  gridArea?: string
  admin: any
}
interface MatchedCommand {
  cmd: string
  output: string
}
interface PanelState {
  showAdd: boolean
  newCmd?: string
  newOutput?: string
  cmds: Array<MatchedCommand>
}

class CommandPanel extends React.Component<PanelProps, PanelState> {
  constructor(props) {
    super(props)
    let storedCmds = window.localStorage.getItem('cmds')
    let cmds: Array<MatchedCommand> = []
    if (storedCmds) {
      let data = JSON.parse(storedCmds)
      data.forEach(element => {
        cmds.push({cmd: element.cmd, output: element.output})
      })
    }
    this.state = { showAdd: false, cmds: cmds }
    this.showAdd = this.showAdd.bind(this)
    this.hideAdd = this.hideAdd.bind(this)
    this.addCommand = this.addCommand.bind(this)
    this.saveCommands = this.saveCommands.bind(this)
    this.processInput = this.processInput.bind(this)
  }

  showAdd() {
    this.setState({ showAdd: true })
  }

  hideAdd() {
    this.setState({ showAdd: false })
  }

  saveCommands() {
  }

  processInput(cmd) {
    let resp = this.state.cmds.find((item) => {
      return cmd == item.cmd
    })
    if (resp) {
      this.props.admin.sendOutput(resp.output)
    }
  }

  componentDidMount() {
  }
  addCommand() {
    let cmds = this.state.cmds
    if (this.state.newCmd && this.state.newOutput) {
      cmds.push({cmd: this.state.newCmd, output: this.state.newOutput})
    }
    window.localStorage.setItem('cmds', JSON.stringify(cmds))
    this.setState({
      cmds: cmds,
      newCmd: '',
      newOutput: ''
    })
    this.hideAdd()
  }

  render() {
    return <Box gridArea={this.props.gridArea} fill={true}>
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
      {this.state.cmds.map((item, idx) => (
        <Grid columns={['small','medium']} areas={[['cmd','output']]} gap="xsmall" pad="xsmall">
          <Box gridArea="cmd">
            {item.cmd}
          </Box>
          <Box gridArea="output">
            {item.output}
          </Box>
        </Grid>
      ))}
      <Footer pad="small" align="end" direction="row-reverse">
        <Button primary alignSelf="end" label="Add new command" onClick={this.showAdd}/>
      </Footer>
    </Box>
  }
}

export default CommandPanel