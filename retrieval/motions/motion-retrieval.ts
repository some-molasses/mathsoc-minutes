import { MotionFeatureFilter } from "@/app/components/search/search-filters";
import { mathsocFirestore } from "@/app/firebase/firebase-admin";
import lunr from "lunr";
import { Motion } from "../../index/types/motion";

export type MotionFilters = {
  from?: Date;
  to?: Date;
  requiredFeatures: MotionFeatureFilter[];
};

export async function retrieveMotions(
  query: string | null,
  filters: MotionFilters,
): Promise<Motion[]> {
  const baseResults = query ? await searchMotions(query) : [];

  // @todo make sorting better; provide options
  return filterResults(baseResults, filters).sort((a, b) =>
    new Date(a.date) < new Date(b.date) ? 1 : -1,
  );
}

async function searchMotions(query: string): Promise<Motion[]> {
  const index = await loadIndex();
  const results = index.search(query);

  const motions: Motion[] = [];
  await Promise.all(
    results.map(async (result) => {
      return mathsocFirestore
        .collection("motions")
        .select(
          "id",
          "meetingId",
          "motionNumber",
          "date",
          "title",
          "body",
          "features",
        )
        .where("id", "==", result.ref)
        .get()
        .then((res) =>
          res.forEach((doc) =>
            motions.push({ id: doc.id, ...doc.data() } as Motion),
          ),
        );
    }),
  );

  return motions;
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
  const indexChunks = await mathsocFirestore
    .collection("index")
    .get()
    .then((res) =>
      res.docs.map(
        (doc) => ({ ...doc.data() }) as { chunk: string; index: number },
      ),
    )
    .then((res) => res.sort((a, b) => (a.index < b.index ? -1 : 1)));

  const assembledString = indexChunks.map(({ chunk }) => chunk).join("");
  const serializedIndex = JSON.parse(assembledString);

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

    for (const requiredFeatureValue of requiredFeature.values) {
      if (!motionFeature.values.includes(requiredFeatureValue)) {
        return false;
      }
    }
  }

  return true;
}
