import React, { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { ICoinItem } from "@/models/CoinItem";

export type RarityType = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export type RarityModifier =
  | "Normal"
  | "Event"
  | "Premium Lootbox"
  | "Rare Lootbox"
  | "Legendary Lootbox";

// Rarity Farbdefinitionen
const RARITY_COLORS: Record<RarityType, string> = {
  Common: "bg-gray-400 border-gray-500",
  Uncommon: "bg-green-400 border-green-500",
  Rare: "bg-blue-400 border-blue-500",
  Epic: "bg-purple-400 border-purple-500",
  Legendary: "bg-amber-400 border-amber-500",
};

const RARITY_GRADIENTS: Record<RarityType, string> = {
  Common: "from-gray-400 to-gray-500",
  Uncommon: "from-green-400 to-green-600",
  Rare: "from-blue-400 to-blue-600",
  Epic: "from-purple-400 to-purple-600",
  Legendary: "from-amber-400 to-amber-600",
};

// Basis-Gewichtungen für die Rarities
const baseRarityWeights: Record<RarityType, number> = {
  Common: 50,
  Uncommon: 30,
  Rare: 15,
  Epic: 4,
  Legendary: 1,
};

// Multiplikatoren je nach Modifier
const rarityModifierMultipliers: Record<
  RarityModifier,
  Partial<Record<RarityType, number>>
> = {
  Normal: {},
  Event: {
    Rare: 1.5,
    Epic: 2,
    Legendary: 2,
  },
  "Premium Lootbox": {
    Rare: 1.5,
    Epic: 2.5,
    Legendary: 2.5,
  },
  "Rare Lootbox": {
    Rare: 2,
    Epic: 2.5,
    Legendary: 3,
  },
  "Legendary Lootbox": {
    Rare: 2,
    Epic: 3,
    Legendary: 5,
  },
};

function getAdjustedWeights(
  modifier: RarityModifier
): Record<RarityType, number> {
  const adjusted = { ...baseRarityWeights };
  const multipliers = rarityModifierMultipliers[modifier];
  for (const rarity in multipliers) {
    const r = rarity as RarityType;
    adjusted[r] = adjusted[r] * (multipliers[r] || 1);
  }
  return adjusted;
}

function easeInQuart(t: number) {
  return t * t * t * t;
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Baut einen "balanced pool" auf, in dem Items basierend auf Gewichtung und Zielanzahl verteilt werden.
 */
const TARGET_ITEMS = 20; // Anzahl der Items im Spinner

function distributeItems(
  weights: Record<RarityType, number>,
  targetCount: number
): Record<RarityType, number> {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const fractions = Object.entries(weights).map(([rarity, weight]) => ({
    rarity,
    fraction: (weight / totalWeight) * targetCount,
    originalWeight: weight,
  }));

  const rounded = fractions.map((f) => ({
    ...f,
    count: Math.floor(f.fraction),
    remainder: f.fraction - Math.floor(f.fraction),
  }));

  const totalRounded = rounded.reduce((sum, f) => sum + f.count, 0);
  const remaining = targetCount - totalRounded;

  const sorted = [...rounded].sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < remaining; i++) {
    sorted[i].count += 1;
  }

  const result = Object.fromEntries(
    sorted.map((f) => [f.rarity, f.count])
  ) as Record<RarityType, number>;

  return result;
}

// Props inkl. optionalem Callback, der nach dem Spin das gewonnene CoinItem übergibt.
type Props = {
  coinItems: ICoinItem[];
  modifier?: RarityModifier;
  onSpinComplete?: (wonItem: ICoinItem) => void;
  lootboxId?: string;
  hasKeys: boolean;
  // Neuer Prop: Gibt an, ob die Lootbox im Profil vorhanden ist.
  lootboxExistsInProfile: boolean;
};

// Interface für die API-Antwort
interface SpinResponse {
  success: boolean;
  message?: string;
}

const Spinner: React.FC<Props> = ({
  coinItems,
  modifier = "Normal",
  onSpinComplete,
  lootboxId,
  hasKeys,
  lootboxExistsInProfile,
}) => {
  const router = useRouter();
  // Erstelle eine gewichtete Liste von Items basierend auf TARGET_ITEMS
  const weightedItems = useMemo(() => {
    const counts = distributeItems(baseRarityWeights, TARGET_ITEMS);
    const itemsByRarity: Partial<Record<RarityType, ICoinItem[]>> = {};

    Object.entries(counts).forEach(([rarity, count]) => {
      const r = rarity as RarityType;
      const available = coinItems.filter((item) => item.rarity === r);
      if (available.length === 0) return;

      const repeated: ICoinItem[] = [];
      while (repeated.length < count) {
        repeated.push(...shuffleArray(available));
      }
      itemsByRarity[r] = shuffleArray(repeated).slice(0, count);
    });

    return shuffleArray(Object.values(itemsByRarity).flat());
  }, [coinItems]);

  // Fülle den Pool mit Platzhaltern, falls zu wenige Items vorhanden sind.
  const filledItems = useMemo(() => {
    return weightedItems.length < TARGET_ITEMS
      ? [
          ...weightedItems,
          ...new Array(TARGET_ITEMS - weightedItems.length).fill({
            _id: "placeholder",
            name: "Platzhalter",
            rarity: "Common" as RarityType,
          }),
        ]
      : weightedItems;
  }, [weightedItems]);

  const [shuffledItems, setShuffledItems] = useState<ICoinItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const itemCount = shuffledItems.length;

  // Initialize shuffled items only on client side to avoid hydration issues
  useEffect(() => {
    setShuffledItems(shuffleArray(filledItems));
    setIsHydrated(true);
  }, [filledItems]);
  const visibleCount = 5;
  const buffer = 4;

  // Responsive Dimensions via ResizeObserver
  const [itemWidth, setItemWidth] = useState(100);
  const [gap, setGap] = useState(16);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      const containerWidth = containerRef.current!.offsetWidth;
      const newGap = Math.min(32, Math.max(16, containerWidth * 0.02));
      const newItemWidth =
        (containerWidth - (visibleCount - 1) * newGap) / visibleCount;
      setItemWidth(Math.max(80, newItemWidth));
      setGap(newGap);
    };

    const observer = new ResizeObserver(updateDimensions);
    observer.observe(containerRef.current!);

    return () => observer.disconnect();
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(currentIndex);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<ICoinItem | null>(null);
  const [offset, setOffset] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Diese Funktion ruft die neue API (/api/spin) auf, die sowohl den Verbrauch
  // von Key & Lootbox als auch das Update des CoinBooks übernimmt.
  const updateSpin = async (coinItemId: string) => {
    try {
      const res = await fetch("/api/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modifier: modifier,
          newCoinItem: coinItemId,
          lootboxId: lootboxId,
        }),
      });
      const data = (await res.json()) as SpinResponse;
      if (!data.success) {
        throw new Error(data.message || "Fehler beim Spin-Update");
      }
    } catch (error) {
      console.error("Error in spin update:", error);
    }
  };

  const updateIndex = (newIndex: number) => {
    currentIndexRef.current = newIndex;
    setCurrentIndex(newIndex);
  };

  const getCircularItem = (index: number): ICoinItem =>
    shuffledItems[(index + itemCount) % itemCount];

  const preBuffer: ICoinItem[] = [];
  for (let i = buffer; i > 0; i--) {
    preBuffer.push(getCircularItem(currentIndex - i));
  }
  const visibleItems: ICoinItem[] = [];
  for (let i = 0; i < visibleCount; i++) {
    visibleItems.push(getCircularItem(currentIndex + i));
  }
  const postBuffer: ICoinItem[] = [];
  for (let i = 1; i <= buffer; i++) {
    postBuffer.push(getCircularItem(currentIndex + visibleCount - 1 + i));
  }
  const renderedItems = [...preBuffer, ...visibleItems, ...postBuffer];

  const baseTranslateX = -(buffer * (itemWidth + gap));
  const markerIndex = buffer + Math.floor(visibleCount / 2);

  const listStyle = {
    gap: `${gap}px`,
    transform: `translateX(${baseTranslateX + offset}px)`,
    transition:
      transitionDuration > 0
        ? `transform ${transitionDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
        : "none",
  };

  // --- Sound beim Markerwechsel ---
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Initialize audio only on client side
    if (typeof window !== 'undefined') {
      tickAudioRef.current = new Audio("/tick.mp3");
    }
  }, []);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    // Only play audio if initialized and on client side
    if (tickAudioRef.current && typeof window !== 'undefined') {
      tickAudioRef.current.currentTime = 0;
      tickAudioRef.current
        .play()
        .catch((err) => console.error("Audio playback failed:", err));
    }
  }, [currentIndex]);
  // --------------------------------

  useEffect(() => {
    if (winner) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [winner]);

  // Bestimme den Gewinner basierend auf gewichteten Wahrscheinlichkeiten
  function pickWeightedWinner(
    items: ICoinItem[],
    modifier: RarityModifier
  ): ICoinItem {
    const adjustedWeights = getAdjustedWeights(modifier);
    const totalWeight = items.reduce(
      (sum, coin) => sum + adjustedWeights[coin.rarity],
      0
    );
    let rnd = Math.random() * totalWeight;
    for (const coin of items) {
      rnd -= adjustedWeights[coin.rarity];
      if (rnd < 0) return coin;
    }
    return items[items.length - 1];
  }

  // Spin-Logik
  const autoSpin = async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setWinner(null);

    const winningItem = pickWeightedWinner(shuffledItems, modifier);
    const winningIndex = shuffledItems.findIndex(
      (item) => item._id === winningItem._id
    );

    const currentCenter =
      (currentIndexRef.current + Math.floor(visibleCount / 2)) % itemCount;
    let stepsToWinner = (winningIndex - currentCenter + itemCount) % itemCount;
    if (stepsToWinner === 0) stepsToWinner = itemCount;

    const extraSpins = 3;
    const totalSteps = extraSpins * itemCount + stepsToWinner;
    const totalDuration = 10000; // Gesamtzeit in ms

    const spinStep = (stepNumber: number) => {
      if (stepNumber > totalSteps) {
        setIsSpinning(false);
        setWinner(winningItem);
        updateSpin(winningItem._id as string); // Hier casten wir _id zu string
        if (onSpinComplete) {
          onSpinComplete(winningItem);
        }
        return;
      }
      const t0 = (stepNumber - 1) / totalSteps;
      const t1 = stepNumber / totalSteps;
      const stepDuration = (easeInQuart(t1) - easeInQuart(t0)) * totalDuration;

      setTransitionDuration(stepDuration);
      setOffset(-(itemWidth + gap));

      setTimeout(() => {
        updateIndex((currentIndexRef.current + 1) % itemCount);
        setTransitionDuration(0);
        setOffset(0);
        setTimeout(() => {
          spinStep(stepNumber + 1);
        }, 20);
      }, stepDuration);
    };

    spinStep(1);
  };

  // Show loading state until items are hydrated
  if (!isHydrated || shuffledItems.length === 0) {
    return (
      <div className="relative w-full min-h-screen bg-gray-900 p-4 sm:p-8 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-32 h-8 bg-gray-700 rounded mx-auto mb-4"></div>
            <div className="flex gap-4 justify-center mb-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-16 h-16 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            <div className="w-24 h-12 bg-gray-700 rounded mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-400">Lade Spinner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-gray-900 p-4 sm:p-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-screen-2xl px-4" ref={containerRef}>
        <div className="relative">
          {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] border-4 border-white/20 rounded-xl shadow-spinner-glow" />
          </div> */}

          <div className="overflow-hidden mx-auto rounded-xl bg-gray-800/30 backdrop-blur-lg p-4 shadow-2xl">
            <ul className="flex m-0 p-0 list-none" style={listStyle}>
              {renderedItems.map((item, idx) => {
                const isMarker = idx === markerIndex;
                return (
                  <li
                    key={idx}
                    className={`flex-shrink-0 p-2 flex flex-col items-center justify-center rounded-lg transition-all duration-300 ${
                      isMarker
                        ? "scale-125 z-20 shadow-2xl"
                        : "opacity-75 scale-100 sm:scale-90 hover:scale-95"
                    }`}
                    style={{
                      width: `${itemWidth}px`,
                      minHeight: `${itemWidth}px`,
                    }}
                  >
                    <div
                      className={`w-full h-full rounded-lg border-2 ${
                        RARITY_COLORS[item.rarity]
                      } flex flex-col items-center justify-center p-2 ${
                        isMarker ? "animate-border-glow" : ""
                      }`}
                    >
                      <span
                        className={`text-[0.6rem] sm:text-xs font-black uppercase tracking-wide ${
                          isMarker ? "text-white" : "text-gray-100/80"
                        }`}
                      >
                        {item.rarity}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex justify-center mt-8 sm:mt-12">
            <button
              onClick={autoSpin}
              disabled={!lootboxExistsInProfile || !hasKeys || isSpinning}
              className="relative px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-bold text-white shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <svg
                  className={`w-6 h-6 ${isSpinning ? "animate-spin-fast" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="text-sm sm:text-base tracking-wider">
                  {isSpinning ? "SPINNING..." : "START SPIN"}
                </span>
              </div>
              <div className="absolute inset-0 bg-noise opacity-20 rounded-xl" />
            </button>
          </div>
        </div>

        {!isSpinning && winner && (
          <div className="mt-10 animate-slide-up">
            <div className="max-w-md mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-1 shadow-2xl">
              <div className="bg-gray-900 rounded-xl p-6 text-center relative overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${
                    RARITY_GRADIENTS[winner.rarity]
                  } opacity-10 pointer-events-none`}
                />
                <h3 className="text-xl font-bold text-white mb-4">
                  🎉 You won! 🎉
                </h3>
                <div
                  className={`inline-block p-1 rounded-lg bg-gradient-to-r ${
                    RARITY_GRADIENTS[winner.rarity]
                  }`}
                >
                  <div className="bg-gray-900 rounded-md px-6 py-4">
                    <p className="text-lg font-semibold text-white mb-2">
                      {winner.name}
                    </p>
                    <span
                      className={`text-sm font-black uppercase tracking-wide bg-gradient-to-r ${
                        RARITY_GRADIENTS[winner.rarity]
                      } bg-clip-text text-transparent`}
                    >
                      {winner.rarity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="confetti-animation" />
          </div>
        )}
      </div>
      {/* Navigation: Button, um zurück zum Profil zu gelangen */}
      <div className="mt-8">
        <button
          onClick={() => router.push("/profile")}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-600 transition-all duration-200"
        >
          Zurück zum Profil
        </button>
      </div>
    </div>
  );
};

export default Spinner;
