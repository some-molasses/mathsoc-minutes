import { readFile } from "fs/promises";
import { getFeaturesListPath } from "../../index/util";

export const retrieveFeatures = async (): Promise<{
  [key: string]: string[];
}> => {
  const featureList = await readFile(getFeaturesListPath()).then((res) =>
    JSON.parse(res.toString()),
  );

  return featureList;
};
