import styled from 'styled-components'

export const StyledToolbar = styled.div`
  position: relative;
  height: 48px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 4;
  box-shadow: 0 0 4px 2px #e1e1e1;

  .active {
    background-color: greenyellow;
  }
`
