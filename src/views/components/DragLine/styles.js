import styled from 'styled-components'

export const StyledDragLine = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  height: 100%;
  z-index: 2;
  background-color: #e5e5e5;
  cursor: pointer;
  transition: all .3s;
  
  &::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 100%;
    left: -3px;
    top: 0;
    z-index: -1;
  }
  
  &:hover {
    cursor: col-resize;
    background-color: #3e3c3d;
    width: 2px;
  }
`
