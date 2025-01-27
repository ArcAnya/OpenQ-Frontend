import React, { useState, useContext, useEffect } from 'react';
import Link from 'next/link';
import { CheckIcon, UploadIcon } from '@primer/octicons-react';
import W8FormModal from './W8FormModal';
import axios from 'axios';
import {
  EMAIL_NOT_SENT,
  INVALID_EMAIL_CLIENT,
  INVALID_EMAIL_FREELANCER,
} from '../../../../constants/invoiceableResponses';
import StoreContext from '../../../../store/Store/StoreContext';
import { getW8Approved } from '../../../../services/utils/lib';
import LoadingIcon from '../../../Loading/ButtonLoadingIcon';
const W8Requirement = ({ bounty }) => {
  const [loading, setLoading] = useState(false);
  const [appState] = useContext(StoreContext);
  const [file, setFile] = useState(null);
  const [w8formResponse, setW8FormResponse] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { accountData } = appState;
  const pending = bounty.requests?.nodes.some((node) => node.requestingUser.id === accountData.id);
  const [sent, setSent] = useState(pending);
  const profileLink = `${process.env.NEXT_PUBLIC_BASE_URL}/user/${accountData.id}?tab=📃Invoicing (Freelancer)`;
  const [w8Approved, setW8Approved] = useState(false);
  useEffect(() => {
    const W8Approved = getW8Approved(bounty, accountData);
    setW8Approved(W8Approved);
  }, [bounty, accountData]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSent(false);
    setW8FormResponse('');
  };

  const handleResult = (result) => {
    if (result?.data?.message) {
      setW8FormResponse(result.data.message);
    } else setW8FormResponse(EMAIL_NOT_SENT);

    setLoading(false);
  };
  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setW8FormResponse('LOADING');
    const formData = new FormData();
    setSent(true);
    formData.append('file', file);
    setFile(null);
    try {
      const result = await axios.post(
        `${process.env.NEXT_PUBLIC_INVOICE_URL}/taxform?id=${bounty.bountyAddress}`,
        formData,
        {
          withCredentials: true,
          headers: {
            'content-type': 'multipart/form-data',
          },
        }
      );
      handleResult(result);
    } catch (e) {
      setLoading(false);
      setW8FormResponse(EMAIL_NOT_SENT);
      appState.logger.error('w8form.js1', e);
    }
  };

  const w8formResponseOptions = {
    '': {
      MessageHTML: () => <></>,
    },
    [INVALID_EMAIL_CLIENT]: {
      MessageHTML: () => (
        <>
          The organization's invoicing email is invalid.
          {w8formResponse?.invoicingEmail && `The email entered was  ${w8formResponse.invoicingEmail}.`} Please contact
          them or ask for help in our{' '}
          <a target={'_blank'} className='underline' href='https://discord.gg/puQVqEvVXn' rel='noreferrer'>
            discord
          </a>
          .
        </>
      ),
    },
    [INVALID_EMAIL_FREELANCER]: {
      MessageHTML: () => (
        <>
          Your email is an invalid format. Please head to your{' '}
          <Link className='underline' href={profileLink}>
            profile
          </Link>{' '}
          and correct it or ask for help in our{' '}
          <a target={'_blank'} className='underline' href='https://discord.gg/puQVqEvVXn' rel='noreferrer'>
            discord
          </a>
          .
        </>
      ),
    },
    EMAIL_SENT: {
      successW8Form: true,
      MessageHTML: () => (
        <>
          We have sent your tax document to the organization. Please wait until they have viewed and confirmed them. If
          they request changes, you will be notified via your contact email. If you have any questions, feel free to
          reach out in our{' '}
          <a target={'_blank'} className='underline' href='https://discord.gg/puQVqEvVXn' rel='noreferrer'>
            discord
          </a>
          .
        </>
      ),
    },
    NO_DEPOSITS: {
      MessageHTML: () =>
        "Funder hasn't made any deposits yet, please wait for money to be deposited before sending W8/W9 form.",
    },
    'no deposits': {
      MessageHTML: () =>
        "Funder hasn't made any deposits yet, please wait for money to be deposited before sending W8/W9 form.",
    },

    NOT_WINNER: {
      MessageHTML: () => (
        <>
          You are not the winner of this bounty
          <br />
          <br />
          If you believe this is an error, please reach out to us via{' '}
          <a target={'_blank'} className='underline' href='https://discord.gg/puQVqEvVXn' rel='noreferrer'>
            discord
          </a>
        </>
      ),
    },

    SECURITY_ERROR: {
      MessageHTML: () => (
        <>
          Your pdf failed our security scan, please reach out to us via{' '}
          <a target={'_blank'} className='underline' href='https://discord.gg/puQVqEvVXn' rel='noreferrer'>
            discord
          </a>
        </>
      ),
    },
    FILE_TOO_LARGE: {
      MessageHTML: () => (
        <>
          Your pdf was too large, must be under 10 mb threshold. Please reach out to us via{' '}
          <a target={'_blank'} className='underline' href='https://discord.gg/puQVqEvVXn' rel='noreferrer'>
            discord
          </a>
          .
        </>
      ),
    },

    NOT_PDF: {
      MessageHTML: () => <>Your file is not a pdf.</>,
    },
    EMAIL_NOT_SENT: {
      MessageHTML: () => (
        <>
          We are very sorry but it seems we are having difficulties with our email server, please try again or ask for
          support on our{' '}
          <a target={'_blank'} className='underline' href='https://discord.gg/puQVqEvVXn' rel='noreferrer'>
            discord
          </a>
          .
        </>
      ),
    },
    EMAIL_LIMIT_REACHED: {
      MessageHTML: () => (
        <>
          You have reached the limit of 4 emails per day, please try again tomorrow or ask for support on our{' '}
          <a target={'_blank'} className='underline' href='https://discord.gg/puQVqEvVXn' rel='noreferrer'>
            discord
          </a>
          .
        </>
      ),
    },
    LOADING: {
      MessageHTML: () => <>Scanning and sending your tax form to your client.</>,
    },
  };

  const MessageHTML = w8formResponseOptions[w8formResponse]?.MessageHTML || (() => <></>);
  return (
    <section className='flex flex-col gap-3'>
      <h4 className='text-2xl flex content-center items-center gap-2 border-b border-gray-700 pb-2'>
        Form W8/W9*
        <div
          className={`${
            w8Approved ? 'border-green bg-green-inside' : 'bg-info border-2 border-info-strong'
          } text-sm px-2 border rounded-full h-6`}
        >
          {w8Approved ? 'Approved' : 'Required'}
        </div>
      </h4>
      {w8Approved ? (
        <div className='border-green bg-green-inside border p-4 rounded-sm'> Your w8 was accepted</div>
      ) : (
        <>
          <div>
            <p>
              Please complete and upload a W-8/W-9 form. Choose one of five types, depending on your entity. We
              encourage you to consult with you own tax or financial adviser to determine which form is appropriate for
              you or ask in our
              <div>
                <Link
                  href={'https://discord.gg/puQVqEvVXn'}
                  rel='noopener norefferer'
                  target='_blank'
                  className='text-link-colour hover:underline col-span-2'
                >
                  discord
                </Link>{' '}
                for help.
              </div>
            </p>
            <p>
              Please make sure your email is filled in your{' '}
              <Link
                className='text-link-colour hover:underline col-span-2'
                href={profileLink}
                target='_blank'
                rel='noopener norefferer'
              >
                profile
              </Link>{' '}
              so that we can send you a copy of the your submitted form.
            </p>
          </div>
          <div className='font-semibold flex gap-2 group w-fit'>
            Upload{' '}
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              width='24'
              height='24'
              className='fill-primary cursor-pointer'
              onClick={() => setShowModal(true)}
            >
              <path d='M13 7.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-3 3.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v4.25h.75a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1 0-1.5h.75V12h-.75a.75.75 0 0 1-.75-.75Z'></path>
              <path d='M12 1c6.075 0 11 4.925 11 11s-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1ZM2.5 12a9.5 9.5 0 0 0 9.5 9.5 9.5 9.5 0 0 0 9.5-9.5A9.5 9.5 0 0 0 12 2.5 9.5 9.5 0 0 0 2.5 12Z'></path>
            </svg>
          </div>
          <form onSubmit={handleSend} className='flex gap-2  flex-wrap md:flex-nowrap'>
            <label
              htmlFor='file input'
              className={`relative ${sent ? 'cursor-not-allowed' : 'cursor-pointer'} ${
                file || sent ? 'btn-verified' : 'btn-requirements'
              }`}
            >
              <div className='flex w-56  lg:w-28 gap-2 z-20 py-0.5 items-center justify-center text-center'>
                {file || sent ? (
                  sent ? (
                    'Pending'
                  ) : (
                    <>
                      <CheckIcon size={16} />
                      Change File
                    </>
                  )
                ) : (
                  <>
                    <UploadIcon size={16} />
                    Choose File
                  </>
                )}
              </div>
              <input
                onChange={handleFileChange}
                disabled={loading}
                type='file'
                className='absolute invisible w-full top-0 bottom-0 z-10'
                id='file input'
              />
            </label>

            {sent && (
              <label
                htmlFor='file input'
                className={`relative cursor-pointer ${file ? 'btn-verified' : 'btn-requirements'}`}
              >
                <div className='flex w-56 gap-2 z-20 py-0.5 items-center'>
                  {file ? (
                    <>
                      <CheckIcon size={16} /> Change File
                    </>
                  ) : (
                    <>
                      <UploadIcon size={16} />
                      Upload Updated W8/W9
                    </>
                  )}
                </div>
                <input
                  onChange={handleFileChange}
                  disabled={loading}
                  type='file'
                  className='absolute invisible w-full top-0 bottom-0 z-10'
                  id='file input'
                />
              </label>
            )}
            <div className='border border-web-gray w-full flex items-center font-semibold h-8 px-2 rounded-sm'>
              {file?.name}
            </div>
            <button
              disabled={!file}
              className={
                file ? 'btn-requirements cursor-pointer flex gap-2' : 'btn-default cursor-not-allowed flex gap-2'
              }
            >
              {sent ? (loading ? 'Sending' : 'Sent') : 'Send'}
              {loading && <LoadingIcon />}
            </button>
          </form>
          <div className=''>
            *W-8 forms are{' '}
            <Link
              href={'https://www.irs.gov/'}
              rel='noopener norefferer'
              target='_blank'
              className='text-link-colour hover:underline col-span-2'
            >
              Internal Revenue Service
            </Link>{' '}
            (IRS) forms that foreign individuals and businesses must file to verify their country of residence for tax
            purposes, certifying that they qualify for a lower rate of tax withholding.
          </div>
        </>
      )}
      {w8formResponse && (
        <div className='bg-info border-info-strong border p-4 rounded-sm'>
          <MessageHTML />
        </div>
      )}
      {showModal && <W8FormModal setShowModal={setShowModal} />}
    </section>
  );
};

export default W8Requirement;
