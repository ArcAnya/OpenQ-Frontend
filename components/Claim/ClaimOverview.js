import React, { useContext, useMemo } from 'react';
import StoreContext from '../../store/Store/StoreContext';
import Jazzicon from '../Utils/Jazzicon';
import useEns from '../../hooks/useENS';
import useGetTokenValues from '../../hooks/useGetTokenValues';
import { ethers } from 'ethers';

// get bounty info
// cols => bounty.deposits => list of token addresses (3 subcolumns => vol / % / $ value)
// end of cols => sum col value in $ total
// rows => bounty.payouts.closer.id (with jazzicon like AB) => payouts.volume per tokenAddress (and % total deposit & $ value)
// subsum row
// "rest" row => still available for claim
// "total" value deposited

const ClaimOverview = ({ bounty }) => {
  const [appState] = useContext(StoreContext);
  const shortenAddress = (address) => {
    if (!address) {
      return '';
    }
    return `${address.slice(0, 4)}...${address.slice(38)}`;
  };
  const tokenAdresses = bounty.deposits
    .map((deposit) => deposit.tokenAddress)
    .filter((itm, pos, self) => {
      return self.indexOf(itm) == pos;
    });
  const claimants = bounty.payouts
    .map((payout) => payout.closer.id)
    .filter((itm, pos, self) => {
      return self.indexOf(itm) == pos;
    });
  const claimantsShort = claimants.map((claimant) => {
    const [claimantEnsName] = useEns(claimant);
    return claimantEnsName || shortenAddress(claimant);
  });

  const claimantBalances = (claimant, tokenAddress) => {
    const getBalances = () => {
      return claimant
        ? bounty.payouts.filter((payout) => payout.closer.id == claimant && payout.tokenAddress == tokenAddress)
        : null;
    };
    const balanceObj = useMemo(() => getBalances(), [claimant]);
    const [balanceValues] = useGetTokenValues(balanceObj);
    const claimantTotal = appState.utils.formatter.format(balanceValues?.total);
    return claimantTotal;
  };

  const claimantVolume = (claimant, tokenAddress) => {
    const tokenMetadata = appState.tokenClient.getToken(tokenAddress);
    const volume = bounty.payouts.filter(
      (payout) => payout.closer.id == claimant && payout.tokenAddress == tokenAddress
    )[0].volume;
    let bigNumberVolume = ethers.BigNumber.from(volume.toString());
    let decimals = parseInt(tokenMetadata.decimals) || 18;
    return ethers.utils.formatUnits(bigNumberVolume, decimals);
  };

  const totalDeposit = (tokenAddress) => {
    const tokenMetadata = appState.tokenClient.getToken(tokenAddress);
    const volume = bounty.deposits
      .filter((deposit) => deposit.tokenAddress == tokenAddress)
      .map((deposit) => deposit.volume)
      .reduce((a, b) => parseInt(a) + parseInt(b));
    let bigNumberVolume = ethers.BigNumber.from(volume.toLocaleString('fullwide', { useGrouping: false }));
    let decimals = parseInt(tokenMetadata.decimals) || 18;
    return ethers.utils.formatUnits(bigNumberVolume, decimals);
  };

  const claimantPercent = (claimant, tokenAddress) => {
    return (claimantVolume(claimant, tokenAddress) / totalDeposit(tokenAddress)) * 100;
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th className='p-2'></th>
            {tokenAdresses.map((token) => (
              <th key={token} className='p-2'>
                {appState.tokenClient.getToken(token).symbol}
                <div className='flex justify-between p-2'>
                  <th className='p-2'>Vol</th>
                  <th className='p-2'>%</th>
                  <th className='p-2'>$</th>
                </div>
              </th>
            ))}
            <th className='p-2'>Total</th>
          </tr>
        </thead>
        <tbody>
          {claimants.map((claimant, index) => (
            <>
              <tr key={claimant}>
                <td className='flex gap-4 items-center p-2' key={claimant}>
                  <Jazzicon tooltipPosition={'-left-2'} size={36} address={claimant} />
                  <span>{claimantsShort[index]}</span>
                </td>
                {tokenAdresses.map((tokenAddress) => (
                  <td key={tokenAddress} className='p-2 text-center'>
                    <td className='p-2 text-center' key={tokenAddress + 1}>
                      {bounty.payouts?.some((payout) => payout.closer.id == claimant) ? (
                        <>{claimantVolume(claimant, tokenAddress)}</>
                      ) : (
                        '0.0'
                      )}
                    </td>
                    <td className='p-2 text-center' key={tokenAddress + 2}>
                      {bounty.payouts?.some((payout) => payout.closer.id == claimant) ? (
                        <>{claimantPercent(claimant, tokenAddress)} %</>
                      ) : (
                        '0.0'
                      )}
                    </td>
                    <td className='p-2 text-center' key={tokenAddress + 3}>
                      {bounty.payouts?.some((payout) => payout.closer.id == claimant) ? (
                        <>{claimantBalances(claimant, tokenAddress)}</>
                      ) : (
                        '0.0'
                      )}
                    </td>
                  </td>
                ))}
                <td className='p-2'>Total</td>
              </tr>
            </>
          ))}
          <tr>SubTotal</tr>
          <tr>Still Claimable</tr>
          <tr className='italic'>of which currently refundable (plus link)</tr>
          <tr>Total Deposited</tr>
        </tbody>
      </table>
    </div>
  );
};

export default ClaimOverview;
