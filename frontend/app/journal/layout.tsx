export default function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="px-6 py-8">
        {children}
      </div>
    </div>
  );
} 