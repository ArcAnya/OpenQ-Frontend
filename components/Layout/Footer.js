// Third party
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Custom
import CopyAddressToClipboard from '../Copy/CopyAddressToClipboard';

const Footer = () => {
	const year = new Date().getFullYear();
	const iW = 16;
	const iH = 16;
	return (
		<div className="text-tinted justify-center w-full bg-black PY-2" style={{ position: 'absolute', bottom: '0px' }}>
			<div className='py-2'>
				<div className='px-4 w-full'>
					<div>These are currently unaudited contracts. OpenQ Labs assumes no responsibility or liability for any transaction errors, faults or losses which occur while minting, funding, refunding or claiming a bounty.</div>
				
				</div>
			</div>
			<div className="px-4 flex flex-wrap items-center justify-between w-full py-2">
				<div>Copyright {year} OpenQ ©</div>
				<div className='flex flex-wrap'>
					<div className='min-w-[100px] flex gap-4'>
						<Link href={'https://twitter.com/openqlabs'}>
							<a target={'_blank'}>
								<Image src={'/social-icons/twitter.svg'} width={iW} height={iH} />
							</a>
						</Link>
						<Link href={'https://github.com/OpenQDev/'}>
							<a target={'_blank'}>
								<Image src={'/social-icons/github-logo-white.svg'}  width={iW} height={iH}/>
							</a>
						</Link>
						<Link href={'https://discord.gg/puQVqEvVXn'}>
							<a target={'_blank'}>
								<Image src={'/social-icons/discord.svg'}  width={iW} height={iH}/>
							</a>
						</Link>
					</div>
					<CopyAddressToClipboard data={'0x06b306C85E5F33b1b2D971822ce0eD42FB7aB9a1'} styles="pt-0 w-64"/>
				</div>
			</div>
		</div>);
};

export default Footer;
