import { NextRequest } from "next/server";
import zod from "zod";
import {
  MEETING_BODIES,
  MONETARY_RELATIONS,
  Motion,
  ORGANIZATIONS,
} from "../../../../index/types/motion";
import { retrieveMotions } from "../../../../retrieval/motions/motion-retrieval";

export type SortOption = "newest" | "oldest" | "most-relevant";
const SORT_OPTIONS: SortOption[] = ["newest", "oldest", "most-relevant"];

const PaginatedMotionsRequestSchema = zod.strictObject({
  query: zod.string().nullable(),
  sort: zod.enum(SORT_OPTIONS).nullable(),
  page: zod.object({
    size: zod.number().positive(),
    index: zod.number().nonnegative(),
  }),
  filters: zod
    .strictObject({
      from: zod.iso.datetime().optional(),
      to: zod.iso.datetime().optional(),
      requiredFeatures: zod
        .strictObject({
          organizations: zod.array(zod.enum(ORGANIZATIONS)).optional(),
          body: zod.array(zod.enum(MEETING_BODIES)).optional(),
          monetaryRelation: zod.array(zod.enum(MONETARY_RELATIONS)).optional(),
        })
        .optional(),
    })
    .optional(),
});

export type PaginatedMotionsRequest = zod.infer<
  typeof PaginatedMotionsRequestSchema
>;

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
  const motionRequest = JSON.parse(await rawRequest.text());
  const parsed = PaginatedMotionsRequestSchema.parse(motionRequest);

  const result: PaginatedMotionsResponse = await retrieveMotions(parsed);

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
