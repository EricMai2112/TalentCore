import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="footer" className="w-full bg-[#070b18] border-t border-slate-900 pt-16 pb-8 text-slate-450">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          
          {/* Brand Info Column */}
          <div className="lg:col-span-2 flex flex-col gap-5 text-left">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-base shadow-lg shadow-blue-500/20">
                TC
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                Talent<span className="text-blue-500">Core</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm text-slate-400">
              TalentCore cam kết mang đến những giải pháp công nghệ đột phá, góp phần xây dựng một thế giới thông minh và bền vững hơn.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-200 mb-4 text-left">
              Công ty
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-left">
              <li>
                <Link href="#about" className="text-slate-400 hover:text-white transition-colors duration-150">Về chúng tôi</Link>
              </li>
              <li>
                <Link href="#values" className="text-slate-400 hover:text-white transition-colors duration-150">Giá trị cốt lõi</Link>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-150">Ban lãnh đạo</a>
              </li>
              <li>
                <Link href="#news" className="text-slate-400 hover:text-white transition-colors duration-150">Tin tức</Link>
              </li>
              <li>
                <Link href="#footer" className="text-slate-400 hover:text-white transition-colors duration-150">Liên hệ</Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-200 mb-4 text-left">
              Sản phẩm
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-left">
              <li>
                <Link href="#products" className="text-slate-400 hover:text-white transition-colors duration-150">TalentHRM</Link>
              </li>
              <li>
                <Link href="#products" className="text-slate-400 hover:text-white transition-colors duration-150">TC Cloud</Link>
              </li>
              <li>
                <Link href="#products" className="text-slate-400 hover:text-white transition-colors duration-150">DataCore AI</Link>
              </li>
              <li>
                <Link href="#products" className="text-slate-400 hover:text-white transition-colors duration-150">SecureCore</Link>
              </li>
              <li>
                <Link href="#products" className="text-slate-400 hover:text-white transition-colors duration-150">Tất cả giải pháp</Link>
              </li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-200 mb-4 text-left">
              Sự nghiệp
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-left">
              <li>
                <Link href="#careers" className="text-slate-400 hover:text-white transition-colors duration-150">Văn hóa doanh nghiệp</Link>
              </li>
              <li>
                <Link href="/jobs" className="text-slate-400 hover:text-white transition-colors duration-150">Cơ hội nghề nghiệp</Link>
              </li>
              <li>
                <Link href="#careers" className="text-slate-400 hover:text-white transition-colors duration-150">Phúc lợi nhân viên</Link>
              </li>
              <li>
                <Link href="/jobs" className="text-slate-400 hover:text-white transition-colors duration-150">Sinh viên & Thực tập</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Information Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 grid grid-cols-1 gap-6 sm:grid-cols-3 text-left">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-semibold text-slate-300">Địa chỉ văn phòng</h4>
              <p className="mt-1 text-slate-500">Tầng 7, Tòa nhà Innovation Hub, Khu Công nghệ cao Hòa Lạc, Thạch Thất, Hà Nội</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-semibold text-slate-300">Email liên hệ</h4>
              <p className="mt-1 text-slate-500">hello@talentcore.vn</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-semibold text-slate-300">Hotline</h4>
              <p className="mt-1 text-slate-500">(+84) 24 1234 5678</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div className="mt-12 pt-8 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TalentCore. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Điều khoản sử dụng</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
