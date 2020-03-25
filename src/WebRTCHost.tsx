import SimplePeer from "simple-peer";
var peers: Array<any>
 
class WebRTCHost {
  start(host: boolean, signal?: any) {
    let url = "wss://6r7dk8n979.execute-api.us-east-1.amazonaws.com/"
    let webSocket = new WebSocket(url)
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
    webSocket.onmessage = (event) => {
      console.log('WS', event.data)
    }

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
        webSocket.send(JSON.stringify(data))
        console.log('SIGNAL', JSON.stringify(data))
      })
      if (signal) rtc.signal(signal)
    }
    
    return rtc
  }
}
export default WebRTCHost