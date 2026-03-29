import { MeetingData } from "@/app/data/types";
import { mathsocFirestore } from "@/app/firebase/firebase-admin";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { Motion } from "../types/motion";
import { getMeetingsSubdirectories, shouldWriteToFirebase } from "../util";

export type Meeting = {
  id: string;
  date: string;
  motions: Motion[];
  url?: string;
};

export type ParsedMeetingDetail = Meeting & {
  raw: string;
};

async function clearExistingMotionData() {
  await mathsocFirestore.recursiveDelete(
    mathsocFirestore.collection("motions"),
  );
  await mathsocFirestore.recursiveDelete(
    mathsocFirestore.collection("meetings"),
  );
}

export async function parseAllMeetings() {
  const meetingPaths = await getPaths();

  if (shouldWriteToFirebase()) {
    await clearExistingMotionData();
  }

  await Promise.all(
    meetingPaths.map(async (meetingPath) => {
      const meta: MeetingData = await readFile(meetingPath.meta).then((res) =>
        JSON.parse(res.toString()),
      );
      const agenda = await readFile(meetingPath.agenda).then((res) =>
        res.toString(),
      );
      const meeting = parseMeeting(meetingPath.id, meta, agenda);

      if (shouldWriteToFirebase()) {
        await mathsocFirestore.collection("meetings").doc(meeting.id).set({
          id: meeting.id,
          date: meeting.date,
          url: meeting.url,
        });

        await Promise.all(
          meeting.motions.map(async (motion) => {
            await mathsocFirestore
              .collection("motions")
              .doc(motion.id)
              .set(motion.toJSON());
            console.log(`Added ${motion.id} to Firebase`);
          }),
        );
      } else {
        await writeFile(meetingPath.parsed, JSON.stringify(meeting, null, 2));
      }
    }),
  );
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

function parseMeeting(
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
