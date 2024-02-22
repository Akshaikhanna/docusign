const {
  Client,
  Template,
  Document,
  Signer,
  Recipient,
  SignatureField,
} = require("eversign");

const client = new Client("a486d18f4e069d8213de14bafd5f1ec4", "859930");

client.fetchBusinesses().then(function (businesses) {
  console.log(businesses[0].getBusinessId(), "hi");
  client.setSelectedBusiness(businesses[0]);
});

client.setSelectedBusinessById(859930);

const documentTemplate = new Template();
documentTemplate.setTemplateId("MY_TEMPLATE_ID");
documentTemplate.setTitle("Test");
documentTemplate.setMessage("Test Message");
console.log("Start");

const templateSigner = new Signer();
templateSigner.setRole("Testrole");
templateSigner.setName("Akshai");
templateSigner.setEmail("akshai.khanna@aaludra.com");
documentTemplate.appendSigner(templateSigner);
// console.log("Template",templateSigner);

client.createDocumentFromTemplate(documentTemplate).then(function (document) {
  const newlyCreatedDocument = document;
  console.log(newlyCreatedDocument, "new");
});

const document = new Document();
document.setTitle("Test");
document.setMessage("Hi Thank you");

// separate variable
const documentSigner = new Signer();
documentSigner.setName("akshai");
documentSigner.setEmail("akshaikhanna123@gmail.com");
document.appendSigner(documentSigner);
// console.log(documentSigner);

const recipient = new Recipient();
recipient.setRole("Testrole");
recipient.setName("akshai");
recipient.setEmail("akshaikhanna123@gmail.com");
document.appendRecipient(recipient);
// console.log(recipient,"Rec");

// const signatureField = new SignatureField();
// signatureField.setFileIndex(0);
// signatureField.setPage(1);
// signatureField.setX(30);
// signatureField.setY(150);
// signatureField.setRequired(true);
// signatureField.setSigner("1");
// document.appendFormField(signatureField);
// console.log(signatureField,"Error");

client.createDocument(document).then(function (savedDocument) {
  const newlyCreatedDocument = savedDocument;
});

client.getDocumentByHash("MY_HASH").then(function (document) {
  console.log(document.getTitle());
});

client.getAllDocuments().then(function (documents) {
  console.log(documents);
});

// const eversign = require("eversign");

// const apiKey ="a486d18f4e069d8213de14bafd5f1ec4"
//   // "https://api.eversign.com/document?access_key=a486d18f4e069d8213de14bafd5f1ec4";
// const businessId = "859930";

// const client = new eversign.Client(apiKey, businessId);

// //  new document
// async function createDocument() {
//   try {
//     // document details
//     const documentDetails = {
//       template_id: "YOUR_TEMPLATE_ID",
//       title: "Please Sign",
//       message: "Hello, please sign this document.",
//       signers: [
//         {
//           role: "Signer",
//           name: "Akshai khanna",
//           email: "akshai.khanna@aaludra.com",
//         },
//       ],
//     };

//     const response = await client.createDocument(documentDetails);

//     console.log(response);
//   } catch (error) {
//     console.error("Error creating document:", error.message);
//   }
// }

// createDocument();



// -------------------------------------------------------------------------------------------------------------------
// const express = require('express');
// const bodyParser = require('body-parser');
// const { ApiClient, Configuration, EnvelopesApi, Document, Recipient, Recipients, Tabs } = require('docusign-esign');
// const fs = require('fs');

// const app = express();
// const port = 3000;

// app.use(bodyParser.json());

// const integratorKey = 'e2f869e2-113f-4773-a789-6fc21896e7b2';
// const accountId = '24914258';
// const privateKey = '9dd90b91-9370-47ea-a98f-d44d70f6813f'; // Replace with the path to your private key file
// const clientUserId = '1';

// const apiClient = new ApiClient();
// const config = new Configuration();

// const filePath = '9dd90b91-9370-47ea-a98f-d44d70f6813f';

// if (fs.existsSync(filePath)) {
//   const fileContent = fs.readFileSync(filePath, 'utf8');
//   // Your code to process the file content
// } else {
//   console.error(`File not found: ${filePath}`);
// }

// const private = fs.readFileSync(privateKey);
// apiClient.setBasePath('https://demo.docusign.net/restapi');

// apiClient.requestJWTUserToken(integratorKey, accountId, 3600, {
//   scopes: 'signature',
//   clientUserId: clientUserId,
// })
//   .then((response) => {
//     apiClient.setAccessToken(response.body.access_token, 3600);
//   })
//   .catch((error) => {
//     console.error('Error obtaining JWT token:', error.response ? error.response.body : error.message);
//   });

// const envelopesApi = new EnvelopesApi(apiClient);

// // API endpoint for creating an envelope
// app.post('/create-envelope', async (req, res) => {
//   try {
//     const { name, email, address, documentBase64 } = req.body;

//     // Create an envelope with recipient and tabs
//     const envelopeDefinition = new EnvelopeDefinition();
//     envelopeDefinition.emailSubject = 'Please sign this document';

//     // Add a document to the envelope
//     const document = new Document();
//     document.documentBase64 = documentBase64;
//     document.name = '';
//     document.fileExtension = 'pdf';
//     document.documentId = '1';

//     envelopeDefinition.documents = [document];

//     // Add a recipient to the envelope
//     const recipient = new Recipient();
//     recipient.email = email;
//     recipient.name = name;
//     recipient.recipientId = '1';

//     // Add tabs (fields) to the recipient
//     const tabs = new Tabs();
//     tabs.textTabs = [
//       {
//         tabLabel: 'Name',
//         value: name,
//       },
//       {
//         tabLabel: 'Email',
//         value: email,
//       },
//       {
//         tabLabel: 'Address',
//         value: address,
//       },
//     ];

//     recipient.tabs = tabs;

//     envelopeDefinition.recipients = new Recipients();
//     envelopeDefinition.recipients.signers = [recipient];

//     // Set the status to "sent" to trigger sending the envelope
//     envelopeDefinition.status = 'sent';

//     // Create the envelope
//     const results = await envelopesApi.createEnvelope(accountId, { envelopeDefinition });
//     res.json(results);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });
