// pages/quicktask/[id].tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { Rating } from "@mui/material";
import QuickTaskDetail from "@/components/QuickTaskDetail/QuickTaskDetail";

interface QuickTaskData {
  _id: string;
  title: string;
  description: string;
  url?: string;
  createdAt: string;
  status: "NEW" | "ACCEPTED" | "DONE" | "FAILED";
  rating?: number;
  completionEffort?: number;
  creativity?: number;
  timeManagement?: number;
  followedInstructions?: number;
  additionalNotes?: string;
  goldReward?: number;
}

const QuickTaskDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [task, setTask] = useState<QuickTaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    if (!id) return;

    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/quicktasks?id=${id}`);
        const result = await response.json();

        if (!result.success) {
          setError(result.message || "Fehler beim Laden des Quick Tasks");
        } else {
          setTask(result.data);
        }
      } catch (err) {
        console.error("Fetch-Error:", err);
        setError("Fehler beim Abrufen des Quick Tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [router.isReady, id]);

  const getAverageRating = (): number => {
    if (!task) return 0;

    const ratings = [
      task.completionEffort,
      task.creativity,
      task.timeManagement,
      task.followedInstructions,
    ].filter((r) => typeof r === "number") as number[];

    if (ratings.length === 0) return 0;

    return ratings.reduce((sum, val) => sum + val, 0) / ratings.length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-red-500">{error}</p>
        <Link
          href="/"
          className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Zurück zur Startseite
        </Link>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p>Kein Quick Task gefunden</p>
        <Link
          href="/"
          className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Zurück zur Startseite
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{task.title} | Quick Task</title>
      </Head>

      <div className="max-w-4xl mx-auto py-8 px-4">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:underline mb-6"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Zurück zur Startseite
        </Link>

        <QuickTaskDetail task={task} />

        {(task.rating || task.completionEffort) && (
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Bewertung
            </h2>

            <div className="mb-6 pb-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">
                Durchschnittliche Bewertung
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Rating
                  value={getAverageRating()}
                  readOnly
                  precision={0.1}
                  className="text-yellow-500"
                />
                <span className="text-sm text-gray-600">
                  ({getAverageRating().toFixed(1)} von 5)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">
                    Gesamtbewertung
                  </h3>
                  <Rating value={task.rating} readOnly precision={0.5} />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700">
                    Einsatz & Mühe
                  </h3>
                  <Rating
                    value={task.completionEffort}
                    readOnly
                    precision={0.5}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700">
                    Kreativität
                  </h3>
                  <Rating value={task.creativity} readOnly precision={0.5} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">
                    Zeitmanagement
                  </h3>
                  <Rating
                    value={task.timeManagement}
                    readOnly
                    precision={0.5}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700">
                    Anweisungstreue
                  </h3>
                  <Rating
                    value={task.followedInstructions}
                    readOnly
                    precision={0.5}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700">
                    Erhaltene Belohnung
                  </h3>
                  <p className="text-xl font-bold text-yellow-600">
                    {task.goldReward} Gold
                  </p>
                </div>
              </div>
            </div>

            {task.additionalNotes && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Zusätzliche Anmerkungen
                </h3>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {task.additionalNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default QuickTaskDetailPage;
