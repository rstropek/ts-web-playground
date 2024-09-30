import yaml from "yaml";

export type File = {
  content: string;
  isEditable: boolean;
};

export type Exercise = {
  title: string;
  descriptionMd: string;
  files: { [key: string]: File };
};

export async function loadExercise(url: string): Promise<Exercise> {
  // Try to load it via proxy
  let response = await fetch(`/github/exercise/proxy?exerciseUrl=${url}`, { redirect: "manual" });
  if (!response.ok) {
    // Try to load it directly
    response = await fetch(url);
  }

  const content = await response.text();

  const exercise = yaml.parse(content);
  return exercise;
}

export function getExerciseUrlFromQueryString(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("exerciseUrl");
}
