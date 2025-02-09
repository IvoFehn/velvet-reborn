export async function sendTelegramMessage(
  role: "user" | "admin",
  message: string
) {
  try {
    const response = await fetch("/api/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, message }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Fehler beim Senden der Nachricht");
    }

    return { success: true, response: result };
  } catch (error: unknown) {
    let errorMessage = "Unbekannter Fehler beim Senden der Nachricht";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    console.error("Telegram API Fehler:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
