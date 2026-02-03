import { readFile } from "fs/promises";
import { getMeetingsFilePath } from "../../index/util";
import { Meeting } from "../../index/parse/parse";

export const retrieveMeetings = async ({
  ids,
}: {
  ids: string[];
}): Promise<Meeting[]> => {
  const meetingsMap = (await readFile(getMeetingsFilePath()).then((res) =>
    JSON.parse(res.toString()),
  )) as Record<string, Meeting>;

  const meetings = ids.map((id) => meetingsMap[id]);

  return meetings;
};
