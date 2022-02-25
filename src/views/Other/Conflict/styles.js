import styled from 'styled-components'

export const StyledConflict = styled.div`
  width: 450px;
  position: absolute;
  right: 604px;
  top: 1px;
  background-color: #ffffff;
  box-shadow: 2px 2px 7px 4px rgba(229, 229, 229, 0.57);
  border-radius: 4px;
  z-index: 7;

  .title {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 12px;
    padding: 12px 12px 0;
  }

  .addWp {
    padding: 0 12px;
    background-color: rgba(0, 128, 0, 0.04);
  }

  .reduceWp {
    padding: 0 12px;
    background-color: rgba(255, 0, 0, 0.04);
  }

  .sign {
    color: white;
    padding: 2px 8px;
    border-radius: 20px;
    margin-right: 6px;
    font-style: normal;

    &.add {
      background-color: green;
    }

    &.reduce {
      background-color: red;
    }
    
    &.other {
      background-color: gray;
    }
  }

  .tipTitle {
    font-size: 12px;
    font-style: italic;
    height: 28px;
    line-height: 28px;
    color: #afafaf;
  }

  .conflict {
    font-size: 12px;
    padding-left: 46px;
    height: 24px;
    line-height: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all .3s;
    position: relative;
    
    .saveTip {
      position: absolute;
      top: 0;
      right: 75px;
      color: rgba(0, 128, 0, 0.3);
      font-style: italic;
    }

    &::before {
      content: '';
      position: absolute;
      left: 30px;
      top: 10px;
      width: 4px;
      height: 4px;
      border-radius: 100%;
      background-color: black;
      opacity: 0;
    }

    &:hover {
      &::before {
        opacity: 1;
        transition: opacity ease-out .2s;
      }
    }

    & button {
      font-size: 12px;
      margin-right: 4px;
      width: 20px;
    }

    .btn {
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 5px;
      transition: all .3s;

      &.primary {
        color: green;
      }

      &.danger {
        color: #ff4b4b;
      }

      &:hover, &.active {
        background-color: rgba(193, 193, 193, .3);

        &.primary {
          background-color: rgba(121, 231, 60, .3);
        }

        &.danger {
          background-color: rgba(253, 181, 181, 0.3);
        }
      }
    }
  }

  .extra {
    font-size: 12px;
    padding: 0 12px;
    background-color: rgba(204, 204, 204, 0.18);
    height: 32px;
    line-height: 32px;
  }

  .footer {
    text-align: right;
    margin-top: 10px;
    padding: 0 12px 12px;
  }
`
