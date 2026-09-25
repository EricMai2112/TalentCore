import React from 'react';
import { FileText, Send, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { OfferItem, OfferStatus } from '../types/offer.types';

interface OfferStatCardsProps {
  offers: OfferItem[];
}

export const OfferStatCards: React.FC<OfferStatCardsProps> = ({ offers }) => {
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

  const cards = [
    {
      label: 'Tổng số đề nghị',
      value: stats.total,
      icon: FileText,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/80',
      borderColor: 'border-indigo-100',
    },
    {
      label: 'Chờ ứng viên phản hồi',
      value: stats.sent,
      icon: Clock,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50/80',
      borderColor: 'border-amber-100',
    },
    {
      label: 'Đã chấp nhận',
      value: stats.accepted,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'border-emerald-100',
    },
    {
      label: 'Đã từ chối',
      value: stats.declined,
      icon: XCircle,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50/80',
      borderColor: 'border-rose-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`flex items-center gap-4 p-4 rounded-2xl bg-white border ${card.borderColor} shadow-xs transition-all hover:shadow-sm`}
          >
            <div className={`p-3 rounded-xl ${card.bgColor} ${card.iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">{card.label}</p>
              <h3 className="text-xl font-bold text-slate-800 mt-0.5">{card.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};
