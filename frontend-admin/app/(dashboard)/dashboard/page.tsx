export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/10">
        <div className="max-w-2xl space-y-2">
          <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-indigo-100 uppercase tracking-wider">
            TalentCore Platform
          </span>
          <h2 className="text-2xl font-bold tracking-tight">Chào mừng bạn đến với Hệ thống Quản trị TalentCore</h2>
          <p className="text-indigo-100 text-sm leading-relaxed">
            Theo dõi tiến độ tuyển dụng, điều phối lịch phỏng vấn và quản lý ứng viên hiệu quả trong cùng một giao diện.
          </p>
        </div>
      </div>
    </div>
  );
}
