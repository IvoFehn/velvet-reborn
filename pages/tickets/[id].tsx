/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import "dayjs/locale/de";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { checkAuth } from "@/components/navigation/NavBar";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";

dayjs.locale("de");

interface Message {
  content: string;
  sender: string;
  timestamp: Date;
  isAdmin: boolean;
}

interface Generator {
  _id: string;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface Ticket {
  _id: string;
  subject: string;
  description: string;
  generatorId?: string | null;
  sanctionsFrontendId?: string | null;
  archived: boolean;
  createdAt: Date;
  updatedAt?: Date;
  messages: Message[];
}

export default function TicketPage() {
  const router = useRouter();
  const { id } = router.query;
  const [isAdmin, setIsAdmin] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [generator, setGenerator] = useState<Generator | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [showAdminMenu, setShowAdminMenu] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(7);
  const adminMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAdminStatus = () => {
      const isUserAdmin = checkAuth();
      setIsAdmin(isUserAdmin);
    };
    checkAdminStatus();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        adminMenuRef.current &&
        !adminMenuRef.current.contains(event.target as Node)
      ) {
        setShowAdminMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchTicket = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/tickets/${id}`);
      if (!response.ok) {
        throw new Error("Fehler beim Abrufen der Ticket-Details");
      }
      const data = await response.json();
      if (data.success) {
        setTicket(data.ticket);
        if (data.ticket.generatorId) {
          try {
            const genResponse = await fetch(
              `/api/generator/${data.ticket.generatorId}`
            );
            // Prüfen des Antwort-Status vor dem Parsen von JSON
            if (genResponse.status === 404) {
              console.log(
                `Generator mit ID ${data.ticket.generatorId} nicht gefunden`
              );
              // Optionaler Fallback oder null-Status
            } else if (genResponse.ok) {
              const contentType = genResponse.headers.get("content-type");
              if (contentType && contentType.includes("application/json")) {
                const genData = await genResponse.json();
                if (genData.success) {
                  setGenerator(genData.data);
                }
              } else {
                console.error("Unerwarteter Inhaltstyp:", contentType);
              }
            }
          } catch (error) {
            console.error("Fehler beim Laden des Generators:", error);
            // Keine Fehlermeldung an den Nutzer - stattdessen nur im Log
          }
        }
      } else {
        throw new Error(data.message || "Fehler bei der Datenverarbeitung");
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"
      );
      console.error("Fehler beim Laden der Ticket-Details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchTicket();
      setCountdown(7);
    }, 7000);
    return () => clearInterval(intervalId);
  }, [id]);

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 7));
    }, 1000);
    return () => clearInterval(countdownInterval);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;
    try {
      setSendingMessage(true);
      const response = await fetch(`/api/tickets/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
          isAdmin: isAdmin,
        }),
      });
      if (!response.ok) {
        throw new Error("Fehler beim Senden der Nachricht");
      }
      const newMsg: Message = {
        content: newMessage,
        sender: isAdmin ? "Administrator" : "Benutzer",
        timestamp: new Date(),
        isAdmin: isAdmin,
      };
      setTicket((prevTicket) =>
        prevTicket
          ? { ...prevTicket, messages: [...prevTicket.messages, newMsg] }
          : prevTicket
      );
      setNewMessage("");
      await fetchTicket();
      // Telegram-Nachricht senden
      const telegramMessage = `Neue Nachricht im Ticket #${id}: "${newMessage}" von ${
        isAdmin ? "Administrator" : "Benutzer"
      }`;
      await sendTelegramMessage(
        `${isAdmin ? "user" : "admin"}`,
        telegramMessage
      );
    } catch (error) {
      console.error("Fehler beim Senden der Nachricht:", error);
      alert(
        "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut."
      );
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStatusChange = async (status: "open" | "closed") => {
    if (!isAdmin || !id) return;
    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          archived: status === "closed",
        }),
      });
      if (!response.ok) {
        throw new Error(
          `Fehler beim ${
            status === "open" ? "Öffnen" : "Schließen"
          } des Tickets`
        );
      }
      const data = await response.json();
      if (data.success) {
        setTicket(data.ticket);
        setShowAdminMenu(false);
        // Telegram-Nachricht senden
        const telegramMessage = `Ticket #${id} wurde auf "${status}" gesetzt.`;
        await sendTelegramMessage("user", telegramMessage);
      }
    } catch (error) {
      console.error("Fehler beim Ändern des Ticket-Status:", error);
      alert(
        "Der Status konnte nicht geändert werden. Bitte versuchen Sie es später erneut."
      );
    }
  };

  const handleGeneratorStatusChange = async (status: string) => {
    if (!isAdmin || !ticket?.generatorId) return;
    try {
      const response = await fetch(`/api/generator`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: ticket.generatorId,
          newStatus: status,
        }),
      });
      if (!response.ok) {
        throw new Error("Fehler beim Ändern des Generator-Status");
      }
      const data = await response.json();
      if (data.success) {
        setGenerator({ ...generator, status } as Generator);
        setShowAdminMenu(false);
        await fetch(`/api/tickets/${id}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: `Der Status des Generators wurde auf "${status}" geändert.`,
            isAdmin: true,
          }),
        });
        await fetchTicket();
        // Telegram-Nachricht senden
        const telegramMessage = `Generator-Status für Ticket #${id} wurde auf "${status}" geändert.`;
        await sendTelegramMessage("user", telegramMessage);
      }
    } catch (error) {
      console.error("Fehler beim Ändern des Generator-Status:", error);
      alert(
        "Der Generator-Status konnte nicht geändert werden. Bitte versuchen Sie es später erneut."
      );
    }
  };

  const handleCompleteSanction = async () => {
    if (!isAdmin || !ticket?.sanctionsFrontendId) return;
    if (!confirm("Möchten Sie diese Sanktion als erledigt markieren?")) return;
    try {
      const response = await fetch(
        `/api/sanctions/${ticket.sanctionsFrontendId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "erledigt",
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Fehler beim Aktualisieren der Sanktion");
      }
      await fetch(`/api/tickets/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: "Die verknüpfte Sanktion wurde als erledigt markiert.",
          isAdmin: true,
        }),
      });
      await fetchTicket();
      alert("Die Sanktion wurde erfolgreich als erledigt markiert.");
      // Telegram-Nachricht senden
      const telegramMessage = `Sanktion für Ticket #${id} wurde als erledigt markiert.`;
      await sendTelegramMessage("user", telegramMessage);
    } catch (error) {
      console.error("Fehler bei der Sanktionsaktualisierung:", error);
      alert(
        "Die Sanktion konnte nicht aktualisiert werden. Bitte versuchen Sie es später erneut."
      );
    }
  };

  const handleViewSanction = () => {
    if (!ticket?.sanctionsFrontendId) return;
    router.push(`/sanctions/${ticket.sanctionsFrontendId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500">Lädt Ticketdetails...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
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
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Head>
        <title>{ticket.subject} | Ticket-Details</title>
        <meta
          name="description"
          content={`Details zum Ticket: ${ticket.subject}`}
        />
      </Head>

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
                    {isAdmin && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                        <ShieldCheckIcon className="mr-1 h-3 w-3" />
                        Admin
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

                {showAdminMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl p-4 space-y-4 z-50">
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

                    {ticket.sanctionsFrontendId && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Verknüpfte Sanktion
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCompleteSanction}
                            className="flex-1 px-4 py-2 text-sm font-medium rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                          >
                            Als erledigt markieren
                          </button>
                          <button
                            onClick={handleViewSanction}
                            className="flex-1 px-4 py-2 text-sm font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                          >
                            Anzeigen
                          </button>
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

      <main className="flex-1 container max-w-5xl px-4 sm:px-6 py-6">
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
                {ticket.sanctionsFrontendId && (
                  <Link
                    href={`/sanctions/${ticket.sanctionsFrontendId}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Zur Sanktion
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
            <div className="text-xs text-gray-500 mt-3">
              Erstellt am{" "}
              {dayjs(ticket.createdAt).format("DD. MMMM YYYY, HH:mm")} Uhr
            </div>
          </div>
        )}

        <div className="space-y-4">
          {ticket.messages?.length > 0 ? (
            ticket.messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.isAdmin ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] lg:max-w-[70%] p-4 rounded-2xl ${
                    message.isAdmin
                      ? "bg-purple-600 text-white"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span
                      className={`text-sm font-medium flex items-center ${
                        message.isAdmin ? "text-purple-100" : "text-gray-700"
                      }`}
                    >
                      {message.isAdmin ? (
                        <>
                          <ShieldCheckIcon className="mr-1 h-4 w-4" />
                          Administrator
                        </>
                      ) : (
                        "Benutzer"
                      )}
                    </span>
                    <span
                      className={`text-xs ${
                        message.isAdmin ? "text-purple-200" : "text-gray-500"
                      }`}
                    >
                      {dayjs(message.timestamp).format("DD.MM.YYYY HH:mm")}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-500">Noch keine Nachrichten vorhanden</p>
            </div>
          )}
        </div>

        <div className="text-center py-2 text-gray-500">
          Neue Nachrichten werden in {countdown} Sekunden geladen
        </div>
      </main>

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
                placeholder={
                  isAdmin
                    ? "Als Administrator antworten..."
                    : "Nachricht schreiben..."
                }
                className="flex-1 px-5 py-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={ticket.archived && !isAdmin}
              />
              <button
                type="submit"
                className={`flex-shrink-0 px-6 py-3 text-white rounded-full font-medium transition-colors disabled:opacity-50 ${
                  isAdmin
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={!newMessage.trim() || sendingMessage}
              >
                Senden
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
