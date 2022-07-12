import React, { useState, useContext, useEffect } from "react";
import StoreContext from "../../store/Store/StoreContext";
import useWeb3 from "../../hooks/useWeb3";
import { ethers } from "ethers";
import { Framework } from "@superfluid-finance/sdk-core";

// IMPORTS AS IN FUNDPAGE

import TokenFundBox from "../../components/FundBounty/SearchTokens/TokenFundBox";
import ButtonLoadingIcon from '../../components/Loading/ButtonLoadingIcon';
import ToolTip from "../../components/Utils/ToolTip";
import ApproveFundModal from '../../components/FundBounty/ApproveFundModal';
import {
	RESTING,
	CONFIRM,
	APPROVING,
	TRANSFERRING,
	SUCCESS,
	ERROR
} from '../../components/FundBounty/ApproveTransferState';
import useIsOnCorrectNetwork from '../../hooks/useIsOnCorrectNetwork';

const CreateStream = () => {

	const [volume, setVolume] = useState('');
	const [receiverAddress, setReceiverAddress] = useState('');
	const [error, setError] = useState('');
	const [buttonText, setButtonText] = useState('Start Paying');
	const [, setSuccessMessage] = useState('');
	const [transactionHash, setTransactionHash] = useState(null);
	const [confirmationMessage, setConfirmationMessage] = useState('Please enter a volume greater than 0.');
	const [showApproveTransferModal, setShowApproveTransferModal] = useState(false);
	const [approveTransferState, setApproveTransferState] = useState(RESTING);
	const [isOnCorrectNetwork] = useIsOnCorrectNetwork();
	const zeroAddressMetadata = {
		name: 'Matic',
		address: '0x0000000000000000000000000000000000000000',
		symbol: 'MATIC',
		decimals: 18,
		chainId: 80001,
		path: '/crypto-logos/MATIC.svg'
	};

	// CONTEXT
  const [appState] = useContext(StoreContext);
  const { activate, account, library } = useWeb3();
	

  // STATE
  const [recipient, setRecipient] = useState("");
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [flowRate, setFlowRate] = useState("");
  const [flowRateDisplay, setFlowRateDisplay] = useState("");
  const [amount, setAmount] = useState("");

  const fDaiXAddress = "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f";
  const fDaiAddress = "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7";

	const [token, setToken] = useState(zeroAddressMetadata);

	const loadingClosedOrZero = approveTransferState == CONFIRM || approveTransferState == APPROVING || approveTransferState == TRANSFERRING || parseFloat(volume) <= 0.00000001 || parseFloat(volume) >= 1000 || volume == '' ;
	const disableOrEnable = `${(loadingClosedOrZero || !isOnCorrectNetwork) && account ? 'confirm-btn-disabled cursor-not-allowed' : 'confirm-btn cursor-pointer'}`;
	const fundButtonClasses = `flex flex-row justify-center space-x-5 items-center py-3 text-lg  ${disableOrEnable}`;

	function resetState() {
		setApproveTransferState(RESTING);
	}

  // HOOKS
  useEffect(() => {
    async function init() {
      if (library) {
        await appState.superfluidClient.createInstance(library);
      }
    }
    init();
  }, [library]);

  async function approveToken(amount, callback) {
    const amountInWei = ethers.utils.parseEther(amount);
    const superToken = await appState.superfluidClient.loadSuperToken(
      library,
      fDaiXAddress
    );
    const unwrappedToken = superToken.underlyingToken.contract.connect(
      library.getSigner()
    );
    try {
      const tx = await unwrappedToken.approve(fDaiXAddress, amountInWei);
      console.log(tx);
      await tx.wait();
      callback();
    } catch (error) {
      console.log(error);
      callback();
    }
  }

  async function createNewFlowAndUpgrade(recipient, callback) {
    try {
      const tx = await appState.superfluidClient.upgradeAndCreateFlowBacth(
        library,
        fDaiXAddress,
        flowRate,
        account,
        recipient
      );
      console.log("Creating your stream...");
      await tx.wait();
      console.log(tx);
      console.log(
        `Congrats - you've just created a money stream!
				View Your Stream At: https://app.superfluid.finance/dashboard/${recipient}
				Network: Mumbai
				Super Token: fDAIx
				Sender: 0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721
				Receiver: ${recipient},
				FlowRate: ${flowRateDisplay}`
      );
      callback();
    } catch (error) {
      console.log(
        "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
      );
      console.error(error);
      callback();
    }
  }

  async function updateFlow(recipient, callback) {
    try {
      const tx = await appState.superfluidClient.updateFlow(
        library,
        account,
        recipient,
        flowRate,
        fDaiXAddress
      );
      console.log("Updating your stream...");
      await tx.wait();
      console.log(tx);
      console.log(
        `Congrats - you've just updated a money stream!
				View Your Stream At: https://app.superfluid.finance/dashboard/${recipient}
				Network: Mumbai
				Super Token: DAIx
				Sender: 0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721
				Receiver: ${recipient},
				FlowRate: ${flowRateDisplay}`
      );
      callback();
    } catch (error) {
      console.log(
        "Hmmm, your transaction threw an error. Make sure that this stream does exist, and that you've entered a valid Ethereum address!"
      );
      console.error(error);
      callback();
    }
  }

  async function deleteFlow(recipient, callback) {
    try {
      const tx = await appState.superfluidClient.deleteFlow(
        library,
        account,
        recipient,
        fDaiXAddress
      );
      console.log("Deleting your stream...");
      await tx.wait();
      console.log(tx);
      console.log(
        `Congrats - you've just deleted a money stream!
				check it at: https://app.superfluid.finance/dashboard/${recipient}
				Network: Mumbai
				Super Token: DAIx
				Sender: 0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721
				Receiver: ${recipient},
				FlowRate: ${flowRateDisplay}`
      );
      callback();
    } catch (error) {
      console.log(
        "Hmmm, your transaction threw an error. Make sure that this stream  exist, and that you've entered a valid Ethereum address!"
      );
      console.error(error);
      callback();
    }
  }

  function calculateFlowRate(amount) {
    if (typeof Number(amount) !== "number" || isNaN(Number(amount)) === true) {
      alert("You can only calculate a flowRate based on a number");
      return;
    } else if (typeof Number(amount) === "number") {
      if (Number(amount) === 0) {
        return 0;
      }
      const amountInWei = ethers.BigNumber.from(amount);
      const monthlyAmount = ethers.utils.formatEther(amountInWei.toString());
      const calculatedFlowRate = monthlyAmount * 3600 * 24 * 30;
      return calculatedFlowRate;
    }
  }

  function CreateButton({ isLoading, children, ...props }) {
    return (
      <button
        variant="success"
        className="mb-5 text-lg rounded-full inline-flex items-center justify-center px-3 py-2 border-2 border-secondary-900 bg-secondary-900"
        disabled={isButtonLoading}
        {...props}
      >
        {children}
      </button>
    );
  }

  const handleRecipientChange = (e) => {
    setRecipient(() => ([e.target.name] = e.target.value));
  };

  const handleFlowRateChange = (e) => {
    setFlowRate(() => ([e.target.name] = e.target.value));
    // if (typeof Number(flowRate) === "number") {
    let newFlowRateDisplay = calculateFlowRate(e.target.value);
    setFlowRateDisplay(newFlowRateDisplay.toString());
    // setFlowRateDisplay(() => calculateFlowRate(e.target.value));
    // }
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

	const openFund = () => {
		setConfirmationMessage(
			`You are about to fund this bounty at address ${bounty.bountyAddress.substring(
				0,
				12
			)}...${bounty.bountyAddress.substring(32)} with ${volume} ${token.name
			}.
									
									This will be not be refundable}.
									
									Is this correct?`
		);
		setApproveTransferState(CONFIRM);
		setShowApproveTransferModal(true);
	};

	const connectWallet = () => {
		const payload = {
			type: 'CONNECT_WALLET',
			payload: true
		};
		dispatch(payload);
	};

	async function fundBounty() {
		const volumeInWei = volume * 10 ** token.decimals;

		if (volumeInWei == 0) {
			setError({ title: 'Zero Volume Sent', message: 'Must send a greater than 0 volume of tokens.' });
			setApproveTransferState(ERROR);
			setButtonText('Fund');
			return;
		}

		const bigNumberVolumeInWei = ethers.BigNumber.from(volumeInWei.toString());

		let approveSucceeded = false;

		try {
			const isWhitelisted = await appState.openQClient.isWhitelisted(library, token.address);

			// Only check bounty token address limit for non-whitelisted tokens
			if (!isWhitelisted) {
				const tokenAddressLimitReached = await appState.openQClient.tokenAddressLimitReached(library, bounty.bountyId);
				if (tokenAddressLimitReached) {
					setError({ title: 'Token Address Limit Is Reached!', message: 'Contact info@openq.dev' });
					setApproveTransferState(ERROR);
					return;
				}
			}
		} catch (error) {
			console.error(error);
			setError({ title: 'Call Revert Exception', message: 'A contract call exception occurred. Please try again.' });
			setButtonText('Fund');
			setApproveTransferState(ERROR);
			return;
		}

		try {
			const callerBalance = await appState.openQClient.balanceOf(library, account, ethers.utils.getAddress(token.address));
			if (callerBalance.noSigner) {
				setError({ title: 'No wallet connected.', message: 'Please connect your wallet.' });
				setApproveTransferState(ERROR);
				return;
			} else if (callerBalance.lt(bigNumberVolumeInWei)) {
				setError({ title: 'Funds Too Low', message: 'You do not have sufficient funds for this payment' });
				setApproveTransferState(ERROR);
				return;
			}
		} catch (error) {
			console.log(error);
			setError({ title: 'Call Revert Exception', message: 'A contract call exception occurred. Please try again.' });
			setButtonText('Fund');
			setApproveTransferState(ERROR);
			return;
		}

		try {
			setShowApproveTransferModal(true);
			if (token.address != ethers.constants.AddressZero) {
				setButtonText('Approving');
				setApproveTransferState(APPROVING);
				await appState.openQClient.approve(
					library,
					bounty.bountyAddress,
					token.address,
					bigNumberVolumeInWei
				);
			}
			approveSucceeded = true;
		} catch (error) {
			console.log(error);
			const { message, title, link, linkText } = appState.openQClient.handleError(error, { bounty });
			setError({ message, title, link, linkText });
			setButtonText('Fund');
			setApproveTransferState(ERROR);
		}

		if (approveSucceeded) {
			setApproveTransferState(TRANSFERRING);
			try {
				const fundTxnReceipt = await appState.openQClient.fundBounty(
					library,
					bounty.bountyId,
					token.address,
					bigNumberVolumeInWei
				);
				setTransactionHash(fundTxnReceipt.events[0].transactionHash);
				setApproveTransferState(SUCCESS);
				setSuccessMessage(
					`Successfully funded issue ${bounty.url} with ${volume} ${token.symbol}!`
				);
				refreshBounty();
			} catch (error) {
				console.log(error);
				const { message, title } = appState.openQClient.handleError(error, { bounty });
				setError({ message, title });
				setApproveTransferState(ERROR);
			}
			setButtonText('Fund');
		}
	}

	function onCurrencySelect(token) {
		setToken({ ...token, address: ethers.utils.getAddress(token.address) });
	}

	function onVolumeChange(volume) {
		const numberRegex = /^(\d+)?(\.)?(\d+)?$/;
		if (numberRegex.test(volume) || volume === '' || volume === '.') {
			setVolume(volume.match(numberRegex)[0]);
		}
	}

  return (
		<>
			<div className="flex flex-1 font-mont justify-center items-center pb-10">
				<div className="flex flex-col space-y-5 w-5/6">
					<div className="flex text-3xl font-semibold  justify-center pt-16">
						Start Streaming Your Payment
					</div>
	
					<TokenFundBox
						onCurrencySelect={onCurrencySelect}
						onVolumeChange={onVolumeChange}
						token={token}
						volume={volume}
					/>
	
					<div className="flex w-full flex-row justify-between items-center px-4 py-3 rounded-lg py-1 bg-dark-mode border border-web-gray ">
						<div className={'flex w-full px-4 font-bold fundBox-amount bg-dark-mode'}>
							<input
								className="w-full bg-dark-mode px-5 m-1.5 p-1 border-web-gray outline-none"
								autoComplete="off"
								value={receiverAddress}
								type="text"
								onChange={(event) => {
									setReceiverAddress(event.target.value);
								}}
								placeholder="Enter Wallet Address"
							/>
						</div>
					</div>
	
					<ToolTip hideToolTip={account && isOnCorrectNetwork && !loadingClosedOrZero}
						toolTipText={
							account && isOnCorrectNetwork ?
								'Please indicate how many days you\'d like to fund your bounty for.' :
								account && isOnCorrectNetwork ?
									'Please indicate the volume you\'d like to fund with. Must be between 0.0000001 and 1000.' :
									account ?
										'Please switch to the correct network to fund this bounty.' :
										'Connect your wallet to fund this bounty!'}
						customOffsets={
							[0, 54]}>
						<button
							className={fundButtonClasses}
							disabled={(loadingClosedOrZero || !isOnCorrectNetwork) && account}
							type="button"
							onClick={account ? openFund : connectWallet}
						>
							<div>{account ? buttonText : 'Connect Wallet'}</div>
							<div>{approveTransferState != RESTING && approveTransferState != SUCCESS && approveTransferState != ERROR ? (
								<ButtonLoadingIcon />
							) : null}</div>
						</button>
					</ToolTip>
					<div className='text-web-gray text-sm'>Always pay through the interface! Never send funds directly to the address!</div>
				</div>
	
				{showApproveTransferModal && <ApproveFundModal
					approveTransferState={approveTransferState}
					address={account}
					transactionHash={transactionHash}
					confirmationMessage={confirmationMessage}
					error={error}
					setShowApproveTransferModal={setShowApproveTransferModal}
					confirmMethod={fundBounty}
					resetState={resetState}
					token={token}
					volume={volume}
					bountyAddress={bounty.bountyAddress}
					bounty={bounty}
				/>}
			</div>
    {/* <div>
      <div className="ml-12 mt-8">
        <h2 className="mb-5 text-2xl">Approve Tokens</h2>
        <form>
          <div className="mb-5 text-black">
            <input
              type="text"
              name="recipient"
              value={amount}
              onChange={handleAmountChange}
              placeholder="amount of tokens"
              className="w-full h-8"
            />
          </div>
          <CreateButton
            onClick={(e) => {
              e.preventDefault();
              setIsButtonLoading(true);
              approveToken(amount, () => {
                setIsButtonLoading(false);
                setAmount("");
              });
            }}
          >
            Approve the contract to move your tokens
          </CreateButton>
        </form>
      </div>
      <div>
        <h2 className="mb-3 text-2xl">Create a Flow</h2>
        <form>
          <div className="mb-3 text-black">
            <input
              type="text"
              name="recipient"
              value={recipient}
              onChange={handleRecipientChange}
              placeholder="Enter the receiver Ethereum address"
              className="w-full h-8"
            />
          </div>
          <div className="mb-3 text-black">
            <input
              type="text"
              name="flowRate"
              value={flowRate}
              onChange={handleFlowRateChange}
              placeholder="Enter a flowRate in wei/second"
              className="w-full h-8"
            />
          </div>
          <CreateButton
            onClick={(e) => {
              e.preventDefault();
              setIsButtonLoading(true);
              createNewFlowAndUpgrade(recipient, () => {
                setIsButtonLoading(false);
                setRecipient("");
                setFlowRate("");
                setFlowRateDisplay("");
              });
            }}
          >
            Click to Create Your Stream
          </CreateButton>
          <div className="mb-3">
            <div>
              <p>Your flow will be equal to:</p>
              <p>
                <b>${flowRateDisplay !== " " ? flowRateDisplay : 0}</b>{" "}
                DAIx/month
              </p>
            </div>
          </div>
        </form>
      </div>
      <div>
        <h2 className="mb-3 text-2xl">Update a Flow</h2>
        <form>
          <div className="mb-3 text-black">
            <input
              type="text"
              name="recipient"
              value={recipient}
              onChange={handleRecipientChange}
              placeholder="Enter the receiver Ethereum address"
              className="w-full h-8"
            />
          </div>
          <div className="mb-3 text-black">
            <input
              type="text"
              name="flowRate"
              value={flowRate}
              onChange={handleFlowRateChange}
              placeholder="Enter a flowRate in wei/second"
              className="w-full h-8"
            />
          </div>
          <CreateButton
            onClick={(e) => {
              e.preventDefault();
              setIsButtonLoading(true);
              updateFlow(recipient, () => {
                setIsButtonLoading(false);
                setRecipient("");
                setFlowRate("");
                setFlowRateDisplay("");
              });
            }}
          >
            Click to Update Your Stream
          </CreateButton>
          <div className="mb-3">
            <div>
              <p>Your flow will be equal to:</p>
              <p>
                <b>${flowRateDisplay !== " " ? flowRateDisplay : 0}</b>{" "}
                DAIx/month
              </p>
            </div>
          </div>
        </form>
      </div>
      <div>
        <h2 className="mb-3 text-2xl">Delete a Flow</h2>
        <form>
          <div className="mb-3 text-black">
            <input
              type="text"
              name="recipient"
              value={recipient}
              onChange={handleRecipientChange}
              placeholder="Enter the receiver Ethereum address"
              className="w-full h-8"
            />
          </div>
          <CreateButton
            onClick={(e) => {
              e.preventDefault();
              setIsButtonLoading(true);
              deleteFlow(recipient, () => {
                setIsButtonLoading(false);
                setRecipient("");
              });
            }}
          >
            Click to Delete Your Stream
          </CreateButton>
        </form>
      </div>
    </div> */}
		</>
  );
};

export default CreateStream;
