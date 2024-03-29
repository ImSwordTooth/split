import styled from 'styled-components'

export const StyledDataTree = styled.div`
  flex: 1;
  padding: 0 0 10px 0;
  height: 100%;
  overflow: auto;
  position: relative;

  .toolbar {
    height: 32px;
    background-color: #f5f5f5;
    border: solid 1px #e5e5e5;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    padding: 0 4px;
    position: sticky;
    width: 100%;
    top: 0;
    z-index: 1;

    .btn {
      position: relative;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      margin-right: 2px;
      background-color: transparent;
      outline: none;
      border: solid 1px transparent;
      font-size: 16px;
      width: 24px;
      height: 24px;
      padding: 2px;
      border-radius: 3px;
      cursor: pointer;
      transition: all .3s;

      &:hover {
        background-color: rgba(201, 201, 201, 0.3);
      }

      &.active {
        background-color: rgb(215, 215, 215);
      }
    }
  }

  .edit .ant-tree-node-selected {
    white-space: nowrap;
    padding: 2px 4px;
  }

  .parent .ant-tree-node-content-wrapper {
    outline: solid 2px #ffc864;
    transition: all 0.3s, border 0s, line-height 0s, box-shadow 0s, outline 0s;
  }

  .treeTitle {
    display: inline-flex;
    align-items: center;

    .iconPart {
      margin-left: 20px;
      display: flex;
      align-items: center;

      img {
        width: 16px;
        margin: 0 2px;
      }
      
      .chipIcon {
        position: relative;
        
        & > span {
          position: absolute;
          font-size: 12px;
          top: -4px;
          right: 1px;
          color: white;
          text-shadow: 0 0 1px black;
          font-weight: bold;
        }
      }
    }
  }
`
