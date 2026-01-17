import { writeFile } from "fs/promises";
import lunr from "lunr";
import { getMeetings, getSearchIndexPath } from "../util";

export async function buildIndex() {
  const meetings = await getMeetings();
  const meetingsList = Object.values(meetings);

  const index = lunr(function () {
    this.ref("id");
    this.field("title");
    this.field("body");

    meetingsList.forEach((meeting) => {
      meeting.motions.forEach((motion) => {
        this.add(motion);
      });
    });
  });

  await writeFile(getSearchIndexPath(), JSON.stringify(index));
}
