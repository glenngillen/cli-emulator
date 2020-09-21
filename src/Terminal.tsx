import React from 'react'
import { RealtimeClient } from "./WebRTCHost";
import styled from "styled-components";
import { theme } from "./Theme";

const InputArea = styled.div`
  height: 100%;
  padding: 20px;
  white-space: pre;
  p {
    line-height: 1.3em;
  }
  p.error {
    color: ${theme['color-error']};
  }
  p.suggestion {
    color: ${theme['color-suggestion']};
  }
  p.success {
    color: ${theme['color-success']};
  }
`
const Prompt = styled.span`
  color: $terminal-color-prompt;
  font-family: $font-family-fixed;
  font-size: $font-size;
  margin-right: 0.65em;
`

const Input = styled.input`
  font-family: $font-family-fixed;
  font-size: $font-size;
  border: none;
  padding: 0;
  margin: 0;
  height: 1.2em;
  line-height: 1.2em;
  background: #2b303b;
  color: #ebcb8b;
  width: 80%;

  &:focus {
    outline: none;
  }
`

interface State {
  client: any,
  commands: {},
  history: Array<string>,
  cmdHistory: Array<string>,
  cmdPos: -1,
  prompt: '$ ',
  waiting: boolean,
  inlineInput: boolean
}
class Terminal extends React.Component<{}, State> {
  term: any
  constructor(props) {
    super(props)
    let client = new RealtimeClient();
    this.state = {
      client: client,
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
    this.processResponse = this.processResponse.bind(this)
    this.send = this.send.bind(this)
  }
  clearHistory() {
      this.setState({ history: [] });
  }
  send(message: string) {
    this.state.client.command(message)
  }
  processResponse(output) {
      this.setState({ waiting: false })
      if (output) {
        this.addHistory(output)
      }
      this.addHistory("")
  }
  componentDidMount() {
      this.handleFocus();
      this.state.client.subscribeOutput(this.processResponse)
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
    cmdHistory.push(cmd)
    this.setState({
      cmdHistory: cmdHistory,
      cmdPos: -1
    })
  }
  addHistory(output) {
    var history = this.state.history;
    history.push(output)
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
            <InputArea onClick={this.handleClick}>
              {output}
            </InputArea>
          )
      } else {
          return (
            <InputArea onClick={this.handleClick}>
              {output}
              <p>
                <Prompt>{this.state.prompt}</Prompt>
                <Input type="text" onKeyDown={this.handleKey} onKeyPress={this.handleInput} ref={(ref) => this.term = ref }/>
              </p>
            </InputArea>
          )
      }
  }
}

export default Terminal