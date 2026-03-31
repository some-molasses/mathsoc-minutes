import {
  MeetingBody,
  MonetaryRelation,
  Motion,
  MotionFeatures,
  Organization,
} from "./motion";

export function generateTags(motion: Motion): MotionFeatures {
  return {
    organizations: [...tagOrganizations(motion)],
    body: [tagMeetingBody(motion)],
    monetaryRelation: [tagIsMonetary(motion)],
  };
}

function tagMeetingBody(motion: Motion): MeetingBody {
  if (motion.meetingId.includes("board")) {
    return "Board";
  }

  if (motion.meetingId.includes("council")) {
    return "Council";
  }

  return "General meeting";
}

function tagIsMonetary(motion: Motion): MonetaryRelation {
  return motion.textContents.includes("$") ? "Monetary" : "Non-monetary";
}

function tagOrganizations(motion: Motion): Set<Organization> {
  const termsPerOrganization = Object.keys(
    ORGANIZATION_TERMS,
  ) as Organization[];
  const tags = new Set<Organization>();

  for (const organization of termsPerOrganization) {
    if (motionIncludesOrganization(motion, organization)) {
      tags.add(organization);
      continue;
    }
  }

  return tags;
}

function motionIncludesOrganization(
  motion: Motion,
  organization: Organization,
): boolean {
  const terms = ORGANIZATION_TERMS[organization];
  for (const term of terms) {
    if (motion.textContents.includes(term)) {
      return true;
    }
  }

  return false;
}

const ORGANIZATION_TERMS: Record<Organization, string[]> = {
  CSC: ["CSC", "Computer Science Club"],
  PMC: [
    "PMC",
    "AMC",
    "PMAMCO",
    "PMAMC&O",
    "Pure Math Club",
    "Applied Math Club",
    "Combinatorics & Optimization Club",
  ],
  DDC: ["DDC", "Double degree club"],
  DSC: ["DSC", "Data science club"],
  mathNEWS: ["mathNEWS"],
  FARMSA: [
    "FARMSA",
    "Financial Analysis or Risk Management Student Association",
  ],
  "Stats Club": ["Stats Club", "Statistics Club"],
  "ActSci Club": ["ActSci Club", "Actuarial Science Club"],
  "MathSoc Cartoons": ["MathSoc Cartoons"],
};
