import React from 'react'
import { RealtimeClient } from "./WebRTCHost";
import { Box } from "grommet"
import styled from "styled-components";
import replacePlaceholders from "./placeholders"
import { theme } from "./Theme";
import Spinner from "./Spinner";

const delayRe = /:delay[_]?([0-9]{1,2})?:/
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
  font-family: ${theme['code-font-family']};
  font-size: ${theme['font-size']};
  color: ${theme['terminal-color-prompt']};
  margin-right: 0.65em;
  font-weight: normal;
`

const Output = styled.p`
  white-space: pre;
  font-family: ${theme['code-font-family']};
  font-size: ${theme['font-size']};
  font-weight: normal;
  color: white;

`
const Input = styled.input`
  font-family: ${theme['code-font-family']};
  font-size: ${theme['font-size']};
  color: ${theme['terminal-color-prompt']};
  font-weight: normal;
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
const InlineInput = styled(Input)`
  width: 12em;
`

interface State {
  client: any,
  commands: {},
  history: Array<string>,
  cmdHistory: Array<string>,
  cmdPos: -1,
  prompt: '$ ',
  waiting: boolean,
  inlineInput: boolean,
  connected: boolean,
}


interface PasswordProps {
  login: any
}
interface PasswordState {
  connecting: boolean
  connected: boolean
  attempts: number
}
class PasswordPrompt extends React.Component<PasswordProps, PasswordState> {
  input: any
  constructor(props) {
    super(props)
    this.state = {
      connecting: false,
      connected: false,
      attempts: 0
    }

    this.handlePassword = this.handlePassword.bind(this)
    this.focus = this.focus.bind(this)
  }
  focus() {
    this.input.focus()
  }
  handlePassword(e) {
    if (e.key === "Enter") { 
      let password = e.target.value
      this.setState({
        connecting: true
      })
      this.props.login(password, (loggedIn) => {
        let newAttempts: number
        if (loggedIn) {
          newAttempts = 0
        } else {
          newAttempts = this.state.attempts + 1
        }
        this.setState({
          connecting: false,
          attempts: newAttempts,
          connected: loggedIn
        }, () => { if (!loggedIn) this.focus() })
      })
    }
  }
  componentDidMount() {
    this.focus()
  }
  render() {
    const field = <Input type="text" onKeyDown={this.handlePassword} ref={(ref) => this.input = ref } />
    let errors : Array<JSX.Element>
    errors = []    
    for(let i=0; i<this.state.attempts; i++) {
      errors.push(<p key={"password-error-"+i}>Password: <br/>Incorrect password!</p>)
    }
    let content : JSX.Element
    if (this.state.connected) {
      content = <p>✅ Logged in! <Spinner/></p>
    } else {
      content = <p>Password: {!this.state.connecting && field}{this.state.connecting && <Spinner/>}</p>
    }
    return (
      <Box>
        {errors}
        {content}
      </Box>
    )
  }
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
      inlineInput: false,
      connected: false
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
    this.connect = this.connect.bind(this)
    this.login = this.login.bind(this)
    this.send = this.send.bind(this)
    this.handleInline = this.handleInline.bind(this)
    this.handleDelay = this.handleDelay.bind(this)
    this.updateWaitState = this.updateWaitState.bind(this)
    this.lastResponse = this.lastResponse.bind(this)
  }
  connect(password:string, cb) {
    this.state.client.connect(password, cb)
  }
  clearHistory() {
      this.setState({ history: [] });
  }
  send(message: string) {
    this.state.client.command(message)
  }
  lastResponse() {
    return this.state.history[this.state.history.length -1]
  }
  updateWaitState() {
    let last = this.lastResponse()
    if (last.indexOf(":input:") > 0 || last.search(delayRe) > 0) {
      let inlineState = last.indexOf(":input:") > 0 
      this.setState({
        waiting: true,
        inlineInput: inlineState
      })
    } else {
      this.setState({
        waiting: false,
        inlineInput: false
      })
    }
  }
  processResponse(output) {
    let processed = replacePlaceholders(output)
    if (processed.indexOf(":input:") >= 0) {
      this.setState({ inlineInput: true })
      this.addHistory(processed)
      this.handleFocus()
    } else if (processed.search(delayRe) > 0) {
      this.addHistory(processed)
    } else {
      if (output) {
        this.addHistory(processed)
      }
      this.addHistory("")
      this.handleFocus()
    }
    this.updateWaitState()
  }
  componentDidMount() {
      this.handleFocus();
      this.state.client.subscribeOutput(this.processResponse)
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

  login(password, cb) {
    this.connect(password, () => {
      let loggedIn = this.state.client.members() >= 2 ? true : false
      cb(loggedIn)
      if (loggedIn) {
        setTimeout(() => {
          this.state.client.subscribeOutput(this.processResponse)
          this.setState({
            connected: true
          }, this.handleFocus )
        }, 2000)

      }
    })
  }
  handleDelay() {
    var history = this.state.history;
    let latest = history[history.length - 1] 
    latest = latest.replace(delayRe, "") 
    history[history.length - 1] = latest
    this.setState({
      history: history,
    });
    this.updateWaitState()
  }
  handleInline(response) {
    var history = this.state.history;
    let latest = history[history.length - 1] 
    latest = latest.replace(":input:", response)
    history[history.length - 1] = latest
    this.setState({
      history: history,
    });
    this.updateWaitState()
  }
  handleInput(e) {
    if (!this.state.connected) return
      if (e.key === "Enter") {
          var input_text = this.term.value;
          this.send(input_text)
          if (this.state.inlineInput) {
              this.setState({ inlineInput: false })
              this.handleInline(input_text)
          } else {
              var input_array = input_text.split(' ', );
              var input = input_array[0];
              var arg = input_array.slice(1).join(' ')
              var command = this.state.commands[input];

              this.addHistory(this.state.prompt + " " + input_text);
              this.addCommandHistory(input_text)
              this.setState({
                waiting: true
              })

                  //this.addHistory("sh: command not found: " + input);
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
    let self = this
      var output = this.state.history.map(function(op, i) {
          let inputIdx = op.indexOf(":input:") 
          let delayIdx = op.search(delayRe)
          if (self.state.inlineInput && inputIdx > 0 && (delayIdx == -1 || inputIdx < delayIdx)) {
              var msg = op.substr(0, inputIdx)
              return <p key={i}>{msg}<InlineInput type="text" onKeyPress={self.handleInput} ref={(ref) => self.term = ref} /></p>
          } else if (delayIdx > 0) {
            let delay = 1000
            let matched = op.match(delayRe)
            if (matched && matched[1]) delay = parseInt(matched[1]) * 1000
            let msg = op.substr(0, delayIdx)
            setTimeout(self.handleDelay,delay)
            return <p key={i}>{msg}<Spinner/></p>
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
              return <Output key={i} className={outputClass}>{op}</Output>
          }
      }, this);
      if (this.state.inlineInput == true || this.state.waiting) {
          return (
            <InputArea onClick={this.handleClick}>
              {output}
            </InputArea>
          )
        } else {        
          let prompt: JSX.Element
          if (this.state.connected) {
            prompt = <p>
                <Prompt>{this.state.prompt}<Input type="text" onKeyDown={this.handleKey} onKeyPress={this.handleInput} ref={(ref) => this.term = ref }/></Prompt>
              </p>
          } else {
            prompt = <PasswordPrompt login={this.login} ref={(ref) => this.term = ref }/>
          }
          return (
            <InputArea onClick={this.handleClick}>
                {output}
                {prompt}
            </InputArea>
          )
      }
  }
}

export default Terminal