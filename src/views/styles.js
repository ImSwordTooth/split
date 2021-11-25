import styled from "styled-components";

export const StyledApp = styled.div`
  position: relative;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .main {
    position: relative;
    flex: 1;
    
    #app {
      position: relative;
      height: 100%;
    }

    .data {
      position: absolute;
      background-color: #ffffff;
      z-index: 3;
      right: 0;
      top: 0;
      height: 100%;
    }
  }
`
