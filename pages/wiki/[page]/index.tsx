// pages/wiki/[page].tsx
import { useEffect, useState } from "react";
import Wiki from "@/components/Wiki/Wiki";
import { checkAuth } from "@/components/navigation/NavBar";

export default function WikiPage() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    // Client-seitige Authentifizierungsprüfung
    setIsAuthed(checkAuth());
  }, []);

  return <Wiki isAuthed={isAuthed} />;
}
