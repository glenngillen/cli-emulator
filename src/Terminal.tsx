import React from 'react'
import { RealtimeClient } from "./WebRTCHost";
import { Box } from "grommet"
import Linkify from 'react-linkify'
import styled from "styled-components";
import keydown from 'react-keydown'
import replacePlaceholders from "./placeholders"
import { theme } from "./Theme";
import Spinner from "./Spinner";
import CommandMatcher from "./CommandMatcher"

const linkDecorator = (href, text, key) => {
  return <a href={href} key={key} target="_blank">{text}</a>
}
const delayRe = /:delay[_]?([0-9]{1,2})?:/
const inputRe = /(:input:|:password:)/
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

  a {
    color: #e0d5ff;

    &:visited, &:active, &:hover {
      color: #e0d5ff;
    }
  }

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
  history: Array<string>,
  cmdHistory: Array<string>,
  cmdPos: -1,
  prompt: '$ ',
  waiting: boolean,
  inlineInput: boolean,
  connected: boolean,
  lookingBusy?: boolean
  interactive: boolean
  nonInteractiveCommands?: any,
  commandsLoaded: boolean
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
      let password = e.target.value.replace(/[^a-zA-Z0-9]/g, "-")
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
interface CommandProps {
  gist: string
}

class NonInteractiveCommands {
  gist: string
  commands: any
  constructor(gist, loadedCb?: any) {
    this.gist = gist
    let self = this
    fetch('https://gist.githubusercontent.com/' + gist + '/raw').then(json => {
      json.json().then(result => {
        self.commands = result
        if (loadedCb) loadedCb()
      })
    })
  }

  welcome() {
    let welcome = this.command('welcome')
    if (welcome) return welcome.output
  }

  command(cmd) {
    let [matched] = CommandMatcher(this.commands, cmd)
    return matched[0]
  }
}
interface TermProps {
  updated?: any
}
class Terminal extends React.Component<TermProps, State> {

  term: any
  constructor(props) {
    super(props)
    let client : any
    let interactive = true
    let connected = false
    let nonInteractiveCommands : any
    let query = new URLSearchParams(window.location.search);
    let gist = query.get('g')
    if (gist) {
      interactive = false
      connected = true
      nonInteractiveCommands = new NonInteractiveCommands(gist, this.commandsLoaded.bind(this))
    } else {
      client = new RealtimeClient();
    }
    this.state = {
      client: client,
      history: [],
      cmdHistory: [],
      cmdPos: -1,
      prompt: '$ ',
      waiting: false,
      inlineInput: false,
      connected: connected,
      interactive: interactive,
      nonInteractiveCommands: nonInteractiveCommands,
      commandsLoaded: false
    }
    this.commandsLoaded = this.commandsLoaded.bind(this)
    this.handleCtrlC = this.handleCtrlC.bind(this)
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
    this.updateState = this.updateState.bind(this)
    this.updateContainer = this.updateContainer.bind(this)
  }
  commandsLoaded() {
    this.setState({
      commandsLoaded: true
    })
    if (!this.state.interactive) {
      let welcome = this.state.nonInteractiveCommands.welcome()
      if (welcome) {
        this.processResponse(welcome)
      }
    } 
  }
  connect(password:string, cb) {
    if (this.state.interactive) this.state.client.connect(password, cb)
  }
  clearHistory() {
    this.updateState({ history: [] });
  }
  send(message: string) {
    if (this.state.interactive) {
      this.state.client.command(message)
    } else {
      let self = this
      setTimeout(() => {
        let output : any
        try {
          output = self.state.nonInteractiveCommands.command(message)
        } catch {
          output = { output: 'command not found' }
        }
        let stdout : any
        if (output) {
          stdout = output.output
        } else {
          stdout = "command not found"
        }
        self.processResponse(stdout)
      }, 1000)
    }
  }
  lastResponse() {
    return this.state.history[this.state.history.length -1]
  }
  updateWaitState(extraState?) {
    let last = this.lastResponse()
    let inputIdx = last.search(inputRe) 
    let delayIdx = last.search(delayRe)
    let waitState = {}
    let delay = 1000
    let matched = last.match(delayRe)
    if (matched && matched[1]) delay = parseInt(matched[1]) * 1000
    if (inputIdx != -1 && delayIdx != -1) {
      if (inputIdx < delayIdx) {
        waitState = { 
          waiting: true,
          inlineInput: true,
          lookingBusy: false
        }
      } else {
        waitState = {
          waiting: true,
          inlineInput: false,
          lookingBusy: true
        }
        if (!this.state.lookingBusy) setTimeout(this.handleDelay, delay)
      }
    } else if (inputIdx > 0) {
      waitState = {
        waiting: true,
        inlineInput: true,
        lookingBusy: false
      }
    } else if (delayIdx > 0) {
      waitState = {
        waiting: true,
        inlineInput: false,
        lookingBusy: true
      }
      if (!this.state.lookingBusy) setTimeout(this.handleDelay, delay)
    } else {
      waitState = {
        waiting: false,
        inlineInput: false,
        lookingBusy: false
      }
    }
    this.updateState({
      ...extraState, ...waitState
    })
  }
  processResponse(output) {
    let newState = {}
    let processed = replacePlaceholders(output)
    if (processed.search(inputRe) >= 0) {
      newState = { inlineInput: true }
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
    this.updateWaitState(newState)
  }
  updateContainer() {
    if (this.props.updated) this.props.updated()
  }
  componentDidMount() {
      this.handleFocus();
      if (this.state.interactive) {
        this.state.client.subscribeOutput(this.processResponse) 
      } 
      this.updateContainer()
  }
  componentDidUpdate() {
    this.updateContainer()
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
  @keydown('ctrl+c')
  handleCtrlC(ev) {
    this.addHistory("^C: Command Canceled")
    this.updateState({
      waiting: false,
      inlineInput: false
    })
  }
  login(password, cb) {
    this.connect(password, () => {
      let loggedIn = this.state.client.members() >= 2 ? true : false
      cb(loggedIn)
      if (loggedIn) {
        setTimeout(() => {
          this.state.client.subscribeOutput(this.processResponse)
          this.updateState({
            connected: true
          })
        }, 2000)

      }
    })
  }
  handleDelay() {
    var history = this.state.history;
    let latest = history[history.length - 1] 
    latest = latest.replace(delayRe, "") 
    history[history.length - 1] = latest
    this.setState({ lookingBusy: false}, () => {
      this.updateWaitState({ history: history })
    })
  }
  handleInline(response) {
    var history = this.state.history;
    let latest = history[history.length - 1] 
    let matched = latest.match(inputRe)
    if (matched && matched[1] === ":password:") response = response.replace(/./g,"*")
    latest = latest.replace(inputRe, response)
    history[history.length - 1] = latest
    this.updateWaitState({ history: history })
  }
  handleInput(e) {
    if (!this.state.connected) return
      if (e.key === "Enter") {
          var input_text = this.term.value;
          this.send(input_text)
          if (this.state.inlineInput) {
              this.updateState({ inlineInput: false })
              this.handleInline(input_text)
          } else {
              var input_array = input_text.split(' ', );
              var input = input_array[0];
              this.addHistory(this.state.prompt + " " + input_text);
              this.addCommandHistory(input_text)
              this.updateState({
                waiting: true
              })

                  //this.addHistory("sh: command not found: " + input);
          }
          this.clearInput();
      }
  }
  updateState(state) {
    this.setState(state, this.handleFocus)
  }
  clearInput() {
    this.term.value = "";
  }
  addCommandHistory(cmd) {
    var cmdHistory = this.state.cmdHistory;
    cmdHistory.push(cmd)
    this.updateState({
      cmdHistory: cmdHistory,
      cmdPos: -1
    })
  }
  addHistory(output) {
    var history = this.state.history;
    history.push(output)
    this.updateState({
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
          this.updateState({ cmdPos: pos })
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
        this.updateState({ cmdPos: pos })
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
      var output = <Linkify componentDecorator={linkDecorator} properties={{}}>{
        this.state.history.map(function(op, i) {
          let inputIdx = op.search(inputRe) 
          let delayIdx = op.search(delayRe)
          if (self.state.inlineInput && inputIdx > 0) {
            var msg = op.substr(0, inputIdx)
            let isPassword = op.substr(inputIdx, 10) === ":password:"

            return <Output key={'inlineinput-'+i}>{msg}<InlineInput type={isPassword ? "password" : "text"} onKeyPress={self.handleInput} ref={(ref) => self.term = ref} /></Output>
          } else if (self.state.lookingBusy && delayIdx > 0) {
            let msg = op.substr(0, delayIdx)
            //setTimeout(self.handleDelay, delay)
            return <Output key={'delayed-'+i}>{msg}<Spinner/></Output>
          } else {
            return <Output key={'output-'+i}>{op}</Output>
          }
      }, this)}</Linkify>
      if (this.state.inlineInput == true || this.state.waiting) {
          return (
            <InputArea onClick={this.handleClick} onKeyDown={this.handleCtrlC} tabIndex={0}>
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