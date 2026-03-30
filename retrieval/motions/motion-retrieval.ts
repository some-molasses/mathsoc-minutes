import {
  PaginatedMotionsRequest,
  PaginatedMotionsResponse,
} from "@/app/api/motions/route";
import { MotionFeatureFilter } from "@/app/components/search/search-filters";
import { mathsocFirestore } from "@/app/firebase/firebase-admin";
import lunr from "lunr";
import { Motion } from "../../index/types/motion";

export type MotionFilters = {
  from?: Date;
  to?: Date;
  requiredFeatures: MotionFeatureFilter[];
};

export type PageConfig = {
  start?: string;
  size: number;
};

export type PageResult<T> = {
  data: T[];
  totalResultCount: number;
};

export async function retrieveMotions(
  request: PaginatedMotionsRequest,
): Promise<PaginatedMotionsResponse> {
  const baseResults: PageResult<Motion> = request.query
    ? await searchMotions(request)
    : await getSampleMotions(request);

  // @todo make sorting better; provide options
  const filteredResults = filterResults(baseResults, request);
  return {
    data: { motions: filteredResults.data },
    page: {
      size: request.page.size,
      index: request.page.index,
      total: filteredResults.totalResultCount,
      pageCount: Math.ceil(
        filteredResults.totalResultCount / request.page.size,
      ),
    },
  };
}

async function getSampleMotions(
  request: PaginatedMotionsRequest,
): Promise<PageResult<Motion>> {
  const sortedQuery = sortQuery(
    mathsocFirestore.collection("motions"),
    request,
  );
  const paginatedQuery = paginateQuery(sortedQuery, request);

  const results = await paginatedQuery
    .get()
    .then((res) =>
      res.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Motion),
    );

  return {
    data: results.slice(0, results.length - 1),
    totalResultCount: (await sortedQuery.count().get()).data().count,
  };
}

async function searchMotions(
  request: PaginatedMotionsRequest,
): Promise<PageResult<Motion>> {
  const index = await loadIndex();
  const searchResults = index.search(request.query!);

  const start = request.page.size * request.page.index;
  const idsToRetrieve = searchResults
    .slice(start, start + request.page.size)
    .map(({ ref }) => ref);

  let query = sortQuery(mathsocFirestore.collection("motions"), request);
  query = query.where("id", "in", idsToRetrieve);

  const motions = await query
    .get()
    .then((res) =>
      res.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Motion),
    );

  return {
    data: motions,
    totalResultCount: searchResults.length,
  };
}

function sortQuery(
  query: FirebaseFirestore.CollectionReference,
  request: PaginatedMotionsRequest,
): FirebaseFirestore.Query {
  switch (request.sort) {
    case "newest": {
      return query.orderBy("date", "desc");
    }
    case "oldest": {
      return query.orderBy("date", "asc");
    }
    default:
    case "most-relevant": {
      return query;
    }
  }
}

function paginateQuery(
  query: FirebaseFirestore.Query,
  request: PaginatedMotionsRequest,
): FirebaseFirestore.Query {
  query = query.limit(request.page.size);
  if (request.page.index) {
    query = query.offset(request.page.index * request.page.size);
  }

  return query;
}

type FilterFunction = (
  motion: Motion,
  filters: PaginatedMotionsRequest,
) => boolean;
function filterResults(
  results: PageResult<Motion>,
  request: PaginatedMotionsRequest,
): PageResult<Motion> {
  const filterFunctions: FilterFunction[] = [
    request.filters.requiredFeatures ? filterByFeatures : null,
    request.filters.from ? filterByFromDate : null,
    request.filters.to ? filterByToDate : null,
  ].filter((fn) => fn) as FilterFunction[];

  return {
    data: results.data.filter((result) => {
      for (const filter of filterFunctions) {
        if (!filter(result, request)) {
          return false;
        }
      }

      return true;
    }),
    // @todo make this in any way accurate
    totalResultCount: results.totalResultCount,
  };
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
  request: PaginatedMotionsRequest,
): boolean {
  return request.filters.from! <= new Date(motion.date);
}

function filterByToDate(
  motion: Motion,
  request: PaginatedMotionsRequest,
): boolean {
  return new Date(motion.date) <= request.filters.to!;
}

function filterByFeatures(motion: Motion, request: PaginatedMotionsRequest) {
  const requiredSet = new Set(request.filters.requiredFeatures);
  for (const requiredFeature of requiredSet) {
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
