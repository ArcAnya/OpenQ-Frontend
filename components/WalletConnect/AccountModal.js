// Third party
import React, { useContext } from 'react';
import Link from 'next/link';
// Custom
import chainIdDeployEnvMap from './chainIdDeployEnvMap';
import CopyAddressToClipboard from '../Copy/CopyAddressToClipboard';
import { PersonIcon, SignOutIcon } from '@primer/octicons-react';
import StoreContext from '../../store/Store/StoreContext';
import { metaMask, walletConnect } from '../WalletConnect/connectors';
import AuthContext from '../../store/AuthStore/AuthContext';

const AccountModal = ({ chainId, account, ensName, setIsConnecting, domRef, isSafeApp }) => {
  let networkName;
  const [appState] = useContext(StoreContext);
  const [authState] = useContext(AuthContext);
  const { accountData } = appState;
  for (let key in chainIdDeployEnvMap) {
    if (chainIdDeployEnvMap[key].chainId === chainId) {
      networkName = chainIdDeployEnvMap[key].networkName;
    }
  }
  const disconnectAccount = () => {
    const connectors = [walletConnect, metaMask];
    try {
      connectors.forEach((connector) => {
        if (connector?.deactivate) {
          connector.deactivate();
        } else {
          connector.resetState();
        }
      });
    } catch (err) {
      appState.logger.error(err, account);
    }
    setIsConnecting(false);
  };

  return (
    <>
      {account ? (
        <div className='flex mr-4 flex-col items-center'>
          <div className='flex -mt-2 md:-mt-2 border-b-gray-700 tooltip-triangle absolute'></div>
          <div className='flex z-40 -mt-1.5 md:-mt-1.5 border-b-[#161B22] tooltip-triangle absolute'></div>

          <div
            ref={domRef}
            className='flex absolute flex-col mt-0 z-30 bg-[#161B22] w-40 tooltip border-gray-700 border rounded-sm p-0'
          >
            <div className='flex text-[#c9d1d9] items-center w-full h-8 p-2 mt-2 ml-2 m-0'>{networkName}</div>

            <div className='flex md:hover:bg-[#1f6feb] w-full gap-4 items-center hover:text-white text-[#c9d1d9]'>
              <div className='flex flex-col w-full p-2 ml-2'>
                <span className='text-left'>{ensName}</span>
                <CopyAddressToClipboard data={account} clipping={[5, 38]} />
              </div>
            </div>

            {!isSafeApp && (
              <div className='flex flex-col w-full'>
                <button
                  className='flex md:hover:bg-[#1f6feb] h-8 w-full items-center hover:text-white text-[#c9d1d9] self-start gap-4  p-2 mb-2'
                  onClick={disconnectAccount}
                >
                  <SignOutIcon className='w-4 h-4 ml-2 ' />
                  <span>Disconnect</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className='flex mr-4 flex-col items-center relative right-7'>
          <div className='flex -mt-2 md:-mt-2 border-b-gray-700 tooltip-triangle absolute left-10'></div>
          <div className='flex z-40 -mt-1.5 md:-mt-1.5 border-b-[#161B22] tooltip-triangle absolute left-10'></div>

          <div
            ref={domRef}
            className='flex absolute flex-col mt-0 pt-2 z-30 bg-[#161B22] w-52 tooltip border-gray-700 border rounded-sm p-0'
          >
            <div className='flex flex-wrap text-[#c9d1d9]  pl-4  w-full p-3  m-0 gap-1'>
              <span className='text-left break-all'> Signed in as </span>
              <Link
                href={`https://github.com/${authState.login}`}
                className='text-blue-500 hover:underline semi-bold '
                target='_blank'
              >
                <span className='break-all'> {accountData.username}</span>
              </Link>
            </div>
            {!isSafeApp && (
              <div className='flex flex-col w-full'>
                <Link href={`${process.env.NEXT_PUBLIC_BASE_URL}/user/${'6399d59cb372a7a55125bbbf'}`} className=''>
                  <div
                    data-testid='link'
                    className='flex md:hover:bg-[#1f6feb] h-8 md:hover:z-50 items-center w-full cursor-pointer hover:text-white text-[#c9d1d9] self-start gap-4 p-2 mb-2'
                  >
                    <PersonIcon className='w-4 h-4 ml-2' />
                    <span>Profile</span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
export default AccountModal;
