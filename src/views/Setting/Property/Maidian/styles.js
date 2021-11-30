import styled from 'styled-components'

export const StyledMaidian = styled.div`
  .params {
    padding-left: 20px;
  }

  .customer_table {
    width: 100%;
    border-radius: 4px 4px 0 0;
    border: solid 1px #e8e8e8;
    border-spacing: 0;
    table-layout: fixed;
    font-size: 12px;
    margin: 8px 0;

    & tr {
      position: relative;
      transition: all .3s;

      &:hover {
        background-color: rgba(241, 241, 241, 0.4);
      }
    }

    & th {
      color: rgba(0, 0, 0, 0.85);
      font-weight: 500;
      text-align: left;
      background: #f1f1f1;
      transition: background .3s ease;
      padding: 4px 8px;
    }

    & td {
      position: relative;
      transition: all .3s, border 0s;
      padding: 3px 12px;

      &.editing {
        box-shadow: 1px 1px 6px 1px rgba(130, 130, 130, 0.14);
        border: solid 1px #ccc;
      }

      & input {
        outline: none;
        border: none;
        background-color: transparent;
        width: 100%;
      }
      
      &.delete {
        cursor: pointer;
        
        &:hover {
          color: red;
        }
      }
    }
  }
`
