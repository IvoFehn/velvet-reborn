import React from "react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { checkAuth } from "@/components/navigation/NavBar";
import AdminDashboard from "@/components/AdminDashboard/AdminDashboard";

const AdminPage: React.FC = () => {
  const router = useRouter();

  // Authentifizierungsprüfung auf Seitenebene
  useEffect(() => {
    // Wenn nicht authentifiziert, zur Startseite umleiten
    if (!checkAuth()) {
      router.push("/");
    }
  }, [router]);

  return <AdminDashboard />;
};

export default AdminPage;
