import { downloadAllMeetings } from "./download/download";

(async () => {
  console.info("hello?");
  await downloadAllMeetings();
  console.info("done");
})();
