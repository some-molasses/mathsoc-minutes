"use client";

import { useEffect, useState } from "react";
import { Motion, MotionFeature } from "../../../index/types/motion";
import { Organization } from "../../../index/types/motion-features";
import { colours } from "../colours";
import { Markdown } from "./markdown";
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
      <div className="result-body">
        <Markdown contents={motion.body} />
      </div>
      <div className="result-bottom-row">
        <div className="result-features">
          {motion.features.map((feature) => {
            if (feature.values === undefined) {
              console.error(feature);
              throw new Error();
            }

            return feature.values.map((featureValue) => (
              <SearchResultFeature
                feature={feature}
                value={featureValue}
                key={feature.type + featureValue}
              />
            ));
          })}
        </div>
        <div className="result-id">{motion.id}</div>
      </div>
    </div>
  );
};

const SearchResultFeature: React.FC<{
  feature: MotionFeature;
  value: string;
}> = ({ feature, value }) => {
  const getDotColor = () => {
    switch (feature.type) {
      case "organization": {
        switch (value as Organization) {
          case "ActSci Club":
            return colours.organizations.actSci;
          case "CSC":
            return colours.organizations.csc;
          case "DSC":
            return colours.organizations.dsc;
          case "DDC":
            return colours.organizations.ddc;
          case "FARMSA":
            return colours.organizations.farmsa;
          case "MathSoc Cartoons":
            return colours.organizations.mathsocCartoons;
          case "mathNEWS":
            return colours.organizations.mathNEWS;
          case "PMC":
            return colours.organizations.pmc;
          case "Stats Club":
            return colours.organizations.stats;
        }
      }
    }
  };

  return (
    <div className="result-feature">
      <div className="feature-dot" style={{ backgroundColor: getDotColor() }} />
      <span className="feature-name">{value}</span>
    </div>
  );
};
