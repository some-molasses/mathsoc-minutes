import { writeFile } from "fs/promises";
import lunr from "lunr";
import { getMotions, getSearchIndexPath } from "../util";

export async function buildIndex() {
  const motions = await getMotions();
  const motionsList = Object.values(motions);

  const index = lunr(function () {
    this.ref("id");
    this.field("title");
    this.field("body");

    motionsList.forEach((motion) => {
      this.add(motion);
    });
  });

  await writeFile(getSearchIndexPath(), JSON.stringify(index));
}
