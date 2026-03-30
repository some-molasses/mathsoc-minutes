import { retrieveFeatures } from "../../../../retrieval/features/feature-retrieval";

type FeatureMetadata = {
  label: string;
  values: string[];
};

export type FeaturesListResponse = {
  organization: FeatureMetadata;
  body: FeatureMetadata;
  isMonetary: FeatureMetadata;
};

export async function GET() {
  const result = await retrieveFeatures();

  const formattedResult: FeaturesListResponse = {
    organization: { label: "Organization", values: result.organization.values },
    body: { label: "Body", values: result.body.values },
    isMonetary: { label: "Nature", values: result.isMonetary.values },
  };

  return new Response(JSON.stringify(formattedResult), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
