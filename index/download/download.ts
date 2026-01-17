import { meetings } from "@/app/data/meetings";
import { MeetingCategory, MeetingData } from "@/app/data/types";
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export async function downloadAllMeetings() {
  const meetingCategories: (keyof typeof meetings)[] = [
    "boardMeetings",
    "councilMeetings",
    "generalMeetings",
  ];

  await Promise.all(
    meetingCategories.map((category) => writeMeetings(category)),
  );
}

async function writeMeetings(category: MeetingCategory): Promise<void> {
  const meetingsOfCategory: MeetingData[] = Object.values(meetings[category]);
  await Promise.all(
    meetingsOfCategory.map((meetingData) =>
      downloadDriveDocument(category, meetingData).then((meetingBody) =>
        writeMeeting(category, meetingData, meetingBody),
      ),
    ),
  );
}

async function writeMeeting(
  source: keyof typeof meetings,
  data: MeetingData,
  body: string | null,
) {
  if (!body) {
    return;
  }

  const date = new Date(data.date);
  const title = `${getSourceName(source)}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  const directory = path.join(process.cwd(), "output", title);
  if (!existsSync(directory)) {
    await mkdir(directory, { recursive: true });
  }

  await writeFile(path.join(directory, "agenda.md"), body);
  await writeFile(path.join(directory, "meta.json"), JSON.stringify(data));
}

function getSourceName(source: keyof typeof meetings) {
  switch (source) {
    case "councilMeetings":
      return "council";
    case "boardMeetings":
      return "board";
    case "generalMeetings":
      return "gm";
  }
}

/**
 * @todo download minutes, not just agenda
 */
async function downloadDriveDocument(
  category: MeetingCategory,
  meetingData: MeetingData,
): Promise<string | null> {
  // older documents had inconsistent formatting; hard to parse
  if (new Date(meetingData.date).getFullYear() < 2022) {
    return null;
  }

  if (!meetingData.agenda) {
    console.warn(`No ${category} agenda for ${meetingData.date}`);
    return null;
  }

  const docID = meetingData.agenda.match("/d/(.*)/")![1];

  const res = await fetch(
    `https://docs.google.com/document/d/${docID}/export?format=markdown`,
  );

  const text = await res.text();
  if (text.startsWith("<!DOCTYPE html>")) {
    console.warn(
      `Failed to download ${category} ${meetingData.date}; denied by Google`,
    );

    return null;
  } else {
    console.info(`Successfully downloaded ${category} ${meetingData.date}`);
  }

  return text;
}
