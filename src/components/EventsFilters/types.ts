export type EventsFiltersValue = {
  team: string;
  period: string;
};

export type EventsFiltersProps = {
  value: EventsFiltersValue;
  onChange: (value: EventsFiltersValue) => void;
};
