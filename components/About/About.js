// Third Party
import React from 'react';

// Custom
import AboutFunding from './AboutFunding';

const About = ({ organizationData, tokenValues }) => {
	const bounties = organizationData.bountiesCreated.filter((elem) => {
		return elem.status === 'OPEN';
	});

	const numBounties = bounties.length;
	const users = [];

	organizationData.payouts.forEach((elem) => {
		if (!users.some(userElem => userElem.payoutAddress === elem.payoutAddress)) {
			users.push(elem);
		}
	});

	return (
		<div className='text-white grid grid-cols-wide gap-4 justify-center col-start-2 pt-12'>
			<section className="min-h-card rounded-lg shadow-sm col-start-2 border border-web-gray">
				<h1 className='font-semibold p-4 text-3xl border-web-gray border-b'>{organizationData.login}</h1>
				<dl className="p-10 pb-0">
					<dt className='font-semibold text-gray-300 text-lg pb-2'>Bounties</dt>
					<dd className='font-semibold pb-8'>{numBounties}</dd>
					<dt className='font-semibold text-gray-300 text-lg pb-2'>Contributors</dt>
					<dd className='font-semibold pb-8'>{users.length}</dd>
					<AboutFunding organizationFunding={organizationData.fundedTokenBalances} tokenValues={tokenValues} />
				</dl>
			</section>
		</div >
	);
};
export default About;