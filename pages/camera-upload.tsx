/* eslint-disable @next/next/no-img-element */
import { useState, ChangeEvent, FormEvent } from "react";
import imageCompression from "browser-image-compression";
import {
  Button,
  Container,
  Box,
  Typography,
  Alert,
  Card,
  CircularProgress,
} from "@mui/material";
import { CameraAlt, Send } from "@mui/icons-material";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);

    try {
      // Kompressionsoptionen anpassen (max. 1MB, max. Breite/Höhe 1024px)
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      const formData = new FormData();
      formData.append("file", compressedFile);

      const res = await fetch("/api/telegram", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMessage({
        type: data.ok ? "success" : "error",
        text: data.ok
          ? "Bild erfolgreich versendet!"
          : "Fehler beim Versenden des Bildes.",
      });
    } catch (error) {
      console.error("Fehler beim Komprimieren oder Senden:", error);
      setMessage({ type: "error", text: "Ein Fehler ist aufgetreten." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md" className="min-h-screen py-8">
      <Box className="text-center mb-8">
        <Typography
          variant="h3"
          component="h1"
          className="font-bold text-gray-800 mb-2"
        >
          Bildversand
        </Typography>
        <Typography variant="subtitle1" className="text-gray-600">
          Fotografieren Sie ein Bild und senden es direkt per Telegram
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Box className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <Box className="text-center">
            <input
              accept="image/*"
              capture="environment"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button
                component="span"
                variant="outlined"
                color="primary"
                startIcon={<CameraAlt />}
                className="w-full md:w-auto px-8 py-4 rounded-full"
                size="large"
              >
                {file ? "Foto ersetzen" : "Foto aufnehmen"}
              </Button>
            </label>
          </Box>

          {previewUrl && (
            <Card className="overflow-hidden rounded-lg">
              <img
                src={previewUrl}
                alt="Vorschau"
                className="w-full h-64 object-contain bg-gray-100"
              />
            </Card>
          )}

          <Box className="text-center">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Send />
                )
              }
              className="w-full md:w-auto px-8 py-4 rounded-full"
              size="large"
              disabled={!file || isLoading}
            >
              {isLoading ? "Wird gesendet..." : "Bild senden"}
            </Button>
          </Box>
        </Box>
      </form>

      {message && (
        <Box className="mt-6">
          <Alert
            severity={message.type as "success" | "error"}
            className="rounded-lg"
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        </Box>
      )}
    </Container>
  );
}
