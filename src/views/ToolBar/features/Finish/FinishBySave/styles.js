import styled from 'styled-components'

export const StyledFinishBySave = styled.div`
  
  .highlight {
    margin: 0 6px 0 4px;
    font-style: italic;
    text-shadow: 1px 1px 3px rgba(189, 189, 189, 0.48);
    
    &.update {
      color: #ffc65c;
    }
    
    &.create {
      color: #3FD136;
    }
  }
  
  .tipList {
    margin-top: 20px;
    
    & li {
      font-size: 12px;
      margin: 2px 0;
    }
  }
  
  .extraWp {
    padding-left: 24px;
    margin-top: 10px;
    
    .extraTitle {
      border-left: solid 4px #3490ff;
      margin-bottom: 10px;
      padding-left: 8px;
    }
    
    .extra {
      display: flex;
      align-items: center;
      font-size: 12px;
      padding-left: 12px;
      
      .ant-checkbox-wrapper {
        margin-right: 8px;
      }
    }
  }
`
