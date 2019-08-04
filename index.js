
const { google } = require('googleapis');
const fs = require('fs');

const credentials = require('./credentials.json');

const scopes = [
  'https://www.googleapis.com/auth/drive'
];

const auth = new google.auth.JWT(
  credentials.client_email, null,
  credentials.private_key, scopes
);

const drive = google.drive({ version: 'v3', auth });
const sheets = google.sheets({ version: 'v4', auth });

(async function () {

  let res = await drive.files.list({
    pageSize: 20,
    fields: 'files(name,fullFileExtension,webViewLink)',
    orderBy: 'createdTime desc'
  });

  // Create a new spreadsheet
  let newSheet = await sheets.spreadsheets.create({
    resource: {
      properties: {
        title: 'Another Day, Another Spreadsheet',
      }
    }
  });

  // Move the spreadsheet
  await drive.files.update({
    fileId: newSheet.data.spreadsheetId,
    // Add your own file ID:
    addParents: 'FOLDER_DESTINY_ID',
    fields: 'id, parents'
  });

  // Transfer ownership
  await drive.permissions.create({
    fileId: newSheet.data.spreadsheetId,
    transferOwnership: 'true',
    resource: {
      role: 'owner',
      type: 'user',
      // Add your own email address:
      emailAddress: 'your.account@gmail.com'
    }
  });

  // Add data as new rows
  let sheetData = [['File Name', 'URL']];

  res.data.files.map(entry => {
    const { name, webViewLink } = entry;
    sheetData.push([name, webViewLink]);
  });

  sheets.spreadsheets.values.append({
    spreadsheetId: newSheet.data.spreadsheetId,
    valueInputOption: 'USER_ENTERED',
    range: 'A1',
    resource: {
      range: 'A1',
      majorDimension: 'ROWS',
      values: sheetData,
    },
  });

  // Add styling to the first row
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: newSheet.data.spreadsheetId,
    resource: {
      requests: [
        {
          repeatCell: {
            range: {
              startRowIndex: 0,
              endRowIndex: 1
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: {
                  red: 0.2,
                  green: 0.2,
                  blue: 0.2
                },
                textFormat: {
                  foregroundColor: {
                    red: 1,
                    green: 1,
                    blue: 1
                  },
                  bold: true,
                }
              }
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)'
          }
        },
      ]
    }
  });

  // Back-up data locally
  let data = 'Name,URL\n';

  res.data.files.map(entry => {
    const { name, webViewLink } = entry;
    data += `${name},${webViewLink}\n`;
  });

  fs.writeFile('data.csv', data, (err) => {
    if (err) throw err;
  });

})()