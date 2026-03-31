import { createContext, useContext } from "react";
import {
  FeatureType,
  FeatureValue,
  MotionFeatures,
} from "../../../../index/types/motion";

export const SearchFiltersContext = createContext<{
  filters: Partial<MotionFeatures>;
  setFilters: (filters: Partial<MotionFeatures>) => void;
}>({ filters: {}, setFilters: () => {} });

export interface MotionFeatureFilter {
  type: FeatureType;
  values: Set<FeatureValue>;
}

export interface SerializedMotionFeatureFilter {
  type: FeatureType;
  values: FeatureValue[];
}

export const useSearchFilters = () => {
  const { filters, setFilters } = useContext(SearchFiltersContext);

  const isFeatureFiltered = (
    type: FeatureType,
    value: FeatureValue,
  ): boolean => {
    const featureFilter = filters[type];
    if (!featureFilter) {
      return false;
    }

    return (featureFilter as string[]).includes(value);
  };

  const addFilter = (type: FeatureType, value: FeatureValue): void => {
    const existingFilterForType = new Set(filters[type]) ?? new Set();
    existingFilterForType.add(value);

    const override: Partial<MotionFeatures> = {
      [type]: [...existingFilterForType],
    };

    setFilters(Object.assign(filters, override));
  };

  const removeFilter = (type: FeatureType, value: FeatureValue) => {
    if (!filters[type]) {
      throw new Error("Cannot remove filter; no filter exists");
    }

    const existingFilterForType = new Set(filters[type]) ?? new Set();
    existingFilterForType.delete(value);

    const override: Partial<MotionFeatures> = {
      [type]: [...existingFilterForType],
    };

    setFilters(Object.assign(filters, override));
  };

  const toggleFilter = (type: FeatureType, value: FeatureValue) => {
    if (isFeatureFiltered(type, value)) {
      removeFilter(type, value);
    } else {
      addFilter(type, value);
    }
  };

  return {
    filters,
    addFilter,
    removeFilter,
    toggleFilter,
    isFeatureFiltered,
  };
};
