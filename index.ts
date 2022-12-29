import createLogger from './logger';
import createDb from './db';
import createConfig from './create-config';
import createEmail from './email';
import createDiscordApi from './discord-api';
import createServer from './server';

const logger = createLogger();

Promise.all([
  createEmail(),
  createConfig(),
])
  .then(([email, config]) => createServer({
    logger,
    email,
    config,
    db: createDb(),
    discordApi: createDiscordApi(),
  }))
  .then(() => {
    logger.info('HTTP API is running!');
  })
  .catch(ex => {
    logger.error('Could not initiallize server:', ex);
    process.exit(1);
  });
