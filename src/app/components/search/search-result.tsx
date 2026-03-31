import { colours } from "@/app/colours";
import Link from "next/link";
import {
  FeatureType,
  FeatureValue,
  Organization,
} from "../../../../index/types/motion";
import { Markdown } from "../markdown";
import { EnrichedMotion } from "./retrieval";
import { useSearchFilters } from "./search-filters";
import "./search-result.scss";

export const SearchResult: React.FC<{ motion: EnrichedMotion }> = ({
  motion,
}) => {
  const featureList: { type: FeatureType; values: FeatureValue[] }[] = [
    { type: "organizations", values: motion.features.organizations },
    { type: "body", values: motion.features.body },
    { type: "monetaryRelation", values: motion.features.monetaryRelation },
  ];

  return (
    <div className="search-result">
      <div className="result-title-section">
        <h2 className="result-title">{motion.title}</h2>
        <div className="result-metadata">
          <div className="result-date">
            {new Date(motion.date).toLocaleDateString("en-CA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
      <div className="result-body">
        <Markdown contents={motion.body} />
      </div>
      <div className="result-bottom-row">
        <div className="result-features">
          {featureList.map((feature) => {
            if (feature.values === undefined) {
              console.error(feature);
              throw new Error();
            }

            return feature.values.map((featureValue) => (
              <SearchResultFeature
                featureType={feature.type}
                value={featureValue}
                key={feature.type + featureValue}
              />
            ));
          })}
        </div>
        <Link href={motion.meeting.url!}>
          <div className="result-id">{motion.id}</div>
        </Link>
      </div>
    </div>
  );
};

const SearchResultFeature: React.FC<{
  featureType: FeatureType;
  value: FeatureValue;
}> = ({ featureType, value }) => {
  const { toggleFilter, isFeatureFiltered } = useSearchFilters();

  const getDotColor = () => {
    switch (featureType) {
      case "organizations": {
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

  const getClassName = () => {
    let className = `result-feature`;
    if (isFeatureFiltered(featureType, value)) {
      className += " filter-active";
    }

    return className;
  };

  return (
    <div
      className={getClassName()}
      onClick={() => toggleFilter(featureType, value)}
    >
      <div
        className={"feature-dot"}
        style={{ backgroundColor: getDotColor() }}
      />
      <span className="feature-name">{value}</span>
    </div>
  );
};
