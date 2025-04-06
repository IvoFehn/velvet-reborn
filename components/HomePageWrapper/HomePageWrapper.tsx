/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
import { isEventActive } from "@/util/isEventActive";
import Link from "next/link";
import { useRouter } from "next/router";

interface HomePageWrapperProps {
  children?: React.ReactNode;
}

export default function HomePageWrapper({ children }: HomePageWrapperProps) {
  // States für den Event-Banner
  const [activeEvent, setActiveEvent] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true); // Neuer State zur Verfolgung des Ladestatus
  const [bannerVisible, setBannerVisible] = useState(true);

  // State für das Rules-Modal
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Router für Pfad-Überprüfung
  const router = useRouter();

  // Verwendung des useWindowSize Hooks von react-use
  const { width, height } = useWindowSize();

  // useEffect: Prüfe, ob ein aktives Event vorliegt
  useEffect(() => {
    const checkEvents = async () => {
      try {
        setLoadingEvents(true);
        const active = await isEventActive();
        console.log("Ergebnis des Event-Checks:", active);
        setActiveEvent(active);
      } catch (error) {
        console.error("Fehler beim Überprüfen der Events:", error);
        setActiveEvent(false);
      } finally {
        setLoadingEvents(false);
      }
    };

    checkEvents();

    // Häufigeres Überprüfen (jede Minute statt alle 5 Minuten)
    const interval = setInterval(checkEvents, 60000);
    return () => clearInterval(interval);
  }, []);

  // useEffect: Prüfe, ob die Regeln bereits akzeptiert wurden
  useEffect(() => {
    // Regeln nicht anzeigen, wenn wir bereits auf der Regeln-Seite sind
    const isRulesPage = router.pathname.includes("/rules");
    if (isRulesPage) {
      setShowRulesModal(false);
      return;
    }

    // Prüfe, ob Nutzer Regeln akzeptiert hat
    const hasAcceptedRules = document.cookie.includes("rulesAccepted=true");
    setShowRulesModal(!hasAcceptedRules);
  }, [router.pathname]);

  // Separiere Navbar-Element und Content-Element aus children
  // Annahme: Das erste Element ist die NavBar
  const childrenArray = React.Children.toArray(children);
  const navBarElement = childrenArray[0];
  const contentElements = childrenArray.slice(1);

  return (
    <>
      {/* NavBar-Element bleibt außerhalb des Inhaltsbereichs */}
      {navBarElement}

      {/* Confetti anzeigen, wenn ein aktives Event vorliegt */}
      {/* {activeEvent && (
        <Confetti width={width} height={height} numberOfPieces={50} />
      )} */}

      {activeEvent && bannerVisible && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white py-3 px-4 flex items-center justify-between shadow-lg z-50">
          <Link
            href="/active-event"
            className="flex-1 hover:underline cursor-pointer"
          >
            <div className="flex items-center">
              🎉{" "}
              <span className="ml-2">
                Aktuelles Event läuft! Klicke hier für Details.
              </span>
            </div>
          </Link>
          <button
            className="text-white text-xl ml-4"
            onClick={(e) => {
              e.preventDefault(); // Verhindert, dass der Link bei Klick auf den Button aktiviert wird
              setBannerVisible(false);
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Regeln-Modal */}
      {showRulesModal && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white p-8 rounded-lg max-w-[600px] w-[90%] text-center shadow-lg">
            <p className="text-lg mb-4">
              Die Regeln müssen erneut und aufmerksam gelesen werden, bevor du
              starten kannst.
            </p>
            <Link
              href="/rules"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Zu den Regeln
            </Link>
          </div>
        </div>
      )}

      {/* Hauptinhalt, der unter der NavBar kommt */}
      <div
        className="min-h-screen bg-gray-50 p-4 md:p-6"
        style={{
          paddingTop: activeEvent && bannerVisible ? "60px" : undefined,
        }}
      >
        {contentElements}
      </div>
    </>
  );
}
