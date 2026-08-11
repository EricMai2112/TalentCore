export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#1e1e2d] flex items-center justify-center p-4">
      {children}
    </div>
  );
}