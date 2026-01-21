import { colours } from "@/app/colours";
import { Motion, MotionFeature } from "../../../../index/types/motion";
import { Organization } from "../../../../index/types/motion-features";
import { Markdown } from "../markdown";
import "./search-result.scss";

export const SearchResult: React.FC<{ motion: Motion }> = ({ motion }) => {
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
