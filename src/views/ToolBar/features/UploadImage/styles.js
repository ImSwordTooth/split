import styled from 'styled-components'

export const StyledUploadImage = styled.span`
  .empty {
    animation: empty 1.5s infinite linear;
  }
  
  @keyframes empty {
    from {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(-15deg);
    }
    50% {
      transform: rotate(0deg);
    }
    75% {
      transform: rotate(15deg); 
    }
    to {
      transform: rotate(0deg);
    }
  }
`
