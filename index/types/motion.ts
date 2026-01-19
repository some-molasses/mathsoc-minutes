export class Motion {
  id!: string;
  meetingId!: string;
  motionNumber!: string;
  date!: string;
  title!: string;
  body!: string;

  constructor(params: {
    id: string;
    meetingId: string;
    motionNumber: string;
    date: string;
    title: string;
    body: string;
  }) {
    Object.assign(this, params);
  }
}
