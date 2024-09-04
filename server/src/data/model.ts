// Data types for CosmosDB

export type UserMasterData = {
  userId: string;
  accountName: string;
  firstName: string;
  lastName: string;
};

export type User = UserMasterData & {
  firstLogin: string; // Date/time in ISO 8601 UTC format
  lastLogin: string; // Date/time in ISO 8601 UTC format
};

export type UserWithId = User & { id: string };
