/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '../../test-utils';
import InitialState from '../../store/Store/InitialState';
import mocks from '../../__mocks__/mock-server.json';
import BountyCardDetailsModal from '../../components/BountyCard/BountyCardDetailsModal';

describe('BountyCardDetailsModal', () => {
  const newBounties = mocks.bounties;
  const fullBounties = [];

  const issueData = InitialState.githubRepository.parseIssuesData(mocks.githubIssues);
  newBounties.forEach((bounty) => {
    const relatedIssue = issueData.find((issue) => issue.id == bounty.bountyId);
    if (relatedIssue) {
      const mergedBounty = { ...bounty, ...relatedIssue };
      fullBounties.push(mergedBounty);
    }
  });

  beforeEach(() => {
    const observe = jest.fn();
    const disconnect = jest.fn();

    window.IntersectionObserver = jest.fn(() => ({
      observe,
      disconnect,
    }));
  });
  const test = (bounty) => {
    it('should display BountyCardDetailsModal', async () => {
      // ARRANGE
      render(<BountyCardDetailsModal bounty={bounty} closeModal={() => null} showModal={() => null} complete={true} />);
      await waitFor(async () => {
        const totalRegExp = new RegExp('0.00');
        // ASSERT
        const orgName = screen.getByText(bounty.owner);
        expect(orgName).toBeInTheDocument();
        if (bounty.status === '0') {
          expect(screen.getAllByText(totalRegExp)[0]).toBeInTheDocument();
        }

        const bountyAddressRegExp = new RegExp(bounty.bountyAddress.slice(0, 4));
        expect(screen.getByText(bountyAddressRegExp)).toBeInTheDocument();
        expect(screen.getByText('Watch')).toBeInTheDocument();
        if (bounty.labels[0]) {
          expect(screen.getByText(bounty.labels[0].name)).toBeInTheDocument();
        }
        const link = await screen.findAllByText(/Full Contract/i);
        expect(link[0]).toBeInTheDocument();
        expect(screen.getByText(/Smart Contract/)).toBeInTheDocument();

        // should not have null or undefined values
        const nullish = [...screen.queryAllByRole(/null/), ...screen.queryAllByRole(/undefined/)];
        expect(nullish).toHaveLength(0);
      });
    });
  };

  fullBounties.forEach((bounty) => test(bounty));
});
