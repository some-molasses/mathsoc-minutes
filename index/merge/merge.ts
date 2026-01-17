import { readFile, writeFile } from "fs/promises";
import path from "path";
import { getMeetingDirectory, getMeetingsSubdirectories } from "../util";

export async function mergeMeetings() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allMeetings: Record<string, any> = {};

  const meetingsSubdirectories = await getMeetingsSubdirectories();

  for (const subdirectory of meetingsSubdirectories) {
    const parsedPath = path.join(subdirectory.path, "parsed.json");

    allMeetings[subdirectory.name] = await readFile(parsedPath).then((res) =>
      JSON.parse(res.toString()),
    );
  }

  await writeFile(
    path.join(getMeetingDirectory(), "meetings.json"),
    JSON.stringify(allMeetings, null, 2),
  );
}
