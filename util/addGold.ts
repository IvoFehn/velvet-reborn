/**
 * Erhöht den Gold-Wert um den angegebenen Betrag.
 * @param amount Anzahl, um die Gold erhöht werden soll.
 */
export async function addGold(amount: number) {
  try {
    const response = await fetch("/api/user?action=profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gold: amount }),
    });

    if (!response.ok) {
      throw new Error(
        `Fehler beim Aktualisieren von Gold: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
