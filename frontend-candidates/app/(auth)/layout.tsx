export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center py-10 px-4">
      {children}
    </div>
  );
}