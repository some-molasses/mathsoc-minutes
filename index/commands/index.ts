import { downloadAllMeetings } from "../download/download";
import { parseMeetings } from "../parse";

(async () => {
  await downloadAllMeetings();
  await parseMeetings();
})();
