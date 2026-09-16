import Image from 'next/image'
import { PartyPopper, Sparkles } from 'lucide-react'
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
      <GlassCard className="w-full md:w-[460px] shrink-0 rounded-3xl p-8 sm:p-10 flex flex-col shadow-2xl shadow-purple-500/10 bg-white/80 backdrop-blur-2xl border border-white/90">
        {/* Logo + greeting */}
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-3">
            <Image src={logo} alt="TalentCore" width={175} className="h-auto object-contain" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#8B5CF6]/12 via-[#3B82F6]/12 to-[#06B6D4]/12 backdrop-blur-md border border-[#8B5CF6]/25 rounded-full shadow-2xs mb-2.5">
            <PartyPopper size={13} className="text-[#8B5CF6] shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#06B6D4] bg-clip-text text-transparent">
              Hệ Thống Quản Trị Tuyển Dụng
            </span>
          </div>
          <p className="text-xs font-semibold text-[#64748B]">
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
