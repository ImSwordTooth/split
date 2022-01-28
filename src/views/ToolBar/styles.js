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

  .centerPart {
    position: absolute;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: -1;

    .fileNameWp {
      display: flex;
      align-items: center;
      cursor: pointer;

      .en, .cn {
        cursor: pointer;

        &:hover {
          color: #76abe2;
        }
      }

      .en {
        font-size: 16px;
        font-weight: bold;
      }

      .cn {
        font-size: 12px;
      }

      i {
        margin-left: 2px;
        cursor: pointer;

        :hover {
          color: #2b96ff;
        }
      }

      input {
        font-weight: normal;
      }

    }

    .channel {
      cursor: pointer;
      margin: 0 0 2px 8px;
    }
  }

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
      background-color: rgba(181, 227, 253, .3);
    }

    &:active {
      border-color: #76abe2;
    }

    &.active {
      border-color: #76abe2;
      background-color: rgba(219, 245, 255, .52);
      box-shadow: 1px 1px 3px 0 rgba(111, 172, 224, 0.38);
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
        font-size: 14px;
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

  .colorType {
    font-size: 12px;
    cursor: pointer;
    display: inline-block;
    padding: 0 2px;
    box-sizing: content-box;
    width: 50px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    user-select: none;
  }
  
  .paste {
    margin-left: 4px;
    
    &.active {
      background-color: green;
      border-color: green;
    }
    
    img {
      width: 24px;
      height: 24px;
      margin-right: 4px;
    }
    
    &:hover {
      img {
        animation: shake linear .7s;
      }
    }
  }

  @keyframes shake {
    from {
      transform: translate3d(0, 0, 0);
    }

    15% {
      transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg);
    }

    30% {
      transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg);
    }

    45% {
      transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg);
    }

    60% {
      transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg);
    }

    75% {
      transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg);
    }

    to {
      transform: translate3d(0, 0, 0);
    }
  }

`
