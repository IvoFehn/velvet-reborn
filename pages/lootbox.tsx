/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { ICoinItem } from "@/models/CoinItem";
import Spinner, { RarityModifier } from "@/components/spinner/Spinner";
import { CircularProgress, Typography, Button, Box } from "@mui/material";
import { IProfile } from "@/models/Profile";

const LootboxPage: NextPage = () => {
  const router = useRouter();
  // Hole die Lootbox-ID aus dem Query-Parameter "id"
  const { id: lootboxId } = router.query;

  const [items, setItems] = useState<ICoinItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [refetch, setRefetch] = useState<boolean>(false);

  // Neuer State für die vollständigen Lootbox-Daten
  const [lootbox, setLootbox] = useState<any>(null);
  const [loadingLootbox, setLoadingLootbox] = useState(true);

  // CoinItems laden
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/gaming?action=coinbook");
        const data = await res.json();
        if (data.data) setItems(data.data.items || []);
      } catch (error) {
        console.error("Fetch error:", error);
      }
      setLoadingItems(false);
    };
    fetchItems();
  }, []);

  // Profil laden
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user?action=profile");
        const data = await res.json();
        if (data.data) setProfile(data.data || null);
      } catch (error) {
        console.error("Profile fetch error:", error);
      }
      setLoadingProfile(false);
    };
    fetchProfile();
  }, [refetch]);

  // Lootbox anhand der übergebenen ID laden
  useEffect(() => {
    const fetchLootbox = async () => {
      if (!lootboxId || typeof lootboxId !== "string") {
        setLoadingLootbox(false);
        return;
      }
      try {
        const res = await fetch(`/api/gaming?action=lootbox&id=${lootboxId}`);
        const data = await res.json();
        if (data.data) {
          setLootbox(data.data);
        }
      } catch (error) {
        console.error("Lootbox fetch error:", error);
      }
      setLoadingLootbox(false);
    };
    fetchLootbox();
  }, [lootboxId]);

  if (loadingItems || loadingProfile || loadingLootbox) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <Box textAlign="center">
          <CircularProgress size={60} className="text-blue-500" />
          <Typography variant="h6" className="mt-4 text-gray-600">
            Lootbox lädt...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Prüfe, ob der Benutzer mindestens einen Schlüssel hat
  if (profile && profile.keys <= 0) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <Box textAlign="center">
          <Typography variant="h5" className="text-red-500 mb-4">
            Kein Schlüssel
          </Typography>
          <Typography variant="body1" className="text-gray-600 mb-4">
            Du brauchst mindestens einen Schlüssel zum Öffnen dieser Lootbox.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push("/shop")}
            className="mr-2"
          >
            Zum Shop
          </Button>
          <Button variant="outlined" onClick={() => router.back()}>
            Go Back
          </Button>
        </Box>
      </Box>
    );
  }

  if (!lootbox) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <Typography variant="h6" color="error">
          Lootbox nicht gefunden.
        </Typography>
      </Box>
    );
  }

  // Hier prüfen wir, ob die geladene Lootbox im Profil vorhanden ist
  const lootboxExistsInProfile =
    profile?.lootboxes?.some((item) => {
      // Vergleiche die Lootbox-ID aus dem Profil mit der geladenen Lootbox-ID
      return item.lootbox._id.toString() === lootbox._id.toString();
    }) || false;

  return (
    <Box className="min-h-screen flex items-center justify-center">
      <Spinner
        coinItems={items}
        // Übergebe den Lootbox-Typ als modifier (z.B. "Normal", "Event" etc.)
        modifier={lootbox.type as RarityModifier}
        // Zusätzlich wird die Lootbox-ID als extra Prop übergeben
        lootboxId={lootbox._id}
        onSpinComplete={() => setRefetch((prev) => !prev)}
        hasKeys={!!profile?.keys}
        // Übergibt den Boolean, ob die Lootbox im Profil vorhanden ist
        lootboxExistsInProfile={lootboxExistsInProfile}
      />
    </Box>
  );
};

export default LootboxPage;
