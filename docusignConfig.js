const path = require('path');

const privateKey = path.join(__dirname, 'docusignConfig', '22643e5c-8428-4c56-bf5e-d373fd718c42','./Loan doc.pdf');

module.exports = {
  privateKey,
};

// const path = require('path');

// const privateKeyPath = path.join(__dirname, 'docusignConfig', '22643e5c-8428-4c56-bf5e-d373fd718c42');
// const pdfFilePath = path.join(__dirname, 'docusignConfig', 'Loan doc.pdf');

// module.exports = {
//   privateKeyPath,
//   pdfFilePath,
// };
