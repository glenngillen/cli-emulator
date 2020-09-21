import React from "react";
import { Box, TextArea } from "grommet";
import styled from "styled-components";
import { theme } from "./Theme"

const Notes = styled(TextArea)`
  background: #2b303b;
  color: #fff;
  font-family: ${theme['code-font-family']};
  font-size: ${theme['font-size']};
  font-weight: normal;
  white-space: pre;
`

interface NotepadProps {
  gridArea?: string
}
interface NotepadState {
  notes?: string 
}
class Notepad extends React.Component<NotepadProps, NotepadState> {
  constructor(props) {
    super(props);
    let note = window.localStorage.getItem('notes')
    if (note) {
      this.state = {notes: JSON.parse(note)}
    } else {
      this.state = { notes: '' }
    }

    this.onchange = this.onchange.bind(this)
  }

  onchange(event) {
    this.setState({notes: event.target.value})
    console.log(window.localStorage.setItem('notes', JSON.stringify(event.target.value)))
  }
  render() {
    return <Box gridArea={this.props.gridArea} border="all">
      <Notes fill={true} resize={false} value={this.state.notes} placeholder="Put your common responses in here for quick copy & pasting" onChange={event => this.onchange(event)} />
    </Box>
  }
}

export default Notepad