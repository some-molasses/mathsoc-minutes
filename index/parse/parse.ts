import { MeetingData } from "@/app/data/types";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { getMeetingsSubdirectories } from "../util";

export type Motion = {
  title: string;
  body: string;
};

export type ParsedMeeting = {
  motions: Motion[];
  url?: string;
  raw: string;
};

export async function parseAllMeetings() {
  const meetingPaths = await getPaths();

  for (const meeting of meetingPaths) {
    const meta: MeetingData = await readFile(meeting.meta).then((res) =>
      JSON.parse(res.toString()),
    );
    const agenda = await readFile(meeting.agenda).then((res) => res.toString());
    const parsed = parseMinutes(meta, agenda);
    await writeFile(meeting.parsed, JSON.stringify(parsed, null, 2));
  }
}

async function getPaths(): Promise<
  { agenda: string; meta: string; parsed: string }[]
> {
  const subdirectories = await getMeetingsSubdirectories();
  return subdirectories.map(({ path: subdirectoryPath }) => {
    return {
      agenda: path.join(subdirectoryPath, "agenda.md"),
      meta: path.join(subdirectoryPath, "meta.json"),
      parsed: path.join(subdirectoryPath, "parsed.json"),
    };
  });
}

function parseMinutes(data: MeetingData, document: string): ParsedMeeting {
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

  const motions = motionBlobs.map((blob) => {
    const titleSplit = blob.indexOf("\n");

    const title = blob.substring(0, titleSplit);
    const body = blob.substring(titleSplit);

    const sanitizedTitle = title
      .replaceAll(/[\-–—]\s.*/g, "") // remove movers, seconders
      .replaceAll(/[_\\\*\-–—,]/g, "")
      .trim();

    return { title: sanitizedTitle, body };
  });

  return {
    motions,
    url: data.agenda,
    raw: document,
  };
}
