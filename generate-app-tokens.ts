#!/usr/bin/env node

/* eslint no-console: 0 */

import { promisify } from 'node:util';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const randomBytes = promisify(crypto.randomBytes);

interface ConfigJson {
  apps: {
    id: string;
    apiToken: string;
  }[];
}

(async () => {
  console.info('Generating configuration...');
  const exampleConfig: ConfigJson = await fs.readFile(path.resolve('config.example.json'), 'utf-8')
    .then(exampleJson => JSON.parse(exampleJson))
    .catch(ex => {
      console.error('Error reading example JSON:', ex);
      process.exit(1);
    });

  const apiTokens = await Promise.all(exampleConfig.apps.map(() => randomBytes(48)));

  const config: ConfigJson = {
    ...exampleConfig,
    apps: exampleConfig.apps.map((app, i) => {
      const tokenBytes = apiTokens.at(i);
      if (!tokenBytes) throw new Error('Token index out of range');
      return {
        ...app,
        apiToken: tokenBytes.toString('hex'),
      };
    }),
  };

  console.info('Writing configuration...');
  const configPath = path.resolve('config.json');
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8').catch(ex => {
    console.error(`Unable to write to "${configPath}":`, ex);
    process.exit(1);
  });

  console.info('Configuration successfully generated!');
})();
