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
  height: 400px;
  -webkit-box-shadow: 0px 0px 13px 0px rgba(50, 50, 50, 0.59);
  -moz-box-shadow:    0px 0px 13px 0px rgba(50, 50, 50, 0.59);
  box-shadow:         0px 0px 13px 0px rgba(50, 50, 50, 0.59);
  overflow: hidden;
  overflow-y: auto;
  margin-bottom: ${math(theme['grid-base-spacing'] + '*10')};
`

interface Props {
  peer?: string
}
class Window extends React.Component<Props> {
  render() {
    return <Box margin="none" fill={true}>
      <WindowTitleBar/>
      <Container>
        <div className="holder">
          <div id="content">
            {this.props.children}
          </div>
        </div>
      </Container>
    </Box>
  }
}

export default Window;