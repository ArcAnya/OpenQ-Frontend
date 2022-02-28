// Third Party
import React, { useState, useContext, useEffect } from 'react';
import useWeb3 from '../../hooks/useWeb3';
import { ethers } from 'ethers';

// Custom
import StoreContext from '../../store/Store/StoreContext';
import ConfirmErrorSuccessModalsTrio from '../ConfirmErrorSuccessModals/ConfirmErrorSuccessModalsTrio';
import useConfirmErrorSuccessModals from '../../hooks/useConfirmErrorSuccessModals';
import LoadingIcon from '../Loading/LoadingIcon';
import DepositCard from './DepositCard';

const RefundPage = ({ bounty, refreshBounty }) => {
	const {
		showErrorModal,
		setShowErrorModal,
		showSuccessModal,
		setShowSuccessModal,
		showConfirmationModal,
		setShowConfirmationModal,
	} = useConfirmErrorSuccessModals();
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const [transactionHash, setTransactionHash] = useState(null);
	const [confirmationMessage, setConfirmationMessage] = useState('');

	// Context
	const [appState] = useContext(StoreContext);
	const { library, account } = useWeb3();

	const claimed = bounty.status == 'CLOSED';

	useEffect(() => {
		if (bounty) {
			setConfirmationMessage(
				`You are about to refund your deposits on issue ${bounty.url} to the address ${account}. Is this correct ?`
			);
		}
	}, [bounty]);

	// Methods
	async function refundBounty(depositId) {
		setIsLoading(true);
		appState.openQClient
			.refundDeposit(library, bounty.bountyAddress, depositId)
			.then((txnReceipt) => {
				setTransactionHash(txnReceipt.transactionHash);
				setSuccessMessage('Money refunded!');
				setShowSuccessModal(true);
				refreshBounty();
				setIsLoading(false);
			})
			.catch((error) => {
				const { message, title } = appState.openQClient.handleError(error, { account, bounty });
				setError({ message, title });
				setIsLoading(false);
				setShowErrorModal(true);
			});
	}

	// Render
	if (claimed) {
		return (
			<div className="pt-16">
				<div className="flex flex-col space-y-5">
					<div className="bg-purple-600 col-span-3 bg-opacity-20 border border-purple-700 rounded-lg text-white p-4">
						Bounty Is Already Closed
					</div>
				</div>
			</div>
		);
	} else {
		return (
			<>
				<div className="flex justify-center items-center">
					<div className="pt-16 flex flex-col space-y-5 w-1/2">
						<div className="text-3xl font-semibold text-white text-center">
							Refund Bounty{' '}
						</div>
						<h1 className="text-white">
							Your Deposits
						</h1>
						<h2 className='text-white'>Refundable</h2>
						{
							bounty.deposits
								.filter((deposit) => {
									return (ethers.utils.getAddress(deposit.sender.id) == account);
								})
								.filter((deposit) => {
									return deposit.refunded == false;
								})
								.filter((deposit) => {
									return ((parseInt(deposit.receiveTime) + parseInt(deposit.expiration)) < Math.floor(Date.now() / 1000));
								})
								.map((deposit) => {
									return (
										<div className="pb-3" key={deposit.id}>
											<DepositCard deposit={deposit} bounty={bounty} refundBounty={refundBounty} notRefundable={false} />
										</div>
									);
								})
						}
						<h2 className='text-white'>Not Yet Refundable</h2>
						{
							bounty.deposits
								.filter((deposit) => {
									return (ethers.utils.getAddress(deposit.sender.id) == account);
								})
								.filter((deposit) => {
									return ((parseInt(deposit.receiveTime) + parseInt(deposit.expiration)) > Math.floor(Date.now() / 1000));
								})
								.map((deposit) => {
									return (
										<div className="pb-3" key={deposit.id}>
											<DepositCard deposit={deposit} bounty={bounty} refundBounty={refundBounty} notRefundable={true} />
										</div>
									);
								})
						}
						<h2 className='text-white'>Refunded</h2>
						{
							bounty.deposits
								.filter((deposit) => {
									return (ethers.utils.getAddress(deposit.sender.id) == account);
								})
								.filter((deposit) => {
									return (deposit.refunded == true);
								})
								.map((deposit) => {
									return (
										<div className="pb-3" key={deposit.id}>
											<DepositCard deposit={deposit} bounty={bounty} refundBounty={refundBounty} />
										</div>
									);
								})
						}
					</div>
					{isLoading && <LoadingIcon />}
					<ConfirmErrorSuccessModalsTrio
						setShowErrorModal={setShowErrorModal}
						showErrorModal={showErrorModal}
						error={error}
						setShowConfirmationModal={setShowConfirmationModal}
						showConfirmationModal={showConfirmationModal}
						confirmationTitle={'Refund Deposits'}
						confirmationMessage={confirmationMessage}
						positiveOption={'Yes, Refund!'}
						confirmMethod={refundBounty}
						showSuccessModal={showSuccessModal}
						setShowSuccessModal={setShowSuccessModal}
						successMessage={successMessage}
						transactionHash={transactionHash}
					/>
				</div>
			</>
		);
	}
};

export default RefundPage;
