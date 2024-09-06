// Data types for CosmosDB

export type UserMasterData = {
  userId: string;
  accountName: string;
  firstName: string;
  lastName: string;
  repository?: string;
  class?: string;
  isAdmin?: boolean
};

export type User = UserMasterData & {
  firstLogin: string; // Date/time in ISO 8601 UTC format
  lastLogin: string; // Date/time in ISO 8601 UTC format
};

export type UserWithId = User & { id: string };

export type ExerciseMasterData = {
  title: string;
  descriptionMd: string;
  category?: string;
  icon?: string;
  yamlUrl?: string;
}

export type Exercise = ExerciseMasterData & {
  created: string; // Date/time in ISO 8601 UTC format
  lastChanged: string; // Date/time in ISO 8601 UTC format
};

export type ExerciseWithId = Exercise & { id: string };
