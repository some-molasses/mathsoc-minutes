"use client";

import { FeaturesListResponse } from "@/app/api/features/route";
import { PaginatedMotionsResponse, SortOption } from "@/app/api/motions/route";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Centered, Column, Row } from "./layout";
import { SearchResult } from "./search-result";
import "./search-section.scss";

export type SearchQueryParams = Partial<{
  query: string;
  sort: SortOption;
  page: string;
}>;

export const SearchSection: React.FC = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const query = searchParams.get("query");
  const sort = searchParams.get("sort");
  const pageIndex = searchParams.get("page") ?? "0";

  const setParams = (toSet: SearchQueryParams) => {
    const newParams = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(toSet)) {
      newParams.set(key, value);
    }
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  const { data: results } = useQuery<PaginatedMotionsResponse>({
    queryKey: ["/api/motions", query, sort, pageIndex],
    queryFn: async () => {
      const motionsURL = new URL("/api/motions", window.location.origin);
      if (query) {
        motionsURL.searchParams.append("query", query);
      }
      if (sort) {
        motionsURL.searchParams.append("sort", sort);
      }
      motionsURL.searchParams.append("pageIndex", pageIndex);
      return fetch(motionsURL).then((res) => res.json());
    },
  });

  const onNextPage = () =>
    setParams({
      page: (parseInt(pageIndex) + 1).toString(),
    });

  const onPreviousPage = () =>
    setParams({
      page: (parseInt(pageIndex) - 1).toString(),
    });

  return (
    <div className="search-container">
      <input
        className="search-input"
        placeholder="search through all MathSoc motions"
        onKeyDown={(evt) =>
          evt.key === "Enter"
            ? setParams({ query: evt.currentTarget.value, page: "0" })
            : null
        }
        defaultValue={query ?? ""}
      />
      <TopBar
        onSelect={(sort) => setParams({ sort })}
        data={results}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
      />
      <Row>
        <Filters onFiltersChange={() => {}} />
        <Column>
          <div className="search-results">
            {results?.data.motions.map((motion) => (
              <SearchResult key={motion.id} motion={motion} />
            ))}
          </div>
          <Centered>
            <Pagination
              data={results}
              onNext={onNextPage}
              onPrevious={onPreviousPage}
            />
          </Centered>
        </Column>
      </Row>
    </div>
  );
};

const TopBar: React.FC<{
  onSelect: (value: SortOption) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  data?: PaginatedMotionsResponse;
}> = ({ onSelect, onNextPage, onPreviousPage, data }) => {
  return (
    <Row className="search-top-bar">
      <Pagination data={data} onNext={onNextPage} onPrevious={onPreviousPage} />
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

const Pagination: React.FC<{
  data?: PaginatedMotionsResponse;
  onNext: () => void;
  onPrevious: () => void;
}> = ({ data, onNext, onPrevious }) => {
  if (!data?.page) {
    return <div></div>;
  }

  return (
    <Row className="pagination-row">
      <span className="pagination-label">
        page {data.page.index + 1} of {data.page.count}
      </span>
      <button
        className="pagination-button"
        onClick={onPrevious}
        disabled={data.page.index == 0}
      >
        previous page
      </button>
      <button
        className="pagination-button"
        onClick={onNext}
        disabled={data.page.index >= data.page.count - 1}
      >
        next page
      </button>
    </Row>
  );
};

const Filters: React.FC<{ onFiltersChange: () => void }> = (
  {
    // onFiltersChange,
  },
) => {
  const { data: features } = useQuery<FeaturesListResponse>({
    queryKey: ["/api/features"],
    queryFn: async () => {
      return fetch("/api/features").then((res) => res.json());
    },
  });

  return (
    <Column className="filters-menu">
      {features
        ? Object.entries(features).map(([featureName, featureMetadata]) => {
            return (
              <FeatureSection
                key={featureName}
                label={featureMetadata.label}
                featureName={featureName}
                featureValues={featureMetadata.values}
              />
            );
          })
        : null}
    </Column>
  );
};

const FeatureSection: React.FC<{
  label: string;
  featureName: string;
  featureValues: string[];
}> = ({ label, featureName, featureValues }) => {
  return (
    <Column key={featureName} className="feature-section">
      <h3 className="feature-name">{label}</h3>
      <Column className="feature-options">
        {featureValues.map((featureValue) => {
          return (
            <Row key={featureValue} className="feature-value-row">
              <button className="feature-value">{featureValue}</button>
            </Row>
          );
        })}
      </Column>
    </Column>
  );
};
