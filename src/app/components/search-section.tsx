"use client";

import { useEffect, useState } from "react";
import { Motion } from "../../../index/parse/parse";
import "./search-section.scss";

export const SearchSection: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Motion[]>([]);

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
      <div className="search-input">
        <input
          placeholder="search through all MathSoc motions"
          onChange={(evt) => setQuery(evt.target.value)}
        />
      </div>
      <div className="search-results">
        {results.map((motion) => (
          <SearchResult key={motion.id} motion={motion} />
        ))}
      </div>
    </div>
  );
};

const SearchResult: React.FC<{ motion: Motion }> = ({ motion }) => {
  return (
    <div className="search-result">
      <div className="result-title-section">
        <h2 className="result-title">{motion.title}</h2>
        <div className="result-metadata">
          <div className="result-date">{motion.date}</div>
        </div>
      </div>
      <div className="result-body">{motion.body}</div>
      <div className="result-id">{motion.id}</div>
    </div>
  );
};
