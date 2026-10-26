import { createSlice, nanoid } from "@reduxjs/toolkit";
import { createRequest, respondToRequest, updateRequestStatus } from "./requestsSlice";

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: {
    items: [], // { id, message, read }
  },
  reducers: {
    markAllRead(state) {
      state.items.forEach((n) => {
        n.read = true;
      });
    },
    dismissNotification(state, action) {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
        // A plain reducer (not tied to a thunk) so the socket hook can push
    // a notification directly when the server emits an event — e.g. "a
    // donor just responded to your request" arriving live over WebSockets.
    pushNotification(state, action) {
      state.items.unshift({ id: nanoid(), read: false, ...action.payload });
    },
  },
  extraReducers: (builder) => {
    // Reacts to actions dispatched from a completely different slice
    // (requestsSlice) — this is the kind of cross-cutting, app-wide state
    // update that's awkward with plain useState/useContext but natural
    // with a single Redux store.
    builder
      .addCase(createRequest.fulfilled, (state, action) => {
        const nearby = action.payload.nearbyDonorsMatched;
        const nearbyNote = nearby !== null && nearby !== undefined ? ` ${nearby} nearby donor(s) matched.` : "";
        state.items.unshift({
          id: nanoid(),
          message: `Request posted for ${action.payload.patientName} — matching donors are being alerted.${nearbyNote}`,
          read: false,
        });
      })
      .addCase(respondToRequest.fulfilled, (state, action) => {
        state.items.unshift({
          id: nanoid(),
          message: `You responded to the request for ${action.payload.patientName}. The requester now has your contact details.`,
          read: false,
        });
      })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        if (action.payload.status === "fulfilled") {
          state.items.unshift({
            id: nanoid(),
            message: `Marked the request for ${action.payload.patientName} as fulfilled.`,
            read: false,
          });
        }
      });
  },
});

export const { markAllRead, dismissNotification, pushNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;


