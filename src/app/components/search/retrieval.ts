import {
  PaginatedMotionsRequest,
  PaginatedMotionsResponse,
  SortOption,
} from "@/app/api/motions/route";
import { useQuery } from "@tanstack/react-query";
import { Meeting } from "../../../../index/parse/parse";
import { Motion } from "../../../../index/types/motion";
import { MeetingsResponse } from "../../../../retrieval/meetings/meeting-retrieval";
import { useSearchFilters } from "./search-filters";

export type EnrichedMotion = Omit<Omit<Motion, "toJSON">, "textContents"> & {
  meeting: Meeting;
};

export const useSearchMotions = (
  query: string | null,
  sort: string | null,
  pageIndex: string,
) => {
  const { filters } = useSearchFilters();

  const { data: motionResults } = useQuery<PaginatedMotionsResponse>({
    queryKey: ["/api/motions", query, sort, pageIndex, JSON.stringify(filters)],
    queryFn: async () => {
      const motionsURL = new URL("/api/motions", window.location.origin);
      const body: PaginatedMotionsRequest = {
        query,
        sort: sort as SortOption,
        page: { index: parseInt(pageIndex), size: 20 },
        filters: {
          requiredFeatures: filters,
        },
      };

      return fetch(motionsURL, {
        method: "POST",
        body: JSON.stringify(body),
      }).then((res) => res.json());
    },
  });

  const ids =
    motionResults?.data.motions.map((motion) => motion.meetingId) ?? [];
  const { data: meetingsArray } = useMeetings(ids);

  const enrichedMotions: EnrichedMotion[] = enrichMotions(
    motionResults?.data.motions,
    meetingsArray?.meetings,
  );

  return { motions: enrichedMotions, page: motionResults?.page };
};

const enrichMotions = (
  motions?: Motion[],
  meetings?: Meeting[],
): EnrichedMotion[] => {
  if (!motions || !meetings) {
    return [];
  }

  const meetingsMap = new Map(
    meetings?.map((meeting) => [meeting.id, meeting]),
  );

  return (
    motions.map((motion) => {
      const meeting = meetingsMap.get(motion.meetingId);
      if (!meeting) {
        throw new Error(`no meeting for ${motion.id}?`);
      }

      return {
        ...motion,
        isPreamble: motion.isPreamble,
        meeting,
      };
    }) ?? []
  );
};

export const useMeetings = (ids: string[]) => {
  const { data } = useQuery<MeetingsResponse>({
    queryKey: ["/api/meetings/list", JSON.stringify(ids)],
    queryFn: async () => {
      if (ids.length === 0) {
        return { meetings: [] };
      }

      const url = new URL("/api/meetings/list", window.location.origin);
      const body = { ids };

      return fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
      }).then((res) => res.json());
    },
  });

  return { data };
};
