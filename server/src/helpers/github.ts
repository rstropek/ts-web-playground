import { Octokit } from "@octokit/rest";
import { createOrUpdateTextFile } from "@octokit/plugin-create-or-update-text-file"

export async function createRepository(ghPat: string, org: string): Promise<string | undefined> {
  const octokit = new Octokit({ auth: ghPat });
      
  const repoName = `typescript-playground-${crypto.randomUUID()}`;
  const result = await octokit.rest.repos.createInOrg({
    "name": repoName,
    "org": org,
    "private": false,
    "has_issues": true,
    "has_projects": false,
    "has_wiki": false,
  });
  
  if (result.status === 201) {
    return repoName;
  }

  return;
}

export async function saveFile(ghPat: string, org: string, repo: string, owner: string, path: string, content: string | null): Promise<void> {
  const octokit = new Octokit({ auth: ghPat });

  const createFile = createOrUpdateTextFile(octokit);
  await createFile.createOrUpdateTextFile({
    owner,
    repo,
    path,
    content,
    message: `Saved in TypeScript Playground at ${new Date().toISOString()}`,
  });
}
