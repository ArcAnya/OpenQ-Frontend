import {gql} from '@apollo/client';

export const GET_STREAMS_BY_ACCOUNT = gql`query MyQuery {
  account(id: "0x0f194a3dca674d83528028251e4e06b43c3beafc") {
    outflows {
      deposit
      receiver {
        id
      }
      token {
        decimals
        isListed
        name
        symbol
      }
    }
    inflows {
      token {
        decimals
        id
        name
        symbol
      }
      deposit
      sender {
        id
      }
    }
  }
}

`;