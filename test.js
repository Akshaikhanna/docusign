const express = require('express');
const docusign = require('docusign-esign');
const fs = require('fs');

const app = express();
const port = 3000;

const integratorKey = 'YOUR_INTEGRATOR_KEY';
const clientSecret = 'YOUR_CLIENT_SECRET';
const redirectUri = 'http://localhost:3000/callback';
const basePath = 'https://demo.docusign.net/restapi';

const apiClient = new docusign.ApiClient({
  basePath: basePath,
  oAuthBasePath: 'account-d.docusign.com',
});

apiClient.setOAuthBasePath(apiClient.getOAuthBasePath().replace(/https:\/\/|http:\/\//, ''));
apiClient.addDefaultHeader('Authorization', 'Basic ' + Buffer.from(integratorKey + ':' + clientSecret).toString('base64'));

const authUri = apiClient.getAuthorizationUri(
  integratorKey,
  'signature',
  redirectUri,
  docusign.OAuth.Scope.IMPERSONATION
);

function openAuthorizationUrl() {
  console.log('Please authorize the application by opening the URL below in your browser:');
  console.log(authUri);
  // Open the authorization URL in the default browser or copy-paste it in a browser manually
}

async function performAuthFlow() {
  openAuthorizationUrl();

  const code = await new Promise((resolve) => {
    app.get('/callback', (req, res) => {
      const authorizationCode = req.query.code;
      res.send('Authorization successful. You can close this browser window.');
      resolve(authorizationCode);
    });
  });

  const tokenResponse = await apiClient.generateAccessToken(
    integratorKey,
    clientSecret,
    'authorization_code',
    code,
    redirectUri
  );
  return tokenResponse.refresh_token;
}

async function createAndSignEnvelope() {
  try {
    const refreshToken = await performAuthFlow();
    const dsApiClient = new docusign.ApiClient({
      basePath: basePath,
      oAuthBasePath: 'account-d.docusign.com',
    });
    dsApiClient.setOAuthBasePath(dsApiClient.getOAuthBasePath().replace(/https:\/\/|http:\/\//, ''));
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + refreshToken);
    const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    // Read the PDF document
    const docPdfBytes = fs.readFileSync('path/to/your/document.pdf');

    // Create the envelope definition
    const env = new docusign.EnvelopeDefinition();
    env.emailSubject = 'Please sign this document';

    // Add the document
    const doc1 = new docusign.Document();
    doc1.documentBase64 = Buffer.from(docPdfBytes).toString('base64');
    doc1.name = 'Document.pdf';
    doc1.fileExtension = 'pdf';
    doc1.documentId = '1';
    env.documents = [doc1];

    // Create a signer recipient
    const signer1 = docusign.Signer.constructFromObject({
      email: 'recipient@example.com', // Replace with the recipient's email
      name: 'Recipient Name', // Replace with the recipient's name
      clientUserId: '1001', // Replace with a unique identifier for the recipient
      recipientId: 1,
    });

    // Create signHere tab
    const signHere1 = docusign.SignHere.constructFromObject({
      anchorString: '/sign1/', // Replace with an anchor string in your document
      anchorYOffset: '10',
      anchorUnits: 'pixels',
      anchorXOffset: '20',
    });

    // Set tabs for the signer
    const signer1Tabs = docusign.Tabs.constructFromObject({
      signHereTabs: [signHere1],
    });
    signer1.tabs = signer1Tabs;

    // Add the signer to the envelope
    const recipients = docusign.Recipients.constructFromObject({
      signers: [signer1],
    });
    env.recipients = recipients;

    // Set envelope status to sent
    env.status = 'sent';

    // Call the Envelopes::create API to send the envelope
    const results = await envelopesApi.createEnvelope('accountId', { envelopeDefinition: env });

    console.log('Envelope created successfully. Envelope ID:', results.envelopeId);
  } catch (error) {
    console.error('Error creating envelope or recipient view:', error);
  }
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  createAndSignEnvelope();
});
