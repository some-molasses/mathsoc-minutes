import { lstatSync } from "fs";
import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";

export async function mergeMeetings() {
  //@todo refactor out subdirectory finding into shared function
  const meetingsDirectory = path.join(process.cwd(), "output");
  const meetingSubdirectories: string[] = await readdir(meetingsDirectory);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allMeetings: Record<string, any> = {};

  for (const subdirectory of meetingSubdirectories) {
    const subdirectoryPath = path.join(meetingsDirectory, subdirectory);
    if (!lstatSync(subdirectoryPath).isDirectory()) {
      continue;
    }

    const parsedPath = path.join(subdirectoryPath, "parsed.json");

    allMeetings[subdirectory] = await readFile(parsedPath).then((res) =>
      JSON.parse(res.toString()),
    );
  }

  await writeFile(
    path.join(meetingsDirectory, "meetings.json"),
    JSON.stringify(allMeetings, null, 2),
  );
}
