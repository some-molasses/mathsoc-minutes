import { mathsocFirestore } from "@/app/firebase/firebase-admin";
import { writeFile } from "fs/promises";
import { FeatureValue } from "../types/motion";
import {
  getFeaturesListPath,
  getMotions,
  shouldWriteToFirebase,
} from "../util";

export interface FeatureValuesMap {
  [featureName: string]: { values: FeatureValue[] };
}

async function writeResults(features: FeatureValuesMap) {
  if (shouldWriteToFirebase()) {
    await mathsocFirestore.recursiveDelete(
      mathsocFirestore.collection("features"),
    );

    await Promise.all(
      Object.entries(features).map(([featureName, featureValues]) => {
        mathsocFirestore
          .collection("features")
          .doc(featureName)
          .set(featureValues);
      }),
    );
  } else {
    await writeFile(getFeaturesListPath(), JSON.stringify(features));
  }
}

export async function writeFeatureList() {
  const motions = await getMotions();
  const motionsList = Object.values(motions);

  const features = motionsList.reduce((map, motion) => {
    for (const [type, values] of Object.entries(motion.features)) {
      const existingSet = map.get(type) ?? new Set();
      for (const value of values) {
        existingSet.add(value);
      }
      map.set(type, existingSet);
    }
    return map;
  }, new Map<string, Set<string>>());

  const featuresJSON: FeatureValuesMap = features
    .entries()
    .reduce((prev, [featureName, valueSet]) => {
      return {
        ...prev,
        [featureName]: {
          values: Array.from(valueSet).sort((a, b) =>
            a.toLowerCase() < b.toLowerCase() ? -1 : 1,
          ),
        },
      };
    }, {});

  await writeResults(featuresJSON);
}
