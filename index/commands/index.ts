import { downloadAllMeetings } from "../download/download";
import { mergeMeetings } from "../merge/merge";
import { parseAllMeetings } from "../parse/parse";

(async () => {
  await downloadAllMeetings();
  await parseAllMeetings();
  await mergeMeetings();
})();
