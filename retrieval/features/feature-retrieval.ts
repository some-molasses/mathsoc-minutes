import { mathsocFirestore } from "@/app/firebase/firebase-admin";
import { readFile } from "fs/promises";
import { FeatureValuesMap } from "../../index/postprocess/features";
import { getFeaturesListPath } from "../../index/util";

export const retrieveFeatures = async (): Promise<{
  [key: string]: string[];
}> => {
  const featureList = await readFile(getFeaturesListPath()).then((res) =>
    JSON.parse(res.toString()),
  );

  const features: FeatureValuesMap = {};
  await mathsocFirestore
    .collection("features")
    .get()
    .then((res) =>
      res.forEach((doc) => {
        features[doc.id] = { ...doc.data() } as { values: string[] };
      }),
    );

  return featureList;
};
