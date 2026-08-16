import yaml from "yaml";

export type File = {
  content: string;
  isEditable: boolean;
};

/**
 * Sample solution of an exercise.
 *
 * A single string is the URL of the solution for _index.ts_. Exercises whose
 * solution spans multiple modules use a map of file name to solution URL.
 */
export type SampleSolution = string | { [fileName: string]: string };

export type Exercise = {
  title: string;
  descriptionMd: string;
  files: { [key: string]: File };
  sampleSolution?: SampleSolution;
};

/** Turn both supported _sampleSolution_ notations into a file name to URL map. */
export function normalizeSampleSolution(
  sampleSolution: SampleSolution | undefined
): { [fileName: string]: string } {
  if (!sampleSolution) {
    return {};
  }

  if (typeof sampleSolution === "string") {
    return { "index.ts": sampleSolution };
  }

  return sampleSolution;
}

/**
 * Fetch an exercise resource (YAML spec, sample solution, ...).
 *
 * Goes through the server-side proxy first and falls back to a direct request
 * when the proxy is unavailable (e.g. when running the client on its own).
 */
export async function fetchExerciseResource(url: string): Promise<Response> {
  const response = await fetch(`/github/exercise/proxy?exerciseUrl=${encodeURIComponent(url)}`, { redirect: "manual" });
  if (response.ok) {
    return response;
  }

  // Try to load it directly
  return await fetch(url);
}

export async function loadExercise(url: string): Promise<Exercise> {
  const response = await fetchExerciseResource(url);

  const content = await response.text();

  const exercise = yaml.parse(content);
  return exercise;
}

export function getExerciseUrlFromQueryString(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("exerciseUrl");
}
