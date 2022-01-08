import React, { useState, useContext, useRef } from 'react';
import TokenFundBox from './SearchTokens/TokenFundBox';
import useWeb3 from '../../hooks/useWeb3';
import StoreContext from '../../store/Store/StoreContext';
import { ethers } from 'ethers';
import useConfirmErrorSuccessModals from '../../hooks/useConfirmErrorSuccessModals';
import ConfirmErrorSuccessModalsTrio from '../ConfirmErrorSuccessModals/ConfirmErrorSuccessModalsTrio';
import ButtonLoadingIcon from '../Loading/ButtonLoadingIcon';


const FundModal = ({ setShowModal, bounty }) => {
	// State
	const [volume, setVolume] = useState('');
	const {
		showErrorModal,
		setShowErrorModal,
		showSuccessModal,
		setShowSuccessModal,
		showConfirmationModal,
		setShowConfirmationModal,
	} = useConfirmErrorSuccessModals();
	const [errorMessage, setErrorMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const [transactionHash, setTransactionHash] = useState(null);
	const [confirmationMessage, setConfirmationMessage] = useState('');
	let menuRef = useRef();

	// Context
	const [appState] = useContext(StoreContext);
	const { library } = useWeb3();

	const [token, setToken] = useState(appState.tokens[0]);

	// Methods
	async function fundBounty() {
		console.log('funding');
		setIsLoading(true);
		const volumeInWei = volume * 10 ** token.decimals;
		const bigNumberVolumeInWei = ethers.BigNumber.from(volumeInWei.toString());

		let approveSucceeded = false;
		try {
			await appState.openQClient.approve(
				library,
				bounty.bountyAddress,
				token.address,
				bigNumberVolumeInWei
			);
			approveSucceeded = true;
		} catch (error) {
			setTransactionHash(JSON.stringify(error));
			setErrorMessage(JSON.stringify(error));
			setIsLoading(false);
			setShowErrorModal(true);
		}

		if (approveSucceeded) {
			console.log(bounty.bountyAddress);
			console.log(token.address);
			console.log(bigNumberVolumeInWei);

			try {
				const fundTxnReceipt = await appState.openQClient.fundBounty(
					library,
					bounty.bountyAddress,
					token.address,
					bigNumberVolumeInWei
				);
				setTransactionHash(fundTxnReceipt.transactionHash);
				setSuccessMessage(
					`Successfully funded issue ${bounty.url} with ${volume} ${token.symbol}!`
				);
				setShowSuccessModal(true);
				setIsLoading(false);
			} catch (error) {
				setTransactionHash(JSON.stringify(error));
				setErrorMessage(parseTransactionRevertedMessage(error));
				setIsLoading(false);
				setShowErrorModal(true);
			}
		}
	}

	const parseTransactionRevertedMessage = (error) => {
		if (error.data.message.includes('Cannot fund a closed bounty')) {
			return "This bounty is already closed! You cannot fund a bounty that has already been closed.";
		} else {
			return JSON.stringify(error);
		}
	};

	const updateModal = () => {
		setShowModal(false);
	};

	function onCurrencySelect(token) {
		setToken(token);
		setConfirmationMessage(
			`You are about to fund this bounty at address ${bounty.bountyAddress.substring(
				0,
				12
			)}...${bounty.bountyAddress.substring(32)} with ${volume} ${token.name
			}. Is this correct?`
		);
	}

	function onVolumeChange(volume) {
		setVolume(volume);
		setConfirmationMessage(
			`You are about to fund this bounty at address ${bounty.bountyAddress.substring(
				0,
				12
			)}...${bounty.bountyAddress.substring(32)} with ${volume} ${token.name
			}. Is this correct?`
		);
	}

	//Close Modal on outside click
	/* useEffect(() => {
		let handler = (event) => {
			if (!menuRef.current.contains(event.target)) {
				if (!isLoading) {
					if (!notifyMenuRef.current.contains(event.target)) {
						setIsLoading(false);
						updateModal();
					}
				} else {
					updateModal();
				}
			}
		};
		window.addEventListener("mousedown", handler);

		return () => {
			window.removeEventListener("mousedown", handler);
		};
	}); */

	// Render
	return (
		<div>
			<div className="justify-center font-mont items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
				<div className="w-1/4 my-6 mx-auto max-w-3xl">
					<div
						ref={menuRef}
						className="border-0 rounded-lg shadow-lg  flex flex-col w-full bg-white outline-none focus:outline-none"
					>
						<div className="flex flex-col p-5  border-solid">
							<div className="flex flex-row items-center justify-between">
								<div></div>
								<div className="text-3xl font-semibold">Fund Bounty </div>
								<div className="cursor-pointer" onClick={() => updateModal()}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-5 w-5"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
							</div>
							<div className="text-lg pt-3 font-mont text-center text-gray-400">
								Deposited ERC-20 Tokens can be withdrawn again after 30 days
							</div>
						</div>
						<div className="p-7 flex-auto">
							<TokenFundBox
								onCurrencySelect={onCurrencySelect}
								onVolumeChange={onVolumeChange}
								token={token}
								volume={volume}
							/>
						</div>
						<div className="flex px-6 pb-7">
							<button
								className={`flex flex-row justify-center space-x-5 items-center py-3 text-lg text-white ${isLoading
									? 'confirm-btn-disabled cursor-not-allowed'
									: 'confirm-btn cursor-pointer'
									}`}
								type="button"
								onClick={() => setShowConfirmationModal(true)}
							>
								<div>{!isLoading ? 'Fund' : 'Approving'}</div>
								<div>{isLoading && <ButtonLoadingIcon />}</div>
							</button>
						</div>
						{/*  <div className="flex items-center justify-end p-6 border-solid border-blueGray-200 rounded-b">
              <button
                className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={() => updateModal()}
              >
                Close
              </button>
            </div> */}
					</div>
				</div>
			</div>
			<div className="opacity-25 fixed inset-0 bg-black"></div>

			<ConfirmErrorSuccessModalsTrio
				setShowErrorModal={setShowErrorModal}
				showErrorModal={showErrorModal}
				errorMessage={errorMessage}
				setShowConfirmationModal={setShowConfirmationModal}
				showConfirmationModal={showConfirmationModal}
				confirmationTitle={'Confirm Deposit'}
				confirmationMessage={confirmationMessage}
				positiveOption={'Approve'}
				confirmMethod={fundBounty}
				showSuccessModal={showSuccessModal}
				setShowSuccessModal={setShowSuccessModal}
				successMessage={successMessage}
				transactionHash={transactionHash}
			/>
		</div>
	);
};

export default FundModal;
