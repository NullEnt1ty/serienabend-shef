import { Bot, InlineKeyboard } from 'grammy';
import { CronJob } from 'cron';
import { type ChefContext } from './telegram-bot';
import { getSetting } from './setting';
import { Settings } from './types';
import { getNextChef } from './chef';

const runningJobs: CronJob[] = [];

export function initializeJobs(telegramBot: Bot<ChefContext>) {
  const askWhoCookedJob = CronJob.from({
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
  runningJobs.push(askWhoCookedJob);

  const chefReminderJob = CronJob.from({
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
  runningJobs.push(chefReminderJob);
}

export function stopAllJobs() {
  for (const job of runningJobs) {
    job.stop();
  }
}
