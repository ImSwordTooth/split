import styled from 'styled-components'

export const StyledPreComponent = styled.div`

  &:hover {
    .preWp {
      padding: 0 12px 0 24px;
      background-color: #3e3c3d;
      color: white;
    }
  }

  .preWp {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #f5f5f5;
    height: 32px;
    margin: 2px 0;
    padding: 0 12px 0 8px;
    cursor: pointer;
    transition: padding .3s;
    user-select: none;
    border-left: solid 4px transparent;
    
    &::before {
      content: '';
      position: absolute;
      left: -4px;
      height: 100%;
      width: 0;
      background-color: #1890ff;
      transition: width .3s;
    }

    &.active {
      &::before {
        width: 4px;
      }
    }

    .name {

    }

    .desc {
      font-weight: lighter;
    }
  }

  .ant-popover-inner-content {
    padding: 2px;

    img {
      object-fit: cover;
      cursor: zoom-in;

      &.pc {
        width: 384px;
        height: 216px;
      }

      &.mobile {
        width: 187px;
        height: 333px;
      }
    }
  }
`
