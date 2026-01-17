import { readFile } from "fs/promises";
import lunr from "lunr";
import { Motion } from "../index/parse/parse";
import { getMotions, getSearchIndexPath } from "../index/util";

export async function retrieveMotions(query: string | null): Promise<Motion[]> {
  const motions = await getMotions();

  if (query) {
    return await searchMotions(query, motions);
  }

  return Object.values(motions);
}

async function searchMotions(
  query: string,
  motions: Record<string, Motion>,
): Promise<Motion[]> {
  const index = await loadIndex();
  const results = index.search(query);

  const motionResults = results.map((result) => motions[result.ref]);

  return motionResults;
}

async function loadIndex(): Promise<lunr.Index> {
  const serializedIndex = await readFile(getSearchIndexPath()).then((res) =>
    JSON.parse(res.toString()),
  );

  return lunr.Index.load(serializedIndex);
}
