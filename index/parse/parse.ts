import { MeetingData } from "@/app/data/types";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { Motion } from "../types/motion";
import { getMeetingsSubdirectories } from "../util";

export type ParsedMeeting = {
  id: string;
  date: string;
  motions: Motion[];
  url?: string;
};

export type ParsedMeetingDetail = ParsedMeeting & {
  raw: string;
};

export async function parseAllMeetings() {
  const meetingPaths = await getPaths();

  for (const meeting of meetingPaths) {
    const meta: MeetingData = await readFile(meeting.meta).then((res) =>
      JSON.parse(res.toString()),
    );
    const agenda = await readFile(meeting.agenda).then((res) => res.toString());
    const parsed = parseMinutes(meeting.id, meta, agenda);
    await writeFile(meeting.parsed, JSON.stringify(parsed, null, 2));
  }
}

async function getPaths(): Promise<
  { id: string; agenda: string; meta: string; parsed: string }[]
> {
  const subdirectories = await getMeetingsSubdirectories();
  return subdirectories.map(({ name, path: subdirectoryPath }) => {
    return {
      id: name,
      agenda: path.join(subdirectoryPath, "agenda.md"),
      meta: path.join(subdirectoryPath, "meta.json"),
      parsed: path.join(subdirectoryPath, "parsed.json"),
    };
  });
}

function parseMinutes(
  id: string,
  data: MeetingData,
  document: string,
): ParsedMeetingDetail {
  const sanitized = document.replaceAll(/{.*}/g, "");
  const splitByHeading = sanitized.split("#");

  const motionBlobs = splitByHeading.filter((block) => {
    const sanitizedBlock = block
      .replaceAll(/\s/g, "")
      .replaceAll(/\*/g, "")
      .replaceAll(/[\u200B-\u200D\uFEFF]/g, "") // weird zero-width chars that keep appearing for some reason
      .trim();

    const startsWithMotionNumber = sanitizedBlock.match(/^(\d+\.\d+)/);
    const startsWithSpace = block.match(/^(\s)/);

    return startsWithMotionNumber && startsWithSpace;
  });

  const motions = motionBlobs.map((blob) => parseMotion(id, data, blob));

  return {
    id: id,
    date: data.date,
    url: data.agenda,
    motions,
    raw: document,
  };
}

function parseMotion(
  meetingId: string,
  meetingData: MeetingData,
  motionText: string,
): Motion {
  const trimmedMotionText = motionText.trim();

  const titleSplit = trimmedMotionText.indexOf("\n");

  const title =
    titleSplit > 0
      ? trimmedMotionText.substring(0, titleSplit)
      : trimmedMotionText;
  const body = titleSplit > 0 ? trimmedMotionText.substring(titleSplit) : "";

  const sanitizedTitle = title
    .replaceAll(/[\-–—]\s.*/g, "") // remove movers, seconders
    .replaceAll(/[_\\\*\-–—,]/g, "")
    .trim();

  const motionNumberMatch = title.match(/\d+\.\d+/);
  if (!motionNumberMatch || !motionNumberMatch[0]) {
    throw new Error(
      `Could not find motion number for motion: ${title} (${trimmedMotionText}), found ${motionNumberMatch}`,
    );
  }
  const motionId = `${meetingId}:${motionNumberMatch[0]}`;

  return new Motion({
    id: motionId,
    meetingId,
    motionNumber: motionNumberMatch[0],
    date: meetingData.date,
    title: sanitizedTitle,
    body,
  });
}
