export const festivals = [
  {
    id: "makar-sankranti",
    name: "Makar Sankranti",
    emoji: "Sankranti",
    start: { month: 0, day: 10 },
    end: { month: 0, day: 15 },
    countdownFrom: 7,
    banner: "Makar Sankranti Special - Til-Gud gifting kits live now",
    gradient: "from-amber-500 via-orange-500 to-yellow-400",
    accent: "#E58A1F",
  },
  {
    id: "pongal",
    name: "Pongal",
    emoji: "Pongal",
    start: { month: 0, day: 13 },
    end: { month: 0, day: 16 },
    countdownFrom: 7,
    banner: "Pongal - Auspicious home, harvest and gifting picks",
    gradient: "from-yellow-500 via-lime-500 to-emerald-500",
    accent: "#65A30D",
  },
  {
    id: "maha-shivaratri",
    name: "Maha Shivaratri",
    emoji: "Om",
    start: { month: 1, day: 14 },
    end: { month: 1, day: 18 },
    countdownFrom: 7,
    banner: "Maha Shivaratri - Rudraksha and Shiva pooja kits live",
    gradient: "from-slate-800 via-indigo-700 to-purple-700",
    accent: "#4338CA",
  },
  {
    id: "holi",
    name: "Holi",
    emoji: "Holi",
    start: { month: 2, day: 8 },
    end: { month: 2, day: 14 },
    countdownFrom: 10,
    banner: "Holi Hai! Rangoli colours and pooja kits at festive prices",
    gradient: "from-pink-500 via-fuchsia-500 to-yellow-400",
    accent: "#D6336C",
  },
  {
    id: "raksha-bandhan",
    name: "Raksha Bandhan",
    emoji: "Rakhi",
    start: { month: 7, day: 12 },
    end: { month: 7, day: 19 },
    countdownFrom: 10,
    banner: "Raksha Bandhan - Bracelets and gifting bundles live",
    gradient: "from-rose-500 via-pink-500 to-amber-400",
    accent: "#C2185B",
  },
  {
    id: "onam",
    name: "Onam",
    emoji: "Onam",
    start: { month: 7, day: 20 },
    end: { month: 7, day: 27 },
    countdownFrom: 10,
    banner: "Onam - Festive decor, lamps and gifting essentials now live",
    gradient: "from-emerald-600 via-yellow-500 to-orange-400",
    accent: "#047857",
  },
  {
    id: "guru-purnima",
    name: "Guru Purnima",
    emoji: "Guru",
    start: { month: 6, day: 27 },
    end: { month: 6, day: 31 },
    countdownFrom: 10,
    banner: "Guru Purnima - Sacred offerings, guru gifts and spiritual essentials",
    gradient: "from-amber-600 via-yellow-500 to-orange-400",
    accent: "#B45309",
  },
  {
    id: "ganesh-chaturthi",
    name: "Ganesh Chaturthi",
    emoji: "Ganesh",
    start: { month: 7, day: 22 },
    end: { month: 8, day: 6 },
    countdownFrom: 10,
    banner: "Ganesh Chaturthi - Brass Ganesha idols and modak thalis live",
    gradient: "from-orange-500 via-amber-500 to-red-400",
    accent: "#C8941F",
  },
  {
    id: "durga-puja",
    name: "Durga Puja",
    emoji: "Durga",
    start: { month: 8, day: 26 },
    end: { month: 9, day: 3 },
    countdownFrom: 10,
    banner: "Durga Puja - Shakti pooja essentials and festive gifts",
    gradient: "from-red-700 via-rose-600 to-amber-400",
    accent: "#B91C1C",
  },
  {
    id: "navratri",
    name: "Navratri",
    emoji: "Navratri",
    start: { month: 8, day: 25 },
    end: { month: 9, day: 5 },
    countdownFrom: 10,
    banner: "Navratri Nine Nights - Yantras and vastu specials live now",
    gradient: "from-red-600 via-rose-500 to-orange-400",
    accent: "#9C1C3A",
  },
  {
    id: "dussehra",
    name: "Dussehra",
    emoji: "Dussehra",
    start: { month: 9, day: 6 },
    end: { month: 9, day: 9 },
    countdownFrom: 5,
    banner: "Dussehra - Protection bracelets and auspicious picks on offer",
    gradient: "from-amber-500 via-red-500 to-orange-400",
    accent: "#B8451F",
  },
  {
    id: "diwali",
    name: "Diwali",
    emoji: "Diwali",
    start: { month: 9, day: 18 },
    end: { month: 9, day: 27 },
    countdownFrom: 15,
    banner: "Diwali Dhamaka - Pooja samagri, idols and gemstones on offer",
    gradient: "from-amber-500 via-yellow-400 to-orange-500",
    accent: "#C8941F",
  },
  {
    id: "pushkar-camel-fair",
    name: "Pushkar Camel Fair",
    emoji: "Pushkar",
    start: { month: 10, day: 15 },
    end: { month: 10, day: 23 },
    countdownFrom: 12,
    banner: "Pushkar Camel Fair - Rajasthani spiritual gifts and travel picks",
    gradient: "from-orange-600 via-amber-500 to-red-500",
    accent: "#C2410C",
  },
  {
    id: "christmas",
    name: "Christmas",
    emoji: "Christmas",
    start: { month: 11, day: 18 },
    end: { month: 11, day: 31 },
    countdownFrom: 12,
    banner: "Christmas - Year-end gifting and annual horoscope reports",
    gradient: "from-emerald-600 via-green-500 to-red-500",
    accent: "#1E5631",
  },
];

export const isFestivalActiveOnDate = (festival, today = new Date()) => {
  const month = today.getMonth();
  const day = today.getDate();
  const { start, end } = festival;

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

export function getActiveFestival(today = new Date(), customFestivals = []) {
  return (
    [...festivals, ...customFestivals].find((festival) =>
      isFestivalActiveOnDate(festival, today),
    ) || null
  );
}

export function getActiveFestivals(today = new Date(), customFestivals = []) {
  return [...festivals, ...customFestivals].filter((festival) =>
    isFestivalActiveOnDate(festival, today),
  );
}

export function getUpcomingFestival(today = new Date(), customFestivals = []) {
  let closest = null;
  let closestDays = Infinity;

  for (const festival of [...festivals, ...customFestivals]) {
    const startThisYear = new Date(
      today.getFullYear(),
      festival.start.month,
      festival.start.day,
    );
    let diffDays = Math.ceil((startThisYear - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      const startNextYear = new Date(
        today.getFullYear() + 1,
        festival.start.month,
        festival.start.day,
      );
      diffDays = Math.ceil((startNextYear - today) / (1000 * 60 * 60 * 24));
    }
    if (diffDays < closestDays) {
      closestDays = diffDays;
      closest = festival;
    }
  }

  return closest ? { festival: closest, daysAway: closestDays } : null;
}
