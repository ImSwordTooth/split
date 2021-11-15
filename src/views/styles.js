import styled from "styled-components";

export const StyledApp = styled.div`
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
    
  .toolbar {
    height: 48px;
    background-color: #e5e5e5;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .main {
    display: flex;
    justify-content: space-between;
    flex: 1;
  }

  .left {
    flex: 1;
  }

  .data {
    position: absolute;
    background-color: #ffffff;
    z-index: 3;
    right: 0;
    height: calc(100% - 48px);
  }

  #app {
    position: relative;
    height: 100%;
  }

  .toolbar .active {
    background-color: greenyellow;
  }

  .data .list > li.active {
    color: red;
  }

`
