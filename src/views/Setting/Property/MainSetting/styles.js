import styled from 'styled-components'

export const StyledMainSetting = styled.div`
  cursor: default;
  
  .settingTitle {
    display: flex;
    align-items: center;
      
    i {
      margin-right: 4px;
    }
  }
  
  .settingItem {
    display: flex;
    align-items: center;
    margin: 4px 0;
    
    .prop {
      margin-right: 4px;
      cursor: help;
      
      &:hover {
        text-decoration: underline dashed;
      }
    }
  }
  
`
