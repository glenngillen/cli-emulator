import SimplePeer from "simple-peer";
import Pusher from 'pusher-js';
import * as PusherTypes from 'pusher-js';
var peers: Array<any>

const pusher = new Pusher('a39e2734ba451727d4f6', {
  cluster: 'mt1',
});

class RealtimeClient {
  client = pusher
  channel = pusher.subscribe('terminal')
  send(message) {
    this.channel.trigger('input', message)
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