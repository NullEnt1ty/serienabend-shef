import { and, asc, eq, getTableColumns, inArray, max, min } from "drizzle-orm";
import { db } from "./database";
import { chef, type Chef, type NewChef, history, Settings } from "./schemas";
import { deleteSetting, getSetting, setSetting } from "./setting";

export async function getAllChefs() {
	return db.select().from(chef);
}

export async function getAllEnabledChefs() {
	return db.select().from(chef).where(eq(chef.isDisabled, false));
}

export async function getAllDisabledChefs() {
	return db.select().from(chef).where(eq(chef.isDisabled, true));
}

export async function getAllChefsSortedByPointsAndLastCookedDate() {
	return db
		.select(getTableColumns(chef))
		.from(chef)
		.leftJoin(history, eq(chef.id, history.chefId))
		.groupBy(chef.id)
		.orderBy(asc(chef.points), asc(max(history.date)));
}

export async function getChefByName(name: string) {
	return db.query.chef.findFirst({ where: eq(chef.name, name) });
}

export async function addChef(name: string) {
	if ((await getChefByName(name)) !== undefined) {
		throw new Error(`Chef with name '${name}' does already exist`);
	}

	// Give the new chef the lowest score of the current chefs so they don't lag behind.
	const lowestPoints = await getLowestPoints();

	const newChef: NewChef = { name: name, points: lowestPoints };

	await db.insert(chef).values(newChef);
	const addedChef = await getChefByName(name);

	if (addedChef === undefined) {
		throw new Error(`Adding chef with name '${name}' failed`);
	}

	return addedChef;
}

export async function setNextChef(name: string) {
	const _chef = await getChefByName(name);

	if (_chef === undefined) {
		throw new Error(`Could not find chef with name '${name}'`);
	}

	await setSetting(Settings.EnforcedNextChef, _chef.id.toString());

	return _chef;
}

export async function getNextChef() {
	const enforcedNextChefId = await getSetting(Settings.EnforcedNextChef);

	if (enforcedNextChefId != null) {
		const _chef = await db.query.chef.findFirst({
			where: eq(chef.id, Number.parseInt(enforcedNextChefId)),
		});

		if (_chef !== undefined) {
			return _chef;
		}
	}

	return getChefWithLowestPoints();
}

export async function resetEnforcedNextChef() {
	await deleteSetting(Settings.EnforcedNextChef);
}

export async function awardChefForCooking(name: string) {
	await db.transaction(async (trx) => {
		const _chef = await trx.query.chef.findFirst({
			where: eq(chef.name, name),
		});

		if (_chef === undefined) {
			throw new Error(`Could not find chef with name '${name}'`);
		}

		const newPoints = _chef.points + 1;

		await trx
			.update(chef)
			.set({ points: newPoints })
			.where(eq(chef.id, _chef.id));

		// TODO: Maybe use specific time?
		await trx
			.insert(history)
			.values({ chefId: _chef.id, date: new Date(), numberOfPersons: 1 });
	});
}

export async function disableChef(id: number) {
	await db.update(chef).set({ isDisabled: true }).where(eq(chef.id, id));
}

export async function enableChef(id: number) {
	await db.update(chef).set({ isDisabled: false }).where(eq(chef.id, id));
}

async function getChefWithLowestPoints() {
	const minPointsQuery = db
		.select({ value: min(chef.points) })
		.from(chef)
		.where(eq(chef.isDisabled, false));
	const chefsWithLowestPoints = await db
		.select()
		.from(chef)
		.where(and(eq(chef.points, minPointsQuery), eq(chef.isDisabled, false)));

	if (chefsWithLowestPoints.length === 0) {
		return undefined;
	}

	if (chefsWithLowestPoints.length === 1) {
		return chefsWithLowestPoints[0];
	}

	const chefIds = chefsWithLowestPoints.map((chef) => chef.id);
	const chefsWhoHaventCookedForTheLongestTimeResult = await db
		.select({
			chefId: history.chefId,
			name: chef.name,
			points: chef.points,
			isDisabled: chef.isDisabled,
		})
		.from(history)
		.innerJoin(chef, eq(history.chefId, chef.id))
		.where(inArray(chef.id, chefIds))
		.groupBy(history.chefId)
		.orderBy(asc(max(history.date)))
		.limit(1);
	const chefWhoHasntCookedForTheLongestTimeResult =
		chefsWhoHaventCookedForTheLongestTimeResult[0];

	// History might be empty. In this case just return the first chef with lowest points.
	if (chefWhoHasntCookedForTheLongestTimeResult === undefined) {
		return chefsWithLowestPoints[0];
	}

	const _chef: Chef = {
		id: chefWhoHasntCookedForTheLongestTimeResult.chefId,
		name: chefWhoHasntCookedForTheLongestTimeResult.name,
		points: chefWhoHasntCookedForTheLongestTimeResult.points,
		isDisabled: chefWhoHasntCookedForTheLongestTimeResult.isDisabled,
	};

	return _chef;
}

async function getLowestPoints() {
	const lowestPointsResults = await db
		.select({ lowestPoints: min(chef.points) })
		.from(chef)
		.limit(1);
	const lowestPointsResult = lowestPointsResults[0];

	if (lowestPointsResult == null || lowestPointsResult.lowestPoints == null) {
		return 0;
	}

	return lowestPointsResult.lowestPoints;
}
