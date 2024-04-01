import {
  type Conversation,
  conversations,
  type ConversationFlavor,
  createConversation,
} from '@grammyjs/conversations';
import {
  Bot,
  type Context,
  session,
  Keyboard,
  GrammyError,
  HttpError,
} from 'grammy';
import {
  addChef,
  awardChefForCooking,
  getAllChefs,
  getAllChefsSortedByPointsAndLastCookedDate,
  getChefByName,
  getNextChef,
  resetEnforcedNextChef,
  setNextChef,
} from './chef';
import { getSetting, setSetting } from './setting';
import { Settings } from './schemas';

export type ChefContext = Context & ConversationFlavor;
type ChefConversation = Conversation<ChefContext>;

const nobody = 'Niemand';

export async function createTelegramBot(botToken: string) {
  const bot = new Bot<ChefContext>(botToken);

  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
      console.error('Error in request:', e.description);
    } else if (e instanceof HttpError) {
      console.error('Could not contact Telegram:', e);
    } else {
      console.error('Unknown error:', e);
    }

    const errorMessage =
      e instanceof Error ? e.message : 'Unbekannter Fehler (siehe Konsole)';
    ctx.reply(`Upsi, es ist ein Fehler aufgetreten:\n\n${errorMessage}`);
  });

  bot.use(
    session({
      initial: () => {
        return {};
      },
    }),
  );

  bot.use(conversations());
  bot.use(createConversation(whoCookedConversation));
  bot.use(createConversation(addChefConversation));
  bot.use(createConversation(setNextChefConversation));

  bot.command('link_chat', async (ctx) => {
    const botIsAlreadyLinked =
      (await getSetting(Settings.LinkedChatId)) != null;

    if (botIsAlreadyLinked) {
      return;
    }

    const chatId = ctx.msg.chat.id;
    await setSetting(Settings.LinkedChatId, chatId.toString());

    return ctx.reply('Der Bot wurde erfolgreich mit diesem Chat verlinkt!');
  });

  bot.use(async (ctx, next) => {
    const chatId = ctx.chat?.id;
    if (chatId === undefined) {
      return;
    }

    const linkedChatId = await getSetting(Settings.LinkedChatId);
    if (linkedChatId !== chatId.toString()) {
      return;
    }

    await next();
  });

  bot.command('list_chefs', async (ctx) => {
    const allChefs = await getAllChefsSortedByPointsAndLastCookedDate();
    const nextChef = await getNextChef();

    if (allChefs.length === 0) {
      ctx.reply(
        'Es gibt noch keine Köche. Füge einen Koch mit /add_chef hinzu.',
      );
      return;
    }

    const chefLines = allChefs
      .map((chef) => {
        const pointsWord = chef.points === 1 ? 'Punkt' : 'Punkte';
        const isNextChef = nextChef !== undefined && chef.id === nextChef.id;
        const nextChefIndicator = isNextChef ? ' (nächster Koch)' : '';
        return `${chef.name}: ${chef.points} ${pointsWord}${nextChefIndicator}`;
      })
      .join('\n');
    ctx.reply(`Köche:\n\n${chefLines}`);
  });

  bot.command('add_chef', async (ctx) => {
    await ctx.conversation.enter('addChefConversation');
  });

  bot.command('get_next_chef', async (ctx) => {
    const nextChef = await getNextChef();

    if (nextChef === undefined) {
      ctx.reply(
        'Der nächste Koch steht noch nicht fest. Eventuell müssen erst noch Köche mit /add_chef hinzugefügt werden.',
      );
      return;
    }

    return ctx.reply(`Der nächste Koch ist _${nextChef.name}_\\.`, {
      parse_mode: 'MarkdownV2',
    });
  });

  bot.command('set_next_chef', async (ctx) => {
    await ctx.conversation.enter('setNextChefConversation');
  });

  bot.command('debug', async (ctx) => {
    const args = getArgumentsFromText(ctx.msg.text);
    const subCommand = args[1];

    if (subCommand === undefined) {
      return;
    }

    if (subCommand === 'conversation') {
      const conversation = args[2];

      if (conversation !== undefined) {
        await ctx.conversation.enter(conversation);
      }
    }
  });

  bot.callbackQuery('chef_has_cooked', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageReplyMarkup(undefined);

    const nextChef = await getNextChef();
    if (nextChef === undefined) {
      return;
    }

    await awardChefForCooking(nextChef.name);
    await resetEnforcedNextChef();

    return ctx.reply(
      `Alles klar, _${nextChef.name}_ hat einen Punkt verdient\\!`,
      { parse_mode: 'MarkdownV2' },
    );
  });

  bot.callbackQuery('chef_has_not_cooked', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageReplyMarkup(undefined);
    await ctx.conversation.enter('whoCookedConversation');
  });

  bot.hears(/guter|good bot/i, async (ctx) => {
    return ctx.replyWithSticker(
      'CAACAgUAAxkBAAEbeeZjrXI9SxNw2A9cBLeUeX7xpMWlGgACaQYAAnSN4FavS-cAAWo9ekssBA',
    );
  });

  bot.hears(/schlechter|böser|bad bot/i, async (ctx) => {
    return ctx.replyWithSticker(
      'CAACAgUAAxkBAAEbeeJjrXHgNmoPTYpYjjP5Wqx3QEnfZAACtgYAAkno6VeKA2M-fcIveSwE',
    );
  });

  return bot;
}

async function whoCookedConversation(
  conversation: ChefConversation,
  ctx: ChefContext,
) {
  const allChefs = await conversation.external(() => getAllChefs());
  const chefNames = allChefs.map((chef) => chef.name);
  const chefListKeyboardButtons = chefNames.map((chefId) => [chefId]);
  chefListKeyboardButtons.unshift([nobody]);
  const chefListKeyboard = new Keyboard(chefListKeyboardButtons).oneTime();
  await ctx.reply('Wer hat gekocht?', { reply_markup: chefListKeyboard });

  const { message } = await conversation.waitFor('message:text');

  if (message.text === nobody) {
    return ctx.reply('Gut, dann kriegt halt niemand einen Punkt! 🤷‍♀️', {
      reply_markup: { remove_keyboard: true },
    });
  }

  const chefName = message.text;
  const chef = await getChefByName(chefName);

  if (chef == null) {
    ctx.reply(`Es wurde kein Koch mit dem Namen _${chefName}_ gefunden\\.`, {
      parse_mode: 'MarkdownV2',
      reply_markup: { remove_keyboard: true },
    });
    return;
  }

  await conversation.external(async () => {
    await awardChefForCooking(chef.name);
    await resetEnforcedNextChef();
  });

  return ctx.reply(`Alles klar, _${chef.name}_ hat einen Punkt verdient\\!`, {
    parse_mode: 'MarkdownV2',
    reply_markup: { remove_keyboard: true },
  });
}

async function addChefConversation(
  conversation: ChefConversation,
  ctx: ChefContext,
) {
  await ctx.reply('Wie lautet der Name des neuen Koches?');

  const { message } = await conversation.waitFor('message:text');

  const chefName = message.text;
  if (chefName === nobody) {
    ctx.reply('Dieser Name kann nicht gewählt werden.');
    return;
  }

  const existingChefWithSameName = await conversation.external(() =>
    getChefByName(chefName),
  );
  if (existingChefWithSameName != null) {
    ctx.reply(`Es existiert bereits ein Koch mit dem Namen _${chefName}_\\.`, {
      parse_mode: 'MarkdownV2',
    });
    return;
  }

  await conversation.external(() => addChef(chefName));

  return ctx.reply(`Der Koch _${chefName}_ wurde hinzugefügt\\.`, {
    parse_mode: 'MarkdownV2',
  });
}

async function setNextChefConversation(
  conversation: ChefConversation,
  ctx: ChefContext,
) {
  const allChefs = await conversation.external(() => getAllChefs());
  const chefNames = allChefs.map((chef) => chef.name);
  const chefListKeyboardButtons = chefNames.map((chefId) => [chefId]);
  const chefListKeyboard = new Keyboard(chefListKeyboardButtons).oneTime();
  await ctx.reply('Wer soll der nächste Koch sein?', {
    reply_markup: chefListKeyboard,
  });

  const { message } = await conversation.waitFor('message:text');

  const chefName = message.text;
  const chef = await conversation.external(() => getChefByName(chefName));

  if (chef == null) {
    ctx.reply(`Es wurde kein Koch mit dem Namen _${chefName}_ gefunden\\.`, {
      parse_mode: 'MarkdownV2',
      reply_markup: { remove_keyboard: true },
    });
    return;
  }

  const newNextChef = await conversation.external(() => setNextChef(chef.name));

  return ctx.reply(
    `Der nächste Koch wurde zu _${newNextChef.name}_ geändert\\.`,
    {
      parse_mode: 'MarkdownV2',
      reply_markup: { remove_keyboard: true },
    },
  );
}

function getArgumentsFromText(text: string) {
  const regex = /[^\s"]+|"([^"]*)"/gi;
  const args: (string | undefined)[] = [];
  let match;

  while ((match = regex.exec(text)) != null) {
    // Index 1 in the array is the captured group if it exists
    // Index 0 is the matched text, which we use if no captured group exists
    args.push(match[1] ? match[1] : match[0]);
  }

  return args;
}
