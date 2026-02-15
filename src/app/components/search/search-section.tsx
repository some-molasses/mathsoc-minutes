"use client";

import { FeaturesListResponse } from "@/app/api/features/route";
import { PaginatedMotionsResponse, SortOption } from "@/app/api/motions/route";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Centered, Column, Row } from "./layout";
import { SearchResult } from "./search-result";
import "./search-section.scss";
import {
  MotionFeatureFilter,
  SearchFiltersContext,
  useSearchFilters,
} from "./search-filters";
import { useState } from "react";
import { FeatureType } from "../../../../index/types/motion";
import { useSearchMotions } from "./retrieval";

export type SearchQueryParams = Partial<{
  query: string;
  sort: SortOption;
  page: string;
}>;

export const SearchSection = () => {
  const [filters, setFiltersArray] = useState<MotionFeatureFilter[]>([]);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParams = (toSet: SearchQueryParams) => {
    const newParams = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(toSet)) {
      newParams.set(key, value);
    }
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  return (
    <SearchFiltersContext.Provider
      value={{
        filters,
        setFilters: (value) => {
          setFiltersArray(value);
          setParams({ page: "0" });
        },
      }}
    >
      <SearchSectionGuts setParams={setParams} />
    </SearchFiltersContext.Provider>
  );
};

const SearchSectionGuts: React.FC<{
  setParams: (newParams: SearchQueryParams) => void;
}> = ({ setParams }) => {
  const searchParams = useSearchParams();

  const query = searchParams.get("query");
  const sort = searchParams.get("sort");
  const pageIndex = searchParams.get("page") ?? "0";

  const { motions, page } = useSearchMotions(query, sort, pageIndex);

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
        page={page}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
      />
      <Row>
        <Filters />
        <Column>
          <div className="search-results">
            {motions?.map((motion) => (
              <SearchResult key={motion.id} motion={motion} />
            ))}
          </div>
          <Centered>
            <Pagination
              page={page}
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
  page?: PaginatedMotionsResponse["page"];
}> = ({ onSelect, onNextPage, onPreviousPage, page }) => {
  return (
    <Row className="search-top-bar">
      <Pagination page={page} onNext={onNextPage} onPrevious={onPreviousPage} />
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
  page?: PaginatedMotionsResponse["page"];
  onNext: () => void;
  onPrevious: () => void;
}> = ({ page, onNext, onPrevious }) => {
  if (!page) {
    return (
      <Row className="pagination-row">
        <span className="pagination-label">loading...</span>
      </Row>
    );
  }

  return (
    <Row className="pagination-row">
      <span className="pagination-label">
        {page.totalResults} results, page {page.index + 1} of {page.pageCount}
      </span>
      <button
        className="pagination-button"
        onClick={onPrevious}
        disabled={page.index == 0}
      >
        previous page
      </button>
      <button
        className="pagination-button"
        onClick={onNext}
        disabled={page.index >= page.pageCount - 1}
      >
        next page
      </button>
      <span className="pagination-label faint"></span>
    </Row>
  );
};

const Filters: React.FC = () => {
  const { data: allFeatures } = useQuery<FeaturesListResponse>({
    queryKey: ["/api/features"],
    queryFn: async () => {
      return fetch("/api/features").then((res) => res.json());
    },
  });

  return (
    <Column className="filters-menu">
      {allFeatures
        ? Object.entries(allFeatures).map(([featureType, featureMetadata]) => {
            return (
              <FeatureSection
                key={featureType}
                label={featureMetadata.label}
                type={featureType as FeatureType}
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
  type: FeatureType;
  featureValues: string[];
}> = ({ label, type, featureValues }) => {
  const { isFeatureFiltered, toggleFilter } = useSearchFilters();

  return (
    <Column key={type} className="feature-section">
      <h3 className="feature-name">{label}</h3>
      <Column className="feature-options">
        {featureValues.map((featureValue) => {
          return (
            <Row key={featureValue} className="feature-value-row">
              <button
                className={[
                  "feature-value",
                  isFeatureFiltered(type, featureValue) ? "filter-active" : "",
                ].join(" ")}
                onClick={() => toggleFilter(type, featureValue)}
              >
                {featureValue}
              </button>
            </Row>
          );
        })}
      </Column>
    </Column>
  );
};
