import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api/client";

// Async thunks hit the real Experiment 4 REST API. Redux Toolkit generates
// pending/fulfilled/rejected action types for each automatically, which
// the extraReducers below use to drive loading/error state.
export const fetchRequests = createAsyncThunk(
  "requests/fetchAll",
  async (filters = {}) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v && v !== "all"))
    );
    const query = params.toString() ? `?${params.toString()}` : "";
    return api.get(`/requests${query}`);
  }
);

export const createRequest = createAsyncThunk("requests/create", async (payload) => {
  return api.post("/requests", payload);
});

// What the donor's "Confirm & Respond" button dispatches: registers
// interest by creating a Donation (status "scheduled") and shares
// contact details both ways. This deliberately does NOT change the
// request's status — only the requester can do that, once blood is
// actually received, via updateRequestStatus below.
// No donorId here (Experiment 6): the backend derives the donor from
// the verified JWT, not from anything the client sends.
export const respondToRequest = createAsyncThunk(
  "requests/respond",
  async ({ request }) => {
    const donation = await api.post("/donations", {
      request: request._id,
      hospital: request.hospital,
      units: request.unitsNeeded,
    });
    return { requestId: request._id, patientName: request.patientName, donation };
  }
);

// What the requester's status control dispatches once they've actually
// received the blood (or want to cancel a request).
export const updateRequestStatus = createAsyncThunk(
  "requests/updateStatus",
  async ({ requestId, status, fulfilledBy }) => {
    return api.patch(`/requests/${requestId}`, { status, fulfilledBy });
  }
);

const requestsSlice = createSlice({
  name: "requests",
  initialState: {
    items: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
    filters: { bloodGroup: "all", urgency: "all" },
    respondedRequestIds: [], // requests this donor has already responded to, this session
  },
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    requestReceivedViaSocket(state, action) {
      // Pushed live from the server over WebSockets (Experiment 8) — a
      // matching request was just posted, delivered without a refetch.
      const exists = state.items.some((r) => r._id === action.payload._id);
      if (!exists) state.items.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        // New request appears instantly across every connected component
        // (Browse Requests, Requester Dashboard, Admin Panel) without a
        // manual refetch, since they all read from this same store slice.
        state.items.unshift(action.payload);
      })
      .addCase(respondToRequest.fulfilled, (state, action) => {
        // The request stays visible and stays "open" — responding is not
        // the same as fulfilling. Just remember it locally so the UI can
        // show "Responded" instead of the Respond button again.
        state.respondedRequestIds.push(action.payload.requestId);
      })
            .addCase(updateRequestStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) {
          // The PATCH response has `requester` as a bare id; keep the
          // already-populated requester object from the list instead.
          const { requester, ...rest } = action.payload;
          state.items[idx] = { ...state.items[idx], ...rest };
        }
      });
  },
});

export const { setFilters, requestReceivedViaSocket } = requestsSlice.actions;
export default requestsSlice.reducer;

