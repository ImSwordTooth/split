import styled from "styled-components";

export const StyledProperty = styled.div`
  position: absolute;
  right: 0;
  width: ${props => props.width + 'px'};
  height: 100%;
  z-index: 2;
  background-color: #ffffff;
  padding: 4px 0 0;
  
  .main {
    height: 100%;
    padding: 0 10px 0;
    display: flex;
    flex-direction: column;
    
    .breadcrumb {
      white-space: nowrap;
      overflow: auto hidden;
      
      .ant-breadcrumb > span {
        display: inline-flex;
        align-items: center;

        .ant-breadcrumb-link {
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          font-size: 12px;
          height: 24px;
          border-radius: 4px;
          padding-right: 1px;

          &:hover {
            background-color: #f5f5f5;
          }
        }
        
        .ant-breadcrumb-separator {
          margin: 0 4px;
          font-size: 12px;
        }
      }
    }
  }

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
