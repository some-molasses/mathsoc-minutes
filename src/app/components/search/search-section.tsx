"use client";

import { PaginatedMotionsResponse, SortOption } from "@/app/api/motions/route";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Row } from "./layout";
import { SearchResult } from "./search-result";
import "./search-section.scss";

export type SearchQueryParams = Partial<{
  query: string;
  sort: SortOption;
}>;

export const SearchSection: React.FC = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const query = searchParams.get("query");
  const sort = searchParams.get("sort");

  const setParams = (toSet: SearchQueryParams) => {
    const newParams = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(toSet)) {
      newParams.set(key, value);
    }
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  const { data: results } = useQuery<PaginatedMotionsResponse>({
    queryKey: ["/api/motions", query],
    queryFn: async () => {
      const motionsURL = new URL("/api/motions", window.location.origin);
      if (query) {
        motionsURL.searchParams.append("query", query);
      }
      if (sort) {
        motionsURL.searchParams.append("sort", sort);
      }
      return fetch(motionsURL).then((res) => res.json());
    },
  });

  return (
    <div className="search-container">
      <input
        className="search-input"
        placeholder="search through all MathSoc motions"
        onKeyDown={(evt) =>
          evt.key === "Enter"
            ? setParams({ query: evt.currentTarget.value })
            : null
        }
      />
      <TopBar onSelect={(sort) => setParams({ sort })} />
      <div className="search-results">
        {results?.data.motions.map((motion) => (
          <SearchResult key={motion.id} motion={motion} />
        ))}
      </div>
    </div>
  );
};

const TopBar: React.FC<{ onSelect: (value: SortOption) => void }> = ({
  onSelect,
}) => {
  return (
    <Row className="search-top-bar">
      <Row className="sort-button">
        <select
          name="sort"
          onChange={(evt) => {
            onSelect(evt.currentTarget.value as SortOption);
          }}
        >
          <option value="most-relevant">most relevant</option>
          <option value="oldest">oldest first</option>
          <option value="newest">newest first</option>
        </select>
      </Row>
    </Row>
  );
};
