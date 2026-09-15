import Image from 'next/image'
import logo from '@/public/logo-talentcore.png'
import login_image from '@/public/login_image.png'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="w-full max-w-5xl flex items-center gap-10 px-6">
      {/* ── LEFT: Illustration float tự do trên nền gradient (Server Rendered) ── */}
      <div className="hidden md:flex flex-1 items-center justify-center">
        <div className="relative w-[520px] h-[520px]">
          <Image
            src={login_image}
            alt="TalentCore Illustration"
            fill
            className="object-contain"
            style={{ filter: 'drop-shadow(0 8px 32px rgba(10,101,187,0.15))' }}
            priority
          />
        </div>
      </div>

      {/* ── RIGHT: Form card — Ultra Frosted Glassmorphism (Server Rendered Container) ── */}
      <div
        className="w-full md:w-[450px] shrink-0 rounded-3xl p-10 flex flex-col transition-all duration-300"
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.48) 0%, rgba(255, 255, 255, 0.28) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 20px 40px rgba(10, 101, 187, 0.12)'
        }}
      >
        {/* Logo + greeting */}
        <div className="mb-4 text-center">
          <div className="flex justify-center mb-2">
            <Image src={logo} alt="TalentCore" width={180} className="h-auto" />
          </div>
          <p className="text-sm text-gray-500 italic">
            Chào mừng bạn đến với hệ thống quản trị tuyển dụng
          </p>
        </div>

        {/* Interactive Client Form */}
        <LoginForm />

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} TalentCore — Hệ thống Quản trị Tuyển dụng
        </p>
      </div>
    </div>
  )
}
