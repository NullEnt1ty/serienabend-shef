import OpenAI from "openai";
import { getConfig } from "./config";

let openAiClient: OpenAI | undefined;

export function getOpenAiClient() {
	if (openAiClient == null) {
		const config = getConfig();
		const apiKey = config.openAi.apiKey;

		if (apiKey == null) {
			console.error(
				"Cannot create OpenAI client: Missing OpenAI API key in config",
			);
			process.exit(1);
		}

		openAiClient = new OpenAI({ apiKey: apiKey });
	}

	return openAiClient;
}
