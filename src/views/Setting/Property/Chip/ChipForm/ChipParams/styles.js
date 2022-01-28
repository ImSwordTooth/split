import styled from 'styled-components'

export const StyledChipParams = styled.div`
  .paramsList {
    margin-top: 8px;
    
    .param {
      margin-bottom: 4px;
      font-size: 12px;

      .paramName {
        margin-right: 4px;
        font-weight: bold;
        color: rgba(0, 0, 0, 0.8);
        cursor: help;
        
        &:hover {
          text-decoration: underline dashed;
          
        }
      }
    }
  }
`
