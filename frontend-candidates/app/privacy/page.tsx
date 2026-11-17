import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Lock, Eye, Database, FileCheck } from 'lucide-react'

export const metadata = {
  title: 'Chính sách bảo mật | TalentCore',
  description: 'Chính sách bảo mật thông tin và quyền riêng tư dữ liệu cá nhân của hệ thống tuyển dụng TalentCore',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white py-14 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 space-y-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-200 hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs w-fit"
          >
            <ArrowLeft size={14} />
            <span>Quay lại trang Đăng ký</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <ShieldCheck size={24} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                An toàn & Quyền riêng tư
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Chính sách bảo mật thông tin (Privacy Policy)
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Cập nhật lần cuối: Tháng 11/2026. TalentCore cam kết tôn trọng và bảo vệ tối đa quyền riêng tư cùng dữ liệu cá nhân của ứng viên theo chuẩn mực pháp lý cao nhất.
          </p>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10 space-y-8 leading-relaxed text-sm text-slate-700">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 font-extrabold flex items-center justify-center text-xs">
                1
              </span>
              Dữ liệu cá nhân chúng tôi thu thập
            </h2>
            <p>
              Khi bạn khởi tạo tài khoản ứng viên và tham gia nộp hồ sơ trên TalentCore, chúng tôi thu thập các thông tin bao gồm:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Thông tin nhận danh & liên hệ:</strong> Họ và tên, địa chỉ email, số điện thoại, địa chỉ nơi cư trú.</li>
              <li><strong>Hồ sơ nghề nghiệp (CV):</strong> Kinh nghiệm làm việc, lịch sử học vấn, chứng chỉ, kỹ năng chuyên môn, thư giới thiệu và các tài liệu đính kèm do bạn cung cấp.</li>
              <li><strong>Thông tin phỏng vấn & tương tác:</strong> Lịch sử tham gia các buổi phỏng vấn, ghi chú phản hồi, trạng thái chấp nhận hoặc từ chối thư mời nhận việc.</li>
              <li><strong>Dữ liệu kỹ thuật:</strong> Địa chỉ IP, loại trình duyệt, thiết bị truy cập phục vụ mục đích bảo mật và tối ưu trải nghiệm.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 font-extrabold flex items-center justify-center text-xs">
                2
              </span>
              Mục đích sử dụng dữ liệu
            </h2>
            <p>Dữ liệu cá nhân của ứng viên được xử lý cho các mục đích chính đáng sau:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-900 text-xs block">Tuyển chọn & Đánh giá hồ sơ</span>
                <p className="text-xs text-slate-500">Giúp nhà tuyển dụng sàng lọc, xếp hạng năng lực và đối sánh kỹ năng thông minh qua AI Matching.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-bold text-slate-900 text-xs block">Liên lạc & Điều phối phỏng vấn</span>
                <p className="text-xs text-slate-500">Gửi thông báo lịch phỏng vấn, nhắc nhở hạn chót và thư mời nhận việc chính thức qua Email/SMS/In-app.</p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 font-extrabold flex items-center justify-center text-xs">
                3
              </span>
              Cam kết không bán hoặc chia sẻ dữ liệu trái phép
            </h2>
            <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
              <Lock size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-1">Bảo đảm tính bảo mật tuyệt đối:</strong>
                TalentCore cam kết <strong>không bao giờ bán, cho thuê hoặc thương mại hóa</strong> thông tin cá nhân của ứng viên cho bất kỳ đơn vị quảng cáo hoặc bên thứ ba nào. Thông tin hồ sơ chỉ được chia sẻ duy nhất cho các thành viên trong hội đồng tuyển dụng liên quan trực tiếp đến vị trí ứng tuyển.
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 font-extrabold flex items-center justify-center text-xs">
                4
              </span>
              Lưu trữ & Tiêu chuẩn an toàn kỹ thuật
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Mật khẩu người dùng được mã hóa một chiều an toàn với thuật toán <strong>bcrypt</strong> tiêu chuẩn cao trước khi lưu vào cơ sở dữ liệu.</li>
              <li>Mọi dữ liệu trao đổi giữa trình duyệt web/ứng dụng di động và hệ thống máy chủ đều được mã hóa bằng giao thức HTTPS/TLS hiện đại.</li>
              <li>Hệ thống áp dụng cơ chế xác thực JWT và kiểm soát quyền truy cập theo vai trò (Role-Based Access Control) nghiêm ngặt.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 font-extrabold flex items-center justify-center text-xs">
                5
              </span>
              Quyền hạn của Ứng viên đối với dữ liệu
            </h2>
            <p>Ứng viên có toàn quyền:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Truy cập, cập nhật hoặc bổ sung thông tin hồ sơ trong mục <strong>Hồ sơ của tôi</strong> vào bất kỳ thời điểm nào.</li>
              <li>Yêu cầu sao lưu hoặc đề nghị xóa vĩnh viễn tài khoản và các dữ liệu liên quan khỏi cơ sở dữ liệu của hệ thống.</li>
              <li>Đổi mật khẩu tài khoản trực tiếp trong mục Cài đặt.</li>
            </ul>
          </section>

          {/* Footer Callout */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              Ban phụ trách Bảo mật Dữ liệu TalentCore: <strong>privacy@talentcore.vn</strong>
            </span>
            <div className="flex items-center gap-3">
              <Link
                href="/terms"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Xem Điều khoản sử dụng &rarr;
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
