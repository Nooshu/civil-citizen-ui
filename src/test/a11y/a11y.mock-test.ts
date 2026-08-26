import * as fs from 'fs';
import {fail} from 'assert';
import supertest from 'supertest';
import {translateUrlToFilePath} from '../utils/mocks/a11y/urlToFileName';
import {getScannedA11yUrls, resolveA11yMockUrl} from './a11y-scan';
import {A11Y_MOCK_PA11Y_OPTIONS} from './pa11y-options';
import {retry} from '../functionalTests/specClaimHelpers/api/retryHelper.js';

const urlsList = getChunkAtIndex(
  getScannedA11yUrls(),
  parseInt(process.env.A11Y_CHUNKS ?? '1'),
  parseInt(process.env.A11Y_CHUNKS_INDEX ?? '0'),
);
const pa11y = require('pa11y');

const os = require('os');

const networkInterfaces = os.networkInterfaces();

console.log(networkInterfaces);

const express = require('express');
const port = 3000 + parseInt(process.env.A11Y_CHUNKS_INDEX ?? '0');
const app = express();

class PallyIssue {
  code: string;
  context: string;
  message: string;
  selector: string;
  type: string;
  typeCode: number;
}

const server = app.listen(port, () => {
  console.log(`Pa11y test server listening at http://localhost:${port}`);
});
const agent = supertest.agent(app);

declare function after(fn: () => void): void;

function expectNoErrors(messages: PallyIssue[]): void {
  const errors = messages.filter(m => m.type === 'error');
  if (errors.length > 0) {
    const errorsAsJson = `${JSON.stringify(errors, null, 2)}`;
    fail(`There are accessibility issues: \n${errorsAsJson}\n`);
  }
}

describe('Accessibility', () => {

  const options = A11Y_MOCK_PA11Y_OPTIONS;

  after(() => {
    server.close();
  });

  for (let url of urlsList) {
    it('Test of '+url,async () => {
      app.get(url, (req: any, res: any) => {
        url = resolveA11yMockUrl(url);
        const filePath = translateUrlToFilePath(url);
        console.log('File path: ' + filePath);
        const fileContent = fs.readFileSync(filePath,  'utf8');
        res.send(fileContent);
      });

      await retry(async () => {
        const messages = await pa11y(agent.get(url).url, options);
        messages.documentTitle == 'Error' ? fail('This page was titled "error", which suggests it did not render correctly.') : null;
        expectNoErrors(messages.issues);
      });
    });
  }
});

function getChunkAtIndex(array: string[], numChunks: number, index: number) {
  console.log('numChunks ' + numChunks);
  console.log('index ' + index);

  if (!Array.isArray(array) || numChunks <= 0 || index < 0 || index >= numChunks) {
    throw new Error('Invalid input: Provide a valid array, a positive number of chunks, and a valid index.');
  }

  const chunkSize = Math.floor(array.length / numChunks);
  const remainder = array.length % numChunks;

  const start = index * chunkSize + Math.min(index, remainder);

  const end = start + chunkSize + (index < remainder ? 1 : 0);

  return array.slice(start, end);
}
