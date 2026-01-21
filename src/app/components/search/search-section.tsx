"use client";

import { useEffect, useState } from "react";
import { PaginatedMotionsResponse } from "../../api/motions/route";
import { SearchResult } from "./search-result";
import "./search-section.scss";

export const SearchSection: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<PaginatedMotionsResponse>();

  // @todo figure out useQuery again :(
  useEffect(() => {
    const motionsURL = new URL("/api/motions", window.location.origin);
    if (query) {
      motionsURL.searchParams.append("query", query);
    }

    fetch(motionsURL)
      .then((res) => res.json())
      .then((res) => setResults(res));
  }, [query]);

  return (
    <div className="search-container">
      <input
        className="search-input"
        placeholder="search through all MathSoc motions"
        onChange={(evt) => setQuery(evt.target.value)}
      />
      <div className="search-results">
        {results?.data.motions.map((motion) => (
          <SearchResult key={motion.id} motion={motion} />
        ))}
      </div>
    </div>
  );
};
