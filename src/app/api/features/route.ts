import { FeatureValue } from "../../../../index/types/motion";
import { retrieveFeatures } from "../../../../retrieval/features/feature-retrieval";

type FeatureMetadata = {
  label: string;
  values: FeatureValue[];
};

export type FeaturesListResponse = {
  organizations: FeatureMetadata;
  body: FeatureMetadata;
  monetaryRelation: FeatureMetadata;
};

export async function GET() {
  const result = await retrieveFeatures();

  const formattedResult: FeaturesListResponse = {
    organizations: {
      label: "Organization",
      values: result.organizations.values,
    },
    body: { label: "Body", values: result.body.values },
    monetaryRelation: {
      label: "Nature",
      values: result.monetaryRelation.values,
    },
  };

  return new Response(JSON.stringify(formattedResult), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
