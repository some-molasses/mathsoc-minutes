import { readFile, writeFile } from "fs/promises";
import path from "path";
import { Motion, ParsedMeeting, ParsedMeetingDetail } from "../parse/parse";
import {
  getMeetingsFilePath,
  getMeetingsSubdirectories,
  getMotionsFilePath,
} from "../util";

export async function mergeMeetings() {
  const allMeetings: Record<string, ParsedMeeting> = {};
  const allMotions: Record<string, Motion> = {};

  const meetingsSubdirectories = await getMeetingsSubdirectories();

  for (const subdirectory of meetingsSubdirectories) {
    const parsedPath = path.join(subdirectory.path, "parsed.json");

    const parsedMeeting = (await readFile(parsedPath).then((res) =>
      JSON.parse(res.toString()),
    )) as ParsedMeetingDetail;

    allMeetings[subdirectory.name] = {
      id: parsedMeeting.id,
      date: parsedMeeting.date,
      url: parsedMeeting.url,
      motions: parsedMeeting.motions,
    };

    for (const motion of parsedMeeting.motions) {
      allMotions[motion.id] = motion;
    }
  }

  await writeFile(getMeetingsFilePath(), JSON.stringify(allMeetings, null, 2));
  await writeFile(getMotionsFilePath(), JSON.stringify(allMotions, null, 2));
}
