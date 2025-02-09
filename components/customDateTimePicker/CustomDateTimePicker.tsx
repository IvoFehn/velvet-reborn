// src/components/CustomDateTimePicker.tsx
import React, { useState, useMemo, useCallback } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/de";
import localizedFormat from "dayjs/plugin/localizedFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(localizedFormat);
dayjs.extend(isSameOrBefore);
dayjs.locale("de");

interface CustomDateTimePickerProps {
  value: Dayjs | null;
  onChange: (date: Dayjs | null) => void;
  minDate?: Dayjs;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  value,
  onChange,
  minDate = dayjs(),
}) => {
  // Speichere das aktuell ausgewählte Datum (inklusive Zeit) – falls vorhanden
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(value);
  // Die initialen Stunden und Minuten basieren auf dem übergebenen Wert oder auf der aktuellen Uhrzeit
  const [selectedTime, setSelectedTime] = useState({
    hours: value ? value.hour() : dayjs().hour(),
    minutes: value ? value.minute() : dayjs().minute(),
  });
  // Der aktuell angezeigte Monat im Kalender (entspricht dem Monat des ausgewählten Datums, falls vorhanden)
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate ? selectedDate.startOf("month") : dayjs().startOf("month")
  );
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Erzeuge alle Tage für den angezeigten Monat inklusive "leerer" Felder für die Wochenstruktur
  const daysInMonth = useMemo(() => {
    const start = currentMonth.startOf("month");
    const end = currentMonth.endOf("month");
    const days: (Dayjs | null)[] = [];

    // Füge leere Plätze für Tage des Vormonats hinzu (um den Wochenstart anzupassen)
    const firstDayOfWeek = start.day() || 7;
    for (let i = 1; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    let currentDay = start;
    while (currentDay.isBefore(end) || currentDay.isSame(end, "day")) {
      days.push(currentDay);
      currentDay = currentDay.add(1, "day");
    }

    // Füge leere Plätze für den Beginn des Folgemonats hinzu
    const lastDayOfWeek = end.day() || 7;
    for (let i = lastDayOfWeek; i < 7; i++) {
      days.push(null);
    }

    return days;
  }, [currentMonth]);

  // Wird aufgerufen, wenn ein Tag im Kalender ausgewählt wird.
  // Es wird ein Datum erstellt, das mit den aktuell gewählten Stunden und Minuten versehen ist.
  const handleDateSelect = useCallback(
    (date: Dayjs) => {
      const newDate = date
        .hour(selectedTime.hours)
        .minute(selectedTime.minutes);
      setSelectedDate(newDate);
      onChange(newDate);
      setShowTimePicker(false);
    },
    [selectedTime, onChange]
  );

  // Wenn die Zeit (Stunden oder Minuten) geändert wird, aktualisieren wir sowohl die Zeit-Zustände
  // als auch (falls ein Datum ausgewählt wurde) den kompletten DateTime-Wert.
  const handleTimeChange = useCallback(
    (type: "hours" | "minutes", val: number) => {
      const clampedVal = Math.max(0, Math.min(type === "hours" ? 23 : 59, val));
      const newTime = { ...selectedTime, [type]: clampedVal };
      setSelectedTime(newTime);
      if (selectedDate) {
        const updatedDate = selectedDate
          .hour(newTime.hours)
          .minute(newTime.minutes);
        setSelectedDate(updatedDate);
        onChange(updatedDate);
      }
    },
    [selectedTime, selectedDate, onChange]
  );

  // Navigation zwischen den Monaten
  const navigateMonth = useCallback((direction: "next" | "prev") => {
    setCurrentMonth((prev) =>
      direction === "next" ? prev.add(1, "month") : prev.subtract(1, "month")
    );
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-md">
      {/* Monatsheader mit Navigationsbuttons */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold">
          {currentMonth.format("MMMM YYYY")}
        </h2>
        <button
          onClick={() => navigateMonth("next")}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          →
        </button>
      </div>

      {/* Kalendergrid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((day) => (
          <div key={day} className="text-center text-sm text-gray-500 p-1">
            {day}
          </div>
        ))}
        {daysInMonth.map((day, index) => (
          <button
            key={day ? day.format("DD-MM-YYYY") : index}
            onClick={() => day && handleDateSelect(day)}
            className={`p-2 rounded-lg text-sm
              ${!day ? "text-gray-300" : "hover:bg-blue-50"}
              ${
                selectedDate && day?.isSame(selectedDate, "day")
                  ? "bg-blue-500 text-white"
                  : ""
              }
              ${
                day?.isSameOrBefore(minDate, "day")
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            disabled={day?.isSameOrBefore(minDate, "day")}
          >
            {day ? day.format("D") : ""}
          </button>
        ))}
      </div>

      {/* Zeitauswahlbereich */}
      <div
        className={`transition-all ${
          showTimePicker ? "opacity-100" : "opacity-50"
        }`}
      >
        <div
          className="flex items-center justify-center space-x-2 cursor-pointer"
          onClick={() => setShowTimePicker(!showTimePicker)}
        >
          <span className="text-2xl font-bold">
            {selectedTime.hours.toString().padStart(2, "0")}:
            {selectedTime.minutes.toString().padStart(2, "0")}
          </span>
          <svg
            className={`w-5 h-5 transform transition-transform ${
              showTimePicker ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {showTimePicker && (
          <div className="mt-4 flex justify-center space-x-4">
            <div className="flex flex-col items-center">
              <button
                onClick={() =>
                  handleTimeChange("hours", selectedTime.hours + 1)
                }
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                ↑
              </button>
              <input
                type="number"
                value={selectedTime.hours}
                onChange={(e) =>
                  handleTimeChange("hours", parseInt(e.target.value))
                }
                className="w-12 text-center border rounded py-1"
                min="0"
                max="23"
              />
              <button
                onClick={() =>
                  handleTimeChange("hours", selectedTime.hours - 1)
                }
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                ↓
              </button>
            </div>

            <div className="flex flex-col items-center pt-6">:</div>

            <div className="flex flex-col items-center">
              <button
                onClick={() =>
                  handleTimeChange("minutes", selectedTime.minutes + 5)
                }
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                ↑
              </button>
              <input
                type="number"
                value={selectedTime.minutes}
                onChange={(e) =>
                  handleTimeChange("minutes", parseInt(e.target.value))
                }
                className="w-12 text-center border rounded py-1"
                min="0"
                max="59"
              />
              <button
                onClick={() =>
                  handleTimeChange("minutes", selectedTime.minutes - 5)
                }
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                ↓
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(CustomDateTimePicker);
