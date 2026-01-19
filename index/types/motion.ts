import { generateTags as generateFeatures } from "./motion-features";

export interface MotionFeature {
  type: string;
  value: string | string[];
}

export class Motion {
  readonly id!: string;
  readonly meetingId!: string;
  readonly motionNumber!: string;
  readonly date!: string;
  readonly title!: string;
  readonly body!: string;
  features: MotionFeature[] = [];

  constructor(params: {
    id: string;
    meetingId: string;
    motionNumber: string;
    date: string;
    title: string;
    body: string;
  }) {
    Object.assign(this, params);
    this.features = generateFeatures(this);
  }

  get textContents(): string {
    return this.title + "\n" + this.body;
  }

  toJSON() {
    return {
      ...this,
      features: Array.from(this.features),
    };
  }
}
