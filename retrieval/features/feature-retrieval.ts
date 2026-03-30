import { mathsocFirestore } from "@/app/firebase/firebase-admin";
import { FeatureValuesMap } from "../../index/postprocess/features";

export const retrieveFeatures = async (): Promise<FeatureValuesMap> => {
  const features: FeatureValuesMap = {};
  await mathsocFirestore
    .collection("features")
    .get()
    .then((res) =>
      res.forEach((doc) => {
        features[doc.id] = { ...doc.data() } as { values: string[] };
      }),
    );

  return features;
};
