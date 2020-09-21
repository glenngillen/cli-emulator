import React from "react";
import { Box, TextArea } from "grommet";
import styled from "styled-components";
import { theme } from "./Theme"

const Out = styled(TextArea)`
  background: #2b303b;
  color: #fff;
  font-family: ${theme['code-font-family']};
  font-size: ${theme['font-size']};
  font-weight: normal;
  white-space: pre;
`
interface OutputProps {
  gridArea?: string
  admin: any
}
interface OutputState {
  notes?: string 
}
class Output extends React.Component<OutputProps, OutputState> {
  constructor(props) {
    super(props);
    this.respond = this.respond.bind(this)
  }

  respond(event) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      this.props.admin.sendOutput(event.target.value)
      event.target.value = ''
    }
  }
  render() {
    return <Box gridArea={this.props.gridArea} >
      <Out fill={true} onKeyPress={this.respond} resize={false} placeholder="Put command responses in here (CMD+Enter to send)"/>
    </Box>
  }
}

export default Output