// Third party
import React, { useEffect, useState, useContext, useRef } from 'react';
import Image from 'next/image';
import { PersonAddIcon, PersonIcon, PeopleIcon } from '@primer/octicons-react';

// Children
import AddContestParams from '../AddContestParams';
import MintBountyInputIssue from '../MintBountyInputIssue/MintBountyInputIssue';
import AddSplitPriceParams from '../AddSplitPriceParams';
import Budgeting from '../Budgeting';
import ErrorModal from '../ErrorModal';
import InvoiceableToggle from '../InvoiceRequired';
import MintBountyModalButton from '../MintBountyModalButton';
import TokenProvider from '../../../TokenSelection/TokenStore/TokenProvider';
import AddAlternativeMetadata from '../AddAlternativeMetadata';

// Context
import StoreContext from '../../../../store/Store/StoreContext';
import MintContext from '../../MintContext';

// Utils
import SubMenu from '../../../Utils/SubMenu';
import ModalLarge from '../../../Utils/ModalLarge';
import KycRequiredToggle from '../KycRequiredToggle';
import W8RequiredToggle from '../W8RequiredToggle';
import { getBountyTypeName, getTypeFromCategory } from '../../../../services/utils/lib';

const MintBountyModal = ({ modalVisibility }) => {
  const [appState] = useContext(StoreContext);
  const [mintState, mintDispatch] = useContext(MintContext);

  // State
  const [issue, setIssue] = useState();
  const [error, setError] = useState();

  const { type, isLoading } = mintState;

  const handleSetCategory = (category) => {
    const dispatch = {
      payload: getTypeFromCategory(category) || 0,
      type: 'SET_TYPE',
    };
    mintDispatch(dispatch);
  };

  const modal = useRef();

  const closeModal = () => {
    setIssue();
    setError();
    modalVisibility(false);

    const dispatch = {
      type: 'SET_LOADING',
      payload: false,
    };
    mintDispatch(dispatch);
  };

  useEffect(() => {
    // Courtesy of https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
    function handleClickOutside(event) {
      if (
        modal.current &&
        !modal.current.contains(event.target) &&
        !appState.walletConnectModal &&
        !document.getElementById('connect-modal')?.contains(event.target)
      ) {
        modalVisibility(false);
      }
    }

    // Bind the event listener
    if (!isLoading) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modal, isLoading]);

  // Methods

  const footerLeft = (
    <a
      href={'https://github.com/OpenQDev/OpenQ-Contracts/blob/production/contracts/Bounty/Implementations/BountyV2.sol'}
      className='flex gap-2 underline'
      target='_blank'
      rel='noreferrer'
    >
      <>
        <Image src={'/social-icons/github-logo-white.svg'} width={24} height={24} alt='github-logo' />
        Contract source code
      </>
    </a>
  );

  const btn = !error && <MintBountyModalButton issue={issue} modalVisibility={modalVisibility} setError={setError} />;

  // Render
  return (
    <>
      {error ? (
        <ErrorModal setShowErrorModal={closeModal} error={error} />
      ) : (
        <ModalLarge
          title={`Deploy ${getBountyTypeName(type)} Contract`}
          footerLeft={footerLeft}
          footerRight={btn}
          setShowModal={modalVisibility}
          resetState={closeModal}
        >
          <div className='h-full grid grid-cols-[150px_1fr] gap-4'>
            <div className='pl-4 p-2 text-muted border-r border-gray-700'>
              <div className='pb-2'>Contract Type</div>
              <SubMenu
                items={[
                  { name: 'Fixed Price', Svg: PersonIcon },
                  { name: 'Split Price', Svg: PersonAddIcon },
                  { name: 'Hackathon', Svg: PeopleIcon },
                ]}
                internalMenu={getBountyTypeName(type)}
                updatePage={handleSetCategory}
                styles={'justify-center'}
                vertical={true}
              />
            </div>
            <div className='overflow-y-auto px-2'>
              <h3 className='text-xl pt-2'>
                {type == 1
                  ? 'Pay out a fixed amount to any contributors who submit work to this bounty, as many times as you like'
                  : `Create a ${getBountyTypeName(type)} Contract to send funds to any GitHub issue`}
              </h3>
              <MintBountyInputIssue />
              {type === 3 && (
                <>
                  <InvoiceableToggle />
                  <KycRequiredToggle />
                  <W8RequiredToggle />
                </>
              )}
              <TokenProvider>
                <Budgeting />{' '}
              </TokenProvider>

              {type === 1 ? (
                <>
                  <TokenProvider>
                    <AddSplitPriceParams />
                  </TokenProvider>
                </>
              ) : type === 2 || type === 3 ? (
                <>
                  <AddContestParams />
                </>
              ) : null}
              <AddAlternativeMetadata />
            </div>
          </div>
        </ModalLarge>
      )}
    </>
  );
};

export default MintBountyModal;
