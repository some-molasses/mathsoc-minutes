import { NextRequest } from "next/server";
import { retrieveMeetings } from "../../../../retrieval/retrieval";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  if (searchParams.has("query")) {
    return new Response("not implemented", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = await retrieveMeetings(searchParams.get("query"));
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
