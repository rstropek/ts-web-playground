import { Database, SqlQuerySpec } from "@azure/cosmos";
import { Collections, getContainer } from "../helpers/cosmosHelper.js";
import { UserMasterData, UserWithId } from "./model.js";
import crypto from "crypto";

export async function storeLogin(cosmosDb: Database, userData: UserMasterData): Promise<UserWithId> {
  let user = await getUserById(cosmosDb, userData.userId);
  if (!user) {
    user = await createNewUser(cosmosDb, userData);
  } else {
    await update(cosmosDb, userData);
  }

  return user;
}

export async function getUserById(cosmosDb: Database, userId: string): Promise<UserWithId | undefined> {
  const container = await getContainer(cosmosDb, Collections.Users);

  const querySpec: SqlQuerySpec = {
    query: `SELECT * FROM ${Collections.Users} u WHERE u.userId = @userId`,
    parameters: [
      {
        name: "@userId",
        value: userId,
      },
    ],
  };
  const items = await container.items.query<UserWithId>(querySpec).fetchAll();
  if (items.resources.length === 0) {
    return;
  }

  return items.resources[0];
}

export async function getAllUsers(cosmosDb: Database, filter?: string): Promise<UserWithId[]> {
  const container = await getContainer(cosmosDb, Collections.Users);

  let query = `SELECT * FROM ${Collections.Users} u`;
  if (filter) {
    query += ` WHERE u.accountName = @filter OR u.firstName = @filter OR u.lastName = @filter`;
  }

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
  const items = await container.items.query<UserWithId>(querySpec).fetchAll();

  return items.resources;
}

async function createNewUser(cosmosDb: Database, userData: UserMasterData): Promise<UserWithId> {
  const container = await getContainer(cosmosDb, Collections.Users);

  const loginTime = new Date().toISOString();
  const newUser: UserWithId = {
    ...userData,
    id: crypto.randomUUID(),
    firstLogin: loginTime,
    lastLogin: loginTime,
  };

  await container.items.create(newUser);
  return newUser;
}

async function update(cosmosDb: Database, userData: UserMasterData): Promise<void> {
  const container = await getContainer(cosmosDb, Collections.Users);

  const user = await getUserById(cosmosDb, userData.userId);
  if (!user) {
    return; /* should never happen */
  }

  user.accountName = userData.accountName;
  user.firstName = userData.firstName;
  user.lastName = userData.lastName;

  user.lastLogin = new Date().toISOString();

  await container.items.upsert(user);
}

export async function updateUser(cosmosDb: Database, userData: UserWithId): Promise<void> {
  const container = await getContainer(cosmosDb, Collections.Users);

  await container.items.upsert(userData);
}
