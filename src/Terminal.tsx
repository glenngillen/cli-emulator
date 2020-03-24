import React from 'react'
import WebRTCHost from "./WebRTCHost";
import './terminal.scss';

interface Props {
  peer?: string,
}
interface State {
  client: any,
  rtc?: any,
  commands: {},
  history: [],
  cmdHistory: [],
  cmdPos: -1,
  prompt: '$ ',
  waiting: boolean,
  inlineInput: boolean
}
class Terminal extends React.Component<Props, State> {
  term: any
  constructor(props: any) {
    super(props)
    let client = new WebRTCHost();
    let rtc:any;
    if (this.props.peer) {
      let signal = JSON.parse(atob(decodeURIComponent(this.props.peer)))
      console.log(signal)
      rtc = client.start(false, signal)
    }
    this.state = {
      client: client,
      rtc: rtc,
      commands: {},
      history: [],
      cmdHistory: [],
      cmdPos: -1,
      prompt: '$ ',
      waiting: false,
      inlineInput: false
    }
    this.handleClick = this.handleClick.bind(this)
    this.handleFocus = this.handleFocus.bind(this)
    this.handleInput = this.handleInput.bind(this)
    this.handleKey = this.handleKey.bind(this)
    this.clearHistory = this.clearHistory.bind(this)
    this.clearInput = this.clearInput.bind(this)
    this.scrollCommandHistory = this.scrollCommandHistory.bind(this)
    this.addHistory = this.addHistory.bind(this)
    this.addCommandHistory = this.addCommandHistory.bind(this)
  }
  clearHistory() {
      this.setState({ history: [] });
  }
  send(message: string) {
    let rtc = this.state.rtc
    if (rtc) {
      console.log(rtc)
      rtc.send(message)
    }
  }
  processResponse(err, httpResponse, body) {
      this.setState({ waiting: false })
      var prefix
      if (httpResponse.statusCode == 200 || httpResponse.statusCode == 201) {
          prefix = "✓ "
      } else if (httpResponse.statusCode >= 400 && httpResponse.statusCode < 500 ) {
          prefix = "! "
      } else {
          prefix = ""
      }
      if (body.message) {
        this.addHistory(prefix + body.message)
      }
      if (body.suggestion) {
          this.addHistory("* " + body.suggestion)
      }
      this.addHistory("")
  }
  componentDidMount() {
      this.handleFocus();
  }
  componentDidUpdate() {
      //var el = ReactDOM.findDOMNode(this);
      //var container = document.getElementsByClassName('container')[0];
      //var container = document.getElementById("main");
      //if (container && el) {
      //  container.scrollTop = el.scrollHeight;
      //}
      //this.handleFocus();
  }
  handleKey(e) {
    switch(e.which) {
      case 9:
        e.preventDefault()
        break;
      case 38:
        this.scrollCommandHistory('up')
        break;
      case 40:
        this.scrollCommandHistory('down')
        break;
    }
  }
  handleInput(e) {
      if (e.key === "Enter") {
          var input_text = this.term.value;
          this.send(input_text)
          if (this.state.inlineInput) {
              this.setState({ inlineInput: false })
              //this.handleInline.apply(this, [input_text])
          } else {
              var input_array = input_text.split(' ', );
              var input = input_array[0];
              var arg = input_array.slice(1).join(' ')
              var command = this.state.commands[input];

              this.addHistory(this.state.prompt + " " + input_text);
              this.addCommandHistory(input_text)

              if (command === undefined) {
                  this.addHistory("sh: command not found: " + input);
              } else {
                  command(arg);
              }
          }
          this.clearInput();
      }
  }
  clearInput() {
    this.term.value = "";
  }
  addCommandHistory(cmd) {
    var cmdHistory = this.state.cmdHistory;
    //cmdHistory.push(cmd)
    this.setState({
      cmdHistory: cmdHistory,
      cmdPos: -1
    })
  }
  addHistory(output) {
    var history = this.state.history;
    //history.push(output)
    this.setState({
      'history': history
    });
  }
  scrollCommandHistory(direction) {
    var pos
    var cmd
    switch(direction) {
      case 'up':
        if (this.state.cmdPos == -1) {
          pos = this.state.cmdHistory.length - 1
        } else {
          pos = this.state.cmdPos - 1
        }
        if (pos >= 0) {
          cmd = this.state.cmdHistory[pos]
          this.term.value = cmd
          this.setState({ cmdPos: pos })
          this.moveCursorToEnd(this.term)
        }
        break
      case 'down':
        if (this.state.cmdPos == -1) {
          break
        } else if (this.state.cmdPos == this.state.cmdHistory.length) {
          pos = -1
        } else if (this.state.cmdPos >= 0) {
          pos = this.state.cmdPos + 1
        }
        this.setState({ cmdPos: pos })
        if (pos < this.state.cmdHistory.length && pos != -1) {
          cmd = this.state.cmdHistory[pos]
          this.term.value = cmd
          this.moveCursorToEnd(this.term)
        } else {
          this.term.value = ""
          this.moveCursorToEnd(this.term)
        }
        break
    }
  }
  moveCursorToEnd(el) {
    setTimeout(function() {
      if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = el.value.length;
      } else if (typeof el.createTextRange != "undefined") {
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
      }
    }, 0)
  }
  handleClick() {
    this.handleFocus()
  }
  handleFocus() {
    var self = this
    if ( (typeof self.term != 'undefined') && (self.term != null) ){
      self.term.focus();
      self.moveCursorToEnd(self.term)
    }
  }
  render() {
      var output = this.state.history.map(function(op, i) {
          if (false) { //(this.state.inlineInput && op.indexOf(":input:") > 0) {
              //var msg = op.replace(":input:", "")
              //return <p key={i}>{msg}<input type="text" onKeyPress={this.handleInput} ref={(ref) => this.term = ref} className="inline term"/></p>
          } else {
              var outputClass
              //if (op.indexOf("~ ") == 0) {
              //    outputClass = "waiting"
              //    op = op.replace("~ ", "")
              //    op += "..."
              //    if (this.state.waiting) {
              //        return <p key={i} className={outputClass}>{op}<span className="show loading"></span></p>
              //    } else {
              //        op += " done."
              //    }
              //}
              //if (op.indexOf("!") == 0) { outputClass = "error" }
              //if (op.indexOf("sh: ") == 0) { outputClass = "error" }
              //if (op.indexOf("* ") == 0) { outputClass = "suggestion"; op = op.replace("* ", "") }
              //if (op.indexOf("✓ ") == 0) { outputClass = "success"; op = op.replace("✓ ", "") }
              return <p key={i} className={outputClass}>{op}</p>
          }
      }, this);
      if (this.state.inlineInput == true || this.state.waiting) {
          return (
            <div className='input-area' onClick={this.handleClick}>
              {output}
            </div>
          )
      } else {
          return (
            <div className='input-area' onClick={this.handleClick}>
              {output}
              <p>
                <span className="prompt">{this.state.prompt}</span>
                <input type="text" onKeyDown={this.handleKey} onKeyPress={this.handleInput} ref={(ref) => this.term = ref } className="term"/>
              </p>
            </div>
          )
      }
  }
}

export default Terminal