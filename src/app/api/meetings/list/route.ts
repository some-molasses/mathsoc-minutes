import { NextRequest } from "next/server";
import { retrieveMeetings } from "../../../../../retrieval/meetings/meeting-retrieval";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { ids }: { ids: string[] } = body;

  if (!ids) {
    throw new Error("ids not found in request body");
  }

  const result = await retrieveMeetings({ ids });

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
