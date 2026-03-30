import { mathsocFirestore } from "@/app/firebase/firebase-admin";
import { Meeting } from "../../index/parse/parse";

export interface MeetingsResponse {
  meetings: Meeting[];
}

export const retrieveMeetings = async ({
  ids,
}: {
  ids: string[];
}): Promise<MeetingsResponse> => {
  const results: Meeting[] = await mathsocFirestore
    .collection("meetings")
    .where("id", "in", ids)
    .get()
    .then((res) => res.docs.map((doc) => doc.data() as Meeting));

  return { meetings: results };
};
