import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function Careers() {
  return (
    <section id="careers" className="py-24 bg-[#030219] text-white border-b border-slate-900/40 relative overflow-hidden">
      
      {/* Background glow overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:items-center">
          
          {/* Left Column: Text and CTA button */}
          <div className="lg:col-span-5 flex flex-col gap-6 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              SỰ NGHIỆP
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-white leading-tight">
              Cùng TalentCore<br />kiến tạo tương lai
            </h2>
            <p className="text-base text-slate-400 leading-relaxed max-w-lg">
              Chúng tôi tìm kiếm những con người tài năng, đam mê công nghệ và mong muốn tạo ra ảnh hưởng tích cực đến cộng đồng.
            </p>

            <div className="mt-4">
              <Link
                href="/jobs"
                className="group inline-flex h-12 items-center justify-center gap-3 rounded-full bg-blue-600 pl-6 pr-2 text-sm font-semibold text-white hover:bg-blue-700 active:scale-98 transition-all duration-200"
              >
                <span>Khám phá cơ hội nghề nghiệp</span>
                <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>

          {/* Right Column: Composite Visual Collage */}
          <div className="lg:col-span-7 w-full flex justify-center items-center">
            <Image
              src="/su-nghiep.png"
              alt="Cuộc sống tại TalentCore"
              width={1000}
              height={600}
              priority
              className="w-full h-auto rounded-2xl border border-white/5 shadow-2xl"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
