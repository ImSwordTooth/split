import styled from 'styled-components'

export const StyledFinish = styled.div`
  .finish {
    margin-left: 4px;
    display: inline-flex;
    align-items: center;

    :hover {
      .rotate {
        animation: rotate360 .7s infinite linear, rotate360 .7s ease-in;
      }
    }

    .icon {
      position: relative;
      margin-right: 6px;

      .rotate {
        transform-origin: center;
        
        &.leave {
          animation: rotate360B 1s ease-out;
        }
      }
      
      .ok {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
        font-size: 16px;
        line-height: 16px;
      }
    }
  }

  @keyframes rotate360 {
    from {
      transform: rotate(0);
    }

    to {
      transform: rotate(360deg);
    }
  }

  @keyframes rotate360B {
    from {
      transform: rotate(0);
    }

    to {
      transform: rotate(360deg);
    }
  }
`

export const StyledFinishModal = styled.div`
  will-change: transfrom;
  
  .ant-tabs-tab {
    justify-content: flex-end;
    will-change: transfrom;

    .tabTitle {
      text-align: right;

      .subTitle {
        font-size: 12px;
        color: #9d9d9d!important;
        text-shadow: none!important;
      }
    }
  }
`
