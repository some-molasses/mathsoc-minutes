export type MeetingCategory =
  | "boardMeetings"
  | "councilMeetings"
  | "generalMeetings";

export interface MeetingData {
  date: string;
  type?: string;
  agenda?: string;
  minutes?: string;
}
