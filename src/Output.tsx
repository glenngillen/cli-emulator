import React from "react";
import { Box, TextArea } from "grommet";
import styled from "styled-components";

interface OutputProps {
  gridArea?: string
  client: any
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
      this.props.client.output(event.target.value)
      this.props.admin.newOutput(event.target.value)
      event.target.value = ''
    }
  }
  render() {
    return <Box gridArea={this.props.gridArea} >
      <TextArea fill={true} onKeyPress={this.respond}/>
    </Box>
  }
}

export default Output