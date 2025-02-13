/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";

export type RarityType = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

const validRarities: RarityType[] = [
  "Common",
  "Uncommon",
  "Rare",
  "Epic",
  "Legendary",
];

const CreateCoinItem: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [rarity, setRarity] = useState<RarityType>("Common");
  const [neededAmount, setNeededAmount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validierung
    if (!name || !description || !color || !rarity || neededAmount === 0) {
      setError("Bitte fülle alle Felder aus und setze neededAmount > 0.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/coinitems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          color,
          rarity,
          neededAmount,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess("Coin Item erfolgreich erstellt!");
        setName("");
        setDescription("");
        setColor("");
        setRarity("Common");
        setNeededAmount(0);
      } else {
        setError(data.message || "Fehler beim Erstellen des Coin Items.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Coin Item erstellen</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
          placeholder="z.B. Goldmünze"
        />

        <label style={styles.label}>Beschreibung:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...styles.input, height: "80px" }}
          placeholder="Beschreibung des Items"
        />

        <label style={styles.label}>Farbe:</label>
        <input
          type="text"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={styles.input}
          placeholder="z.B. #FFD700"
        />

        <label style={styles.label}>Rarity:</label>
        <select
          value={rarity}
          onChange={(e) => setRarity(e.target.value as RarityType)}
          style={styles.input}
        >
          {validRarities.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <label style={styles.label}>Needed Amount:</label>
        <input
          type="number"
          value={neededAmount}
          onChange={(e) => setNeededAmount(Number(e.target.value))}
          style={styles.input}
          placeholder="z.B. 10"
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Erstelle..." : "Coin Item erstellen"}
        </button>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "500px",
    margin: "20px auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: "4px",
    fontWeight: "bold",
  },
  input: {
    marginBottom: "12px",
    padding: "8px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "1rem",
  },
  button: {
    padding: "10px",
    fontSize: "1rem",
    backgroundColor: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
  success: {
    color: "green",
    marginTop: "10px",
  },
};

export default CreateCoinItem;
