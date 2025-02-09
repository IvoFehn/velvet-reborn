// src/api/news.ts
import { INews, INewsInput, INewsReview } from "@/models/News";

/** Ruft News ab; der optionale Query-Parameter kann z. B. zum Filtern nach type ("general" oder "review") genutzt werden */
export async function fetchNews(query?: {
  type?: string;
  id?: string;
}): Promise<INews[]> {
  let url = "/api/news";
  if (query) {
    const params = new URLSearchParams(
      query as Record<string, string>
    ).toString();
    url += `?${params}`;
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Fehler beim Abrufen der News");
  }
  const data = await res.json();
  return data.data;
}

/** Erstellt einen neuen News‑Eintrag (z. B. eine Review) */
export async function createNews(
  news: INewsInput
): Promise<INews | INewsReview> {
  const res = await fetch("/api/news", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(news),
  });
  if (!res.ok) {
    throw new Error("Fehler beim Erstellen der News");
  }
  const data = await res.json();
  return data.data;
}
