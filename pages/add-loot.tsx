/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Head from "next/head";

interface Lootbox {
  _id: string;
  name?: string;
  type: string;
  img: string;
}

const AssignLootboxPage = () => {
  const [lootboxes, setLootboxes] = useState<Lootbox[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLootboxes = async () => {
      try {
        const res = await fetch("/api/lootbox");
        const data = await res.json();
        if (data.success && data.lootboxes) {
          setLootboxes(data.lootboxes);
        } else {
          setMessage(data.message || "Fehler beim Laden der Lootboxen.");
        }
      } catch (error) {
        console.error("Fehler beim Laden:", error);
        setMessage("Fehler beim Verbinden mit dem Server.");
      }
    };

    fetchLootboxes();
  }, []);

  const handleAssignLootbox = async (lootboxId: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/lootbox/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lootboxId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(
          `Lootbox (ID: ${lootboxId}) erfolgreich dem ersten Nutzer zugewiesen.`
        );
      } else {
        setMessage(data.message || "Fehler beim Zuweisen der Lootbox.");
      }
    } catch (error) {
      console.error("Assign Error:", error);
      setMessage("Fehler beim Verbinden mit dem Server.");
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Lootbox zuweisen</title>
      </Head>
      <main className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">
            Lootbox Verwaltung
          </h1>

          {message && (
            <div
              className={`mb-6 rounded-lg p-4 text-sm ${
                message.includes("erfolgreich")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          {loading && (
            <div className="mb-6 flex items-center text-gray-500">
              <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Wird verarbeitet...
            </div>
          )}

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-gray-800">
              Verfügbare Lootboxen
            </h2>

            {lootboxes.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                Keine Lootboxen gefunden
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lootboxes.map((lootbox) => (
                  <div
                    key={lootbox._id}
                    className="flex flex-col overflow-hidden rounded-lg border border-gray-200 transition-all hover:shadow-md"
                  >
                    <div className="relative aspect-square bg-gray-100">
                      <img
                        src={lootbox.img}
                        alt={lootbox.name || lootbox.type}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="mb-2 text-lg font-medium text-gray-900">
                        {lootbox.name || lootbox.type}
                      </h3>
                      <p className="mb-4 text-sm text-gray-500">
                        Typ: {lootbox.type}
                      </p>
                      <button
                        onClick={() => handleAssignLootbox(lootbox._id)}
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Zu Nutzer hinzufügen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
};

export default AssignLootboxPage;
