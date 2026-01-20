import { NextRequest } from "next/server";
import { retrieveMotions } from "../../../../retrieval/retrieval";
import { Motion } from "../../../../index/types/motion";

export interface PaginatedMotionsRequest {
  query: string | null;
  filters: {
    from?: Date;
    to?: Date;
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

export async function GET(rawRequest: NextRequest) {
  const motionRequest = extractRequest(rawRequest);

  const result = await retrieveMotions(motionRequest.query, {
    from: motionRequest.filters.from,
    to: motionRequest.filters.to,
    requiredFeatures: [],
  });

  const paginatedResult = paginateMotions(motionRequest, result);

  return new Response(JSON.stringify(paginatedResult), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function extractRequest(request: NextRequest): PaginatedMotionsRequest {
  const searchParams = request.nextUrl.searchParams;
  return {
    query: searchParams.get("query"),
    filters: {
      from: searchParams.has("from")
        ? new Date(searchParams.get("from")!)
        : undefined,
      to: searchParams.has("to")
        ? new Date(searchParams.get("to")!)
        : undefined,
    },
    page: {
      index: parseInt(searchParams.get("pageIndex") ?? "0"),
      size: parseInt(searchParams.get("pageSize") ?? "20"),
    },
  };
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
