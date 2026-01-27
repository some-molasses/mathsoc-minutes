import { retrieveFeatures } from "../../../../retrieval/features/feature-retrieval";

export async function GET() {
  const result = await retrieveFeatures();

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
