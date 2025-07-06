import { getOpenAiClient } from "./openai";

function generateRecipeSystemMessage(numberOfServings: number) {
	return (
		`You are a recipe assistant. Generate a vegetarian recipe for ${numberOfServings} servings. ` +
		"You MUST NOT include any of the following ingredients: meat, fish, nuts (excluding almonds), zucchini. " +
		"You may use veggie meat substitutes. " +
		"Use metric units for the ingredients. Cooking weights and measures that are " +
		'common in Germany such as "tablespoon" are allowed. ' +
		"Please answer in German. Don't include any messages besides the recipe. " +
		"If the user has questions or requests, you can answer them in the recipe. " +
		"Include a list of ingredients, the preparation steps, and any additional instructions."
	);
}

export async function generateRecipe(
	numberOfServings: number,
	additionalInstructions?: string,
) {
	const openAiClient = getOpenAiClient();
	const hasAdditionalInstructions =
		additionalInstructions != null && additionalInstructions.trim().length > 0;

	const chatCompletion = await openAiClient.chat.completions.create({
		model: "o4-mini",
		messages: [
			{
				role: "system",
				content: generateRecipeSystemMessage(numberOfServings),
			},
			{
				role: "user",
				content: hasAdditionalInstructions ? additionalInstructions : "",
			},
		],
	});

	const result = chatCompletion.choices[0];
	if (result == null) {
		// `result.message.content` can be `null` so let's return `null` in this case too
		return null;
	}

	return result.message.content;
}
