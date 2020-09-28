import SimplePeer from "simple-peer";
import Pusher from 'pusher-js';
var peers: Array<any>

const pusher = new Pusher('d64215484dde5c81c8d5', {
  cluster: 'mt1',
  authEndpoint: 'https://gg-pusher-auth.herokuapp.com/pusher/auth'
});

class RealtimeClient {
  client = pusher
  id?:string
  channel?: any
  initializing: boolean
  connected:boolean
  queuedStdinCbs: Array<Function>
  queuedStdoutCbs: Array<Function>
  connectCb: any

  constructor(personConnectedCb?:any) {
    pusher.bind_global((event, data) => { if (event === 'pusher:error') console.error(data)})
    this.initializing = false
    this.connected = false
    this.queuedStdinCbs = []
    this.queuedStdoutCbs = []

    this.connect = this.connect.bind(this)
    this.members = this.members.bind(this)
    this.command = this.command.bind(this)
    this.output = this.output.bind(this)
    this.subscribeInput = this.subscribeInput.bind(this)
    this.subscribeOutput = this.subscribeOutput.bind(this)

    if (personConnectedCb) this.connectCb = personConnectedCb
  }
  disconnect() {
    if (!this.connected) return
    pusher.unsubscribe(this.channelName())
    this.connected = false
    this.initializing = false
  }
  channelName() {
    return 'presence-'+this.id
  }
  connect(id:string, connectCb?) {
    this.disconnect()
    this.id = id
    this.initializing = false
    this.queuedStdinCbs = []
    this.queuedStdoutCbs = []
    pusher.connect()
    let channel = pusher.subscribe(this.channelName())
    this.channel = channel 
    let self = this

    this.channel.bind('pusher:subscription_succeeded', function() {
      if (connectCb) connectCb()
      let cb:Function | undefined
      while (cb = self.queuedStdinCbs.pop()) {
        self.channel?.bind('client-new-stdin', cb)
      }
      while (cb = self.queuedStdoutCbs.pop()) {
        self.channel?.bind('client-new-stdout', cb)
      } 
      self.connected = true
    });

    if (this.connectCb) {
      let self = this
      this.channel.bind('pusher:member_added', (member) => {
        self.connectCb(member)
      })
    }
  }
  members() {
    return this?.channel?.members?.count
  }
  command(message) {
    this.channel?.trigger('client-new-stdin', message)
  }

  output(message) {
    this.channel?.trigger('client-new-stdout', message)
  }

  subscribeOutput(cb:Function) {
    if (this.connected) return this.channel?.bind('client-new-stdout', cb)
    this.queuedStdoutCbs.push(cb)
    return true
  }
  subscribeInput(cb:Function) {
    if (this.connected) return this.channel?.bind('client-new-stdin', cb)
    this.queuedStdinCbs.push(cb)
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