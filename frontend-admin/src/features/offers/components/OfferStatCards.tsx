'use client';

import React from 'react';
import { FileText, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { OfferItem, OfferStatus } from '../types/offer.types';

interface OfferStatCardsProps {
  offers: OfferItem[];
  className?: string;
}

export const OfferStatCards: React.FC<OfferStatCardsProps> = ({
  offers,
  className = '',
}) => {
  const stats = React.useMemo(() => {
    let draft = 0;
    let sent = 0;
    let accepted = 0;
    let declined = 0;

    offers.forEach((o) => {
      if (o.status === OfferStatus.DRAFT) draft++;
      else if (o.status === OfferStatus.SENT) sent++;
      else if (o.status === OfferStatus.ACCEPTED) accepted++;
      else if (o.status === OfferStatus.DECLINED) declined++;
    });

    return {
      total: offers.length,
      draft,
      sent,
      accepted,
      declined,
    };
  }, [offers]);

  const statCardsConfig = [
    {
      id: 'ALL',
      label: 'TỔNG SỐ ĐỀ NGHỊ',
      count: stats.total,
      icon: FileText,
      iconBg: 'bg-blue-100/90 text-[#3B82F6] border-blue-200/60',
      blobGradient: 'from-blue-500/15 via-sky-400/10 to-transparent',
      ratioColor: 'bg-blue-50 text-[#3B82F6] border-blue-100',
    },
    {
      id: OfferStatus.SENT,
      label: 'CHỜ PHẢN HỒI',
      count: stats.sent,
      icon: Clock,
      iconBg: 'bg-amber-100/90 text-amber-600 border-amber-200/60',
      blobGradient: 'from-amber-500/15 via-orange-400/10 to-transparent',
      ratioColor: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    {
      id: OfferStatus.ACCEPTED,
      label: 'ĐÃ CHẤP NHẬN',
      count: stats.accepted,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100/90 text-emerald-600 border-emerald-200/60',
      blobGradient: 'from-emerald-500/15 via-teal-400/10 to-transparent',
      ratioColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      id: OfferStatus.DECLINED,
      label: 'ĐÃ TỪ CHỐI',
      count: stats.declined,
      icon: XCircle,
      iconBg: 'bg-rose-100/90 text-rose-600 border-rose-200/60',
      blobGradient: 'from-rose-500/15 via-pink-400/10 to-transparent',
      ratioColor: 'bg-rose-50 text-rose-700 border-rose-100',
    },
  ];

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 ${className}`}>
      {statCardsConfig.map((card) => {
        const IconComponent = card.icon;
        const percentRatio = stats.total > 0 ? Math.round((card.count / stats.total) * 100) : 0;

        return (
          <div
            key={card.id}
            className="relative bg-white/25 border border-white/60 rounded-2xl p-3 px-3.5 shadow-md shadow-blue-500/5 overflow-hidden flex items-center gap-3 select-none"
          >
            {/* Ambient Accent background */}
            <div
              className={`absolute -bottom-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${card.blobGradient} blur-lg pointer-events-none`}
            />

            {/* Left: Icon Badge */}
            <div
              className={`w-8.5 h-8.5 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${card.iconBg}`}
            >
              <IconComponent size={16} className="stroke-[2.2]" />
            </div>

            {/* Right: Label + Count & Dynamic Percentage Ratio */}
            <div className="relative z-10 flex-1 min-w-0">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block truncate leading-tight">
                {card.label}
              </span>
              <div className="flex items-baseline justify-between gap-1 mt-0.5">
                <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
                  {card.count}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 leading-none ${card.ratioColor}`}
                >
                  {percentRatio}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OfferStatCards;
