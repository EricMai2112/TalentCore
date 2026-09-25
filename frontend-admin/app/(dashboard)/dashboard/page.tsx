import { Users, Briefcase, Calendar, CheckCircle2, TrendingUp, ArrowUpRight } from 'lucide-react';
import { GlassCard, GlassBadge, GlassButton } from '@/src/components/common/glass';
import Link from 'next/link';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Tổng Ứng Viên',
      value: '1,284',
      change: '+12.5%',
      icon: Users,
      color: 'text-[#1261A6]',
      bg: 'bg-[#1261A6]/10',
    },
    {
      title: 'Tin Tuyển Dụng',
      value: '42',
      change: '+4 new',
      icon: Briefcase,
      color: 'text-[#2A95BF]',
      bg: 'bg-[#2A95BF]/10',
    },
    {
      title: 'Phỏng Vấn Hôm Nay',
      value: '8',
      change: '2 sắp tới',
      icon: Calendar,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Offer Đã Gửi',
      value: '15',
      change: '85% chấp nhận',
      icon: CheckCircle2,
      color: 'text-amber-600',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Glass Banner ── */}
      <GlassCard variant="primary" className="p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-3">
            <GlassBadge variant="accent" size="md">
              TalentCore Platform v2.0
            </GlassBadge>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Chào mừng bạn đến với Hệ thống Quản trị TalentCore
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Theo dõi tiến độ tuyển dụng, điều phối lịch phỏng vấn và quản lý danh sách ứng viên hiệu quả trên nền tảng thiết kế Glassmorphism hiện đại.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/kanban">
              <GlassButton variant="secondary" icon={<ArrowUpRight size={16} />}>
                Xem Kanban Tuyển Dụng
              </GlassButton>
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* ── KPI Stat Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={i} variant="hover" className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <Icon size={22} />
                </div>
                <GlassBadge variant="accent" size="sm">
                  <TrendingUp size={12} className="mr-1 inline" />
                  {stat.change}
                </GlassBadge>
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
            </GlassCard>
          );
        })}
      </div>

      {/* ── Quick Actions / Overview Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/60">
            <h3 className="text-base font-bold text-slate-900">Hoạt Động Tuyển Dụng Gần Đây</h3>
            <Link href="/candidates">
              <span className="text-xs font-bold text-[#1261A6] hover:underline cursor-pointer">
                Xem tất cả ứng viên →
              </span>
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Nguyễn Văn An', pos: 'Senior Frontend Developer', dept: 'Phòng Công nghệ', time: '10 phút trước', stage: 'Vòng Phỏng vấn Tech' },
              { name: 'Trần Thị Bình', pos: 'UI/UX Designer', dept: 'Phòng Thiết kế', time: '1 giờ trước', stage: 'Đánh giá CV' },
              { name: 'Lê Minh Cường', pos: 'Backend Engineer (Node.js)', dept: 'Phòng Công nghệ', time: '3 giờ trước', stage: 'Đã gửi Offer' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-white/60 backdrop-blur-xs border border-white/80 rounded-2xl hover:bg-white/90 transition-all"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                  <p className="text-xs font-medium text-slate-500">{item.pos} • {item.dept}</p>
                </div>
                <div className="text-right">
                  <GlassBadge variant="accent" size="sm">{item.stage}</GlassBadge>
                  <p className="text-[10px] text-slate-400 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/60">
            <h3 className="text-base font-bold text-slate-900">Truy Cập Nhanh</h3>
          </div>
          <div className="space-y-3">
            <Link href="/job-description/create" className="block">
              <div className="p-3.5 bg-[#1261A6]/10 hover:bg-[#1261A6]/15 border border-[#1261A6]/20 rounded-2xl transition-all flex items-center justify-between">
                <span className="text-xs font-bold text-[#1261A6]">+ Tạo Tin Tuyển Dụng Mới</span>
                <ArrowUpRight size={14} className="text-[#1261A6]" />
              </div>
            </Link>
            <Link href="/interviews/create" className="block">
              <div className="p-3.5 bg-[#2A95BF]/10 hover:bg-[#2A95BF]/15 border border-[#2A95BF]/20 rounded-2xl transition-all flex items-center justify-between">
                <span className="text-xs font-bold text-[#1261A6]">+ Đặt Lịch Phỏng Vấn</span>
                <ArrowUpRight size={14} className="text-[#1261A6]" />
              </div>
            </Link>
            <Link href="/settings" className="block">
              <div className="p-3.5 bg-slate-100/70 hover:bg-slate-200/60 border border-slate-200/60 rounded-2xl transition-all flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Cấu Hình Quy Trình Tuyển Dụng</span>
                <ArrowUpRight size={14} className="text-slate-500" />
              </div>
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
