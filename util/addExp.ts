/**
 * Erhöht den Exp-Wert um den angegebenen Betrag.
 * @param amount Anzahl, um die Exp erhöht werden soll.
 */
export async function addExp(amount: number) {
  try {
    const response = await fetch("/api/profile/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exp: amount }),
    });

    if (!response.ok) {
      throw new Error(
        `Fehler beim Aktualisieren von Exp: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
