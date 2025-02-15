import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { checkAuth } from "@/components/navigation/NavBar";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";

interface Message {
  content: string;
  sender: string;
  timestamp: Date;
  isAdmin: boolean;
}

interface Ticket {
  _id: string;
  subject: string;
  description?: string;
  archived?: boolean;
  messages: Message[];
  createdAt: string;
  generatorId?: string;
}

interface Generator {
  _id: string;
  status: string;
  createdAt: string;
}

const TicketPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [generator, setGenerator] = useState<Generator | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const isAdmin = checkAuth();

  // Schließe Admin-Menü bei Klicks außerhalb
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        adminMenuRef.current &&
        !adminMenuRef.current.contains(event.target as Node)
      ) {
        setShowAdminMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ticket laden
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`/api/tickets/${id}`);
        const data = await res.json();
        setTicket(data.ticket);
      } catch (error) {
        console.error("Fehler beim Laden des Tickets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchTicket();
  }, [id]);

  // Generator laden
  useEffect(() => {
    const fetchGenerator = async () => {
      if (ticket && ticket.generatorId) {
        try {
          const res = await fetch(`/api/generator?id=${ticket.generatorId}`);
          const data = await res.json();
          if (data.success) {
            setGenerator(data.data);
          }
        } catch (error) {
          console.error("Fehler beim Laden des Generators:", error);
        }
      }
    };

    fetchGenerator();
  }, [ticket]);

  // Statusänderung
  const handleStatusChange = async (newStatus: "open" | "closed") => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: newStatus === "closed" }),
      });

      if (res.ok) {
        setTicket((prev) =>
          prev ? { ...prev, archived: newStatus === "closed" } : null
        );
        sendTelegramMessage(
          "user",
          `Ihr Ticket "${ticket?.subject}" wurde ${
            newStatus === "closed" ? "geschlossen" : "geöffnet"
          }.`
        );
      }
    } catch (error) {
      console.error("Statusänderung fehlgeschlagen:", error);
    }
  };

  // Nachricht senden
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(`/api/tickets/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage, isAdmin }),
      });

      if (res.ok) {
        setNewMessage("");
        const updatedTicket = await res.json();
        setTicket(updatedTicket);
        sendTelegramMessage(
          isAdmin ? "user" : "admin",
          `Neue Antwort auf ${isAdmin ? "Ihr Ticket" : "Ticket #${id}"} (${
            ticket?.subject
          }):\n${newMessage}`
        );
      }
    } catch (error) {
      console.error("Nachricht konnte nicht gesendet werden:", error);
    }
  };

  // Generator-Status ändern
  const handleGeneratorStatusChange = async (newStatus: string) => {
    if (!generator) return;
    try {
      const res = await fetch("/api/generator", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: generator._id, newStatus }),
      });

      if (res.ok) {
        const updatedData = await res.json();
        setGenerator(updatedData.data);
        sendTelegramMessage(
          "admin",
          `Generator ${generator._id} Status wurde auf ${newStatus} geändert.`
        );
      }
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Generators:", error);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500">Lädt Ticketdetails...</p>
        </div>
      </div>
    );

  if (!ticket)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center space-y-4">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800">
            Ticket nicht gefunden
          </h1>
          <p className="text-gray-600">
            Das angeforderte Ticket existiert nicht oder Sie haben keine
            Berechtigung.
          </p>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-30">
        <div className="container max-w-5xl px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Link
                  href="/tickets"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ←
                </Link>
                <div>
                  <h1 className="text-xl font-semibold text-gray-800 line-clamp-1">
                    {ticket.subject}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        ticket.archived
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current" />
                      {ticket.archived ? "Geschlossen" : "Offen"}
                    </span>
                    {generator && (
                      <span className="text-xs text-gray-500">
                        Generator #{generator._id.slice(-6)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="relative" ref={adminMenuRef}>
                <button
                  onClick={() => setShowAdminMenu(!showAdminMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <span className="hidden sm:inline">Aktionen</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>

                {/* Admin Dropdown */}
                {showAdminMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-4 space-y-4 z-50">
                    {/* Ticket Status Section */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Ticket Status
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange("open")}
                          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            !ticket.archived
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          Öffnen
                        </button>
                        <button
                          onClick={() => handleStatusChange("closed")}
                          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            ticket.archived
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          Schließen
                        </button>
                      </div>
                    </div>

                    {/* Generator Status Section */}
                    {generator && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Generator Status
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {["DECLINED", "NEW", "ACCEPTED"].map((status) => (
                            <button
                              key={status}
                              onClick={() =>
                                handleGeneratorStatusChange(status)
                              }
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                generator.status === status
                                  ? "bg-blue-600 text-white shadow-sm"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-5xl px-4 sm:px-6 py-6">
        {/* System Info */}
        {ticket.description && (
          <div className="mb-6 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <div className="space-y-2">
                <h2 className="font-medium">Ticketbeschreibung</h2>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {ticket.description}
                </p>
                {ticket.generatorId && (
                  <Link
                    href={`/generator/${ticket.generatorId}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Zum Auftrag
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M7 7h10v10" />
                      <path d="M7 17 17 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Erstellt am{" "}
              {new Date(ticket.createdAt).toLocaleDateString("de-DE")}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="space-y-4">
          {ticket.messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.isAdmin ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] lg:max-w-[70%] p-4 rounded-2xl ${
                  message.isAdmin
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <span className="text-sm font-medium">
                    {message.isAdmin ? "Support Team" : message.sender}
                  </span>
                  <span
                    className={`text-xs ${
                      message.isAdmin ? "text-blue-200" : "text-gray-500"
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString("de-DE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Message Input */}
      {(!ticket.archived || isAdmin) && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200">
          <form
            onSubmit={handleSendMessage}
            className="container max-w-5xl px-4 sm:px-6 py-4"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nachricht schreiben..."
                className="flex-1 px-5 py-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={ticket.archived && !isAdmin}
              />
              <button
                type="submit"
                className="flex-shrink-0 px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={!newMessage.trim()}
              >
                Senden
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TicketPage;
