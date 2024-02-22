const express = require("express");
const bodyParser = require("body-parser");
const docusign = require("docusign-esign");
const fs = require("fs").promises;
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.json());

const integratorKey = "7418c344-1e69-48ec-b6c4-ee730f13ae9b";
const accountId = "24869751";

const apiClient = new docusign.ApiClient();
apiClient.setBasePath("https://demo.docusign.net/restapi");

function setupApiClient() {
  return new Promise(async (resolve, reject) => {
    try {
      const privateKeys = path.join(
        __dirname,
        "docusignConfig",
        "22643e5c-8428-4c56-bf5e-d373fd718c42"
      );

      console.log("Filepath:", privateKeys);
    //   console.log("private", privateKeyContent);
      const privateKeyContent = await fs.readFile(privateKeys, "utf8");

      const jwtToken = jwt.sign(
        {
          iss: integratorKey,
          sub: accountId,
          iat: Math.floor(Date.now() / 1000) - 1,
          exp: Math.floor(Date.now() / 1000) + 3600,
          aud: "account-d.docusign.com",
        },
        privateKeyContent,
        { algorithm: "RS256" }
      );
      console.log("jwt", jwtToken);

      apiClient.addDefaultHeader("Authorization", `Bearer ${jwtToken}`);
      resolve();
    } catch (error) {
      console.error("Error setting up API client:", error);
      reject(error);
    }
  });
}

app.use(async (req, res, next) => {
  try {
    await setupApiClient();
    next();
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const envelopesApi = new docusign.EnvelopesApi(apiClient);

app.post("/create-envelope", async (req, res) => {
  try {
    const { name, email, address, documentBase64 } = req.body;

    const envelopeDefinition = new docusign.EnvelopeDefinition();
    envelopeDefinition.emailSubject = "Please sign this document";

    const document = new docusign.Document();
    document.documentBase64 = documentBase64;
    document.name = path.join(__dirname,"docusignConfig.js","Loan doc.pdf");
    document.fileExtension = "pdf";
    document.documentId = "1";

    envelopeDefinition.documents = [document];

    const recipient = new docusign.Recipient();
    recipient.email = email;
    recipient.name = name;
    recipient.recipientId = "1";

    const tabs = new docusign.Tabs();
    tabs.textTabs = [
      {
        tabLabel: "Name",
        value: name,
      },
      {
        tabLabel: "Email",
        value: email,
      },
      {
        tabLabel: "Address",
        value: address,
      },
    ];

    recipient.tabs = tabs;

    envelopeDefinition.recipients = new docusign.Recipients();
    envelopeDefinition.recipients.signers = [recipient];
    envelopeDefinition.status = "sent";

    const results = await envelopesApi.createEnvelope(accountId, {
      envelopeDefinition,
    });

    res.json(results);
  } catch (error) {
    console.error("Error creating envelope:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
