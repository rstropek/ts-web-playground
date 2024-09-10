import { Octokit } from "@octokit/rest";

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

export async function saveFile(ghPat: string, org: string, repo: string, owner: string, path: string, content: string): Promise<void> {
  const octokit = new Octokit({ auth: ghPat });

  const result = await octokit.git.createBlob({
    owner,
    repo,
    content,
    encoding: "utf-8",
  });

  const ref = await octokit.git.getRef({
    owner,
    repo,
    ref: "heads/main",
  });

  const parentCommit = await octokit.rest.git.getCommit({
    owner: "rstropek",
    repo: "apitest",
    commit_sha: ref.data.object.sha,
  });

  const newTree = await octokit.git.createTree({
    owner: "rstropek",
    repo: "apitest",
    base_tree: parentCommit.data.tree.sha,
    tree: [
      {
        path: 'demo',
        mode: '100644',
        type: 'blob',
        sha: result.data.sha,
      }
    ],
  });

  const comResult = await octokit.git.createCommit({
    owner: "rstropek",
    repo: "apitest",
    message: "My first commit",
    author: {
      name: "Rainer Stropek",
      email: "rainer@software-architects.at",
    },
    tree: newTree.data.sha,
    parents: [parentCommit.data.sha],
  });

  const refResult = await octokit.git.updateRef({
    owner: "rstropek",
    repo: "apitest",
    ref: "heads/main",
    sha: comResult.data.sha,
  });

  const file = await octokit.repos.getContent({
    owner: "rstropek",
    repo: "apitest",
    path: "demo",
  });

  const fd = file.data;
  if (!Array.isArray(fd) && fd.type === "file") {
    const content = Buffer.from(fd.content, "base64").toString("utf-8");
    console.log("Content of demo file: %s", content);
  }
}
