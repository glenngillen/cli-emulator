import React from "react";
import { Box } from "grommet";
import WindowTitleBar from "./WindowTitleBar"
import styled from "styled-components";
import { math } from "polished";
import { theme } from "./Theme"

const Container = styled.div`
  font-family: ${theme['code-font-family']};
  color: ${theme['color-background']};
  background: ${theme['terminal-color-background']};
  height: 100%;
  -webkit-box-shadow: 0px 0px 13px 0px rgba(50, 50, 50, 0.59);
  -moz-box-shadow:    0px 0px 13px 0px rgba(50, 50, 50, 0.59);
  box-shadow:         0px 0px 13px 0px rgba(50, 50, 50, 0.59);
  overflow: hidden;
  overflow-y: auto;
`

const Holder = styled.div`
  margin: ${math(theme['grid-base-spacing'] + '* 2')} 
`
interface WindowProps {
  onClick?: any
}
class Window extends React.Component<WindowProps> {
  render() {
    return <Box margin="none" fill={true} onClick={this.props.onClick} focusIndicator={false}>
      <WindowTitleBar/>
      <Container>
        <Holder>
          <div id="content">
            {this.props.children}
          </div>
        </Holder>
      </Container>
    </Box>
  }
}

export default Window;