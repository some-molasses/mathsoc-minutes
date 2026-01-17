import { NextRequest } from "next/server";
import { retrieveMotions } from "../../../../retrieval/retrieval";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const result = await retrieveMotions(searchParams.get("query"), {
    from: searchParams.has("from")
      ? new Date(searchParams.get("from")!)
      : undefined,
    to: searchParams.has("to") ? new Date(searchParams.get("to")!) : undefined,
  });

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
