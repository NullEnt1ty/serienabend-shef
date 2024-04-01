import { Bot, InlineKeyboard } from 'grammy';
import { CronJob } from 'cron';
import { type ChefContext } from './telegram-bot';
import { getSetting } from './setting';
import { getNextChef } from './chef';
import { Settings } from './schemas';

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
        `Hat *${nextChef.name}* gekocht\\?`,
        {
          parse_mode: 'MarkdownV2',
          reply_markup: inlineKeyboard,
        },
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
        `Erinnerung 🔔: Am Montag ist *${nextChef.name}* mit Kochen dran\\. ` +
          'Der Koch kann mit /set\\_next\\_chef \\<Name des Kochs\\> geändert werden\\. ' +
          'Verwende /generate\\_recipe, um ein Rezept zu generieren\\.',
        { parse_mode: 'MarkdownV2' },
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
