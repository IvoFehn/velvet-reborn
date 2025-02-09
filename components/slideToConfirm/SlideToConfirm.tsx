import React, { useState, useRef, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";

const SlideToConfirm: React.FC<{ onConfirm: () => void }> = ({ onConfirm }) => {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const currValue = useRef(0);
  const rafId = useRef<number | null>(null);
  const maxValue = 150;
  const speed = 12;

  // Behalte die bestehende Logik bei
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(parseInt(e.target.value));
  };

  const unlockStart = () => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    currValue.current = value;
  };

  const unlockEnd = () => {
    if (value >= maxValue) {
      onConfirm();
      setValue(0);
    } else {
      currValue.current = value;
      animate();
    }
  };

  const animate = () => {
    if (currValue.current > 0) {
      currValue.current = Math.max(0, currValue.current - speed);
      setValue(currValue.current);
      rafId.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        textAlign: "center",
        "& .pullee": {
          "--thumb-color": theme.palette.primary.main,
          "--track-color": theme.palette.action.hover,
          "--track-height": "1.5rem", // Mittelwert zwischen den vorherigen Größen
          "--thumb-size": "1.75rem", // Gut sichtbar aber nicht übertrieben
        },
      }}
    >
      <Typography
        variant="h5" // Zwischen h4 und h6
        sx={{
          mb: 2.5,
          textTransform: "uppercase",
          letterSpacing: "1.25px",
          fontSize: "1rem", // Leicht vergrößerte Schrift
        }}
      >
        Slide to Confirm
      </Typography>
      <input
        type="range"
        min="0"
        max={maxValue}
        value={value}
        onChange={handleInputChange}
        onMouseDown={unlockStart}
        onTouchStart={unlockStart}
        onMouseUp={unlockEnd}
        onTouchEnd={unlockEnd}
        className="pullee"
        style={{
          width: "14rem", // Moderate Breite
          appearance: "none",
          cursor: "pointer",
        }}
      />
      <style jsx global>{`
        .pullee:active::-webkit-slider-thumb {
          transform: scale(1.15); // Subtilere Skalierung
          cursor: -webkit-grabbing;
        }
        .pullee:active::-moz-range-thumb {
          transform: scale(1.15);
          cursor: -moz-grabbing;
        }
        .pullee:focus {
          outline: none;
        }
        .pullee::-webkit-slider-thumb {
          appearance: none;
          width: var(--thumb-size);
          height: var(--thumb-size);
          border-radius: 50%;
          background: var(--thumb-color);
          transform-origin: 50% 50%;
          transform: scale(1);
          transition: transform 100ms ease-out;
          cursor: -webkit-grab;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15); // Leichterer Schatten
        }
        .pullee::-moz-range-thumb {
          width: var(--thumb-size);
          height: var(--thumb-size);
          border-radius: 50%;
          background: var(--thumb-color);
          transform-origin: 50% 50%;
          transform: scale(1);
          transition: transform 100ms ease-out;
          cursor: -moz-grab;
          border: none;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
        }
        .pullee::-webkit-slider-runnable-track {
          height: var(--track-height);
          padding: 0.375rem; // Ausgewogenes Padding
          box-sizing: content-box;
          border-radius: calc(var(--track-height) / 2);
          background-color: var(--track-color);
        }
        .pullee::-moz-range-track {
          height: var(--track-height);
          padding: 0.375rem;
          box-sizing: content-box;
          border-radius: calc(var(--track-height) / 2);
          background-color: var(--track-color);
        }
      `}</style>
    </Box>
  );
};

export default SlideToConfirm;
