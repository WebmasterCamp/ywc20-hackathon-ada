'use client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="flex-1">
        <div className="py-6">
            {children}
        </div>
      </main>
    </div>
  );
}
