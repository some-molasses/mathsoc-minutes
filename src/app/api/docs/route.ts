import { councilMeetings } from "@/app/data/council-meetings";

export async function GET() {
  const url = councilMeetings[30].agenda!;

  const minutes = await downloadDriveDocument(url);
  const parsed = await parseMinutes(url, minutes);

  return Response.json({ res: parsed });
}

async function downloadDriveDocument(url: string): Promise<string> {
  const docID = url.match("/d/(.*)/")![1];

  const res = await fetch(
    `https://docs.google.com/document/d/${docID}/export?format=markdown`,
  );

  return await res.text();
}

async function parseMinutes(url: string, document: string) {
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
      .replaceAll(/[\-–—].*/g, "")
      .replaceAll(/[_\\\*\-–—,]/g, "")
      .trim();

    return { title: sanitizedTitle, body };
  });

  return {
    motions,
    url: url,
    raw: document,
  };
}
