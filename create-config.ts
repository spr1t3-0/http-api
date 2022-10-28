import path from 'node:path';
import fs from 'node:fs/promises';

interface ConfigJson {
  apps: {
    id: string;
    apiToken: string;
  }[];
}

export interface Config {
  findAppIdByApiToken(apiToken: string): string | null;
}

export default async function createConfig(): Promise<Config> {
  const config = await fs.readFile(path.resolve('config.json'), 'utf-8')
    .then((json): ConfigJson => JSON.parse(json));

  return {
    findAppIdByApiToken(apiToken: string) {
      return config.apps.find((app) => app.apiToken === apiToken)?.id || null;
    },
  };
}
