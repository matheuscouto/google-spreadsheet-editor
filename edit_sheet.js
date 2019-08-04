
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

const sheets = google.sheets({ version: 'v4', auth });

const sheetGetRequest = {
  spreadsheetId: 'ADD_SPREADSHEET_ID_HERE',  
  ranges: [],
  includeGridData: false,
  auth,
};

(async function () {
  
  // get sheet
  const editSheet = await sheets.spreadsheets.get(sheetGetRequest);

  // data do insert
  const sheetData = [['lorem', 'ipsum']];

  // edit sheet
  sheets.spreadsheets.values.append({
    spreadsheetId: editSheet.data.spreadsheetId,
    valueInputOption: 'USER_ENTERED',
    range: 'A1',
    resource: {
      range: 'A1',
      majorDimension: 'ROWS',
      values: sheetData,
    },
  });

})()