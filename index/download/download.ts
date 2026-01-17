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
      downloadDriveDocument(meetingData).then((meetingBody) =>
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
  const title = `${getSourceName(source)}-${date.getFullYear()}-${date.getMonth()}-${date.getDay()}`;

  const directory = path.join(process.cwd(), "output", title);
  if (!existsSync(directory)) {
    await mkdir(directory);
  }

  await writeFile(path.join(directory, "agenda.md"), body);
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
  meetingData: MeetingData,
): Promise<string | null> {
  if (!meetingData.agenda) {
    console.warn(`No agenda for ${meetingData.date}`);
    return null;
  }

  // older documents had inconsistent formatting; hard to parse
  if (new Date(meetingData.date).getFullYear() < 2020) {
    return null;
  }

  const docID = meetingData.agenda.match("/d/(.*)/")![1];

  const res = await fetch(
    `https://docs.google.com/document/d/${docID}/export?format=markdown`,
  );

  return await res.text();
}
