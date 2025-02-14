/* eslint-disable @typescript-eslint/no-explicit-any */
import { ICoinBook } from "@/models/CoinBook";
import { ICoinItem } from "@/models/CoinItem";
import { useEffect, useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  styled,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SlideToConfirm from "@/components/slideToConfirm/SlideToConfirm";

interface CoinItemWrapper {
  coinItems: ICoinItem[];
  success: boolean;
}

interface CoinBookWrapper {
  coinBook: ICoinBook;
  success: boolean;
}

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

const modalStyle = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  borderRadius: "16px",
  boxShadow: 24,
  p: 0,
  width: "90%",
  maxWidth: 400,
  backgroundImage: "url(/paper-texture.png)",
  backgroundRepeat: "repeat",
  backgroundBlendMode: "multiply",
  border: "3px solid #e5e7eb",
};

const WarningBox = () => (
  <div className="mb-8 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-lg shadow-sm">
    <div className="flex items-center">
      <svg
        className="w-6 h-6 text-orange-400 mr-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-orange-800">Achtung</h3>
    </div>
    <p className="mt-2 text-sm text-orange-700">
      Wenn du bereits das Maximum an Münzen oder Splitter erreicht hast, die für
      das Einlösen nötig sind, kannst du keine weiteren mehr sammeln.
      Überschüssige Münzen aus Lootboxes werden automatisch gelöscht.
    </p>
  </div>
);

// Überarbeitete Accordion-Komponente (cleanes, textbasiertes Design)
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

export default function CoinBookPage() {
  const [coinBook, setCoinBook] = useState<ICoinBook | null>(null);
  const [coinItems, setCoinItems] = useState<ICoinItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<RedeemEntry | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coinBookRes, coinItemsRes] = await Promise.all([
          fetch("/api/coinbooks"),
          fetch("/api/coinitems"),
        ]);

        if (!coinBookRes.ok)
          throw new Error("Fehler beim Laden der CoinBook-Daten.");
        if (!coinItemsRes.ok)
          throw new Error("Fehler beim Laden der CoinItems.");

        const coinBookData: CoinBookWrapper = await coinBookRes.json();
        const coinItemsData: CoinItemWrapper = await coinItemsRes.json();

        setCoinBook(coinBookData.coinBook);
        setCoinItems(coinItemsData.coinItems);
      } catch (err: any) {
        console.error(err);
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
      const data: CoinBookWrapper = await res.json();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">
        {error}
      </div>
    );

  if (!coinBook)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-xl">
        Coin book not found
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <WarningBox />
        </header>

        {collectedItems.length > 0 ? (
          <Grid container spacing={2}>
            {collectedItems.map((coinItem) => {
              const quantity = getQuantityForItem(coinItem);
              const canRedeem = quantity >= coinItem.neededAmount;
              const progressPercentage =
                (quantity / coinItem.neededAmount) * 100;
              return (
                <Grid item xs={12} sm={6} md={4} key={coinItem._id.toString()}>
                  <div className="relative bg-white rounded-2xl shadow-xl p-6 border-4 border-white group overflow-hidden">
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 mix-blend-multiply" />
                      <div className="holographic-pattern" />
                    </div>

                    <div className="absolute inset-0 bg-paper-texture opacity-10 pointer-events-none" />

                    <div className="relative z-10 flex justify-center mb-4">
                      <div
                        className={`w-20 h-20 rounded-full ${getRarityColor(
                          coinItem.rarity
                        )} flex items-center justify-center shadow-lg border-4 border-white`}
                      >
                        {/* <span className="text-3xl">🪙</span> */}
                      </div>
                      <div
                        className={`absolute -top-2 -right-2 px-4 py-1 rounded-full text-sm font-semibold ${getRarityColor(
                          coinItem.rarity
                        )} text-white shadow-md transform rotate-6`}
                      >
                        {coinItem.rarity}
                      </div>
                    </div>

                    <div className="relative z-10">
                      <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-1 font-lora">
                          {coinItem.name}
                        </h2>
                        <p className="text-gray-600 text-sm md:text-base">
                          {coinItem.description}
                        </p>
                      </div>

                      <div className="mb-6">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Collected: {quantity}/{coinItem.neededAmount}
                          </span>
                          <span className="text-sm text-gray-500">
                            {progressPercentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getRarityColor(
                              coinItem.rarity
                            )} transition-all duration-500`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setSelectedEntry({
                            coinItem,
                            quantity,
                          })
                        }
                        disabled={!canRedeem}
                        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                          canRedeem
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {canRedeem ? "Redeem Power ⚡" : "Collect More"}
                      </button>
                    </div>
                  </div>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Typography variant="body1" className="mb-6">
            Noch keine Münzen gesammelt.
          </Typography>
        )}

        {/* Überarbeiteter Accordion für nicht gesammelte Münzen */}
        <StyledAccordion>
          <AccordionSummary expandIcon={null}>
            <AccordionTrigger>
              <ExpandMoreIcon className="text-gray-500" />
              <span className="text-lg font-medium text-gray-700">
                Ungesammelt ({notCollectedItems.length})
              </span>
            </AccordionTrigger>
          </AccordionSummary>
          <AccordionDetails>
            {notCollectedItems.length > 0 ? (
              <Grid container spacing={2}>
                {notCollectedItems.map((coinItem) => {
                  const quantity = getQuantityForItem(coinItem);
                  const canRedeem = quantity >= coinItem.neededAmount;
                  const progressPercentage =
                    (quantity / coinItem.neededAmount) * 100;
                  return (
                    <Grid
                      item
                      xs={12}
                      sm={6}
                      md={4}
                      key={coinItem._id.toString()}
                    >
                      <div className="relative bg-white rounded-2xl shadow-xl p-6 border-4 border-white group overflow-hidden">
                        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 mix-blend-multiply" />
                          <div className="holographic-pattern" />
                        </div>

                        <div className="absolute inset-0 bg-paper-texture opacity-10 pointer-events-none" />

                        <div className="relative z-10 flex justify-center mb-4">
                          <div
                            className={`w-20 h-20 rounded-full ${getRarityColor(
                              coinItem.rarity
                            )} flex items-center justify-center shadow-lg border-4 border-white`}
                          >
                            {/* <span className="text-3xl">🪙</span> */}
                          </div>
                          <div
                            className={`absolute -top-2 -right-2 px-4 py-1 rounded-full text-sm font-semibold ${getRarityColor(
                              coinItem.rarity
                            )} text-white shadow-md transform rotate-6`}
                          >
                            {coinItem.rarity}
                          </div>
                        </div>

                        <div className="relative z-10">
                          <div className="text-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800 mb-1 font-lora">
                              {coinItem.name}
                            </h2>
                            <p className="text-gray-600 text-sm md:text-base">
                              {coinItem.description}
                            </p>
                          </div>

                          <div className="mb-6">
                            <div className="flex justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Collected: {quantity}/{coinItem.neededAmount}
                              </span>
                              <span className="text-sm text-gray-500">
                                {progressPercentage.toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getRarityColor(
                                  coinItem.rarity
                                )} transition-all duration-500`}
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              setSelectedEntry({
                                coinItem,
                                quantity,
                              })
                            }
                            disabled={!canRedeem}
                            className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                              canRedeem
                                ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02]"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {canRedeem ? "Redeem Power ⚡" : "Collect More"}
                          </button>
                        </div>
                      </div>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography variant="body1">
                Alle Münzen wurden bereits gesammelt.
              </Typography>
            )}
          </AccordionDetails>
        </StyledAccordion>
      </div>

      <Modal
        open={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        BackdropProps={{ style: { backgroundColor: "rgba(0,0,0,0.2)" } }}
      >
        <Box sx={modalStyle}>
          <div className="p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-80 z-0" />
            <div className="relative z-10">
              <Typography
                variant="h5"
                className="font-lora text-center mb-4 text-gray-800"
              >
                🔥 Freischalten 🔥
              </Typography>
              <Typography
                variant="body1"
                className="text-center mb-6 text-gray-600"
              >
                Du bist dabei,{" "}
                <span className="font-semibold text-purple-600">
                  {selectedEntry?.coinItem.name}
                </span>{" "}
              </Typography>
              <SlideToConfirm onConfirm={handleConfirmRedeem} />
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
