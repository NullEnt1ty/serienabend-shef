import { createTelegramBot } from './telegram-bot';
import { loadConfig } from './config';
import { initializeJobs, stopAllJobs } from './scheduler';

async function main() {
  const configPath = process.env.CHEF_CONFIG;
  if (configPath === undefined) {
    console.error('Missing environment variable CHEF_CONFIG');
    process.exit(1);
  }
  const config = loadConfig(configPath);

  console.log('Starting Telegram bot ...');
  const telegramBot = await createTelegramBot(config.botToken);
  telegramBot.start();

  console.log('Scheduling jobs ...');
  initializeJobs(telegramBot);

  function stop() {
    console.log('Stopping ...');

    try {
      telegramBot.stop();
      stopAllJobs();
    } finally {
      process.exit(0);
    }
  }

  process.on('SIGINT', () => stop());
  process.on('SIGTERM', () => stop());

  console.log('Ready!');
}

main();
