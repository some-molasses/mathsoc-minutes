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
  const results: PageResult<Motion> = request.query
    ? await searchMotions(request)
    : await getSampleMotions(request);

  return {
    data: { motions: results.data },
    page: {
      size: request.page.size,
      index: request.page.index,
      total: results.totalResultCount,
      pageCount: Math.ceil(results.totalResultCount / request.page.size),
    },
  };
}

async function getSampleMotions(
  request: PaginatedMotionsRequest,
): Promise<PageResult<Motion>> {
  const sortedQuery = sortQuery(
    mathsocFirestore.collection("motions"),
    request,
    true,
  );
  const fullQuery = filterQuery(sortedQuery, request);
  const paginatedQuery = paginateQuery(fullQuery, request);

  const results = await paginatedQuery
    .get()
    .then((res) =>
      res.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Motion),
    );

  return {
    data: results.slice(0, results.length - 1),
    totalResultCount: (await fullQuery.count().get()).data().count,
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
  query = filterQuery(query, request);

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

function sortQuery(
  query: FirebaseFirestore.CollectionReference,
  request: PaginatedMotionsRequest,
  defaultNewest?: boolean,
): FirebaseFirestore.Query {
  switch (request.sort) {
    case "newest": {
      return query.orderBy("date", "desc");
    }
    case "oldest": {
      return query.orderBy("date", "asc");
    }
    case "most-relevant": {
      return query;
    }
    default:
      if (defaultNewest) {
        return query.orderBy("date", "desc");
      }

      return query;
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

function filterQuery(
  query: FirebaseFirestore.Query,
  request: PaginatedMotionsRequest,
): FirebaseFirestore.Query {
  if (!request.filters) {
    return query;
  }

  if (request.filters.from) {
    console.log("filtering by from");
    query = query.where("date", ">=", request.filters.from);
  }

  if (request.filters.to) {
    console.log("filtering by to");
    query = query.where("date", "<=", request.filters.to);
  }

  if (request.filters.requiredFeatures?.body?.length) {
    console.log("filtering by body");
    query = query.where(
      "features.body",
      "==",
      request.filters.requiredFeatures.body,
    );
  }

  console.log(request.filters.requiredFeatures);

  if (request.filters.requiredFeatures?.organizations?.length) {
    query = query.where(
      "features.organizations",
      "array-contains-any",
      request.filters.requiredFeatures?.organizations,
    );
  }

  if (request.filters.requiredFeatures?.monetaryRelation?.length) {
    console.log("filtering by money");
    query = query.where(
      "features.monetaryRelation",
      "==",
      request.filters.requiredFeatures.monetaryRelation,
    );
  }

  return query;
}
