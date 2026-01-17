import { lstatSync } from "fs";
import { readdir } from "fs/promises";
import path from "path";

export function getMeetingDirectory() {
  return path.join(process.cwd(), "output");
}

export async function getMeetingsSubdirectories() {
  const meetingsDirectory = getMeetingDirectory();
  const meetingSubdirectories = (await readdir(meetingsDirectory))
    .map((subdirectory) => ({
      name: subdirectory,
      path: path.join(meetingsDirectory, subdirectory),
    }))
    .filter(({ path }) => lstatSync(path).isDirectory());

  return meetingSubdirectories;
}
