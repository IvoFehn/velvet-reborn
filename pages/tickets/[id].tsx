/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import "dayjs/locale/de";
import { ShieldCheckIcon, ClockIcon } from "@heroicons/react/24/outline";
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
  responseDeadline?: Date | null;
  responseHours?: number;
  lastAdminMessage?: Date | null;
}

export default function TicketPage() {
  const router = useRouter();
  const { id } = router.query;
  const [isAdmin, setIsAdmin] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [generator, setGenerator] = useState<Generator | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newMessage, setNewMessage] = useState<string>("");
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [showAdminMenu, setShowAdminMenu] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(7);
  const [responseDeadline, setResponseDeadline] = useState<Date | null>(null);
  const [remainingTime, setRemainingTime] = useState<string>("");
  const [customResponseHours, setCustomResponseHours] = useState<number>(6);
  const [showResponseHoursInput, setShowResponseHoursInput] =
    useState<boolean>(false);
  const adminMenuRef = useRef<HTMLDivElement>(null);
  const lastMessageTimestampRef = useRef<Date | null>(null);

  // Admin-Status prüfen
  useEffect(() => {
    const checkAdminStatus = () => {
      const isUserAdmin = checkAuth();
      setIsAdmin(isUserAdmin);
    };
    checkAdminStatus();
  }, []);

  // Klick außerhalb des Admin-Menüs
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

  // Format remaining time for the deadline
  const formatRemainingTime = (deadline: Date) => {
    try {
      const now = new Date();

      // If deadline has passed, return "Abgelaufen"
      if (now > deadline) {
        return "Abgelaufen";
      }

      let diffMs = deadline.getTime() - now.getTime();
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      diffMs -= days * 1000 * 60 * 60 * 24;

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      diffMs -= hours * 1000 * 60 * 60;

      const minutes = Math.floor(diffMs / (1000 * 60));

      // Format the remaining time
      let timeString = "";
      if (days > 0) {
        timeString += `${days}d `;
      }

      timeString += `${hours}h ${minutes}m`;
      return timeString;
    } catch (error) {
      console.error("Error in formatRemainingTime:", error);
      return "Fehler";
    }
  };

  // Calculate and update the remaining time
  useEffect(() => {
    if (!responseDeadline || ticket?.archived) {
      setRemainingTime("");
      return;
    }

    // Initial calculation
    const initialTime = formatRemainingTime(responseDeadline);
    setRemainingTime(initialTime);

    // Update every minute
    const timerId = setInterval(() => {
      if (responseDeadline) {
        const formattedTime = formatRemainingTime(responseDeadline);
        setRemainingTime(formattedTime);

        // Check if deadline has passed
        if (formattedTime === "Abgelaufen") {
          fetchNewMessages(); // Fetch messages to check if the ticket has been closed
        }
      }
    }, 60000); // Update every minute

    return () => clearInterval(timerId);
  }, [responseDeadline, ticket?.archived]);

  // Ticket-Details einmalig abrufen und Generator laden
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

        // Set response deadline if available
        if (data.ticket.responseDeadline) {
          setResponseDeadline(new Date(data.ticket.responseDeadline));
        } else {
          setResponseDeadline(null);
        }

        // Set response hours if available
        if (data.ticket.responseHours) {
          setCustomResponseHours(data.ticket.responseHours);
        }

        // Konvertiere alle timestamps in Date-Objekte
        const messagesWithDate = data.ticket.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp), // String -> Date
        }));
        setMessages(messagesWithDate);
        if (messagesWithDate.length > 0) {
          // Setze das letzte timestamp als Date-Objekt
          lastMessageTimestampRef.current =
            messagesWithDate[messagesWithDate.length - 1].timestamp;
        }

        // If the ticket was closed due to a deadline expiration, update the UI
        if (data.deadlineExpired && !data.ticket.archived) {
          setTicket((prevTicket) => ({
            ...prevTicket!,
            archived: true,
            responseDeadline: null,
          }));
          setResponseDeadline(null);
        }

        // Generator laden, wenn generatorId vorhanden ist
        if (data.ticket.generatorId) {
          const genResponse = await fetch(
            `/api/generator/${data.ticket.generatorId}`
          );
          if (genResponse.ok) {
            const genData = await genResponse.json();
            if (genData.success) {
              setGenerator(genData.data); // Setze den Generator
            }
          } else {
            console.error(
              "Fehler beim Laden des Generators:",
              genResponse.statusText
            );
          }
        }
      }
    } catch (error) {
      console.error("Fehler beim Laden der Ticket-Details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Neue Nachrichten abrufen
  const fetchNewMessages = async () => {
    if (!id) return;
    try {
      const since = lastMessageTimestampRef.current?.toISOString();
      const response = await fetch(
        `/api/tickets/${id}/messages${since ? `?since=${since}` : ""}`
      );
      if (!response.ok) {
        throw new Error("Fehler beim Abrufen neuer Nachrichten");
      }
      const data = await response.json();

      // Update deadline information
      if (data.responseDeadline) {
        setResponseDeadline(new Date(data.responseDeadline));
      } else {
        setResponseDeadline(null);
      }

      // Update response hours if available
      if (data.responseHours) {
        setCustomResponseHours(data.responseHours);
      }

      // Check if deadline has expired
      if (data.deadlineExpired && ticket) {
        setTicket({
          ...ticket,
          archived: true,
          responseDeadline: null,
        });
        setResponseDeadline(null);
      }

      if (data.success && data.messages.length > 0) {
        const newMessagesWithDate = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp), // String -> Date
        }));

        setMessages((prevMessages) => {
          // Check if any of the new messages have a system message about deadline expiration
          const hasDeadlineExpired = newMessagesWithDate.some(
            (msg: any) =>
              msg.sender === "SYSTEM" &&
              msg.content.includes("Frist überschritten")
          );

          // If there's a deadline expiration message, update ticket status
          if (hasDeadlineExpired && ticket) {
            setTicket({
              ...ticket,
              archived: true,
              responseDeadline: null,
            });
            setResponseDeadline(null);
          }

          return [...prevMessages, ...newMessagesWithDate];
        });

        lastMessageTimestampRef.current =
          newMessagesWithDate[newMessagesWithDate.length - 1].timestamp;
      }
    } catch (error) {
      console.error("Fehler beim Abrufen neuer Nachrichten:", error);
    }
  };

  // Ticket beim Laden der Seite abrufen
  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  // Regelmäßiges Abrufen neuer Nachrichten
  useEffect(() => {
    if (!id) return;

    // Initial fetch
    fetchNewMessages();

    const intervalId = setInterval(() => {
      fetchNewMessages();
      setCountdown(7);
    }, 7000);
    return () => clearInterval(intervalId);
  }, [id]);

  // Countdown-Timer
  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 7));
    }, 1000);
    return () => clearInterval(countdownInterval);
  }, []);

  // Nachricht senden
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
          responseHours: isAdmin ? customResponseHours : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        // Check if error is due to deadline expiration
        if (data.deadlineExpired) {
          if (ticket) {
            setTicket({
              ...ticket,
              archived: true,
              responseDeadline: null,
            });
            setResponseDeadline(null);
          }

          alert(
            "Das Ticket wurde aufgrund von Fristüberschreitung geschlossen und Ihre Nachricht konnte nicht gesendet werden."
          );
          fetchTicket(); // Refresh to get latest state including system messages
          return;
        }

        throw new Error("Fehler beim Senden der Nachricht");
      }

      const data = await response.json();
      if (data.success) {
        const newMsg = {
          ...data.newMessage,
          timestamp: new Date(data.newMessage.timestamp),
        };

        setMessages((prevMessages) => [...prevMessages, newMsg]);
        lastMessageTimestampRef.current = newMsg.timestamp;
        setNewMessage("");

        // Update deadline information
        if (data.responseDeadline) {
          setResponseDeadline(new Date(data.responseDeadline));
        } else {
          setResponseDeadline(null);
        }

        const telegramMessage = `Neue Nachricht im Ticket #${id}: "${newMessage}" von ${
          isAdmin ? "Administrator" : "Benutzer"
        }`;
        await sendTelegramMessage(
          `${isAdmin ? "user" : "admin"}`,
          telegramMessage
        );
      }
    } catch (error) {
      console.error("Fehler beim Senden der Nachricht:", error);
      alert(
        "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut."
      );
    } finally {
      setSendingMessage(false);
    }
  };

  // Update response hours
  const handleUpdateResponseHours = async () => {
    if (!isAdmin || !id) return;

    try {
      const response = await fetch(`/api/tickets/${id}/messages`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responseHours: customResponseHours }),
      });

      if (!response.ok) {
        const data = await response.json();

        if (data.deadlineExpired) {
          if (ticket) {
            setTicket({
              ...ticket,
              archived: true,
              responseDeadline: null,
            });
            setResponseDeadline(null);
          }

          alert(
            "Das Ticket wurde aufgrund von Fristüberschreitung geschlossen."
          );
          fetchTicket();
          return;
        }

        throw new Error("Fehler beim Aktualisieren der Antwortfrist");
      }

      const data = await response.json();
      if (data.success) {
        if (data.responseDeadline) {
          setResponseDeadline(new Date(data.responseDeadline));
        }
        setShowResponseHoursInput(false);
        setShowAdminMenu(false);
      }
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Antwortfrist:", error);
      alert("Aktualisierung der Antwortfrist fehlgeschlagen.");
    }
  };

  // Statusänderungen
  const handleStatusChange = async (status: "open" | "closed") => {
    if (!isAdmin || !id) return;
    try {
      const response = await fetch(`/api/tickets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: status === "closed" }),
      });
      if (!response.ok) throw new Error("Fehler beim Statuswechsel");
      const data = await response.json();
      if (data.success) {
        setTicket(data.ticket);
        // If ticket is closed, remove the deadline
        if (status === "closed") {
          setResponseDeadline(null);
        }
        setShowAdminMenu(false);
        const telegramMessage = `Ticket #${id} wurde auf "${status}" gesetzt.`;
        await sendTelegramMessage("user", telegramMessage);
      }
    } catch (error) {
      console.error("Fehler beim Ändern des Ticket-Status:", error);
      alert("Statusänderung fehlgeschlagen.");
    }
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

  // Determine if user needs to respond (only when ticket is open, not archived)
  const userNeedsToRespond = !isAdmin && responseDeadline && !ticket.archived;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Head>
        <title>{ticket.subject} | Ticket-Details</title>
        <meta
          name="description"
          content={`Details zum Ticket: ${ticket.subject}`}
        />
      </Head>

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
                        <ShieldCheckIcon className="mr-1 h-3 w-3" /> Admin
                      </span>
                    )}

                    {/* Deadline indicator */}
                    {responseDeadline && !ticket.archived && (
                      <span
                        className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          userNeedsToRespond
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        <ClockIcon className="mr-1 h-3 w-3" />
                        {userNeedsToRespond ? "Antwortfrist: " : "Frist: "}
                        {remainingTime}
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

                    {/* Response hours settings for admin */}
                    {isAdmin && (
                      <div className="border-t border-gray-200 pt-3">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">
                          Antwortfrist festlegen
                        </h3>
                        {showResponseHoursInput ? (
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <input
                                type="number"
                                min="1"
                                max="72"
                                value={customResponseHours}
                                onChange={(e) =>
                                  setCustomResponseHours(Number(e.target.value))
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Stunden"
                              />
                              <span className="mx-2 text-gray-500">
                                Stunden
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={handleUpdateResponseHours}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md"
                              >
                                Bestätigen
                              </button>
                              <button
                                onClick={() => setShowResponseHoursInput(false)}
                                className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-md"
                              >
                                Abbrechen
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowResponseHoursInput(true)}
                            className="w-full px-4 py-2 text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                            disabled={ticket.archived}
                          >
                            Antwortfrist ändern (aktuell: {customResponseHours}{" "}
                            Stunden)
                          </button>
                        )}
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
              {/* Deadline information in the ticket description */}
              {responseDeadline && !ticket.archived && userNeedsToRespond && (
                <span className="ml-3 inline-flex items-center text-yellow-600">
                  <ClockIcon className="mr-1 h-4 w-4" />
                  Bitte antworten Sie bis{" "}
                  {dayjs(responseDeadline).format("DD.MM.YYYY HH:mm")} Uhr
                </span>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.isAdmin ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] lg:max-w-[70%] p-4 rounded-2xl ${
                    message.sender === "SYSTEM"
                      ? "bg-gray-100 text-gray-700 text-center mx-auto border border-gray-300 italic"
                      : message.isAdmin
                      ? "bg-purple-600 text-white"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span
                      className={`text-sm font-medium flex items-center ${
                        message.sender === "SYSTEM"
                          ? "text-gray-600"
                          : message.isAdmin
                          ? "text-purple-100"
                          : "text-gray-700"
                      }`}
                    >
                      {message.sender === "SYSTEM" ? (
                        "System"
                      ) : message.isAdmin ? (
                        <>
                          <ShieldCheckIcon className="mr-1 h-4 w-4" />{" "}
                          Administrator
                        </>
                      ) : (
                        "Benutzer"
                      )}
                    </span>
                    <span
                      className={`text-xs ${
                        message.sender === "SYSTEM"
                          ? "text-gray-500"
                          : message.isAdmin
                          ? "text-purple-200"
                          : "text-gray-500"
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
          {/* Show deadline info here as well for better visibility */}
          {responseDeadline && !ticket.archived && userNeedsToRespond && (
            <div className="mt-2 flex items-center justify-center text-yellow-600">
              <ClockIcon className="mr-1 h-4 w-4" />
              <span className="font-medium">
                Antwortfrist: {remainingTime} (bis{" "}
                {dayjs(responseDeadline).format("DD.MM.YYYY HH:mm")} Uhr)
              </span>
            </div>
          )}
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

            {/* Show response hours for admin in input form for better control */}
            {isAdmin && !ticket.archived && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <span>Antwortfrist:</span>
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={customResponseHours}
                  onChange={(e) =>
                    setCustomResponseHours(Number(e.target.value))
                  }
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md text-sm"
                  aria-label="Antwortfrist in Stunden"
                />
                <span>Stunden</span>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
