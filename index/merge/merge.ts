import { readFile, writeFile } from "fs/promises";
import path from "path";
import { ParsedMeeting } from "../parse/parse";
import { getMeetingsDirectory, getMeetingsSubdirectories } from "../util";

export async function mergeMeetings() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allMeetings: Record<string, any> = {};

  const meetingsSubdirectories = await getMeetingsSubdirectories();

  for (const subdirectory of meetingsSubdirectories) {
    const parsedPath = path.join(subdirectory.path, "parsed.json");

    const parsedMeeting = (await readFile(parsedPath).then((res) =>
      JSON.parse(res.toString()),
    )) as ParsedMeeting;

    allMeetings[subdirectory.name] = {
      url: parsedMeeting.url,
      motions: parsedMeeting.motions,
    };
  }

  await writeFile(
    path.join(getMeetingsDirectory(), "meetings.json"),
    JSON.stringify(allMeetings, null, 2),
  );
}
