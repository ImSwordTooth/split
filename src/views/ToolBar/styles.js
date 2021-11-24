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
  padding: 0 8px;
  
  .btn {
    position: relative;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    margin-right: 6px;
    background-color: white;
    outline: none;
    border: solid 1px transparent;
    font-size: 16px;
    width: 32px;
    height: 32px;
    padding: 4px;
    border-radius: 5px;
    cursor: pointer;
    transition: all .3s;
    
    &:hover {
      background-color: rgba(181,227,253,.3);
    }
    &:active {
      border-color: #76abe2;
    }

    &.active {
      border-color: #76abe2;
      background-color: rgba(219,245,255,.52);
      box-shadow: 1px 1px 3px 0 rgba(111,172,224,0.38);
    }
    
    .clearParent {
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      right: -6px;
      top: -6px;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #e5e5e5;
      color: #666A6D;
      transition: all .3s;
      
      & i {
        font-size: 12px;
        font-weight: bold;
      }
      
      &:hover {
        background-color: red;
        color: white;
      }
    }
  }
  
  .resize {
    display: inline-flex;
    align-items: center;
  }

`
