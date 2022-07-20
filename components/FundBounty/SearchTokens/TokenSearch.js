// Third party
import React, { useContext } from 'react';
import TokenList from './TokenList';
import ManageTokenList from '../ManageTokenList';
import { useState, useEffect } from 'react';
import StoreContext from '../../../store/Store/StoreContext';
import Image from 'next/image';
const TokenSearch = ({  token, onCurrencySelect, stream }) => {
	const [showListManager, setShowListManager] = useState(true);
	const [tokenSearchTerm, setTokenSearchTerm] = useState();
	const [lists, setLists] = useState({ polygon: !stream, openq: !stream, superTokens: stream});
	const [customTokens, setCustomTokens] = useState([]);
	const [polygonTokens, setPolygonTokens] = useState([]);
	const [openQTokens, setOpenQTokens] = useState([]);
	const [showTokenSearch, setShowTokenSearch] = useState();
	
	const batch = 100;
	const [appState] = useContext(StoreContext);
	function handleOutsideClick () {
		setShowTokenSearch(false);
	}
	
	useEffect(async()=>{
		let didCancel;
		const polygonDefaultTokens = await appState.tokenClient.getTokenMetadata(0, batch, 'polygon');
		const constantTokens = await appState.tokenClient.getTokenMetadata(0, 100, 'constants');
		
		if(!didCancel)			setOpenQTokens(constantTokens);
		
		if(!didCancel)	setPolygonTokens(polygonDefaultTokens);

		return ()=>didCancel = true;
	},[]);

	return (
		<div className='justify-self-end'>
			<div>
				<button
					className="flex flex-row items-center space-x-1 py-2 drop-shadow-lg border border-web-gray rounded-lg p-2 pr-2"
					onClick={() => setShowTokenSearch(true)}
				>
					<div className="flex flex-row space-x-5 items-center justify-center">
						<div className="h-1 w-6 pb-6">
							<Image src={token.path || token.logoURI || '/crypto-logos/ERC20.svg'} className="rounded-full" alt="n/a" width="40%" height="40%" />
						</div>
					</div>
					<div className="pl-3 ">{token.symbol}</div>
					<div>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							viewBox="0 0 20 20"
							fill="white"
						>
							<path
								fillRule="evenodd"
								d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
				</button>
			</div>
			{showTokenSearch&& <div
				onClick={handleOutsideClick}
				className='justify-center font-mont items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 md:left-20 z-50 outline-none focus:outline-none'
			>
				<div className='w-5/6 max-w-md'>
					{' '}
					<div
						onClick={e => e.stopPropagation()}
						className='flex justify-left border border-web-gray pl-8 pr-8 pt-5 pb-3 rounded-lg shadow-lg flex flex-col w-full bg-dark-mode outline-none focus:outline-none'
					>
						{showListManager ? (
							<div className='h-[30rem]'>
								<div className='flex items-center justify-between border-solid rounded-t pt-2 pb-4'>
									<h3 className='text-1xl font-semibold'>Select a Token</h3>
									<button
										className='text-3xl hover:text-tinted'
										onClick={() => setShowTokenSearch(false)}
									>
                    ×
									</button>
								</div>

								<div className='pt-3 pb-3 pl-4 bg-dark-mode border border-web-gray rounded-lg overflow-hidden mb-2'>
									<div className=''>
										<div className='justify-start '>
											<input
												className='outline-none bg-transparent '
												onKeyUp={e => setTokenSearchTerm(e.target.value)}
												type='text'
												placeholder='Search name'
											></input>
										</div>
									</div>
								</div>
								<div className='pt-4 overflow-auto h-72'>
									{polygonTokens && openQTokens && (
										<TokenList
											customTokens={customTokens}
											currentCursor={batch}
											lists={lists}
											polygonDefaultTokens = {polygonTokens}
											openqDefaultTokens = {openQTokens}
											tokenSearchTerm={tokenSearchTerm}
											onCurrencySelect={onCurrencySelect}
											setShowTokenSearch={setShowTokenSearch}
										/>
									)}
								</div>
								<div className='flex flex-col justify-items-center gap-2 justify-end p-6 border-t border-solid rounded-b'></div>
							</div>
						) : (
							<ManageTokenList
								stream={stream}
								setLists={setLists}
								setCustomTokens={setCustomTokens}
								customTokens={customTokens}
								lists={lists}
							/>
						)}
						<button
							className='confirm-btn'
							onClick={e => {
								setShowListManager(() => !showListManager);
								e.stopPropagation();
							}}
						>
							{showListManager ? 'Manage token lists' : 'Back'}
						</button>
					</div>
				</div>
			</div>}
			{!stream && <div className='fixed inset-0 bg-overlay'></div> }
		</div>
	);
};

export default TokenSearch;
