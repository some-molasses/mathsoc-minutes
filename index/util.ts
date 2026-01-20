import { existsSync, lstatSync } from "fs";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { Motion } from "./types/motion";

export function getMeetingsDirectory() {
  return path.join(process.cwd(), "output");
}

export function getMeetingsFilePath() {
  return path.join(getMeetingsDirectory(), "meetings.json");
}

export function getMotionsFilePath() {
  return path.join(getMeetingsDirectory(), "motions.json");
}

export function getSearchIndexPath() {
  return path.join(getMeetingsDirectory(), "index.json");
}

export async function getMotions(): Promise<Record<string, Motion>> {
  if (!existsSync(getMotionsFilePath())) {
    throw new Error(
      `Output directory ${getMotionsFilePath()} does not exist; try generating the index first`,
    );
  }

  return await readFile(getMotionsFilePath()).then((res) =>
    JSON.parse(res.toString()),
  );
}

export async function getMeetingsSubdirectories() {
  const meetingsDirectory = getMeetingsDirectory();
  const meetingSubdirectories = (await readdir(meetingsDirectory))
    .map((subdirectory) => ({
      name: subdirectory,
      path: path.join(meetingsDirectory, subdirectory),
    }))
    .filter(({ path }) => lstatSync(path).isDirectory());

  return meetingSubdirectories;
}
