import { Compass, Zap, ShieldCheck, GraduationCap, Users } from 'lucide-react';

export default function CoreValues() {
  const values = [
    {
      title: 'Khách hàng là trung tâm',
      desc: 'Mọi quyết định đều xuất phát từ việc mang lại giá trị cho khách hàng.',
      icon: Compass,
    },
    {
      title: 'Dám nghĩ lớn & hành động nhanh',
      desc: 'Chúng tôi tiên phong, dám khác biệt để tạo ra đột phá.',
      icon: Zap,
    },
    {
      title: 'Chính trực & minh bạch',
      desc: 'Xây dựng niềm tin bằng sự trung thực và tinh thần trách nhiệm.',
      icon: ShieldCheck,
    },
    {
      title: 'Học hỏi & phát triển',
      desc: 'Không ngừng học hỏi để hoàn thiện bản thân và tạo ra giá trị tốt hơn.',
      icon: GraduationCap,
    },
    {
      title: 'Gắn kết & tôn trọng',
      desc: 'Sức mạnh của chúng tôi đến từ sự đa dạng và tinh thần đồng đội.',
      icon: Users,
    },
  ];

  return (
    <section id="values" className="py-24 bg-[#0d0533] text-white border-b border-slate-900/40 relative overflow-hidden">
      
      {/* Decorative Wave Glow (SVG overlay to mimic the reference curve) */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-40">
        <svg viewBox="0 0 1440 600" className="w-full h-full text-indigo-500/20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M-100,350 C300,500 500,100 900,400 C1100,550 1300,450 1600,300"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M-50,380 C320,520 520,120 920,420 C1120,570 1320,470 1650,320"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="5 10"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        
        {/* Title */}
        <div className="text-left max-w-3xl flex flex-col gap-4 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#a78bfa]">
            GIÁ TRỊ CỐT LÕI
          </span>
          <h2 className="text-4xl font-bold tracking-tight text-white leading-tight">
            Những giá trị định hình chúng tôi
          </h2>
        </div>

        {/* 5-Column Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {values.map((val, idx) => {
            const Icon = val.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-start text-left p-2 group"
              >
                {/* Clean border icon wrapper */}
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-105">
                  <Icon className="w-5 h-5 text-white/80" />
                </div>
                
                <h3 className="text-base font-bold text-white leading-snug">
                  {val.title}
                </h3>
                
                <p className="mt-3 text-xs leading-relaxed text-slate-300">
                  {val.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
