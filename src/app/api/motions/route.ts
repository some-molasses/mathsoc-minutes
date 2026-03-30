import { SerializedMotionFeatureFilter } from "@/app/components/search/search-filters";
import { NextRequest } from "next/server";
import { Motion } from "../../../../index/types/motion";
import { retrieveMotions } from "../../../../retrieval/motions/motion-retrieval";

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
    size: number;
    index: number;
    total: number;
    pageCount: number;
  };
}

export async function POST(rawRequest: NextRequest) {
  const motionRequest: PaginatedMotionsRequest = JSON.parse(
    await rawRequest.text(),
  );

  const result: PaginatedMotionsResponse = await retrieveMotions(motionRequest);

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// function paginateMotions(
//   request: PaginatedMotionsRequest,
//   motions: Motion[],
// ): PaginatedMotionsResponse {
//   const startIndex = request.page.index * request.page.size;
//   const endIndex = startIndex + request.page.size;

//   const pageMotions = motions.slice(startIndex, endIndex);

//   const totalPageCount = Math.ceil(motions.length / request.page.size);

//   return {
//     data: {
//       motions: pageMotions,
//     },
//     page: {
//       index: request.page.index,
//       size: request.page.size,
//       pageCount: totalPageCount,
//       totalResults: motions.length,
//     },
//   };
// }
