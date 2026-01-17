import { downloadAllMeetings } from "../download/download";
import { mergeMeetings } from "../merge/merge";
import { parseAllMeetings } from "../parse/parse";
import { buildIndex } from "../search-index/search-index";

(async () => {
  await downloadAllMeetings();
  await parseAllMeetings();
  await mergeMeetings();
  await buildIndex();
})();
