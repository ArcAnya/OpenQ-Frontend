import React, { useState, useContext } from 'react';
import Papa from 'papaparse';
import { ethers } from 'ethers';
import StoreContext from '../store/Store/StoreContext';
import mintBountyTemplate from '../constants/mintBountyTemplate.json';
import mintBountyTransactionTemplate from '../constants/mintBountyTransactionTemplate.json';

function CsvUploader() {
  const [csvData, setCsvData] = useState([]);
  const [mintBountyBatchData, setMintBountyBatchData] = useState(null);

  const [appState] = useContext(StoreContext);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(mintBountyBatchData));
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(mintBountyBatchData)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = 'data.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  let abiCoder = new ethers.utils.AbiCoder();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvData = Papa.parse(event.target.result).data;
      setCsvData(csvData);

      // Convert CSV data to JSON
      const headers = csvData[0];
      const rows = csvData.slice(1);
      const jsonRows = rows.map((row) => {
        const jsonObject = {};
        row.forEach((cell, index) => {
          if (headers[index] === 'payoutSchedule') {
            // Remove spaces from the payoutSchedule array
            const payouts = cell
              .split(',')
              .map((payout) => payout.trim())
              .join();
            jsonObject[headers[index]] = payouts;
          } else {
            jsonObject[headers[index]] = cell;
          }
        });
        return jsonObject;
      });

      const jsonData = JSON.stringify(jsonRows, null, 2);

      const transactions = [];

      const jsonDataParsed = JSON.parse(jsonData);

      for (const element of jsonDataParsed) {
        const issueUrl = element.githubIssueUrl;
        const githubSponsorUrl = element.githubSponsorUrl;

        const resource = await appState.githubRepository.fetchIssueByUrl(issueUrl);
        const githubSponsorResource = await appState.githubRepository.getOrgByUrl(githubSponsorUrl);

        const bountyId = resource.id;
        const organizationId = resource.repository.owner.id;

        const sponsorOrganizationName = githubSponsorResource.login;
        const sponsorOrganizationLogo = githubSponsorResource.avatarUrl;

        const payoutSchedule = JSON.parse(element.payoutSchedule);
        const payoutTokenAddress = element.payoutTokenAddress;

        const invoiceRequired = element.invoiceRequired;
        const kycRequired = element.kycRequired;
        const supportingDocumentsRequired = element.supportingDocumentsRequired;

        const mintBountyTransactionTemplateCopy = mintBountyTransactionTemplate;

        mintBountyTransactionTemplateCopy.contractInputsValues._bountyId = bountyId;
        mintBountyTransactionTemplateCopy.contractInputsValues._organization = organizationId;

        const initializationSchema = ['uint256[]', 'address', 'bool', 'bool', 'bool', 'string', 'string', 'string'];
        const initializationData = [
          payoutSchedule,
          payoutTokenAddress,
          invoiceRequired,
          kycRequired,
          supportingDocumentsRequired,
          '63da6f261d7d7b7cad0bc19d',
          sponsorOrganizationName,
          sponsorOrganizationLogo,
        ];

        const tieredFixedEncoded = abiCoder.encode(initializationSchema, initializationData);
        let tieredFixed = [3, tieredFixedEncoded];

        mintBountyTransactionTemplateCopy.contractInputsValues._initOperation = `[${tieredFixed}]`;

        transactions.push(mintBountyTransactionTemplateCopy);

        console.log(mintBountyTransactionTemplateCopy);
      }

      mintBountyTemplate.transactions = transactions;

      setMintBountyBatchData(mintBountyTemplate);
    };

    reader.readAsText(file);
  };

  return (
    <div>
      <input type='file' onChange={handleFileUpload} />
      {csvData.length > 0 && (
        <div>
          <h2>CSV Data</h2>
          <table>
            <thead>
              <tr>
                {csvData[0].map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.slice(1).map((row, index) => (
                <tr key={index}>
                  {row.map((cell, index) => (
                    <td key={index}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {mintBountyBatchData && (
        <div>
          <h2>JSON Data</h2>
          <pre>{JSON.stringify(mintBountyBatchData)}</pre>
          <button onClick={handleCopyToClipboard}>Copy to Clipboard</button>
          <button onClick={handleDownload}>Download JSON</button>
        </div>
      )}
    </div>
  );
}

export default CsvUploader;
