// components/Wiki.tsx
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/router";
import Link from "next/link";

// Typen
interface WikiPage {
  _id?: string;
  id: string;
  title: string;
  content: string;
  lastModified: Date | string;
  author: string;
}

interface WikiProps {
  isAuthed: boolean;
}

const generateId = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

const Wiki: React.FC<WikiProps> = ({ isAuthed }) => {
  const router = useRouter();
  const { page: pageId } = router.query;

  const [pages, setPages] = useState<WikiPage[]>([]);
  const [currentPage, setCurrentPage] = useState<WikiPage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wiki-Seiten beim Laden abrufen
  useEffect(() => {
    const fetchWikiPages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/wiki");

        if (!response.ok) {
          throw new Error(`Fehler: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setPages(data);
      } catch (err) {
        console.error("Fehler beim Laden der Wiki-Seiten:", err);
        setError(
          "Fehler beim Laden der Wiki-Seiten. Bitte später erneut versuchen."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchWikiPages();
  }, []);

  // Seite beim Laden oder Ändern der URL auswählen
  useEffect(() => {
    // Wir überspringen die Ausführung wenn wir im Erstellungsmodus sind
    if (isCreating) {
      return;
    }

    if (pageId && typeof pageId === "string" && pages.length > 0) {
      const page = pages.find((p) => p.id === pageId);
      setCurrentPage(page || null);
      setIsEditing(false);

      if (page) {
        setEditContent(page.content);
        setEditTitle(page.title);
      }
    } else if (pages.length > 0 && !isCreating && !isLoading) {
      // Default zur ersten Seite, wenn keine spezifiziert wurde
      router.push(`/wiki/${pages[0].id}`);
    }
  }, [pageId, pages, router, isCreating, isLoading]);

  // Diese Funktion stoppt absichtlich jede URL-Navigation
  const createNewPage = () => {
    // Wir bleiben bei der aktuellen URL und ändern nur den internen Zustand
    setCurrentPage(null);
    setEditTitle("");
    setEditContent("");
    setIsCreating(true);
    setIsEditing(false);
  };

  // Seite speichern
  const savePage = async () => {
    if (isCreating) {
      const newId = generateId(editTitle);
      const newPage: WikiPage = {
        id: newId,
        title: editTitle,
        content: editContent,
        lastModified: new Date(),
        author: "Aktueller Benutzer", // In einer realen App würdest du den tatsächlichen Benutzernamen verwenden
      };

      try {
        const response = await fetch("/api/wiki", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPage),
        });

        if (!response.ok) {
          throw new Error("Fehler beim Speichern der Seite");
        }

        // Alle Seiten neu laden, um die aktualisierte Liste zu erhalten
        const allPagesResponse = await fetch("/api/wiki");
        if (!allPagesResponse.ok) {
          throw new Error("Fehler beim Aktualisieren der Seitenliste");
        }

        const updatedPages = await allPagesResponse.json();
        setPages(updatedPages);
        setIsCreating(false);

        // Zur neuen Seite navigieren
        router.push(`/wiki/${newId}`);
      } catch (error) {
        console.error("Fehler beim Speichern:", error);
        alert("Fehler beim Speichern der Seite. Bitte versuche es erneut.");
      }
    } else if (currentPage) {
      const updatedPage = {
        ...currentPage,
        title: editTitle,
        content: editContent,
        lastModified: new Date(),
      };

      try {
        const response = await fetch(`/api/wiki/${currentPage.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedPage),
        });

        if (!response.ok) {
          throw new Error("Fehler beim Aktualisieren der Seite");
        }

        // Alle Seiten neu laden, um die aktualisierte Liste zu erhalten
        const allPagesResponse = await fetch("/api/wiki");
        if (!allPagesResponse.ok) {
          throw new Error("Fehler beim Aktualisieren der Seitenliste");
        }

        const updatedPages = await allPagesResponse.json();
        setPages(updatedPages);

        // Aktuelle Seite aktualisieren
        const newCurrentPage =
          updatedPages.find((p: WikiPage) => p.id === currentPage.id) || null;
        setCurrentPage(newCurrentPage);

        setIsEditing(false);
      } catch (error) {
        console.error("Fehler beim Aktualisieren:", error);
        alert("Fehler beim Aktualisieren der Seite. Bitte versuche es erneut.");
      }
    }
  };

  // Seite löschen
  const deletePage = async (id: string) => {
    if (!confirm("Möchtest du diese Seite wirklich löschen?")) return;

    try {
      const response = await fetch(`/api/wiki/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Fehler beim Löschen der Seite");
      }

      // Alle Seiten neu laden
      const allPagesResponse = await fetch("/api/wiki");
      if (!allPagesResponse.ok) {
        throw new Error("Fehler beim Aktualisieren der Seitenliste");
      }

      const updatedPages = await allPagesResponse.json();
      setPages(updatedPages);

      // Wenn die aktuelle Seite gelöscht wurde, zur ersten Seite navigieren
      if (currentPage?.id === id) {
        if (updatedPages.length > 0) {
          router.push(`/wiki/${updatedPages[0].id}`);
        } else {
          setCurrentPage(null);
        }
      }
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      alert("Fehler beim Löschen der Seite. Bitte versuche es erneut.");
    }
  };

  // Gefilterte Seiten basierend auf Suchbegriff
  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">Lade Wiki-Seiten...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="text-center bg-red-50 p-6 rounded-lg border border-red-200">
          <svg
            className="h-12 w-12 text-red-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-medium text-red-800">Fehler</h3>
          <p className="mt-2 text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Neu laden
          </button>
        </div>
      </div>
    );
  }

  // Entscheidungsbaum für die Ansicht
  const renderContent = () => {
    // Fall 1: Seite wird erstellt
    if (isCreating) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-200">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Neue Seite erstellen
          </h1>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titel
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Seitentitel eingeben..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inhalt (Markdown)
              </label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-96 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="## Beginnen Sie mit dem Schreiben..."
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={savePage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
              >
                Speichern
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  if (pages.length > 0) {
                    router.push(`/wiki/${pages[0].id}`);
                  }
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Fall 2: Vorhandene Seite wird angezeigt oder bearbeitet
    if (currentPage) {
      if (isEditing) {
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-200">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titel
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inhalt (Markdown)
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-96 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={savePage}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Änderungen speichern
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                >
                  Verwerfen
                </button>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-200">
            <div className="flex justify-between items-start mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {currentPage.title}
              </h1>
              {isAuthed && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Bearbeiten
                </button>
              )}
            </div>

            <article className="prose max-w-none lg:prose-lg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {currentPage.content}
              </ReactMarkdown>
            </article>

            <div className="mt-12 pt-6 border-t border-gray-100 text-sm text-gray-500">
              <p>
                Zuletzt aktualisiert:{" "}
                {new Date(currentPage.lastModified).toLocaleDateString(
                  "de-DE",
                  {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }
                )}{" "}
                • {currentPage.author}
              </p>
            </div>
          </div>
        );
      }
    }

    // Fall 3: Keine Seite ausgewählt/vorhanden
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {pages.length === 0
              ? "Keine Wiki-Seiten vorhanden"
              : "Keine Seite ausgewählt"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {pages.length === 0
              ? "Erstellen Sie Ihre erste Wiki-Seite, um zu beginnen."
              : "Wählen Sie eine bestehende Seite aus oder erstellen Sie eine neue."}
          </p>
          {isAuthed && pages.length === 0 && (
            <button
              onClick={createNewPage}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Erste Seite erstellen
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Sidebar */}
      <div className="w-full md:w-64 lg:w-72 bg-white p-4 md:p-6 border-b md:border-r border-gray-200">
        <div className="mb-6">
          <h1 className="text-gray-900 text-xl font-bold mb-4 hidden md:block">
            Wiki
          </h1>
          <input
            type="text"
            placeholder="Seiten suchen..."
            className="w-full px-4 py-2 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 border border-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <nav>
          <h2 className="text-gray-500 text-sm font-medium mb-3 hidden md:block">
            Seitenverzeichnis
          </h2>
          {filteredPages.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              {pages.length === 0
                ? "Keine Seiten verfügbar"
                : "Keine Ergebnisse gefunden"}
            </div>
          ) : (
            <ul className="space-y-1">
              {filteredPages.map((page) => (
                <li key={page.id} className="flex">
                  <Link
                    href={`/wiki/${page.id}`}
                    className={`flex-1 flex items-center px-3 py-2 rounded-lg transition-colors
                      ${
                        currentPage?.id === page.id
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <span className="truncate">{page.title}</span>
                  </Link>
                  {isAuthed && (
                    <button
                      onClick={() => deletePage(page.id)}
                      className="ml-1 text-gray-400 hover:text-red-500 p-2"
                      title="Seite löschen"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </nav>

        {isAuthed && (
          <button
            onClick={createNewPage}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Neue Seite</span>
          </button>
        )}
      </div>

      {/* Hauptinhalt - Verwendet die renderContent-Funktion */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl">{renderContent()}</main>
    </div>
  );
};

export default Wiki;
