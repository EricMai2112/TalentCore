export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center py-10 px-4 bg-[#f8fafc] text-slate-900 relative overflow-hidden">
      {/* Hiệu ứng đốm sáng trang trí nhẹ nhàng cho nền sáng */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}