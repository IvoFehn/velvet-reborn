import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <style>{`
          /* Globale Styles */
          main {
            margin-top: 0;
          }

          /* Regeln-Modal Styling:
             Das Modal überdeckt den gesamten Bildschirm und zwingt den Nutzer, die Regeln erneut und aufmerksam zu lesen,
             bevor er starten kann.
          */
          #rules-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5); /* Halbtransparentes Overlay */
            display: none; /* standardmäßig versteckt */
            align-items: center;
            justify-content: center;
            z-index: 10000; /* Über allen anderen Elementen */
          }

          #rules-modal .modal-content {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            max-width: 600px;
            width: 90%;
            text-align: center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          }

          #rules-modal a {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 4px;
          }
        `}</style>
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />

        {/* Regeln-Modal, das den gesamten Bildschirm überdeckt */}
        <div id="rules-modal">
          <div className="modal-content">
            <p>
              Die Regeln müssen erneut und aufmerksam gelesen werden, bevor du
              starten kannst.
            </p>
            <a href="/rules">Zu den Regeln</a>
          </div>
        </div>

        {/* Skript zur Steuerung des Modals */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function hasAcceptedRules() {
                  return document.cookie.includes("rulesAccepted=true");
                }
                function isRulesPage() {
                  return window.location.pathname.includes("/rules");
                }
                var modal = document.getElementById("rules-modal");
                if (!hasAcceptedRules() && !isRulesPage()) {
                  modal.style.display = "flex";
                } else {
                  modal.style.display = "none";
                }
              })();
            `,
          }}
        />
      </body>
    </Html>
  );
}
