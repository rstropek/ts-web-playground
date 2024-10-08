import { Database, SqlQuerySpec } from "@azure/cosmos";
import { Collections, getContainer } from "../helpers/cosmosHelper.js";
import { UserMasterData, UserWithId } from "./model.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

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
    query += ` WHERE CONTAINS(u.accountName, @filter) OR CONTAINS(u.firstName, @filter) OR CONTAINS(u.lastName, @filter) OR CONTAINS(u.class, @filter)`;
  }

  query += " ORDER BY u.lastName ASC, u.firstName ASC";

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

export function generateUserTan(): string {
  // Generate a random combination of 8 digits/characters.
  // Avoids ambiguous characters like 0/O and 1/I/l.
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let tan = "";
  for (let i = 0; i < 8; i++) {
    tan += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return tan;
}

export type RegenerateUserTansResult = {
  accountName: string;
  firstName: string;
  lastName: string;
  plainTan: string;
}

export async function regenerateUserTans(cosmosDb: Database, userIds: string[]): Promise<RegenerateUserTansResult[]> {
  const container = await getContainer(cosmosDb, Collections.Users);

  const users: RegenerateUserTansResult[] = [];
  for (const userId of userIds) {
    const user = await getUserById(cosmosDb, userId);
    if (!user) {
      continue;
    }

    const tan = generateUserTan();
    const salt = await bcrypt.genSalt(10);
    user.tan = await bcrypt.hash(tan, salt);
    await container.items.upsert(user);
    users.push({
      accountName: user.accountName,
      firstName: user.firstName,
      lastName: user.lastName,
      plainTan: tan,
    });
  }

  return users;
}

export async function getUserWithTan(cosmosDb: Database, accountName: string, enteredTan: string): Promise<UserWithId | undefined> {
  const container = await getContainer(cosmosDb, Collections.Users);

  const querySpec: SqlQuerySpec = {
    query: `SELECT * FROM ${Collections.Users} u WHERE u.accountName = @accountName`,
    parameters: [
      {
        name: "@accountName",
        value: accountName,
      },
    ],
  };
  const items = await container.items.query<UserWithId>(querySpec).fetchAll();
  if (items.resources.length === 0 || !items.resources[0] || !items.resources[0].tan) {
    return;
  }

  const user = items.resources[0];
  if (await bcrypt.compare(enteredTan, user.tan!)) {
    delete user.tan;
    await container.items.upsert(user);
    return user;
  }
}
