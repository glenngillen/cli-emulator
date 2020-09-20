import React from "react";
import { Box } from "grommet"
import styled from "styled-components";

const Bar = styled(Box)`
  height: 30px;
  text-align: left;
  background: #5f43e9;
`

class WindowTitleBar extends React.Component {
  render() {
    return <Bar fill="horizontal">
        <svg height="20" width="100">
          <circle cx="24" cy="14" fill="#bf616a" r="5" />
          <circle cx="44" cy="14" fill="#ebcb8b" r="5" />
          <circle cx="64" cy="14" fill="#a3be8c" r="5" />
        </svg>
      </Bar>
  }
}

export default WindowTitleBar;