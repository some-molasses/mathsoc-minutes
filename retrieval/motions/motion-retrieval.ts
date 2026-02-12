import { readFile } from "fs/promises";
import lunr from "lunr";
import { Motion } from "../../index/types/motion";
import { getMotions, getSearchIndexPath } from "../../index/util";
import { MotionFeatureFilter } from "@/app/components/search/search-filters";

export type MotionFilters = {
  from?: Date;
  to?: Date;
  requiredFeatures: MotionFeatureFilter[];
};

export async function retrieveMotions(
  query: string | null,
  filters: MotionFilters,
): Promise<Motion[]> {
  const motions = await getMotions();
  const baseResults = query
    ? await searchMotions(query, motions)
    : Object.values(motions);

  // @todo make sorting better; provide options
  return filterResults(baseResults, filters).sort((a, b) =>
    new Date(a.date) < new Date(b.date) ? 1 : -1,
  );
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

type FilterFunction = (motion: Motion, filters: MotionFilters) => boolean;
function filterResults(results: Motion[], filters: MotionFilters) {
  const filterFunctions: FilterFunction[] = [
    filters.requiredFeatures ? filterByFeatures : null,
    filters.from ? filterByFromDate : null,
    filters.to ? filterByToDate : null,
  ].filter((fn) => fn) as FilterFunction[];

  return results.filter((result) => {
    for (const filter of filterFunctions) {
      if (!filter(result, filters)) {
        return false;
      }
    }

    return true;
  });
}

async function loadIndex(): Promise<lunr.Index> {
  const serializedIndex = await readFile(getSearchIndexPath()).then((res) =>
    JSON.parse(res.toString()),
  );

  return lunr.Index.load(serializedIndex);
}

function filterByFromDate(
  motion: Motion,
  filters: Required<Pick<MotionFilters, "from">>,
): boolean {
  return filters.from <= new Date(motion.date);
}

function filterByToDate(
  motion: Motion,
  filters: Required<Pick<MotionFilters, "to">>,
): boolean {
  return new Date(motion.date) <= filters.to;
}

function filterByFeatures(
  motion: Motion,
  filters: Required<Pick<MotionFilters, "requiredFeatures">>,
) {
  for (const requiredFeature of filters.requiredFeatures) {
    const motionFeature = motion.features.find(
      (feature) => feature.type == requiredFeature.type,
    );

    if (!motionFeature) {
      return false;
    }

    console.log(requiredFeature.values);

    for (const requiredFeatureValue of requiredFeature.values) {
      if (!motionFeature.values.includes(requiredFeatureValue)) {
        return false;
      }
    }
  }

  return true;
}
