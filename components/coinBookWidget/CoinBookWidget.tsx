/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICoinBook } from "@/models/CoinBook";
import { ICoinItem } from "@/models/CoinItem";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Modal,
  Box,
  Typography,
  styled,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SlideToConfirm from "@/components/slideToConfirm/SlideToConfirm";
import { useRouter } from "next/router";

// Hilfsfunktion für die Raritätsfarbe
const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case "Common":
      return "bg-gray-400";
    case "Uncommon":
      return "bg-green-400";
    case "Rare":
      return "bg-blue-400";
    case "Epic":
      return "bg-purple-400";
    case "Legendary":
      return "bg-orange-400";
    default:
      return "bg-gray-400";
  }
};

// Styled Components
const StyledAccordion = styled(Accordion)(() => ({
  background: "transparent !important",
  boxShadow: "none !important",
  "&:before": {
    display: "none",
  },
  "& .MuiAccordionSummary-root": {
    padding: "0 !important",
    minHeight: "auto !important",
  },
  "& .MuiAccordionSummary-content": {
    margin: "0 !important",
    "&.Mui-expanded": {
      margin: "0 !important",
    },
  },
  "& .MuiAccordionDetails-root": {
    padding: "16px 0 0 0 !important",
  },
}));

const AccordionTrigger = styled("button")(() => ({
  all: "unset",
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "12px 0",
  cursor: "pointer",
  color: "#4b5563",
  transition: "all 0.2s ease",
  "&:hover": {
    color: "#374151",
  },
  "& svg": {
    transition: "transform 0.2s ease",
  },
  "&[aria-expanded='true'] svg": {
    transform: "rotate(180deg)",
  },
}));

interface RedeemEntry {
  coinItem: ICoinItem;
  quantity: number;
}

export const CoinBookWidget = () => {
  const [coinBook, setCoinBook] = useState<ICoinBook | null>(null);
  const [coinItems, setCoinItems] = useState<ICoinItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<RedeemEntry | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coinBookRes, coinItemsRes] = await Promise.all([
          fetch("/api/coinbooks"),
          fetch("/api/coinitems"),
        ]);

        if (!coinBookRes.ok || !coinItemsRes.ok) {
          throw new Error("Fehler beim Laden der Daten");
        }

        const coinBookData = await coinBookRes.json();
        const coinItemsData = await coinItemsRes.json();

        setCoinBook(coinBookData.coinBook);
        setCoinItems(coinItemsData.coinItems);
      } catch (err: any) {
        setError(err.message || "Unbekannter Fehler");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleConfirmRedeem = async () => {
    if (!selectedEntry) return;
    try {
      const res = await fetch("/api/coinbooks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coinItem: selectedEntry.coinItem._id,
          quantity: selectedEntry.quantity,
        }),
      });
      if (!res.ok) throw new Error("Einlösen fehlgeschlagen");
      const data = await res.json();
      setCoinBook(data.coinBook);
      setSelectedEntry(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  const getQuantityForItem = (coinItem: ICoinItem): number => {
    if (!coinBook) return 0;
    const entry = coinBook.entries.find((e: any) => {
      const id =
        typeof e.coinItem === "object" && e.coinItem._id
          ? e.coinItem._id.toString()
          : e.coinItem.toString();
      return id === coinItem._id.toString();
    });
    return entry ? entry.quantity : 0;
  };

  const rarityOrder: Record<string, number> = {
    Common: 1,
    Uncommon: 2,
    Rare: 3,
    Epic: 4,
    Legendary: 5,
  };

  const sortedCoinItems = [...coinItems].sort(
    (a, b) => (rarityOrder[a.rarity] || 99) - (rarityOrder[b.rarity] || 99)
  );

  const collectedItems = sortedCoinItems.filter(
    (coin) => getQuantityForItem(coin) > 0
  );
  const notCollectedItems = sortedCoinItems.filter(
    (coin) => getQuantityForItem(coin) === 0
  );

  if (loading)
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );

  if (error)
    return <div className="text-red-500 text-center py-4">{error}</div>;

  if (!coinBook) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mt-6 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span>🏦 Münzbuch</span>
          <span className="text-sm text-gray-500 font-normal">
            ({collectedItems.length}/{coinItems.length})
          </span>
        </h3>
        {/* Link zur vollständigen Münzbuch-Seite */}
        <button
          onClick={() => router.push("/coinbook")} // Navigiere zur /coinbook-Seite
          className="text-sm text-blue-500 hover:text-blue-600 font-semibold underline"
        >
          Alle anzeigen
        </button>
      </div>

      <div className="space-y-4">
        {collectedItems.length > 0 ? (
          <Grid container spacing={2}>
            {collectedItems.map((coinItem) => {
              const quantity = getQuantityForItem(coinItem);
              const canRedeem = quantity >= coinItem.neededAmount;
              const progressPercentage =
                (quantity / coinItem.neededAmount) * 100;
              return (
                <Grid item xs={6} sm={4} key={coinItem._id.toString()}>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div
                      className={`w-12 h-12 rounded-full ${getRarityColor(
                        coinItem.rarity
                      )} mb-2 flex items-center justify-center`}
                    >
                      {/* <span className="text-2xl">🪙</span> */}
                    </div>
                    <h4 className="font-semibold">{coinItem.name}</h4>
                    <p className="text-sm text-gray-600">
                      {quantity}/{coinItem.neededAmount}
                    </p>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full ${getRarityColor(coinItem.rarity)}`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <button
                      onClick={() =>
                        setSelectedEntry({
                          coinItem,
                          quantity,
                        })
                      }
                      disabled={!canRedeem}
                      className={`w-full mt-2 py-1 px-2 rounded-lg text-sm font-semibold ${
                        canRedeem
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {canRedeem ? "Einlösen ⚡" : "Sammle mehr"}
                    </button>
                  </div>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <p className="text-gray-500 text-center">
            Noch keine Münzen gesammelt
          </p>
        )}

        <StyledAccordion>
          <AccordionSummary>
            <AccordionTrigger>
              <ExpandMoreIcon />
              <span>Ungesammelt ({notCollectedItems.length})</span>
            </AccordionTrigger>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {notCollectedItems.map((coinItem) => (
                <Grid item xs={6} sm={4} key={coinItem._id.toString()}>
                  <div className="bg-gray-50 p-3 rounded-lg opacity-50">
                    <div
                      className={`w-12 h-12 rounded-full ${getRarityColor(
                        coinItem.rarity
                      )} flex items-center justify-center`}
                    >
                      {/* <span className="text-2xl">🪙</span> */}
                    </div>
                    <h4 className="font-semibold mt-2">{coinItem.name}</h4>
                  </div>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </StyledAccordion>
      </div>

      <Modal
        open={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        BackdropProps={{ style: { backgroundColor: "rgba(0,0,0,0.2)" } }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            borderRadius: "16px",
            boxShadow: 24,
            p: 4,
            width: "90%",
            maxWidth: 400,
          }}
        >
          <Typography variant="h6" className="text-center mb-4">
            🔥 Freischalten 🔥
          </Typography>
          <Typography variant="body1" className="text-center mb-6">
            Du bist dabei,{" "}
            <span className="font-semibold text-purple-600">
              {selectedEntry?.coinItem.name}
            </span>{" "}
            freizuschalten.
          </Typography>
          <SlideToConfirm onConfirm={handleConfirmRedeem} />
        </Box>
      </Modal>
    </div>
  );
};
