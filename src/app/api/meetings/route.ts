import { NextRequest } from "next/server";
import { retrieveMeetings } from "../../../../retrieval/retrieval";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const result = await retrieveMeetings(searchParams.get("query"));

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
