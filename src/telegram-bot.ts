import {
	type Conversation,
	conversations,
	type ConversationFlavor,
	createConversation,
} from "@grammyjs/conversations";
import {
	type ParseModeFlavor,
	hydrateReply,
	bold,
	fmt,
} from "@grammyjs/parse-mode";
import {
	Bot,
	type Context,
	session,
	Keyboard,
	GrammyError,
	HttpError,
} from "grammy";
import {
	addChef,
	awardChefForCooking,
	disableChef,
	enableChef,
	getAllChefsSortedByPointsAndLastCookedDate,
	getAllDisabledChefs,
	getAllEnabledChefs,
	getChefByName,
	getNextChef,
	resetEnforcedNextChef,
	setNextChef,
} from "./chef";
import { getSetting, setSetting } from "./setting";
import { Settings } from "./schemas";
import { generateRecipe } from "./recipe";
import { getConfig } from "./config";

export type ChefContext = ConversationFlavor<Context> &
	ParseModeFlavor<Context>;
type ChefConversation = Conversation<ChefContext>;

const nobody = "Niemand";
const cancel = "Abbrechen";
const cancelLowerCase = cancel.toLowerCase();

export async function createTelegramBot(botToken: string) {
	const bot = new Bot<ChefContext>(botToken);

	bot.catch((err) => {
		const ctx = err.ctx;
		console.error(`Error while handling update ${ctx.update.update_id}:`);
		const e = err.error;
		if (e instanceof GrammyError) {
			console.error("Error in request:", e.description);
		} else if (e instanceof HttpError) {
			console.error("Could not contact Telegram:", e);
		} else {
			console.error("Unknown error:", e);
		}

		const errorMessage =
			e instanceof Error ? e.message : "Unbekannter Fehler (siehe Konsole)";
		ctx.reply(`Upsi, es ist ein Fehler aufgetreten:\n\n${errorMessage}`);
	});

	bot.use(hydrateReply);

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
	bot.use(createConversation(generateRecipeConversation));
	bot.use(createConversation(disableChefConversation));
	bot.use(createConversation(enableChefConversation));

	bot.command("link_chat", async (ctx) => {
		const botIsAlreadyLinked =
			(await getSetting(Settings.LinkedChatId)) != null;

		if (botIsAlreadyLinked) {
			return;
		}

		const chatId = ctx.msg.chat.id;
		await setSetting(Settings.LinkedChatId, chatId.toString());

		return ctx.reply("Der Bot wurde erfolgreich mit diesem Chat verlinkt!");
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

	bot.command("list_chefs", async (ctx) => {
		const allChefs = await getAllChefsSortedByPointsAndLastCookedDate();
		const nextChef = await getNextChef();

		if (allChefs.length === 0) {
			ctx.reply(
				"Es gibt noch keine Köche. Füge einen Koch mit /add_chef hinzu.",
			);
			return;
		}

		const chefLines = allChefs
			.map((chef) => {
				const pointsWord = chef.points === 1 ? "Punkt" : "Punkte";
				const isNextChef = nextChef !== undefined && chef.id === nextChef.id;
				const nextChefIndicator = isNextChef ? " (nächster Koch)" : "";
				const isDisabled = chef.isDisabled ? " (deaktiviert)" : "";
				return `${chef.name}: ${chef.points} ${pointsWord}${isDisabled}${nextChefIndicator}`;
			})
			.join("\n");
		ctx.reply(`Köche:\n\n${chefLines}`);
	});

	bot.command("add_chef", async (ctx) => {
		await ctx.conversation.enter("addChefConversation");
	});

	bot.command("disable_chef", async (ctx) => {
		await ctx.conversation.enter("disableChefConversation");
	});

	bot.command("enable_chef", async (ctx) => {
		await ctx.conversation.enter("enableChefConversation");
	});

	bot.command("get_next_chef", async (ctx) => {
		const nextChef = await getNextChef();

		if (nextChef === undefined) {
			ctx.reply(
				"Der nächste Koch steht noch nicht fest. Eventuell müssen erst noch Köche mit /add_chef hinzugefügt werden.",
			);
			return;
		}

		return ctx.replyFmt(
			fmt`Der nächste Koch ist ${bold(nextChef.name)}. Benutze /set_next_chef um den nächsten Koch zu ändern.`,
		);
	});

	bot.command("set_next_chef", async (ctx) => {
		await ctx.conversation.enter("setNextChefConversation");
	});

	bot.command("generate_recipe", async (ctx) => {
		const config = getConfig();
		if (!config.openAi.enabled) {
			await ctx.reply(
				"Leider kann ich gerade kein Rezept generieren, da der dazu nötige Dienst deaktiviert ist.",
			);
			return;
		}

		await ctx.conversation.enter("generateRecipeConversation");
	});

	bot.command("debug", async (ctx) => {
		const args = getArgumentsFromText(ctx.msg.text);
		const subCommand = args[1];

		if (subCommand === undefined) {
			return;
		}

		if (subCommand === "conversation") {
			const conversation = args[2];

			if (conversation !== undefined) {
				await ctx.conversation.enter(conversation);
			}
		}
	});

	bot.callbackQuery("chef_has_cooked", async (ctx) => {
		await ctx.answerCallbackQuery();
		await ctx.editMessageReplyMarkup(undefined);

		const nextChef = await getNextChef();
		if (nextChef === undefined) {
			return;
		}

		await awardChefForCooking(nextChef.name);
		await resetEnforcedNextChef();

		return ctx.replyFmt(
			fmt`Alles klar, ${bold(nextChef.name)} hat einen Punkt verdient!`,
		);
	});

	bot.callbackQuery("chef_has_not_cooked", async (ctx) => {
		await ctx.answerCallbackQuery();
		await ctx.editMessageReplyMarkup(undefined);
		await ctx.conversation.enter("whoCookedConversation");
	});

	bot.hears(/guter|good bot/i, async (ctx) => {
		return ctx.replyWithSticker(
			"CAACAgUAAxkBAAEbeeZjrXI9SxNw2A9cBLeUeX7xpMWlGgACaQYAAnSN4FavS-cAAWo9ekssBA",
		);
	});

	bot.hears(/schlechter|böser|bad bot/i, async (ctx) => {
		return ctx.replyWithSticker(
			"CAACAgUAAxkBAAEbeeJjrXHgNmoPTYpYjjP5Wqx3QEnfZAACtgYAAkno6VeKA2M-fcIveSwE",
		);
	});

	return bot;
}

async function whoCookedConversation(
	conversation: ChefConversation,
	ctx: ChefContext,
) {
	const enabledChefs = await conversation.external(() => getAllEnabledChefs());
	const chefNames = enabledChefs.map((chef) => chef.name);
	const chefListKeyboardButtons = chefNames.map((chefId) => [chefId]);
	chefListKeyboardButtons.unshift([nobody]);
	const chefListKeyboard = new Keyboard(chefListKeyboardButtons).oneTime();
	await ctx.reply("Wer hat gekocht?", { reply_markup: chefListKeyboard });

	const { message } = await conversation.waitFor("message:text");
	const chefName = message.text;

	if (chefName === nobody) {
		return ctx.reply("Gut, dann kriegt halt niemand einen Punkt! 🤷‍♀️", {
			reply_markup: { remove_keyboard: true },
		});
	}

	const chef = enabledChefs.find((chef) => chef.name === chefName);

	if (chef == null) {
		await sendChefNotFoundMessage(ctx, chefName);
		return;
	}

	await conversation.external(async () => {
		await awardChefForCooking(chef.name);
		await resetEnforcedNextChef();
	});

	return ctx.replyFmt(
		fmt`Alles klar, ${bold(chef.name)} hat einen Punkt verdient!`,
		{ reply_markup: { remove_keyboard: true } },
	);
}

async function addChefConversation(
	conversation: ChefConversation,
	ctx: ChefContext,
) {
	await ctx.reply("Wie lautet der Name des neuen Koches?", {
		reply_markup: { force_reply: true },
	});

	const { message } = await conversation.waitFor("message:text");
	const chefNameOrAction = message.text;

	if (chefNameOrAction.toLowerCase() === cancelLowerCase) {
		await sendCancelledMessage(ctx);
		return;
	}

	if (chefNameOrAction === nobody) {
		ctx.reply("Dieser Name kann nicht gewählt werden.");
		return;
	}

	const existingChefWithSameName = await conversation.external(() =>
		getChefByName(chefNameOrAction),
	);
	if (existingChefWithSameName != null) {
		ctx.replyFmt(
			fmt`Es existiert bereits ein Koch mit dem Namen ${bold(chefNameOrAction)}.`,
		);
		return;
	}

	await conversation.external(() => addChef(chefNameOrAction));

	return ctx.replyFmt(
		fmt`Der Koch ${bold(chefNameOrAction)} wurde hinzugefügt.`,
	);
}

async function disableChefConversation(
	conversation: ChefConversation,
	ctx: ChefContext,
) {
	const enabledChefs = await conversation.external(() => getAllEnabledChefs());
	if (enabledChefs.length === 0) {
		await ctx.reply("Es gibt keine aktiven Köche.");
		return;
	}

	const chefNames = enabledChefs.map((chef) => chef.name);
	const chefListKeyboardButtons = chefNames.map((chefId) => [chefId]);
	const chefListKeyboard = new Keyboard([
		...chefListKeyboardButtons,
		[cancel],
	]).oneTime();

	await ctx.reply(
		"Du kannst einen Koch deaktivieren, damit er nicht mehr als nächster Koch ausgewählt wird.\n\n" +
			"Welchen Koch möchtest du deaktivieren?",
		{ reply_markup: chefListKeyboard },
	);

	const { message } = await conversation.waitFor("message:text");
	const chefNameOrAction = message.text;

	if (chefNameOrAction === cancel) {
		await sendCancelledMessage(ctx);
		return;
	}

	const chef = enabledChefs.find((chef) => chef.name === chefNameOrAction);

	if (chef == null) {
		await sendChefNotFoundMessage(ctx, chefNameOrAction);
		return;
	}

	await conversation.external(() => {
		disableChef(chef.id);
	});

	return ctx.replyFmt(fmt`${bold(chef.name)} wurde deaktiviert.`, {
		reply_markup: { remove_keyboard: true },
	});
}

async function enableChefConversation(
	conversation: ChefConversation,
	ctx: ChefContext,
) {
	const disabledChefs = await conversation.external(() =>
		getAllDisabledChefs(),
	);
	if (disabledChefs.length === 0) {
		await ctx.reply("Es gibt keine deaktivierten Köche.");
		return;
	}

	const chefNames = disabledChefs.map((chef) => chef.name);
	const keyboardButtons = chefNames.map((name) => [name]);
	const chefListKeyboard = new Keyboard([
		...keyboardButtons,
		[cancel],
	]).oneTime();

	await ctx.reply("Welchen Koch möchtest du aktivieren?", {
		reply_markup: chefListKeyboard,
	});

	const { message } = await conversation.waitFor("message:text");
	const chefNameOrAction = message.text;

	if (chefNameOrAction === cancel) {
		await sendCancelledMessage(ctx);
		return;
	}

	const chef = disabledChefs.find((chef) => chef.name === chefNameOrAction);

	if (chef == null) {
		await sendChefNotFoundMessage(ctx, chefNameOrAction);
		return;
	}

	await conversation.external(() => enableChef(chef.id));

	return ctx.replyFmt(fmt`${bold(chef.name)} wurde aktiviert.`, {
		reply_markup: { remove_keyboard: true },
	});
}

async function setNextChefConversation(
	conversation: ChefConversation,
	ctx: ChefContext,
) {
	const enabledChefs = await conversation.external(() => getAllEnabledChefs());

	if (enabledChefs.length === 0) {
		await ctx.reply(
			"Es gibt keine aktiven Köche. Füge einen Koch mit /add_chef hinzu oder aktiviere einen Koch mit /enable_chef.",
		);
		return;
	}

	const chefNames = enabledChefs.map((chef) => chef.name);
	const chefListKeyboardButtons = chefNames.map((chefId) => [chefId]);
	const chefListKeyboard = new Keyboard([
		...chefListKeyboardButtons,
		[cancel],
	]).oneTime();

	await ctx.reply("Wer soll der nächste Koch sein?", {
		reply_markup: chefListKeyboard,
	});

	const { message } = await conversation.waitFor("message:text");
	const chefNameOrAction = message.text;

	if (chefNameOrAction === cancel) {
		await sendCancelledMessage(ctx);
		return;
	}

	const chef = enabledChefs.find((chef) => chef.name === chefNameOrAction);

	if (chef == null) {
		await sendChefNotFoundMessage(ctx, chefNameOrAction);
		return;
	}

	const newNextChef = await conversation.external(() => setNextChef(chef.name));

	return ctx.replyFmt(
		fmt`Der nächste Koch wurde zu ${bold(newNextChef.name)} geändert.`,
		{ reply_markup: { remove_keyboard: true } },
	);
}

async function generateRecipeConversation(
	conversation: ChefConversation,
	ctx: ChefContext,
) {
	await ctx.reply("Für wie viele Personen soll das Rezept sein?", {
		reply_markup: { force_reply: true },
	});

	const { message: numberOfServingsMessage } =
		await conversation.waitFor("message:text");

	if (numberOfServingsMessage.text.toLowerCase() === cancelLowerCase) {
		await sendCancelledMessage(ctx);
		return;
	}

	const numberOfServings = Number.parseInt(numberOfServingsMessage.text, 10);

	if (Number.isNaN(numberOfServings)) {
		return ctx.reply("Bitte gib eine ganze Zahl an.");
	}

	if (numberOfServings <= 0) {
		return ctx.reply("Die Anzahl der Personen muss größer als 0 sein.");
	}

	if (numberOfServings > 20) {
		return ctx.reply("Die Anzahl der Personen darf maximal 20 betragen.");
	}

	const yesNoKeyboard = new Keyboard([["Ja"], ["Nein"], [cancel]]).oneTime();
	await ctx.reply(
		`Alles klar, ein Rezept für ${numberOfServings} Personen. Hast du noch spezielle Wünsche?`,
		{ reply_markup: yesNoKeyboard },
	);

	const { message: additionalInstructionsDesiredMessage } =
		await conversation.waitFor("message:text");

	if (additionalInstructionsDesiredMessage.text === cancel) {
		await sendCancelledMessage(ctx);
		return;
	}

	let additionalInstructions: string | undefined;
	if (additionalInstructionsDesiredMessage.text === "Ja") {
		await ctx.reply("Was möchtest du ergänzen?", {
			reply_markup: { remove_keyboard: true },
		});

		const { message: additionalInstructionsMessage } =
			await conversation.waitFor("message:text");
		additionalInstructions = additionalInstructionsMessage.text;
	}

	await ctx.reply("Ich generiere nun ein Rezept…", {
		reply_markup: { remove_keyboard: true },
	});

	// TODO: Abort after a certain time
	const recipe = await conversation.external(() =>
		generateRecipe(numberOfServings, additionalInstructions),
	);

	await ctx.reply(recipe ?? "Upsi, es konnte kein Rezept generiert werden.");
}

function sendCancelledMessage(ctx: ChefContext) {
	return ctx.reply("Abgebrochen.", { reply_markup: { remove_keyboard: true } });
}

function sendChefNotFoundMessage(ctx: ChefContext, chefName: string) {
	return ctx.replyFmt(
		fmt`Es wurde kein Koch mit dem Namen ${bold(chefName)} gefunden.`,
		{ reply_markup: { remove_keyboard: true } },
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
