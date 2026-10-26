import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api/client";

export const fetchDonors = createAsyncThunk("donors/fetchAll", async (filters = {}) => {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v && v !== "all"))
  );
  const query = params.toString() ? `?${params.toString()}` : "";
  return api.get(`/users/donors${query}`);
});

const donorsSlice = createSlice({
  name: "donors",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDonors.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDonors.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchDonors.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default donorsSlice.reducer;
