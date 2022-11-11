import React, { useContext } from 'react';
import StoreContext from '../../store/Store/StoreContext';
import WinnerSelect from './WinnerSelect';

const SubmissionCardAdmin = ({ bounty, pr, refreshBounty }) => {
  const [appState] = useContext(StoreContext);
  const claimedArr = bounty.claims.map((claim) => parseInt(claim.tier));
  const payoutAndIndex = bounty.payoutSchedule.map((payout, index) => {
    const claimed = claimedArr.includes(index);
    return {
      claimed,
      index,
      payout,
    };
  });
  const firstPrize = payoutAndIndex[0];
  const evenPrizes = payoutAndIndex
    .filter((elem, index) => {
      return index % 2 === 0 && index !== 0;
    })
    .reverse();

  const oddPrizes = payoutAndIndex.filter((elem, index) => {
    return index % 2 !== 0;
  });

  const linkedPrize = bounty.claims.filter((claim) => claim.claimantAsset === pr.url)[0];
  let tierWon = null;
  if (linkedPrize) {
    tierWon = parseInt(linkedPrize.tier) + 1;
  }

  const prizeColor = appState.utils.getPrizeColor(tierWon - 1);
  return (
    <div className='border-web-gray border-t px-2'>
      <h4 className='py-4 text-center w-full font-medium text-xl'>
        {linkedPrize ? `Winner of ${appState.utils.handleSuffix(tierWon)} Place` : 'Select Winner'}
      </h4>
      <div className='flex w-full relative h-32'>
        {tierWon ? (
          <div className='absolute inset-0   flex justify-center justify-items-center content-center items-center'>
            <svg className='w-20 h-32' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='24' height='24'>
              <path
                fillRule='evenodd'
                fill={prizeColor}
                d='M5.09 10.121A5.252 5.252 0 011 5V3.75C1 2.784 1.784 2 2.75 2h2.364c.236-.586.81-1 1.48-1h10.812c.67 0 1.244.414 1.48 1h2.489c.966 0 1.75.784 1.75 1.75V5a5.252 5.252 0 01-4.219 5.149 7.01 7.01 0 01-4.644 5.478l.231 3.003a.326.326 0 00.034.031c.079.065.303.203.836.282.838.124 1.637.81 1.637 1.807v.75h2.25a.75.75 0 010 1.5H4.75a.75.75 0 010-1.5H7v-.75c0-.996.8-1.683 1.637-1.807.533-.08.757-.217.836-.282a.334.334 0 00.034-.031l.231-3.003A7.01 7.01 0 015.09 10.12zM5 3.5H2.75a.25.25 0 00-.25.25V5A3.752 3.752 0 005 8.537V3.5zm6.217 12.457l-.215 2.793-.001.021-.003.043a1.203 1.203 0 01-.022.147c-.05.237-.194.567-.553.86-.348.286-.853.5-1.566.605a.482.482 0 00-.274.136.265.265 0 00-.083.188v.75h7v-.75a.265.265 0 00-.083-.188.483.483 0 00-.274-.136c-.713-.105-1.218-.32-1.567-.604-.358-.294-.502-.624-.552-.86a1.203 1.203 0 01-.025-.19l-.001-.022-.215-2.793a7.076 7.076 0 01-1.566 0zM19 8.578V3.5h2.375a.25.25 0 01.25.25V5c0 1.68-1.104 3.1-2.625 3.578zM6.5 2.594c0-.052.042-.094.094-.094h10.812c.052 0 .094.042.094.094V9a5.5 5.5 0 11-11 0V2.594z'
              ></path>
            </svg>
          </div>
        ) : (
          <>
            {evenPrizes.map((payout, index) => {
              return (
                <WinnerSelect
                  pr={pr}
                  disabled={linkedPrize}
                  bounty={bounty}
                  numberOfPayouts={payoutAndIndex.length}
                  prize={payout}
                  key={index}
                  refreshBounty={refreshBounty}
                />
              );
            })}
            <WinnerSelect
              pr={pr}
              disabled={linkedPrize}
              refreshBounty={refreshBounty}
              bounty={bounty}
              numberOfPayouts={payoutAndIndex.length}
              prize={firstPrize}
              key={firstPrize.index}
            />
            {oddPrizes.map((payout, index) => {
              return (
                <WinnerSelect
                  refreshBounty={refreshBounty}
                  pr={pr}
                  disabled={linkedPrize}
                  bounty={bounty}
                  numberOfPayouts={payoutAndIndex.length}
                  prize={payout}
                  key={index}
                />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default SubmissionCardAdmin;
