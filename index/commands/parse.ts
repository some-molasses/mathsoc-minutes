import { mergeMeetings } from "../merge/merge";
import { parseAllMeetings } from "../parse/parse";

(async () => {
  await parseAllMeetings();
  await mergeMeetings();
})();
