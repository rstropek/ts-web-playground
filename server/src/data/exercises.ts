import { Database, SqlQuerySpec } from "@azure/cosmos";
import { Collections, getContainer } from "../helpers/cosmosHelper.js";
import { ExerciseMasterData, ExerciseWithId } from "./model.js";
import crypto from "crypto";

export async function createExercise(cosmosDb: Database, exercise: ExerciseMasterData): Promise<ExerciseWithId> {
  const container = await getContainer(cosmosDb, Collections.Exercises);

  const creationTime = new Date().toISOString();
  const newExercise: ExerciseWithId = {
    ...exercise,
    id: crypto.randomUUID(),
    created: creationTime,
    lastChanged: creationTime,
  };

  await container.items.create(newExercise);
  return newExercise;
}

export async function getAllExercises(cosmosDb: Database, filter?: string, onlyActive?: boolean): Promise<ExerciseWithId[]> {
  const container = await getContainer(cosmosDb, Collections.Exercises);

  let query = `SELECT * FROM ${Collections.Exercises} e`;
  if (filter) {
    query += ` WHERE CONTAINS(e.title, @filter) OR CONTAINS(e.category, @filter)`;
  }
  if (onlyActive) {
    if (filter) {
      query += " AND ";
    } else {
      query += " WHERE ";
    }

    query += `
      (NOT IS_DEFINED(e.displayFrom) OR IS_NULL(e.displayFrom) OR e.displayFrom = "" OR e.displayFrom <= GetCurrentDateTime()) 
        AND (NOT IS_DEFINED(e.displayUntil) OR IS_NULL(e.displayUntil) OR e.displayUntil = ""  OR e.displayUntil >= GetCurrentDateTime())`;
  }

  query += " ORDER BY e.category ASC, e.sortOrder ASC, e.title ASC";

  const querySpec: SqlQuerySpec = {
    query: query,
  };
  if (filter) {
    querySpec.parameters = [
      {
        name: "@filter",
        value: filter,
      },
    ];
  }
  const items = await container.items.query<ExerciseWithId>(querySpec).fetchAll();

  return items.resources;
}

export async function getExerciseById(cosmosDb: Database, exerciseId: string): Promise<ExerciseWithId | undefined> {
  const container = await getContainer(cosmosDb, Collections.Exercises);

  const querySpec: SqlQuerySpec = {
    query: `SELECT * FROM ${Collections.Exercises} e WHERE e.id = @exerciseId`,
    parameters: [
      {
        name: "@exerciseId",
        value: exerciseId,
      },
    ],
  };
  const items = await container.items.query<ExerciseWithId>(querySpec).fetchAll();
  if (items.resources.length === 0) {
    return;
  }

  return items.resources[0];
}

export async function updateExercise(cosmosDb: Database, exercise: ExerciseWithId): Promise<void> {
  const container = await getContainer(cosmosDb, Collections.Exercises);

  const lastChanged = new Date().toISOString();
  const updatedExercise: ExerciseWithId = {
    ...exercise,
    lastChanged: lastChanged,
  };

  await container.items.upsert(updatedExercise);
}

export async function deleteExercise(cosmosDb: Database, exerciseId: string): Promise<void> {
  const container = await getContainer(cosmosDb, Collections.Exercises);
  await container.item(exerciseId).delete();
}
