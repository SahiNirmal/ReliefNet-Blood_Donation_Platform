import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "./useAuth";
import { tokenStorage } from "../api/client";
import { connectSocket, disconnectSocket } from "../socket/socketClient";
import { requestReceivedViaSocket } from "../store/requestsSlice";
import { pushNotification } from "../store/notificationsSlice";

// Mounted once, app-wide (in App.jsx), rather than per-page — so the
// live connection and its notifications keep working no matter which
// page the person is currently looking at, not just while a specific
// dashboard happens to be mounted.
export function useSocket() {
  const { user } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      disconnectSocket();
      return;
    }

    const token = tokenStorage.get();
    if (!token) return;

    const socket = connectSocket(token);

    // A donor received this because the server already matched them by
    // blood group and proximity before emitting — no client-side
    // filtering needed, it's already addressed to exactly the right people.
    function handleNewRequest(request) {
      dispatch(requestReceivedViaSocket(request));
      dispatch(
        pushNotification({
          message: `New ${request.bloodGroup} request posted nearby: ${request.patientName} at ${request.hospital}.`,
        })
      );
    }

    // A requester receives this the instant a donor responds to one of
    // their requests — the donor's contact details are already included.
    function handleNewResponse(donation) {
      dispatch(
        pushNotification({
          message: `${donation.donor?.name || "A donor"} responded to your request for ${
            donation.request?.patientName || "a patient"
          }. Their contact details are ready to view.`,
        })
      );
    }

    // A donor receives this once the requester confirms their donation
    // actually happened.
    function handleRequestFulfilled({ patientName }) {
      dispatch(
        pushNotification({
          message: `Your response for ${patientName} was marked fulfilled by the requester. Thank you!`,
        })
      );
    }

    // A user receives this when the other party sends them a chat message in real time
    function handleChatNotification({ senderName, message, patientName }) {
      dispatch(
        pushNotification({
          message: `💬 Message from ${senderName} (${patientName}): "${
            message.length > 50 ? message.slice(0, 50) + "..." : message
          }"`,
        })
      );
    }

    socket.on("new-request", handleNewRequest);
    socket.on("new-response", handleNewResponse);
    socket.on("request-fulfilled", handleRequestFulfilled);
    socket.on("chat:notification", handleChatNotification);

    return () => {
      socket.off("new-request", handleNewRequest);
      socket.off("new-response", handleNewResponse);
      socket.off("request-fulfilled", handleRequestFulfilled);
      socket.off("chat:notification", handleChatNotification);
    };
  }, [user, dispatch]);
}
