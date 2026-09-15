import Image from 'next/image'
import logo from '@/public/logo-talentcore.png'
import login_image from '@/public/login_image.png'
import LoginForm from './LoginForm'
import { GlassCard } from '@/src/components/common/glass'

export default function LoginPage() {
  return (
    <div className="w-full max-w-5xl flex items-center justify-center gap-10 px-6 py-4">
      {/* ── LEFT: Illustration float tự do trên nền ambient ── */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <div className="relative w-[480px] h-[480px]">
          <Image
            src={login_image}
            alt="TalentCore Illustration"
            fill
            className="object-contain drop-shadow-[0_12px_36px_rgba(18,97,166,0.18)]"
            priority
          />
        </div>
      </div>

      {/* ── RIGHT: Form card — Ultra Frosted Glass Panel ── */}
      <GlassCard className="w-full md:w-[460px] shrink-0 rounded-3xl p-8 sm:p-10 flex flex-col shadow-2xl shadow-[#1261A6]/15 bg-white/80 backdrop-blur-2xl border border-white">
        {/* Logo + greeting */}
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-3">
            <Image src={logo} alt="TalentCore" width={175} className="h-auto object-contain" />
          </div>
          <span className="inline-block px-3 py-1 bg-[#1261A6]/10 border border-[#1261A6]/20 rounded-full text-[11px] font-bold text-[#1261A6] uppercase tracking-wider mb-2">
            Hệ Thống Quản Trị Tuyển Dụng
          </span>
          <p className="text-xs font-semibold text-slate-500">
            Đăng nhập để quản lý ứng viên và lịch phỏng vấn
          </p>
        </div>

        {/* Interactive Client Form */}
        <LoginForm />

        {/* Footer */}
        <p className="mt-8 text-center text-[11px] font-medium text-slate-400">
          © {new Date().getFullYear()} TalentCore Platform — All rights reserved
        </p>
      </GlassCard>
    </div>
  )
}
