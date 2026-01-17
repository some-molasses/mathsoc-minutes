import { readFile } from "fs/promises";
import path from "path";
import { getMeetingsDirectory } from "../index/util";

export async function retrieveMeetings(query: string | null) {
  const meetingsDirectory = getMeetingsDirectory();
  const meetings = await readFile(
    path.join(meetingsDirectory, "meetings.json"),
  ).then((res) => JSON.parse(res.toString()));

  return meetings;
}
