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
    }
  }
`
