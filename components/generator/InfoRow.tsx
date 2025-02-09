// src/components/generator/InfoRow.tsx

import React from "react";

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  icon?: string;
  status?: boolean;
  children?: React.ReactNode; // Hinzugefügt
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value, children }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <div className="text-sm font-medium text-gray-500">{label}</div>
        <div className="text-lg font-semibold text-gray-800">{value}</div>
      </div>
      {children && <div>{children}</div>}
    </div>
  );
};
