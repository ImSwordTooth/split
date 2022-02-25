import styled from 'styled-components'

export const StyledSelectNodeFromTree = styled.div`
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
