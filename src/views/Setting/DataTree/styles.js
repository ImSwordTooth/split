import styled from 'styled-components'

export const StyledDataTree = styled.div`
  flex: 1;
  padding: 10px 0;
  .edit .ant-tree-node-selected{
    white-space: nowrap;
    padding: 2px 4px;
  }
  
  .parent .ant-tree-node-content-wrapper{
    outline: solid 2px #ffc864;
  }
`
