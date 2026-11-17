import Link from 'next/link'
import { ArrowLeft, ShieldCheck, FileText, CheckCircle2, AlertCircle, Scale } from 'lucide-react'

export const metadata = {
  title: 'Điều khoản sử dụng | TalentCore',
  description: 'Điều khoản dịch vụ và quy định sử dụng hệ thống tuyển dụng nhân sự thông minh TalentCore',
}

export default function TermsPage() {
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
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Scale size={24} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Quy chế & Chính sách
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Điều khoản sử dụng (Terms of Service)
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Cập nhật lần cuối: Tháng 11/2026. Vui lòng đọc kỹ các điều khoản dưới đây trước khi tạo tài khoản và sử dụng nền tảng tuyển dụng thông minh TalentCore.
          </p>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10 space-y-8 leading-relaxed text-sm text-slate-700">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-xs">
                1
              </span>
              Giới thiệu & Phạm vi áp dụng
            </h2>
            <p>
              Chào mừng bạn đến với <strong>TalentCore</strong> — Hệ thống quản trị và tuyển dụng nhân sự thông minh tích hợp AI Matching. Bằng việc truy cập, đăng ký tài khoản và nộp hồ sơ ứng tuyển trên hệ thống, bạn xác nhận đã đọc, hiểu rõ và đồng ý bị ràng buộc bởi các Điều khoản sử dụng này.
            </p>
            <p>
              Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng hệ thống và không tạo tài khoản ứng viên.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-xs">
                2
              </span>
              Tài khoản & Bảo mật thông tin đăng nhập
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Ứng viên có trách nhiệm bảo mật mật khẩu tài khoản và các thông tin xác thực cá nhân.</li>
              <li>Bạn hoàn toàn chịu trách nhiệm cho tất cả các hoạt động diễn ra dưới tài khoản của mình.</li>
              <li>Khi phát hiện bất kỳ dấu hiệu truy cập trái phép nào, bạn cần thông báo ngay cho ban quản trị TalentCore qua kênh hỗ trợ chính thức.</li>
              <li>Mỗi ứng viên chỉ được phép khởi tạo và sử dụng duy nhất một tài khoản gắn liền với email cá nhân chính chủ.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-xs">
                3
              </span>
              Tính trung thực & Quyền nộp hồ sơ của Ứng viên
            </h2>
            <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-1">Cam kết về tính chính xác của dữ liệu:</strong>
                Tất cả các thông tin trong hồ sơ ứng tuyển, bao gồm CV, kinh nghiệm làm việc, bằng cấp, chứng chỉ và kỹ năng cá nhân, phải hoàn toàn chính xác, trung thực và do ứng viên tự chịu trách nhiệm trước pháp luật.
              </div>
            </div>
            <p>
              TalentCore và các nhà tuyển dụng hợp tác có quyền từ chối tiếp nhận, hủy bỏ kết quả phỏng vấn hoặc chấm dứt đề nghị nhận việc (Offer) nếu phát hiện bất kỳ hành vi gian lận hoặc khai báo sai sự thật nào.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-xs">
                4
              </span>
              Quy chế Lịch phỏng vấn & Phản hồi Thư mời nhận việc (Offer)
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>
                <strong>Xác nhận lịch phỏng vấn:</strong> Khi nhận được thông báo lịch hẹn phỏng vấn (Online qua Jitsi Meet hoặc Trực tiếp), ứng viên vui lòng phản hồi xác nhận hoặc gửi yêu cầu hủy lịch trước thời hạn thông báo.
              </li>
              <li>
                <strong>Thư mời nhận việc (Offer Letter):</strong> Thư mời nhận việc có hiệu lực trong khoảng thời gian quy định cụ thể. Ứng viên có quyền lựa chọn &ldquo;Đồng ý nhận việc&rdquo; hoặc &ldquo;Từ chối nhận việc&rdquo; trực tiếp trên nền tảng. Khi đã xác nhận, trạng thái sẽ được ghi nhận vào nhật ký hồ sơ và đồng bộ đến ban nhân sự.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-xs">
                5
              </span>
              Quyền sở hữu trí tuệ & Bản quyền nền tảng
            </h2>
            <p>
              Toàn bộ giao diện, thuật toán xếp hạng đối sánh AI Matching, cơ sở dữ liệu, nhãn hiệu và mã nguồn của hệ thống TalentCore thuộc quyền sở hữu trí tuệ độc quyền của đội ngũ phát triển TalentCore. Nghiêm cấm mọi hành vi sao chép, thu thập dữ liệu tự động (scraping) hoặc đảo ngược kỹ thuật mà không có sự đồng ý bằng văn bản.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-xs">
                6
              </span>
              Sửa đổi & Bổ sung điều khoản
            </h2>
            <p>
              TalentCore có thể cập nhật các Điều khoản sử dụng này vào bất kỳ lúc nào để phù hợp với quy định pháp luật và nâng cấp tính năng hệ thống. Phiên bản cập nhật sẽ được công bố công khai trên website.
            </p>
          </section>

          {/* Footer Callout */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-500">
              Bạn có câu hỏi về Điều khoản sử dụng? Liên hệ: <strong>support@talentcore.vn</strong>
            </span>
            <div className="flex items-center gap-3">
              <Link
                href="/privacy"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Xem Chính sách bảo mật &rarr;
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
