import { createContext, useContext } from "react";
import { FeatureType } from "../../../../index/types/motion";

export const SearchFiltersContext = createContext<{
  filters: MotionFeatureFilter[];
  setFilters: (filters: MotionFeatureFilter[]) => void;
}>({ filters: [], setFilters: () => {} });

export interface MotionFeatureFilter {
  type: FeatureType;
  values: Set<string>;
}

export interface SerializedMotionFeatureFilter {
  type: FeatureType;
  values: string[];
}

export const useSearchFilters = () => {
  const { filters, setFilters } = useContext(SearchFiltersContext);

  const getFeatureFilter = (
    featureType: FeatureType,
  ): MotionFeatureFilter | undefined => {
    return filters.find((f) => f.type === featureType);
  };

  const isFeatureFiltered = (
    featureType: FeatureType,
    featureValue: string,
  ): boolean => {
    const featureFilter = getFeatureFilter(featureType);
    if (!featureFilter) {
      return false;
    }

    return featureFilter.values.has(featureValue);
  };

  const addFilter = (type: FeatureType, value: string): void => {
    const existingFilter = getFeatureFilter(type);

    if (existingFilter) {
      existingFilter.values.add(value);
      setFilters([...filters]); // invalidate cache
    } else {
      setFilters([...filters, { type, values: new Set([value]) }]);
    }
  };

  const removeFilter = (type: FeatureType, value: string) => {
    const existingFilter = getFeatureFilter(type);

    if (!existingFilter) {
      return;
    }

    existingFilter.values.delete(value);

    // invalidate cached value
    setFilters([...filters]);
  };

  const toggleFilter = (type: FeatureType, value: string) => {
    if (isFeatureFiltered(type, value)) {
      removeFilter(type, value);
    } else {
      addFilter(type, value);
    }
  };

  const serializedFilters = filters.map(({ type, values }) => ({
    type,
    values: Array.from(values),
  }));

  return {
    filters,
    serializedFilters,
    addFilter,
    removeFilter,
    toggleFilter,
    isFeatureFiltered,
  };
};
