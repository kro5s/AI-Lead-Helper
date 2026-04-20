export type AnalyticsFiltersValue = {
  team: string;
  period: string;
};

export type AnalyticsFiltersProps = {
  value: AnalyticsFiltersValue;
  onChange: (value: AnalyticsFiltersValue) => void;
};
