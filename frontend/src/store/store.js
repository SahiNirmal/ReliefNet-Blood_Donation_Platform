import { configureStore } from "@reduxjs/toolkit";
import requestsReducer from "./requestsSlice";
import donorsReducer from "./donorsSlice";
import notificationsReducer from "./notificationsSlice";

export const store = configureStore({
  reducer: {
    requests: requestsReducer,
    donors: donorsReducer,
    notifications: notificationsReducer,
  },
});
