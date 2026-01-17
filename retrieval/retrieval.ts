import { readFile } from "fs/promises";
import lunr from "lunr";
import { Motion } from "../index/parse/parse";
import { getMotions, getSearchIndexPath } from "../index/util";

export type MotionFilters = {
  from?: Date;
  to?: Date;
};

export async function retrieveMotions(
  query: string | null,
  filters: MotionFilters,
): Promise<Motion[]> {
  const motions = await getMotions();
  const baseResults = query
    ? await searchMotions(query, motions)
    : Object.values(motions);

  return filterResults(baseResults, filters);
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

function filterResults(results: Motion[], filters: MotionFilters) {
  return results
    .filter((result) => {
      if (!filters.from) {
        return true;
      }

      return filters.from <= new Date(result.date);
    })
    .filter((result) => {
      if (!filters.to) {
        return true;
      }

      return new Date(result.date) <= filters.to;
    });
}

async function loadIndex(): Promise<lunr.Index> {
  const serializedIndex = await readFile(getSearchIndexPath()).then((res) =>
    JSON.parse(res.toString()),
  );

  return lunr.Index.load(serializedIndex);
}
