import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "./Ticket.module.css";
import { checkAuth } from "@/components/navigation/NavBar";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";
import dayjs from "dayjs";
import Link from "next/link";

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
  generatorId?: string; // Neue Eigenschaft für die Generator-ID
}

const TicketPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const isAdmin = checkAuth();

  // Mobile Viewport Height Fix
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  // Ticket-Daten laden
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

  // Ticket-Status ändern
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
        body: JSON.stringify({
          content: newMessage,
          isAdmin: checkAuth(),
        }),
      });

      if (res.ok) {
        setNewMessage("");
        const updatedTicket = await res.json();
        setTicket(updatedTicket);
        if (!isAdmin) {
          sendTelegramMessage(
            "user",
            `Dein Antrag wurde bearbeitet am ${dayjs()
              .locale("de")
              .format("DD.MM.YYYY HH:mm:ss")}`
          );
        }
      }
    } catch (error) {
      console.error("Nachricht konnte nicht gesendet werden:", error);
    }
  };

  if (isLoading) return <div>Lädt Ticket...</div>;
  if (!ticket) return <div>Ticket nicht gefunden</div>;

  return (
    <div className={styles.container}>
      {/* Header-Bereich mit Betreff, Status und ggf. Status-Schalter */}
      <div className={styles.header}>
        <h1 className={styles.subject}>{ticket.subject}</h1>
        <div className={styles.meta}>
          <span
            className={`${styles.status} ${
              styles[ticket.archived === true ? "closed" : "open"]
            }`}
          >
            {ticket.archived === true ? "Geschlossen" : "Offen"}
          </span>

          {isAdmin && (
            <button
              onClick={() =>
                handleStatusChange(
                  ticket.archived === false ? "closed" : "open"
                )
              }
              className={styles.statusButton}
            >
              {ticket.archived === false ? "Schließen" : "Wieder öffnen"}
            </button>
          )}
        </div>
      </div>

      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {/* Beschreibung als erste Nachricht */}
          {ticket.description && (
            <div className={`${styles.message} ${styles.descriptionMessage}`}>
              <div className={styles.avatar}>ℹ️</div>
              <div className={styles.content}>
                <div className={styles.sender}>Systemnachricht</div>
                <div className={styles.text}>
                  <strong>Ticket-Beschreibung:</strong>
                  <br />
                  {ticket.description}
                  {/* Link zum Generator, falls vorhanden */}
                  {ticket.generatorId && (
                    <div style={{ marginTop: "8px" }}>
                      <strong>Bezogener Generator:</strong>{" "}
                      <Link
                        href={`/generator/${ticket.generatorId}`}
                        target="_blank"
                        style={{
                          color: "#0070f3",
                          textDecoration: "underline",
                        }}
                      >
                        Zum Generator
                      </Link>
                    </div>
                  )}
                </div>
                <div className={styles.timestamp}>
                  Erstellt am {new Date(ticket.createdAt).toLocaleDateString()}{" "}
                  um {new Date(ticket.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}

          {/* Alle weiteren Nachrichten */}
          {ticket.messages.map((message, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                message.isAdmin ? styles.admin : styles.user
              }`}
            >
              <div className={styles.avatar}>
                {message.isAdmin ? "🛠️" : "👤"}
              </div>
              <div className={styles.content}>
                <div className={styles.sender}>{message.sender}</div>
                <div className={styles.text}>{message.content}</div>
                <div className={styles.timestamp}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Eingabeformular bleibt unten fixiert */}
        {(!ticket.archived || isAdmin === true) && (
          <form onSubmit={handleSendMessage} className={styles.messageForm}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Schreiben Sie eine Nachricht..."
              className={styles.input}
            />
            <button type="submit" className={styles.sendButton}>
              Senden
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TicketPage;
