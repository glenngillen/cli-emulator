import React from "react";
import { Grid, Box } from "grommet";
import Window from "./Window"
import CommandPanel from "./CommandPanel"
import Notepad from "./Notepad"
import { RealtimeClient } from "./WebRTCHost";
import './terminal.scss';

interface State {
  client: any
}
class Admin extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = {
      client: new RealtimeClient()
    }
    this.componentDidMount = this.componentDidMount.bind(this)
  }
  componentDidMount() {
  }


  render() {
    return <Grid
      rows={['50%', '50%']}
      columns={['50%', '50%']}
      gap="none"
      areas={[
        ['terminal','commands'],
        ['terminal','notes'],
      ]}
      fill={true}
    >
      <Box gridArea="terminal">
        <Window>
          
        </Window>
      </Box>
      <CommandPanel gridArea="commands"/>
      <Notepad gridArea="notes"/>
    </Grid>
  }
}

export default Admin;