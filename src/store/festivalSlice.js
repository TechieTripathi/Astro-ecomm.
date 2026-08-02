import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { backendUrl } from "../config/api";
import { getActiveFestival, getUpcomingFestival } from "../data/festivals";

const normalizeToken = (value) => {
  if (typeof value !== "string") return "";

  let token = value.replace(/['"]+/g, "").trim();
  if (token.toLowerCase().startsWith("bearer ")) token = token.slice(7).trim();
  if (!token || token === "[object Object]" || token === "undefined" || token === "null") {
    return "";
  }
  return token;
};

const getAuthHeader = () => {
  const token = normalizeToken(localStorage.getItem("astromart_token") || "");
  if (!token) {
    localStorage.removeItem("astromart_token");
    return "";
  }
  return `Bearer ${token}`;
};

const readApiResponse = async (res) => {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const normalizeCustomFestival = (festival = {}) => ({
  id: festival.id || festival.slug || "",
  name: festival.name || "",
  start: {
    month: Number(festival.start?.month) || 0,
    day: Number(festival.start?.day) || 1,
  },
  end: {
    month: Number(festival.end?.month) || 0,
    day: Number(festival.end?.day) || 1,
  },
  countdownFrom: Number(festival.countdownFrom) || 7,
  custom: true,
});

const normalizeCustomSeason = (season = {}) => ({
  id: season.id || season.slug || "",
  name: season.name || "",
  start: {
    month: Number(season.start?.month) || 0,
    day: Number(season.start?.day) || 1,
  },
  end: {
    month: Number(season.end?.month) || 0,
    day: Number(season.end?.day) || 1,
  },
  subtitle: season.subtitle || `Custom ${season.name || "season"} collection`,
  custom: true,
});

export const fetchCustomFestivals = createAsyncThunk(
  "festival/fetchCustom",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/festival/custom`);
      const data = await readApiResponse(res);
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch festivals");
      const festivalsArray = data.data || data.festivals || data;
      return Array.isArray(festivalsArray)
        ? festivalsArray.map(normalizeCustomFestival).filter((festival) => festival.id)
        : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createCustomFestival = createAsyncThunk(
  "festival/createCustom",
  async (festivalData, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/festival/custom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify(festivalData),
      });
      const data = await readApiResponse(res);
      if (!res.ok) return rejectWithValue(data.message || "Failed to create festival");
      dispatch(fetchCustomFestivals());
      return normalizeCustomFestival(data.data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateCustomFestival = createAsyncThunk(
  "festival/updateCustom",
  async ({ id, festivalData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/festival/custom/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify(festivalData),
      });
      const data = await readApiResponse(res);
      if (!res.ok) return rejectWithValue(data.message || "Failed to update festival");
      dispatch(fetchCustomFestivals());
      return normalizeCustomFestival(data.data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteCustomFestival = createAsyncThunk(
  "festival/deleteCustom",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/festival/custom/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          Authorization: getAuthHeader(),
        },
      });
      const data = await readApiResponse(res);
      if (!res.ok) return rejectWithValue(data.message || "Failed to delete festival");
      dispatch(fetchCustomFestivals());
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchCustomSeasons = createAsyncThunk(
  "festival/fetchCustomSeasons",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/season/custom`);
      const data = await readApiResponse(res);
      if (!res.ok) return rejectWithValue(data.message || "Failed to fetch seasons");
      const seasonsArray = data.data || data.seasons || data;
      return Array.isArray(seasonsArray)
        ? seasonsArray.map(normalizeCustomSeason).filter((season) => season.id)
        : [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createCustomSeason = createAsyncThunk(
  "festival/createCustomSeason",
  async (seasonData, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/season/custom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify(seasonData),
      });
      const data = await readApiResponse(res);
      if (!res.ok) return rejectWithValue(data.message || "Failed to create season");
      dispatch(fetchCustomSeasons());
      return normalizeCustomSeason(data.data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateCustomSeason = createAsyncThunk(
  "festival/updateCustomSeason",
  async ({ id, seasonData }, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/season/custom/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify(seasonData),
      });
      const data = await readApiResponse(res);
      if (!res.ok) return rejectWithValue(data.message || "Failed to update season");
      dispatch(fetchCustomSeasons());
      return normalizeCustomSeason(data.data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteCustomSeason = createAsyncThunk(
  "festival/deleteCustomSeason",
  async (id, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetch(`${backendUrl}/api/v1/season/custom/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          Authorization: getAuthHeader(),
        },
      });
      const data = await readApiResponse(res);
      if (!res.ok) return rejectWithValue(data.message || "Failed to delete season");
      dispatch(fetchCustomSeasons());
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const getInitialState = () => {
  const today = new Date();
  const activeFestival = getActiveFestival(today);
  const upcoming = getUpcomingFestival(today);
  const showCountdown = !activeFestival && upcoming && upcoming.daysAway <= upcoming.festival.countdownFrom;

  return {
    activeFestival,
    upcoming,
    showCountdown,
    customFestivals: [],
    customSeasons: [],
    loadingCustomFestivals: false,
    loadingCustomSeasons: false,
    customFestivalError: null,
    customSeasonError: null,
  };
};

const festivalSlice = createSlice({
  name: "festival",
  initialState: getInitialState(),
  reducers: {
    refreshFestivals: (state) => {
      const today = new Date();
      state.activeFestival = getActiveFestival(today, state.customFestivals);
      state.upcoming = getUpcomingFestival(today, state.customFestivals);
      state.showCountdown = !state.activeFestival && state.upcoming && state.upcoming.daysAway <= state.upcoming.festival.countdownFrom;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomFestivals.pending, (state) => {
        state.loadingCustomFestivals = true;
      })
      .addCase(fetchCustomFestivals.fulfilled, (state, action) => {
        const today = new Date();
        state.loadingCustomFestivals = false;
        state.customFestivals = action.payload;
        state.customFestivalError = null;
        state.activeFestival = getActiveFestival(today, state.customFestivals);
        state.upcoming = getUpcomingFestival(today, state.customFestivals);
        state.showCountdown = !state.activeFestival && state.upcoming && state.upcoming.daysAway <= state.upcoming.festival.countdownFrom;
      })
      .addCase(fetchCustomFestivals.rejected, (state, action) => {
        state.loadingCustomFestivals = false;
        state.customFestivalError = action.payload;
      })
      .addCase(createCustomFestival.fulfilled, (state, action) => {
        const today = new Date();
        const exists = state.customFestivals.some((festival) => festival.id === action.payload.id);
        if (!exists && action.payload.id) state.customFestivals.push(action.payload);
        state.activeFestival = getActiveFestival(today, state.customFestivals);
        state.upcoming = getUpcomingFestival(today, state.customFestivals);
        state.showCountdown = !state.activeFestival && state.upcoming && state.upcoming.daysAway <= state.upcoming.festival.countdownFrom;
      })
      .addCase(updateCustomFestival.fulfilled, (state, action) => {
        const today = new Date();
        state.customFestivals = state.customFestivals.map((festival) =>
          festival.id === action.payload.id ? action.payload : festival,
        );
        state.activeFestival = getActiveFestival(today, state.customFestivals);
        state.upcoming = getUpcomingFestival(today, state.customFestivals);
        state.showCountdown = !state.activeFestival && state.upcoming && state.upcoming.daysAway <= state.upcoming.festival.countdownFrom;
      })
      .addCase(deleteCustomFestival.fulfilled, (state, action) => {
        const today = new Date();
        state.customFestivals = state.customFestivals.filter((festival) => festival.id !== action.payload);
        state.activeFestival = getActiveFestival(today, state.customFestivals);
        state.upcoming = getUpcomingFestival(today, state.customFestivals);
        state.showCountdown = !state.activeFestival && state.upcoming && state.upcoming.daysAway <= state.upcoming.festival.countdownFrom;
      })
      .addCase(fetchCustomSeasons.pending, (state) => {
        state.loadingCustomSeasons = true;
      })
      .addCase(fetchCustomSeasons.fulfilled, (state, action) => {
        state.loadingCustomSeasons = false;
        state.customSeasons = action.payload;
        state.customSeasonError = null;
      })
      .addCase(fetchCustomSeasons.rejected, (state, action) => {
        state.loadingCustomSeasons = false;
        state.customSeasonError = action.payload;
      })
      .addCase(createCustomSeason.fulfilled, (state, action) => {
        const exists = state.customSeasons.some((season) => season.id === action.payload.id);
        if (!exists && action.payload.id) state.customSeasons.push(action.payload);
      })
      .addCase(updateCustomSeason.fulfilled, (state, action) => {
        state.customSeasons = state.customSeasons.map((season) =>
          season.id === action.payload.id ? action.payload : season,
        );
      })
      .addCase(deleteCustomSeason.fulfilled, (state, action) => {
        state.customSeasons = state.customSeasons.filter((season) => season.id !== action.payload);
      });
  },
});

export const { refreshFestivals } = festivalSlice.actions;

export const selectActiveFestival = (state) => state.festival.activeFestival;
export const selectUpcomingFestival = (state) => state.festival.upcoming;
export const selectShowCountdown = (state) => state.festival.showCountdown;
export const selectCustomFestivals = (state) => state.festival.customFestivals;
export const selectCustomSeasons = (state) => state.festival.customSeasons;

export default festivalSlice.reducer;
