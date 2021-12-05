import { gql } from '@apollo/client';

export const GET_ALL_BOUNTIES = gql`
query GetAllIssues {
  bounties {
    bountyAddress
    bountyId
    bountyMintTime
    bountyClosedTime
    status
		deposits {
      id
      tokenAddress
      value
      sender {
        id
      }
      receiveTime
    }
    issuer {
      id
    }
    bountyTokenBalances {
      volume
      tokenAddress
    }
  }
}
`;

export const GET_BOUNTY = gql`
query GetBounty($id: ID!) {
  bounty(id: $id) {
    bountyAddress
    bountyId
    bountyMintTime
    bountyClosedTime
    status
		deposits {
      id
      tokenAddress
      value
      sender {
        id
      }
      receiveTime
    }
		bountyTokenBalances {
		  tokenAddress
      volume
		}
    issuer {
      id
    }
  }
}
`;

export const GET_BOUNTIES_FOR_ORGANIZATION = gql`
query GetBountiesForOrganization($id: ID!) {
  bounties(where: {organization: "openqdev"}) {
    id
    bountyAddress
    issuer {
      id
    }
    bountyMintTime
    bountyClosedTime
    bountyTokenBalances {
      id
    }
  }
}
`;

export const GET_USER = gql`
query GetUser($id: ID!) {
  user(id: $id, subgraphError: allow) {
    id
    bountiesCreated {
      id
      bountyId
    }
    bountiesClosed {
      id
    }
    deposits {
      id
      tokenAddress
      value
      bounty {
        id
      }
    }
    fundedTokenBalances {
      id
      volume
      tokenAddress
    }
    payouts {
      id
      tokenAddress
      value
      payoutTime
      organization {
        id
      }
    }
  }
}
`;

export const GET_ORGANIZATION = gql`
query GetOrganization($id: ID!) {
  organization(id: $id, subgraphError: allow) {
    bountiesCreated {
      id
      bountyId
      issuer {
        id
      }
      bountyMintTime
      bountyClosedTime
      status
      bountyTokenBalances {
        id
        tokenAddress
        volume
      }
    }
    fundedTokenBalances {
      id
      tokenAddress
      volume
    }
    deposits {
      id
      tokenAddress
      value
      bounty {
        id
        bountyId
      }
      sender {
        id
      }
    }
    payouts {
      id
      tokenAddress
      payoutTime
      payoutAddress {
        id
      }
      value
    }
		payoutTokenBalances {
		  id
      volume
      tokenAddress
		}
  }
}
`;

export const GET_ORGANIZATIONS = gql`
query GetOrganization {
  organizations {
    id
    bountiesCreated(where: { status: OPEN}) {
      id
    }
  }
}
`;

export const SUBSCRIBE_TO_BOUNTY = gql`
subscription SubscribeToBounty($bountyId: String!) {
	bounties(where: {bountyId: $bountyId}) {
		id
		bountyId
		bountyMintTime
		bountyClosedTime
		status
		payoutAddress {
			id
		}
		deposits {
			id
		}
		refunds {
			id
		}
		payouts {
			id
		}   
	}
}
`;

export const GET_ISSUE = gql`
  query GetIssue($orgName: String!, $repoName: String!, $issueId: Int!) {
    organization(login: $orgName) {
      name
      repository(name: $repoName) {
        name
        issue(number: $issueId) {
          closed
					id
          author {
            login
          }
          createdAt
          title
          body
        }
      }
    }
  }
`;
