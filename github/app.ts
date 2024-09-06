import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

(async () => {
  dotenv.config();

  const pat = process.env.GH_PAT!;

  const octokit = new Octokit({ auth: pat });
  const {
    data: { login },
  } = await octokit.rest.users.getAuthenticated();
  console.log("Hello, %s", login);

  const result = await octokit.git.createBlob({
    owner: "rstropek",
    repo: "apitest",
    content: "Hello, World!\nHello Universe!",
    encoding: "utf-8",
  });

  const ref = await octokit.git.getRef({
    owner: "rstropek",
    repo: "apitest",
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

  
})().then(() => console.log("Done"));
