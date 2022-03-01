import styled from 'styled-components'

export const StyledCopy = styled.span`
  display: inline-flex;
  align-items: center;
  transition: color .3s;
  cursor: grab;
  user-select: none;

  &:hover {
    color: #1890ff;
  }

  &:active {
    cursor: grabbing;
  }
`
