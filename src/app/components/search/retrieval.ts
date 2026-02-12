import {
  PaginatedMotionsRequest,
  PaginatedMotionsResponse,
  SortOption,
} from "@/app/api/motions/route";
import { useQuery } from "@tanstack/react-query";
import { useSearchFilters } from "./search-filters";
import { MeetingsResponse } from "../../../../retrieval/meetings/meeting-retrieval";

export const useSearchMotions = (
  query: string | null,
  sort: string | null,
  pageIndex: string,
) => {
  const { serializedFilters } = useSearchFilters();

  const { data: results } = useQuery<PaginatedMotionsResponse>({
    queryKey: [
      "/api/motions",
      query,
      sort,
      pageIndex,
      JSON.stringify(serializedFilters),
    ],
    queryFn: async () => {
      const motionsURL = new URL("/api/motions", window.location.origin);
      const body: PaginatedMotionsRequest = {
        query,
        sort: sort as SortOption,
        page: { index: parseInt(pageIndex), size: 20 },
        filters: {
          requiredFeatures: serializedFilters,
        },
      };

      return fetch(motionsURL, {
        method: "POST",
        body: JSON.stringify(body),
      }).then((res) => res.json());
    },
  });

  const ids = results?.data.motions.map((motion) => motion.meetingId) ?? [];
  const { data: meetingsArray } = useMeetings(ids);
  const meetings = new Map(
    meetingsArray?.meetings.map((meeting) => [meeting.id, meeting]),
  );

  return { results, meetings };
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
