import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar } from 'lucide-react';
import SubscribeForm from './SubscribeForm';

export default function News() {
  const newsItems = [
    {
      title: 'TalentCore lọt Top 50 Công ty Công nghệ tốt nhất Việt Nam 2026',
      date: '10.05.2026',
      tag: 'Tin tức',
      tagColor: 'bg-blue-50 text-blue-600 border-blue-100',
      image: '/news-01.png',
    },
    {
      title: 'TalentCore Summit 2026: Bứt phá giới hạn, kiến tạo tương lai',
      date: '02.05.2026',
      tag: 'Sự kiện',
      tagColor: 'bg-blue-50 text-blue-600 border-blue-100',
      image: '/news-02.png',
    },
    {
      title: 'TalentCore giành giải thưởng Sản phẩm công nghệ số xuất sắc',
      date: '25.04.2026',
      tag: 'Giải thưởng',
      tagColor: 'bg-blue-50 text-blue-600 border-blue-100',
      image: '/news-03.png',
    },
  ];

  return (
    <section id="news" className="py-24 bg-white text-slate-900 border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <div className="flex flex-col gap-4 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              TIN TỨC NỔI BẬT
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 leading-tight">
              Cập nhật từ TalentCore
            </h2>
          </div>
          <Link
            href="#"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
          >
            <span>Xem tất cả tin tức</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Content Layout: 3 News Cards and 1 Newsletter Box */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          
          {/* News List */}
          <div className="lg:col-span-3 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {newsItems.map((item, idx) => (
              <article
                key={idx}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-slate-200 transition-all duration-300 group"
              >
                {/* Visual Thumbnail */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                </div>

                {/* News Title & Info */}
                <div className="flex flex-1 flex-col justify-between p-6 text-left">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${item.tagColor}`}>
                        {item.tag}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{item.date}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-3 group-hover:text-blue-600 transition-colors duration-200">
                      {item.title}
                    </h3>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-50">
                    <Link
                      href="#"
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors group/btn"
                    >
                      <span>Đọc thêm</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter Subscribe Box */}
          <div className="p-8 rounded-2xl bg-[#090f1d] text-white flex flex-col justify-between relative overflow-hidden group">
            {/* Background design accents */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-blue-500/5 blur-2xl group-hover:bg-blue-500/10 transition-all duration-300" />
            
            <div className="flex flex-col text-left gap-4">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Kết nối với TalentCore
              </h3>
              <p className="text-xs leading-relaxed text-slate-400">
                Đăng ký để nhận những cập nhật mới nhất về công nghệ và cơ hội nghề nghiệp.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-6">
              {/* Subscribe email field */}
              <SubscribeForm />
              
              {/* Circular Social Links - exact visual alignment from reference image */}
              <div className="flex items-center gap-3">
                <a href="#" className="w-8 h-8 rounded-full border border-slate-800 hover:border-blue-500/30 bg-slate-900 hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 flex items-center justify-center transition-all duration-200" aria-label="LinkedIn">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-slate-800 hover:border-blue-500/30 bg-slate-900 hover:bg-blue-500/10 text-slate-400 hover:text-blue-500 flex items-center justify-center transition-all duration-200" aria-label="Facebook">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-slate-800 hover:border-pink-500/30 bg-slate-900 hover:bg-pink-500/10 text-slate-400 hover:text-pink-500 flex items-center justify-center transition-all duration-200" aria-label="Instagram">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full border border-slate-800 hover:border-slate-800 bg-slate-900 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200" aria-label="Twitter">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
