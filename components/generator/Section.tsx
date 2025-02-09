export const SectionComponent = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <h2 className="text-xl font-semibold mb-4 text-gray-700">{title}</h2>
    {children}
  </div>
);
