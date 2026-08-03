export const seasons = [
  {
    id: "spring",
    name: "Spring",
    start: { month: 1, day: 15 },
    end: { month: 3, day: 30 },
    subtitle: "Fresh spiritual essentials for renewal and new beginnings",
  },
  {
    id: "summer",
    name: "Summer",
    start: { month: 4, day: 1 },
    end: { month: 5, day: 30 },
    subtitle: "Cooling, balancing picks for the warm season",
  },
  {
    id: "monsoon",
    name: "Monsoon",
    start: { month: 6, day: 1 },
    end: { month: 8, day: 15 },
    subtitle: "Seasonal remedies and pooja essentials for rainy days",
  },
  {
    id: "autumn",
    name: "Autumn",
    start: { month: 8, day: 16 },
    end: { month: 10, day: 15 },
    subtitle: "Auspicious picks for the festive turn of the year",
  },
  {
    id: "winter",
    name: "Winter",
    start: { month: 10, day: 16 },
    end: { month: 1, day: 14 },
    subtitle: "Warm, grounding essentials for winter rituals",
  },
];

export const isDateInWindow = (today, start, end) => {
  const month = today.getMonth();
  const day = today.getDate();

  if (start.month === end.month) {
    return month === start.month && day >= start.day && day <= end.day;
  }

  if (start.month < end.month) {
    if (month === start.month) return day >= start.day;
    if (month === end.month) return day <= end.day;
    return month > start.month && month < end.month;
  }

  if (month === start.month) return day >= start.day;
  if (month === end.month) return day <= end.day;
  return month > start.month || month < end.month;
};

export function getActiveSeason(today = new Date(), customSeasons = []) {
  return [...customSeasons, ...seasons].find((season) => isDateInWindow(today, season.start, season.end)) || null;
}
