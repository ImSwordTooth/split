import styled from 'styled-components'

export const StyledChipParams = styled.div`

  .ant-collapse-header {
    padding: 6px 16px!important;
    user-select: none;
    display: flex;
    align-items: center;
    background-color: #f5f5f5;
    border-radius: 4px!important;
    margin-bottom: 2px;
    
    &:hover {
      background-color: #e9e9e9;
    }

    .ant-collapse-arrow {
      font-size: 10px!important;
    }

    .collapseTitle {
      width: 100%;
      padding-right: 12px;
      display: inline-flex;
      justify-content: space-between;

      strong {
        margin: 0 2px;
      }
    }
  }
  
  .chipType {
    position: relative;
    display: flex;
    align-items: center;
    
    .tip {
      position: absolute;
      right: 0;
      font-size: 12px;
      color: #cccccc;
    }
  }
  
  .formProp {
    font-size: 12px;
    margin-right: 8px;
  }
  
  .title {
    color: rgba(0, 0, 0, 0.85);
    font-weight: 500;
    margin: 0 0 4px;
    font-size: 14px;
  }
  
`
