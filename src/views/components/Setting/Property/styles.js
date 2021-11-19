import styled from "styled-components";

export const StyledProperty = styled.div`
  position: absolute;
  right: 0;
  width: ${props => props.width + 'px'};
  height: 100%;
  z-index: 2;
  background-color: #ffffff;
  padding: 4px 0 10px;

  .ant-tabs-tab {

    & + .ant-tabs-tab {
      margin-left: 20px;
    }
  }

  .tabDiv {
    position: relative;
    padding: 0 4px 0;

    &.active::after {
      content: '';
      position: absolute;
      top: 0;
      right: -4px;
      width: 6px;
      height: 6px;
      border: solid 1px #575757;
      border-radius: 50%;
      transition: opacity ease-in-out .3s;
      animation: colorChange 2s infinite ease-in-out;
    }
  }

  @keyframes colorChange {
    0% {
      background-color: #d5ffe3;
    }

    50% {
      background-color: #57ef85;
    }

    100% {
      background-color: #d5ffe3;
    }
  }
`
