import { readFile } from "fs/promises";
import lunr from "lunr";
import { ParsedMeeting } from "../index/parse/parse";
import { getMeetingsFilePath, getSearchIndexPath } from "../index/util";

export async function retrieveMeetings(
  query: string | null,
): Promise<ParsedMeeting[]> {
  const meetings = await readFile(getMeetingsFilePath()).then((res) =>
    JSON.parse(res.toString()),
  );

  if (query) {
    return await searchMeetings(query, meetings);
  }

  return meetings;
}

async function searchMeetings(
  query: string,
  meetings: Record<string, ParsedMeeting>,
): Promise<ParsedMeeting[]> {
  const index = await loadIndex();
  const results = index.search(query);
  const meetingResults = results.map((result) => {
    const meetingIdMatch = result.ref.match(/(.*):/);
    if (!meetingIdMatch) {
      throw new Error(
        `Could not extract meeting ID from motion ID ${result.ref}`,
      );
    }

    const meetingId = meetingIdMatch[1];
    return meetings[meetingId];
  });

  return meetingResults;
}

async function loadIndex(): Promise<lunr.Index> {
  const serializedIndex = await readFile(getSearchIndexPath()).then((res) =>
    JSON.parse(res.toString()),
  );

  return lunr.Index.load(serializedIndex);
}
