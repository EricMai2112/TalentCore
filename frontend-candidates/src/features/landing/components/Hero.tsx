import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'
import Image from 'next/image'

export default function Hero() {
  const partners = [
    { name: 'Microsoft', icon: '💻' },
    { name: 'AWS', icon: '☁️' },
    { name: 'Google Cloud', icon: '🌐' },
    { name: 'NVIDIA', icon: '⚡' },
    { name: 'VNG', icon: '🔥' },
    { name: 'VinBigData', icon: '🧠' }
  ]

  return (
    <section className="relative w-full overflow-hidden bg-[#020512] min-h-[640px] lg:min-h-[760px] flex items-center pt-24 pb-20">
      {/* Background Image - Absolute cover */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/hero.png"
          alt="TalentCore Digital City Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-right md:object-center"
        />
        {/* Soft dark overlays to ensure text readability on all screens */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020512]/90 via-[#020512]/80 to-[#020512]/95 md:bg-gradient-to-r md:from-[#020512]/95 md:via-[#020512]/75 md:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#030712] to-transparent" />
      </div>

      <div className="relative z-10 w-full px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Main Content Area */}
        <div className="flex flex-col max-w-2xl gap-6 text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15] lg:leading-[1.12]">
            Công nghệ cốt lõi
            <span className="block mt-2 text-[#7059E8]">Kiến tạo tương lai</span>
          </h1>

          <p className="max-w-lg text-base leading-relaxed sm:text-lg text-slate-300">
            TalentCore xây dựng các sản phẩm công nghệ đột phá, giải quyết những vấn đề lớn và tạo
            ra giá trị bền vững cho doanh nghiệp và cộng đồng.
          </p>

          <div className="flex flex-col items-center justify-start gap-4 mt-6 sm:flex-row">
            <Link
              href="#about"
              className="flex items-center justify-center w-full h-12 gap-3 pl-6 pr-2 text-sm font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full group sm:w-auto hover:bg-blue-700"
            >
              <span>Khám phá TalentCore</span>
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <button className="flex items-center justify-center w-full h-12 gap-3 px-6 text-sm font-semibold text-white transition-all duration-200 border rounded-full group sm:w-auto border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10">
              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
              <span>Xem video</span>
            </button>
          </div>
        </div>

        {/* Partners Section - Positioned bottom left aligned with text */}
        <div className="max-w-4xl pt-8 mt-24 border-t lg:mt-32 border-white/10">
          <p className="text-xs font-bold tracking-widest uppercase text-slate-400">
            ĐỐI TÁC TIN CẬY CỦA CHÚNG TÔI
          </p>
          <div className="flex flex-wrap items-center mt-6 transition-opacity duration-300 gap-x-12 gap-y-6 opacity-60 hover:opacity-85">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="flex items-center gap-2 transition-all duration-200 cursor-default grayscale hover:grayscale-0"
              >
                <span className="text-lg">{partner.icon}</span>
                <span className="text-sm font-semibold tracking-wider text-slate-200">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
