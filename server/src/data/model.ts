// Data types for CosmosDB

export type UserMasterData = {
  userId: string;
  accountName: string;
  firstName: string;
  lastName: string;
  repository?: string;
  class?: string;
  tan?: string;
};

export type User = UserMasterData & {
  firstLogin: string; // Date/time in ISO 8601 UTC format
  lastLogin: string; // Date/time in ISO 8601 UTC format
};

export type UserWithId = User & { id: string };

export type ExerciseMasterData = {
  category?: string;
  sortOrder?: string;
  title: string;
  yamlUrl?: string;
}

export type Exercise = ExerciseMasterData & {
  created: string; // Date/time in ISO 8601 UTC format
  lastChanged: string; // Date/time in ISO 8601 UTC format
};

export type ExerciseWithId = Exercise & { id: string };
