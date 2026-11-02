import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { api } from "../api/client";
import { getSocket } from "../socket/socketClient";

export default function ChatModal({ donation, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const donationId = donation?._id;
  const request = donation?.request || {};
  const donor = donation?.donor || {};

  // Determine who the other person is:
  // If the logged-in user is the donor, the other person is the requester (or patient).
  // If the logged-in user is the requester, the other person is the donor.
  const isCurrentUserDonor = user?._id && (donor._id === user._id || donor === user._id);
  const otherPartyName = isCurrentUserDonor
    ? request.requester?.name || "Requester"
    : donor.name || "Donor";
  const otherPartyRole = isCurrentUserDonor ? "Requester" : "Donor";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!donationId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    // 1. Fetch message history from REST API
    api
      .get(`/chat/${donationId}/messages`)
      .then((res) => {
        if (isMounted) {
          setMessages(res.messages || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load chat history.");
          setLoading(false);
        }
      });

    // 2. Real-time WebSocket connection to this response room
    const socket = getSocket();
    if (socket) {
      socket.emit("join-chat", { donationId });

      function handleNewMessage(msg) {
        if (msg.donation === donationId) {
          setMessages((prev) => {
            const alreadyExists = prev.some((m) => m._id === msg._id);
            if (alreadyExists) return prev;
            return [...prev, msg];
          });
        }
      }

      socket.on("chat:new-message", handleNewMessage);

      return () => {
        isMounted = false;
        socket.emit("leave-chat", { donationId });
        socket.off("chat:new-message", handleNewMessage);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [donationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  async function handleSendMessage(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    try {
      const sentMessage = await api.post(`/chat/${donationId}/messages`, { message: text });
      // Optimistically add message if not already added via socket
      setMessages((prev) => {
        const alreadyExists = prev.some((m) => m._id === sentMessage._id);
        if (alreadyExists) return prev;
        return [...prev, sentMessage];
      });
      setInput("");
    } catch (err) {
      setError(err.message || "Could not send message. Please retry.");
    } finally {
      setSending(false);
    }
  }

  if (!donation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 animate-fade-in">
      <div className="relative flex flex-col h-[560px] max-h-[90vh] w-full max-w-lg rounded-2xl border border-line bg-surface shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-surface">
          <div className="min-w-0 pr-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green"></span>
              </span>
              <h3 className="font-semibold text-sm truncate">
                Chat with {otherPartyName}
              </h3>
              <span className="rounded-full bg-crimson-tint px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-crimson">
                {otherPartyRole}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-ink-soft truncate">
              {request.patientName ? `Patient: ${request.patientName} (${request.bloodGroup || ""})` : "Blood Request"}
              {request.hospital ? ` · ${request.hospital}` : ""}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-bg-alt hover:text-ink transition-colors"
            title="Close chat"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-bg/40">
          {loading ? (
            <div className="flex flex-col gap-2 py-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-12 w-48 animate-pulse rounded-xl bg-bg-alt ${i % 2 === 0 ? "self-start" : "self-end"}`}
                />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-center text-xs text-amber bg-amber/10 rounded-lg">
              {error}
            </div>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center text-xs text-ink-soft space-y-1.5">
              <div className="flex justify-center text-ink-soft/60">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <p className="font-medium text-ink">Private Real-Time Channel</p>
              <p>You can coordinate donation time, hospital location, and transport directly.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;
              const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={msg._id || msg.createdAt}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-ink-soft">
                    <span>{isMe ? "You" : msg.senderName}</span>
                    <span>·</span>
                    <span>{formattedTime}</span>
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed break-words shadow-xs ${
                      isMe
                        ? "bg-action text-white rounded-tr-xs"
                        : "bg-surface border border-line text-ink rounded-tl-xs"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="border-t border-line p-3 bg-surface">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type message to coordinate donation..."
              disabled={loading || sending}
              className="flex-1 rounded-full border border-line bg-bg px-4 py-2 text-xs focus:border-action focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending || loading}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-action text-white transition-opacity hover:bg-action-hover disabled:opacity-40 shrink-0"
              title="Send message"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
