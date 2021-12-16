import styled from "styled-components";

export const StyledProperty = styled.div`
  position: absolute;
  right: 0;
  height: 100%;

  background-color: #ffffff;
  padding: 4px 0 0;
  
  .propertyWp {
    position: relative;
    height: 100%;
    padding: 0 10px 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 12px;
    z-index: 3;

    .property {
      height: 100%;
    }
    
    .ant-tabs-nav {
      margin-bottom: 0;
    }
    
    .ant-tabs-content-holder {
      height: 100%;
      overflow: auto;
      padding-top: 12px;
    }

    .ant-form-item {
      margin-bottom: 12px;
    }

    .ant-form-item-label > label {
      font-size: 12px;
    }

    .ant-radio + span {
      font-size: 12px;
    }

    .ant-select-selection-item {
      font-size: 12px;
    }
    
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

  .btnBox {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    button {
      margin: 0 4px;
      padding: 0 12px;
      font-size: 12px;
      border-radius: 20px;
      width: 80px;
      line-height: 12px;
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
