import { mergeMeetings } from "../merge/merge";
import { parseAllMeetings } from "../parse/parse";
import { buildIndex } from "../search-index/search-index";

(async () => {
  await parseAllMeetings();
  await mergeMeetings();
  await buildIndex();
})();
