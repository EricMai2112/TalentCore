import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function Products() {
  const products = [
    {
      title: 'TalentHRM',
      desc: 'Nền tảng quản trị nhân sự toàn diện ứng dụng AI giúp tối ưu quy trình và phát triển con người.',
      image: '/screen.png',
    },
    {
      title: 'TC Cloud',
      desc: 'Hệ sinh thái điện toán đám mây bảo mật, linh hoạt và tối ưu chi phí cho doanh nghiệp.',
      image: '/cloude.png',
    },
    {
      title: 'DataCore AI',
      desc: 'Giải pháp phân tích dữ liệu và trí tuệ nhân tạo giúp doanh nghiệp ra quyết định thông minh.',
      image: '/data.png',
    },
    {
      title: 'SecureCore',
      desc: 'Giải pháp an ninh mạng thế hệ mới bảo vệ hệ thống và dữ liệu doanh nghiệp 24/7.',
      image: '/secure.png',
    },
  ];

  return (
    <section id="products" className="py-24 bg-[#f8fafc] text-slate-900 border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <div className="flex flex-col gap-4 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              SẢN PHẨM & GIẢI PHÁP
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 leading-tight">
              Công nghệ tạo ra giá trị
            </h2>
          </div>
          <Link
            href="#"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
          >
            <span>Khám phá tất cả giải pháp</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((prod, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] hover:shadow-2xl hover:border-slate-200 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div>
                {/* Product Image Wrapper */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-100">
                  <Image
                    src={prod.image}
                    alt={prod.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                </div>
                
                {/* Product Text details */}
                <div className="p-8">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                    {prod.title}
                  </h3>
                  <p className="mt-3.5 text-sm leading-relaxed text-slate-500 line-clamp-3">
                    {prod.desc}
                  </p>
                </div>
              </div>

              {/* Action Link Footer */}
              <div className="px-8 pb-8">
                <Link
                  href="#"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors group/link"
                >
                  <span>Tìm hiểu thêm</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
