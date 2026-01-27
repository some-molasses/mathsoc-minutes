import { mergeMeetings } from "./merge/merge";
import { parseAllMeetings } from "./parse/parse";
import { writeFeatureList } from "./postprocess/features";
import { writeIndex } from "./postprocess/search-index";

export const parseMeetings = async () => {
  await parseAllMeetings();
  await mergeMeetings();
  await writeIndex();
  await writeFeatureList();
};
