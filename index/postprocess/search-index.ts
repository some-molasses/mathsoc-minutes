import { mathsocFirestore } from "@/app/firebase/firebase-admin";
import { writeFile } from "fs/promises";
import lunr from "lunr";
import { getMotions, getSearchIndexPath, shouldWriteToFirebase } from "../util";

const INDEX_STRSPLIT_INCREMENT = 500000;

async function writeResults(index: lunr.Index) {
  if (!shouldWriteToFirebase()) {
    await writeFile(getSearchIndexPath(), JSON.stringify(index));
    return;
  }

  const indexString = JSON.stringify(index);
  const indexParts: { chunk: string; index: number }[] = [];
  for (let i = 0; i <= indexString.length; i += INDEX_STRSPLIT_INCREMENT) {
    indexParts.push({
      index: i / INDEX_STRSPLIT_INCREMENT,
      chunk: indexString.substring(i, i + INDEX_STRSPLIT_INCREMENT),
    });
  }

  await mathsocFirestore.recursiveDelete(mathsocFirestore.collection("index"));
  await Promise.all(
    indexParts.map((part) =>
      mathsocFirestore.collection("index").doc(part.index.toString()).set(part),
    ),
  );
}

export async function writeIndex() {
  const motions = await getMotions();
  const motionsList = Object.values(motions);

  const index = lunr(function () {
    this.ref("id");
    this.field("title");
    this.field("body");

    motionsList.forEach((motion) => {
      this.add(motion);
    });
  });

  await writeResults(index);
}
