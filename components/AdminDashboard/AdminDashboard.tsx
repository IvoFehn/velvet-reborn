import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { checkAuth } from "../navigation/NavBar";
import AdminHealthReports from "../AdminHealthReports/AdminHealthReports";

// Admin-Module und ihre Links
const adminModules = [
  {
    title: "Generator",
    link: "/generator",
    description: "Generator-Tool verwalten",
    icon: "📝",
  },
  {
    title: "Review",
    link: "/news",
    description: "Reviews und Neuigkeiten bearbeiten",
    icon: "📰",
  },
  {
    title: "Events",
    link: "/events",
    description: "Veranstaltungen planen und verwalten",
    icon: "🗓️",
  },
  {
    title: "Goldweight",
    link: "/goldweightsettings",
    description: "Goldgewichtseinstellungen konfigurieren",
    icon: "⚖️",
  },
  {
    title: "Lootboxes",
    link: "/add-loot",
    description: "Beutekisten und Belohnungen verwalten",
    icon: "🎁",
  },
  {
    title: "Gesundheitsberichte",
    link: "#health-reports",
    description: "Gesundheitsberichte der Benutzer einsehen",
    icon: "🩺",
    internal: true,
  },
];

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showHealthReports, setShowHealthReports] = useState(false);

  // Überprüfen der Authentifizierung
  useEffect(() => {
    if (!checkAuth()) {
      router.push("/");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  // Interne Link-Handler
  const handleInternalLinkClick = (moduleId: string) => {
    if (moduleId === "#health-reports") {
      setShowHealthReports(true);
      // Zur Gesundheitsberichte-Sektion scrollen
      const element = document.getElementById("health-reports-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard | Velvet Reborn</title>
        <meta name="description" content="Admin Dashboard für Velvet Reborn" />
      </Head>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="pb-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Admin Dashboard
            </h1>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              Zentrale Verwaltung aller Administratorfunktionen
            </p>
          </div>

          {/* Admin-Module */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Admin-Module
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {adminModules.map((module) => (
                <div
                  key={module.link}
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <div className="flex-shrink-0 text-2xl">{module.icon}</div>
                  <div className="flex-1 min-w-0">
                    {module.internal ? (
                      <button
                        onClick={() => handleInternalLinkClick(module.link)}
                        className="focus:outline-none w-full text-left"
                      >
                        <span className="absolute inset-0" aria-hidden="true" />
                        <p className="text-sm font-medium text-gray-900">
                          {module.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {module.description}
                        </p>
                      </button>
                    ) : (
                      <Link href={module.link} className="focus:outline-none">
                        <span className="absolute inset-0" aria-hidden="true" />
                        <p className="text-sm font-medium text-gray-900">
                          {module.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {module.description}
                        </p>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gesundheitsberichte Sektion */}
          {showHealthReports && (
            <div
              id="health-reports-section"
              className="mt-10 pt-6 border-t border-gray-200"
            >
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Gesundheitsberichte
              </h2>
              <AdminHealthReports />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
