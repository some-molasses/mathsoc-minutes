import { NextRequest } from "next/server";
import { Motion } from "../../../../index/types/motion";
import { retrieveMotions } from "../../../../retrieval/motions/motion-retrieval";
import { SerializedMotionFeatureFilter } from "@/app/components/search/search-filters";

export type SortOption = "newest" | "oldest" | "most-relevant";

export interface PaginatedMotionsRequest {
  query: string | null;
  sort: SortOption;
  filters: {
    from?: Date;
    to?: Date;
    requiredFeatures: SerializedMotionFeatureFilter[];
  };
  page: {
    size: number;
    index: number;
  };
}

export interface PaginatedMotionsResponse {
  data: {
    motions: Motion[];
  };
  page: {
    index: number;
    size: number;
    count: number;
  };
}

export async function POST(rawRequest: NextRequest) {
  const motionRequest: PaginatedMotionsRequest = JSON.parse(
    await rawRequest.text(),
  );

  const result = await retrieveMotions(motionRequest.query, {
    from: motionRequest.filters.from,
    to: motionRequest.filters.to,
    requiredFeatures: motionRequest.filters.requiredFeatures.map(
      ({ type, values }) => ({ type, values: new Set(values) }),
    ),
  });

  const sortedResult = sortMotions(motionRequest, result);
  const paginatedResult = paginateMotions(motionRequest, sortedResult);

  return new Response(JSON.stringify(paginatedResult), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function sortMotions(
  request: PaginatedMotionsRequest,
  motions: Motion[],
): Motion[] {
  switch (request.sort) {
    case "newest": {
      return motions.sort((a, b) => (a.date < b.date ? -1 : 1));
    }
    case "oldest": {
      return motions.sort((a, b) => (a.date > b.date ? -1 : 1));
    }
    default:
    case "most-relevant": {
      return motions;
    }
  }
}

function paginateMotions(
  request: PaginatedMotionsRequest,
  motions: Motion[],
): PaginatedMotionsResponse {
  const startIndex = request.page.index * request.page.size;
  const endIndex = startIndex + request.page.size;

  const pageMotions = motions.slice(startIndex, endIndex);

  const totalPageCount = Math.ceil(motions.length / request.page.size);

  return {
    data: {
      motions: pageMotions,
    },
    page: {
      index: request.page.index,
      size: request.page.size,
      count: totalPageCount,
    },
  };
}
