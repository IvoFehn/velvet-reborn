/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, ChangeEvent } from "react";

const CameraUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) {
      setMessage("Bitte wähle zuerst ein Bild aus");
      return;
    }
    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("photo", selectedFile);

    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setMessage("Bild erfolgreich gesendet! 🎉");
        setPreview(null);
        setSelectedFile(null);
      } else {
        const errorText = await res.text();
        setMessage(`Fehler: ${errorText || "Serverfehler"}`);
      }
    } catch (error: any) {
      setMessage(`Netzwerkfehler: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Foto hochladen</h1>

      <div className="upload-section">
        <label className="file-input-label">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden-input"
            disabled={uploading}
          />
          <div className="camera-button">
            <svg className="camera-icon" viewBox="0 0 24 24">
              <path d="M4 4h3l2-2h4l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m10 6a4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4 4 4 0 0 1 4 4m2 0a6 6 0 0 0-6-6 6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 6-6z" />
            </svg>
            <span>{selectedFile ? "Foto ausgewählt" : "Foto aufnehmen"}</span>
          </div>
        </label>

        {preview && (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="preview-image" />
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile}
          className="upload-button"
        >
          {uploading ? <div className="spinner"></div> : "📤 Bild senden"}
        </button>

        {message && (
          <div
            className={`message ${
              message.includes("Fehler") ? "error" : "success"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      <style jsx>{`
        .container {
          max-width: 100%;
          margin: 0 auto;
          padding: 1.5rem;
          min-height: 100vh;
          background: #f8f9fa;
        }

        .title {
          text-align: center;
          color: #2d3436;
          font-size: 1.8rem;
          margin-bottom: 2rem;
          font-weight: 600;
        }

        .upload-section {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          max-width: 500px;
          margin: 0 auto;
        }

        .hidden-input {
          display: none;
        }

        .file-input-label {
          display: block;
          margin-bottom: 1.5rem;
          cursor: pointer;
        }

        .camera-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1.25rem;
          background: #4a90e2;
          color: white;
          border-radius: 0.75rem;
          transition: all 0.2s ease;
          border: 2px solid transparent;
        }

        .camera-button:hover {
          background: #357abd;
          transform: translateY(-1px);
        }

        .camera-icon {
          width: 24px;
          height: 24px;
          fill: currentColor;
        }

        .preview-container {
          margin: 1.5rem 0;
          border-radius: 0.75rem;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .preview-image {
          width: 100%;
          height: auto;
          display: block;
        }

        .upload-button {
          width: 100%;
          padding: 1rem;
          background: #00b894;
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-size: 1.1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .upload-button:disabled {
          background: #b2bec3;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .upload-button:hover:not(:disabled) {
          background: #00a383;
          transform: translateY(-1px);
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .message {
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          text-align: center;
          font-size: 0.9rem;
        }

        .success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        @media (max-width: 480px) {
          .upload-section {
            padding: 1.5rem;
          }

          .title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CameraUploader;
