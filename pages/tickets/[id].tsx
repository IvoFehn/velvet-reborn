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
        <div className="animate-pulse text-gray-600">
          <span className="mr-2">⏳</span> Lädt Ticket...
        </div>
      </div>
    );

  if (!ticket)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-red-500 text-xl mb-4">⚠️</div>
        <h1 className="text-xl font-medium text-gray-800">
          Ticket nicht gefunden
        </h1>
        <p className="text-gray-600 mt-2">
          Das angeforderte Ticket existiert nicht oder Sie haben keine
          Berechtigung.
        </p>
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {ticket.subject}
              </h1>
              <div className="mt-1 flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    ticket.archived
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {ticket.archived ? "Geschlossen" : "Offen"}
                </span>
              </div>
            </div>

            {isAdmin && (
              <div className="relative" ref={adminMenuRef}>
                <button
                  onClick={() => setShowAdminMenu(!showAdminMenu)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium transition-colors
                    bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Aktionen
                  <svg
                    className="ml-2 -mr-1 h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Admin Dropdown-Menü */}
                {showAdminMenu && (
                  <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-2 px-4 space-y-4">
                      {/* Ticket Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ticket Status
                        </label>
                        <div className="flex rounded-md shadow-sm">
                          <button
                            onClick={() => handleStatusChange("open")}
                            className={`flex-1 px-4 py-2 text-sm ${
                              !ticket.archived
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            } rounded-l-md`}
                          >
                            Öffnen
                          </button>
                          <button
                            onClick={() => handleStatusChange("closed")}
                            className={`flex-1 px-4 py-2 text-sm ${
                              ticket.archived
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            } rounded-r-md`}
                          >
                            Schließen
                          </button>
                        </div>
                      </div>

                      {/* Generator Status */}
                      {ticket.generatorId && generator && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Generator Status
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {["DECLINED", "NEW", "ACCEPTED"].map((status) => (
                              <button
                                key={status}
                                onClick={() =>
                                  handleGeneratorStatusChange(status)
                                }
                                className={`px-3 py-2 text-xs text-center rounded-md transition-colors ${
                                  generator.status === status
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                {status.charAt(0) +
                                  status.slice(1).toLowerCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* System Message */}
          {ticket.description && (
            <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600">ℹ️</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Ticket-Beschreibung
                  </p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                  {ticket.generatorId && (
                    <div className="mt-3">
                      <Link
                        href={`/generator/${ticket.generatorId}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Zum Generator
                        <svg
                          className="ml-1 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </Link>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Erstellt am{" "}
                    {new Date(ticket.createdAt).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}{" "}
                    um{" "}
                    {new Date(ticket.createdAt).toLocaleTimeString("de-DE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
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
                  className={`max-w-[85%] lg:max-w-[70%] p-4 rounded-xl ${
                    message.isAdmin
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-medium ${
                        message.isAdmin ? "text-blue-100" : "text-gray-600"
                      }`}
                    >
                      {message.sender}
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
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Message Input */}
      {(!ticket.archived || isAdmin) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <form
            onSubmit={handleSendMessage}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
          >
            <div className="flex space-x-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nachricht schreiben..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={ticket.archived && !isAdmin}
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
