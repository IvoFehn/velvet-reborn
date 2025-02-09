/* eslint-disable @next/next/no-img-element */
// components/Shop.tsx
import { useState, useEffect } from "react";
import { Item, Profile } from "@/types/profile";

// --- MUI imports ---
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
// (Or import { Badge } from '@mui/material' if you prefer MUI's <Badge /> component)
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

interface ItemsByCategory {
  [category: string]: Item[];
}

const Shop = () => {
  const [itemsByCategory, setItemsByCategory] = useState<ItemsByCategory>({});
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, profileRes] = await Promise.all([
          fetch("/api/items"),
          fetch("/api/profile/get"),
        ]);

        const [itemsData, profileData] = await Promise.all([
          itemsRes.json(),
          profileRes.json(),
        ]);

        const categorized = itemsData.reduce(
          (acc: ItemsByCategory, item: Item) => {
            acc[item.category] = [...(acc[item.category] || []), item];
            return acc;
          },
          {}
        );

        setItemsByCategory(categorized);
        // Hier extrahieren wir das eigentliche Profil aus profileData.data
        setProfile(profileData.data);
      } catch (err) {
        setError("Failed to load data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePurchase = async (itemId: string, price: number) => {
    if (!profile || profile.gold < price) return;

    try {
      const res = await fetch("/api/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setProfile(data.data as Profile);
      } else {
        setError(data.error || "Purchase failed");
      }
    } catch (err) {
      setError("Error processing purchase");
      console.error(err);
    }
  };

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-600">
          {/* Replacing Icons.alert with a MUI icon */}
          <WarningAmberIcon fontSize="small" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Marketplace
          </h1>
          <p className="mt-2 text-gray-500">
            Discover exclusive items and upgrades
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2">
          {/* Replacing Icons.coin with a MUI icon */}
          <MonetizationOnIcon className="text-white" fontSize="small" />
          <span className="font-semibold text-white">
            {loading ? (
              <Skeleton
                variant="text"
                width={50}
                sx={{ bgcolor: "rgba(255,255,255,0.3)" }}
              />
            ) : (
              new Intl.NumberFormat().format(profile?.gold ?? 0)
            )}
          </span>
        </div>
      </header>

      {loading ? (
        <div className="grid gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <Skeleton
                variant="text"
                width={200}
                height={32}
                className="mb-4 rounded-lg"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} variant="rectangular" height={300} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        Object.entries(itemsByCategory).map(([category, items]) => (
          <section key={category} className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold capitalize text-gray-800 dark:text-gray-200">
                {category}
              </h2>

              {/* Replacing Badge with MUI's Chip component */}
              <Chip
                label={`${items.length} items`}
                variant="outlined"
                color="secondary"
                className="px-3 py-1"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article
                  key={item._id}
                  className="group relative overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="relative aspect-square">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw,
                             (max-width: 1200px) 50vw,
                             33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 to-transparent" />
                  </div>

                  <div className="p-4">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {item.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* Replacing Icons.coin with MonetizationOnIcon from MUI */}
                        <MonetizationOnIcon
                          fontSize="small"
                          className="text-amber-500"
                        />
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {new Intl.NumberFormat().format(item.price)}
                        </span>
                      </div>

                      {/* Replacing the custom Button with MUI Button */}
                      <Button
                        onClick={() => handlePurchase(item._id, item.price)}
                        disabled={!profile || profile.gold < item.price}
                        variant="contained"
                        size="small"
                        className="gap-2 transition-transform hover:scale-105"
                        startIcon={<ShoppingCartIcon fontSize="small" />}
                      >
                        Purchase
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
};

export default Shop;
