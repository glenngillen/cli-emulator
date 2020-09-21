import SimplePeer from "simple-peer";
import Pusher from 'pusher-js';
import * as PusherTypes from 'pusher-js';
var peers: Array<any>

const pusher = new Pusher('d64215484dde5c81c8d5', {
  cluster: 'mt1',
  authEndpoint: 'https://gg-pusher-auth.herokuapp.com/pusher/auth'
});

class RealtimeClient {
  client = pusher
  commands:any
  stdout:any
  commandsConnected:boolean
  stdoutConnected:boolean
  queuedCommandsCbs: Array<Function>
  queuedStdoutCbs: Array<Function>

  constructor() {
    this.commandsConnected = false
    this.stdoutConnected = false
    this.queuedCommandsCbs = []
    this.queuedStdoutCbs = []
    let commands = pusher.subscribe('private-stdin')
    let stdout = pusher.subscribe('private-stdout')
    this.commands = commands
    this.stdout = stdout

    let self = this
    this.commands.bind('pusher:subscription_succeeded', function() {
      let cb:Function | undefined
      while (cb = self.queuedCommandsCbs.pop()) {
        self.commands.bind('client-new-command', cb)
      }
      self.commandsConnected = true
      while (cb = self.queuedStdoutCbs.pop()) {
        self.stdout.bind('client-new-output', cb)
      } 
      self.stdoutConnected = true
    });
  }
  command(message) {
    this.commands.trigger('client-new-command', message)
  }

  output(message) {
    console.log('sending output')
    this.stdout.trigger('client-new-output', message)
  }

  subscribeOutput(cb:Function) {
    if (this.stdoutConnected) return this.stdout.bind('client-new-output', cb)
    this.queuedStdoutCbs.push(cb)
    return true
  }
  subscribeInput(cb:Function) {
    if (this.commandsConnected) return this.commands.bind('client-new-command', cb)
    this.queuedCommandsCbs.push(cb)
    return true
  }
}
class WebRTCHost {
  start(host: boolean, signal?: any) {
    //let url = "ws://ws-mt1.pusher.com/app/a39e2734ba451727d4f6"
    //let webSocket = new WebSocket(url)
    let opts;
    if (host) {
      opts = { initiator: true }
    } else {
      opts = { initiator: false}
    }
    var rtc = new SimplePeer(opts);
    rtc.on('connect', function() {
      console.log('peer connect!')
      peers.push(rtc);
    });
    rtc.on('error', function(data) {
      console.log('WebRTC Error', data)
    })
    var channel = pusher.subscribe('signals')

    if (host) {
      rtc.on('data', function(msg) {
        console.log(msg)
        // as host, we need to broadcast the data to the other peers
        peers.forEach(function(p) {
          if(p === rtc) {
            return;
          }
          p.send(msg);
        });
      });
    } else {
      rtc.on('signal', (data:any) => {
        
        console.log(data)
        channel.trigger('client-signals', data)

        //webSocket.send(JSON.stringify(data))
        console.log('SIGNAL', JSON.stringify(data))
      })
      if (signal) rtc.signal(signal)
    }
    
    return rtc
  }
}
export { RealtimeClient }
export default WebRTCHost