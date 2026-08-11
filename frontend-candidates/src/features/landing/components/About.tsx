import Link from 'next/link';
import { Users, Rocket, Globe2, Award, ArrowRight } from 'lucide-react';

export default function About() {
  const stats = [
    {
      value: '1500+',
      label: 'Nhân sự tài năng',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50/80 border-blue-100',
    },
    {
      value: '10+',
      label: 'Năm phát triển',
      icon: Rocket,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50/80 border-blue-100',
    },
    {
      value: '20+',
      label: 'Quốc gia có mặt',
      icon: Globe2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50/80 border-blue-100',
    },
    {
      value: '50+',
      label: 'Giải thưởng & Chứng nhận',
      icon: Award,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50/80 border-blue-100',
    },
  ];

  return (
    <section id="about" className="py-24 bg-white text-slate-900 border-b border-slate-100 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:items-center">
          
          {/* Left Column: Text intro */}
          <div className="lg:col-span-5 flex flex-col gap-5 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              VỀ CHÚNG TÔI
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 leading-tight">
              TalentCore là ai?
            </h2>
            <p className="text-base leading-relaxed text-slate-500">
              Chúng tôi là công ty công nghệ Việt Nam với khát vọng vươn tầm thế giới. TalentCore tập trung vào việc nghiên cứu, phát triển và cung cấp các sản phẩm, giải pháp công nghệ hiện đại trong các lĩnh vực trọng điểm.
            </p>
            <div className="mt-2">
              <Link
                href="#careers"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
              >
                <span>Tìm hiểu thêm về chúng tôi</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Right Column: Stat Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.bgColor} transition-transform duration-300 group-hover:scale-105`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="mt-6">
                    <span className="block text-3xl font-extrabold text-slate-900 tracking-tight">
                      {stat.value}
                    </span>
                    <span className="block mt-1.5 text-sm font-medium text-slate-500">
                      {stat.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
