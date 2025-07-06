import { createTelegramBot } from "./telegram-bot";
import { getConfig } from "./config";
import { initializeJobs, stopAllJobs } from "./scheduler";

async function main() {
	const config = getConfig();

	console.log("Starting Telegram bot ...");
	const telegramBot = await createTelegramBot(config.botToken);
	telegramBot.start();

	console.log("Scheduling jobs ...");
	initializeJobs(telegramBot);

	function stop() {
		console.log("Stopping ...");

		try {
			telegramBot.stop();
			stopAllJobs();
		} finally {
			process.exit(0);
		}
	}

	process.on("SIGINT", () => stop());
	process.on("SIGTERM", () => stop());

	console.log("Ready!");
}

main();
