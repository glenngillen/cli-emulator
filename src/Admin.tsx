import React from "react";
import WebRTCHost from "./WebRTCHost";
import './terminal.scss';

interface State {
  client: any,
  signal?: string
}
class Admin extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = {
      client: new WebRTCHost()
    }
  }
  componentDidMount() {
    let component = this
    let rtc = this.state.client.start(true)
    rtc.on('signal', function(data) {
      console.log(data)
      if (data.type === "offer") {
        console.log("this was an offer")
        component.setState({
          signal: encodeURIComponent(btoa(JSON.stringify(data)))
        })
      }
    })
  }

  signalURL() {
    if (this.state.signal) {
      return "http://localhost:3002/#" + this.state.signal
    }
  }

  render() {
    return <div id="window">
      <div id="bar">
        <svg height="20" width="100">
          <circle cx="24" cy="14" fill="#bf616a" r="5" />
          <circle cx="44" cy="14" fill="#ebcb8b" r="5" />
          <circle cx="64" cy="14" fill="#a3be8c" r="5" />
        </svg>
      </div>
      <div id="main">
        <div className="holder">
          <div id="content">
            <div id="app">{this.signalURL()}</div>
          </div>
        </div>
      </div>
    </div>
  }
}

export default Admin;