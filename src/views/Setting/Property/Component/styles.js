import styled from "styled-components";

export const StyledComponent = styled.div`
  height: 100%;
  overflow: auto;
  
  .propsList {

    .props {
      position: relative;
      padding: 1px 0 1px 20px;
      transition: all .3s;
      cursor: default;
      
      &.custom {
        padding: 2px 0 2px 20px;
      }

      &:hover {
        background-color: #f3f3f3;
        
        .delete {
          display: inline;
        }

        .decoration {
          color: #929292;
        }
      }

      .decoration {
        font-size: 12px;
        color: #cccccc;
        transition: all .3s;
      }
      
      .delete {
        position: absolute;
        top: 3px;
        left: 10px;
        font-size: 12px;
        display: none;
        cursor: pointer;
        
        &:hover {
          color: red;
        }
      }

      .key {
        cursor: text;
        color: black;
        
        &:hover {
          color: #3490FF;
        }
      }

      .colon {
        margin: 0 4px 0 2px;
      }
      
      .customType {
        font-size: 12px;
        cursor: text;
        
        &:hover {
          color: #3490FF;
        }
      }
    }

    &::before {
      content: 'static propTypes = {';
      font-size: 12px;
      color: #cccccc;
    }

    &::after {
      content: '}';
      font-size: 12px;
      color: #cccccc;
    }
  }
  
  .addBtns {
    display: flex;
    font-size: 12px;
    align-items: center;
    margin-top: 6px;
    
    & button {
      margin: 0 4px;
      padding: 0 12px;
      font-size: 12px;
      border-radius: 20px;
      width: 80px;
    }
  }
  
  .pre {
    margin-top: 20px;
    
    .preTitle {
      color: rgba(0, 0, 0, 0.85);
      font-weight: 500;
      margin: 0;
      font-size: 14px;
      
      .icon {
        margin-left: 4px;
        cursor: pointer;
      }
    }

    .ant-collapse-header {
      padding: 6px 4px;
      user-select: none;
      display: flex;
      align-items: center;

      .ant-collapse-arrow {
        font-size: 10px;
      }
    }
    
    .collapseTitle {
      width: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      padding-right: 12px;
      
      strong {
        margin: 0 2px;
      }
    }
  }
`
