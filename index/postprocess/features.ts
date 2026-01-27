import { writeFile } from "fs/promises";
import { getFeaturesListPath, getMotions } from "../util";

export async function writeFeatureList() {
  const motions = await getMotions();
  const motionsList = Object.values(motions);

  const features = motionsList.reduce((map, motion) => {
    for (const feature of motion.features) {
      const existingSet = map.get(feature.type) ?? new Set();
      for (const value of feature.values) {
        existingSet.add(value);
      }
      map.set(feature.type, existingSet);
    }
    return map;
  }, new Map<string, Set<string>>());

  const featuresJSON = features
    .entries()
    .reduce((prev, [featureName, valueSet]) => {
      return { ...prev, [featureName]: Array.from(valueSet).sort() };
    }, {});

  await writeFile(getFeaturesListPath(), JSON.stringify(featuresJSON));
}
