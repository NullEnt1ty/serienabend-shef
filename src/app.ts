import { CronJob } from 'cron';
import { InlineKeyboard } from 'grammy';
import { createTelegramBot } from './telegram-bot';
import { getNextChef } from './chef';
import { getSetting } from './setting';
import { Settings } from './types';
import { loadConfig } from './config';

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
  const askWhoCookedJob = new CronJob({
    cronTime: '0 21 * * 1',
    start: true,
    onTick: async () => {
      const linkedChatId = await getSetting(Settings.LinkedChatId);
      if (linkedChatId == null) {
        return;
      }

      const nextChef = await getNextChef();
      if (nextChef === undefined) {
        return;
      }

      const inlineKeyboard = new InlineKeyboard()
        .text('Ja', 'chef_has_cooked')
        .text('Nein', 'chef_has_not_cooked');

      telegramBot.api.sendMessage(
        linkedChatId,
        `Hat _${nextChef.name}_ gekocht\\?`,
        {
          parse_mode: 'MarkdownV2',
          reply_markup: inlineKeyboard,
        }
      );
    },
  });

  const chefReminderJob = new CronJob({
    cronTime: '0 8 * * 5',
    start: true,
    onTick: async () => {
      const linkedChatId = await getSetting(Settings.LinkedChatId);
      if (linkedChatId == null) {
        return;
      }

      const nextChef = await getNextChef();
      if (nextChef === undefined) {
        return;
      }

      telegramBot.api.sendMessage(
        linkedChatId,
        `Erinnerung 🔔: Am Montag ist _${nextChef.name}_ mit Kochen dran\\. Der Koch kann mit _/set\\_next\\_chef \\<Name des Kochs\\>_ geändert werden\\.`,
        { parse_mode: 'MarkdownV2' }
      );
    },
  });

  function stop() {
    console.log('Stopping ...');

    try {
      telegramBot.stop();
      askWhoCookedJob.stop();
      chefReminderJob.stop();
    } finally {
      process.exit(0);
    }
  }

  process.on('SIGINT', () => stop());
  process.on('SIGTERM', () => stop());

  console.log('Ready!');
}

main();
