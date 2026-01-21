"use client";

import { PaginatedMotionsResponse } from "@/app/api/motions/route";
import { faUpDown } from "@fortawesome/free-solid-svg-icons/faUpDown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Row } from "./layout";
import { SearchResult } from "./search-result";
import "./search-section.scss";

export const SearchSection: React.FC = () => {
  const [query, setQuery] = useState<string>("");

  const { data: results } = useQuery<PaginatedMotionsResponse>({
    queryKey: ["/api/motions"],
    queryFn: async () => {
      const motionsURL = new URL("/api/motions", window.location.origin);
      if (query) {
        motionsURL.searchParams.append("query", query);
      }

      return fetch(motionsURL).then((res) => res.json());
    },
  });

  return (
    <div className="search-container">
      <input
        className="search-input"
        placeholder="search through all MathSoc motions"
        onChange={(evt) => setQuery(evt.target.value)}
      />
      <TopBar />
      <div className="search-results">
        {results?.data.motions.map((motion) => (
          <SearchResult key={motion.id} motion={motion} />
        ))}
      </div>
    </div>
  );
};

const TopBar: React.FC = ({}) => {
  return (
    <Row className="search-top-bar">
      <Row className="sort-button">
        <span>sort</span>
        <FontAwesomeIcon icon={faUpDown} />
      </Row>
    </Row>
  );
};
