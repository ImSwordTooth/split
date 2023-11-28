import styled from 'styled-components'

export const StyledUploadImage = styled.span`
  .empty {
    //animation: empty 1.5s infinite linear;
  }
  
  button {
    background-color: #eeeeee!important;
    //pointer-events: none;
    cursor: not-allowed!important;
  }
  
  @keyframes empty {
    from {
      transform: rotate(0deg);
    }
    5% {
      transform: rotate(-10deg);
    }
    10% {
      transform: rotate(0deg);
    }
    15% {
      transform: rotate(10deg);
    }
    20% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(10deg);
    }
    30% {
      transform: rotate(0deg);
    }
  }
`
