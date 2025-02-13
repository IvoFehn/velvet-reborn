import React from "react";
import styles from "./Coin.module.css";

const colorSchemes = [
  {
    // Gold (Default)
    main: "#ffbd0b",
    borderTop: "#ffd84c",
    borderLeft: "#ffd84c",
    borderRight: "#d57e08",
    borderBottom: "#d57e08",
    innerCircle: "#f0a608",
    innerBorder: "#ffd84c #d57e08",
    currencyText: "#ffbd0b",
    textShadow: "#cb7407",
    shapeColor: "#d57e08",
    shapeBorder: "#c47207",
    textColor: "#d67f08",
  },
  {
    // Silber
    main: "#c0c0c0",
    borderTop: "#d8d8d8",
    borderLeft: "#d8d8d8",
    borderRight: "#a0a0a0",
    borderBottom: "#a0a0a0",
    innerCircle: "#b0b0b0",
    innerBorder: "#d8d8d8 #a0a0a0",
    currencyText: "#c0c0c0",
    textShadow: "#909090",
    shapeColor: "#a0a0a0",
    shapeBorder: "#909090",
    textColor: "#a0a0a0",
  },
  {
    // Bronze
    main: "#cd7f32",
    borderTop: "#e3964e",
    borderLeft: "#e3964e",
    borderRight: "#a5682a",
    borderBottom: "#a5682a",
    innerCircle: "#b8732d",
    innerBorder: "#e3964e #a5682a",
    currencyText: "#cd7f32",
    textShadow: "#8a5522",
    shapeColor: "#a5682a",
    shapeBorder: "#8a5522",
    textColor: "#a5682a",
  },
  {
    // Kupfer
    main: "#b87333",
    borderTop: "#d18a4a",
    borderLeft: "#d18a4a",
    borderRight: "#9a5c2a",
    borderBottom: "#9a5c2a",
    innerCircle: "#a5682d",
    innerBorder: "#d18a4a #9a5c2a",
    currencyText: "#b87333",
    textShadow: "#7a4a22",
    shapeColor: "#9a5c2a",
    shapeBorder: "#7a4a22",
    textColor: "#9a5c2a",
  },
  {
    // Platin
    main: "#e5e4e2",
    borderTop: "#f0f0f0",
    borderLeft: "#f0f0f0",
    borderRight: "#c0c0c0",
    borderBottom: "#c0c0c0",
    innerCircle: "#d0d0d0",
    innerBorder: "#f0f0f0 #c0c0c0",
    currencyText: "#e5e4e2",
    textShadow: "#a0a0a0",
    shapeColor: "#c0c0c0",
    shapeBorder: "#a0a0a0",
    textColor: "#c0c0c0",
  },
  {
    // Smaragd
    main: "#50c878",
    borderTop: "#6ad492",
    borderLeft: "#6ad492",
    borderRight: "#3a9d5a",
    borderBottom: "#3a9d5a",
    innerCircle: "#45b46a",
    innerBorder: "#6ad492 #3a9d5a",
    currencyText: "#50c878",
    textShadow: "#2a7d42",
    shapeColor: "#3a9d5a",
    shapeBorder: "#2a7d42",
    textColor: "#3a9d5a",
  },
  {
    // Rubin
    main: "#e0115f",
    borderTop: "#ff1a6f",
    borderLeft: "#ff1a6f",
    borderRight: "#b00e4b",
    borderBottom: "#b00e4b",
    innerCircle: "#c81055",
    innerBorder: "#ff1a6f #b00e4b",
    currencyText: "#e0115f",
    textShadow: "#900a3c",
    shapeColor: "#b00e4b",
    shapeBorder: "#900a3c",
    textColor: "#b00e4b",
  },
  {
    // Saphir
    main: "#0f52ba",
    borderTop: "#1a6bff",
    borderLeft: "#1a6bff",
    borderRight: "#0c3d8a",
    borderBottom: "#0c3d8a",
    innerCircle: "#0d47a1",
    innerBorder: "#1a6bff #0c3d8a",
    currencyText: "#0f52ba",
    textShadow: "#092e6a",
    shapeColor: "#0c3d8a",
    shapeBorder: "#092e6a",
    textColor: "#0c3d8a",
  },
  {
    // Amethyst (Lila)
    main: "#9966cc",
    borderTop: "#b18cd9",
    borderLeft: "#b18cd9",
    borderRight: "#7a4f9f",
    borderBottom: "#7a4f9f",
    innerCircle: "#8a5db2",
    innerBorder: "#b18cd9 #7a4f9f",
    currencyText: "#9966cc",
    textShadow: "#5a3a7a",
    shapeColor: "#7a4f9f",
    shapeBorder: "#5a3a7a",
    textColor: "#7a4f9f",
  },
  {
    // Obsidian (Schwarz)
    main: "#464646",
    borderTop: "#5c5c5c",
    borderLeft: "#5c5c5c",
    borderRight: "#2e2e2e",
    borderBottom: "#2e2e2e",
    innerCircle: "#3a3a3a",
    innerBorder: "#5c5c5c #2e2e2e",
    currencyText: "#464646",
    textShadow: "#1e1e1e",
    shapeColor: "#2e2e2e",
    shapeBorder: "#1e1e1e",
    textColor: "#2e2e2e",
  },
  {
    // Rosegold (Rosa/Gold)
    main: "#e0bfb7",
    borderTop: "#f0d7d0",
    borderLeft: "#f0d7d0",
    borderRight: "#c09f97",
    borderBottom: "#c09f97",
    innerCircle: "#d0afa7",
    innerBorder: "#f0d7d0 #c09f97",
    currencyText: "#e0bfb7",
    textShadow: "#a07f77",
    shapeColor: "#c09f97",
    shapeBorder: "#a07f77",
    textColor: "#c09f97",
  },
  {
    // Türkis
    main: "#40e0d0",
    borderTop: "#60f0e0",
    borderLeft: "#60f0e0",
    borderRight: "#20b0a0",
    borderBottom: "#20b0a0",
    innerCircle: "#30c0b0",
    innerBorder: "#60f0e0 #20b0a0",
    currencyText: "#40e0d0",
    textShadow: "#108070",
    shapeColor: "#20b0a0",
    shapeBorder: "#108070",
    textColor: "#20b0a0",
  },
  {
    // Bernstein
    main: "#ffbf00",
    borderTop: "#ffcf40",
    borderLeft: "#ffcf40",
    borderRight: "#cc9900",
    borderBottom: "#cc9900",
    innerCircle: "#e6ac00",
    innerBorder: "#ffcf40 #cc9900",
    currencyText: "#ffbf00",
    textShadow: "#996600",
    shapeColor: "#cc9900",
    shapeBorder: "#996600",
    textColor: "#cc9900",
  },
];

interface CoinProps {
  animate?: boolean;
  colorScheme?: number;
  showShadow?: boolean;
  topText?: string;
  bottomText?: string;
  currencySymbol?: string;
}

const Coin: React.FC<CoinProps> = ({
  animate = true,
  colorScheme = 0,
  showShadow = true,
  topText = "Test",
  bottomText = "Coin",
  currencySymbol = "$",
}) => {
  const scheme = colorSchemes[colorScheme % colorSchemes.length];

  const dynamicStyles = {
    "--main-color": scheme.main,
    "--border-top": scheme.borderTop,
    "--border-left": scheme.borderLeft,
    "--border-right": scheme.borderRight,
    "--border-bottom": scheme.borderBottom,
    "--inner-circle": scheme.innerCircle,
    "--currency-text": scheme.currencyText,
    "--text-shadow": scheme.textShadow,
    "--shape-color": scheme.shapeColor,
    "--shape-border": scheme.shapeBorder,
    "--text-color": scheme.textColor,
  } as React.CSSProperties;

  return (
    <div className={styles.container} style={dynamicStyles}>
      <div className={styles.coin}>
        <div className={`${styles.front} ${animate ? styles.jump : ""}`}>
          <span className={styles.currency}>{currencySymbol}</span>
          <div className={styles.shapes}>
            <div className={styles.shape}></div>
            <div className={styles.shape}></div>
          </div>
          {/* Durch Hinzufügen von transform: rotate(-44deg) in CSS werden diese Texte korrekt ausgerichtet */}
          <span className={styles.top}>{topText}</span>
          <span className={styles.bottom}>{bottomText}</span>
        </div>
        {showShadow && <div className={styles.shadow}></div>}
      </div>
    </div>
  );
};

export default Coin;
