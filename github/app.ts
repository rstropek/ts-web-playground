import { Octokit } from "@octokit/rest";
import { Options, createOrUpdateTextFile, composeCreateOrUpdateTextFile } from "@octokit/plugin-create-or-update-text-file"
import dotenv from "dotenv";

(async () => {
  dotenv.config();

  const pat = process.env.GH_PAT!;

  //const MyOctokit = Octokit.plugin(createOrUpdateTextFile);
  const octokit = new Octokit({ auth: pat });
  const {
    data: { login },
  } = await octokit.rest.users.getAuthenticated();
  console.log("Hello, %s", login);

  const fn = createOrUpdateTextFile(octokit);
  const options: Options = {
    owner: "Teaching-HTL-Leonding",
    repo: "typescript-playground-21199d49-a100-49d4-9605-a7e5b18686bd",
    path: "demo2.md",
    content: "Hello, World!\nHello Universe!",
    message: "My first commit",
  };
  await fn.createOrUpdateTextFile(options);
  /*
  const result = await octokit.git.createBlob({
    owner: "Teaching-HTL-Leonding",
    repo: "typescript-playground-65e72ad7-0adb-4e4c-aba6-bd25ffe63542",
    content: "Hello, World!\nHello Universe!",
    encoding: "utf-8",
  });

  const ref = await octokit.git.getRef({
    owner: "Teaching-HTL-Leonding",
    repo: "typescript-playground-65e72ad7-0adb-4e4c-aba6-bd25ffe63542",
    ref: "heads/main",
  });

  const parentCommit = await octokit.rest.git.getCommit({
    owner: "Teaching-HTL-Leonding",
    repo: "typescript-playground-65e72ad7-0adb-4e4c-aba6-bd25ffe63542",
    commit_sha: ref.data.object.sha,
  });

  const newTree = await octokit.git.createTree({
    owner: "Teaching-HTL-Leonding",
    repo: "typescript-playground-65e72ad7-0adb-4e4c-aba6-bd25ffe63542",
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
    owner: "Teaching-HTL-Leonding",
    repo: "typescript-playground-65e72ad7-0adb-4e4c-aba6-bd25ffe63542",
    message: "My first commit",
    author: {
      name: "Rainer Stropek",
      email: "rainer@software-architects.at",
    },
    tree: newTree.data.sha,
    parents: [parentCommit.data.sha],
  });

  const refResult = await octokit.git.updateRef({
    owner: "Teaching-HTL-Leonding",
    repo: "typescript-playground-65e72ad7-0adb-4e4c-aba6-bd25ffe63542",
    ref: "heads/main",
    sha: comResult.data.sha,
  });

  const file = await octokit.repos.getContent({
    owner: "Teaching-HTL-Leonding",
    repo: "typescript-playground-65e72ad7-0adb-4e4c-aba6-bd25ffe63542",
    path: "demo",
  });

  const fd = file.data;
  if (!Array.isArray(fd) && fd.type === "file") {
    const content = Buffer.from(fd.content, "base64").toString("utf-8");
    console.log("Content of demo file: %s", content);
  }

  */  
})().then(() => console.log("Done"));
