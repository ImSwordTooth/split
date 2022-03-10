import styled from 'styled-components'

export const StyledColorChoose = styled.div`
  
  .groupTitle {
    font-size: 12px;
    color: #767676;
  }

  .chooses {
    padding: 4px 0 0 12px;
    font-size: 12px;
    margin-bottom: 6px;

    .chooseItem {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 6px;
      margin: 0 2px;
      height: 28px;
      cursor: pointer;
      border: solid 1px transparent;
      transition: all .3s;
      
      &:hover {
        border: solid 1px #e9e9e9;
        border-radius: 4px;
      }

      &.active {
        border-radius: 4px;
        box-shadow: 1px 1px 9px 1px #d0d0d099;
        border: solid 1px #e9e9e9;
      }
    }
  }
`
