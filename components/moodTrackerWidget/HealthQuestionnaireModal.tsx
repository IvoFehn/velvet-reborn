import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export interface HealthStatus {
  complaint: string;
  analPossible: boolean;
  vaginalPossible: boolean;
  oralPossible: boolean;
}

interface HealthQuestionnaireModalProps {
  onClose: () => void;
  onSubmit: (healthStatus: HealthStatus) => void;
}

const HealthQuestionnaireModal: React.FC<HealthQuestionnaireModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [complaint, setComplaint] = useState<string>("");
  const [customComplaint, setCustomComplaint] = useState<string>("");
  const [analPossible, setAnalPossible] = useState<boolean>(false);
  const [vaginalPossible, setVaginalPossible] = useState<boolean>(false);
  const [oralPossible, setOralPossible] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const predefinedComplaints = ["Allgemeine Schmerzen", "Periode", "Pilz"];

  const handleComplaintChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setComplaint(value);
    if (value !== "custom") {
      setCustomComplaint("");
    }
  };

  const handleCustomComplaintChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomComplaint(e.target.value);
  };

  const handleSubmit = () => {
    // Validieren der Eingaben
    if (!complaint || (complaint === "custom" && !customComplaint)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const finalComplaint =
        complaint === "custom" ? customComplaint : complaint;

      // Erstellen eines expliziten Objekts mit allen Feldern
      const healthStatus: HealthStatus = {
        complaint: finalComplaint,
        analPossible: analPossible,
        vaginalPossible: vaginalPossible,
        oralPossible: oralPossible,
      };

      console.log("Submitting health status:", healthStatus);

      // Direkt aufrufen ohne Verzögerung
      onSubmit(healthStatus);
    } catch (error) {
      console.error("Error submitting health questionnaire:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Gesundheitscheck</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Complaint Section */}
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-gray-700 mb-2 block">
                Aktuelle Beschwerden
              </span>
              <select
                value={complaint}
                onChange={handleComplaintChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="">Bitte auswählen</option>
                {predefinedComplaints.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
                <option value="custom">Andere Beschwerden</option>
              </select>
            </label>

            {complaint === "custom" && (
              <input
                type="text"
                value={customComplaint}
                onChange={handleCustomComplaintChange}
                placeholder="Bitte beschreiben Sie Ihre Beschwerden"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 placeholder-gray-400 transition-all"
              />
            )}
          </div>

          {/* Options Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-gray-700 font-medium">Anal möglich</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analPossible}
                  onChange={() => setAnalPossible(!analPossible)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-gray-700 font-medium">Vaginal möglich</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={vaginalPossible}
                  onChange={() => setVaginalPossible(!vaginalPossible)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-gray-700 font-medium">Oral möglich</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={oralPossible}
                  onChange={() => setOralPossible(!oralPossible)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 peer-checked:after:translate-x-full after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all" />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !complaint ||
              (complaint === "custom" && !customComplaint)
            }
            className="w-full py-3 px-6 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Wird übermittelt...</span>
              </div>
            ) : (
              "Absenden"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthQuestionnaireModal;
