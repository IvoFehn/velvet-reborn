export interface SectionComponentProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const SectionComponent: React.FC<SectionComponentProps> = ({
  title,
  children,
  className = "",
}) => (
  <div
    className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${className}`}
  >
    <h2 className="text-xl font-semibold mb-4 text-gray-700">{title}</h2>
    {children}
  </div>
);
