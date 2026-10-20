'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { analyticsApi } from '../services/analytics.api';

interface Props {
  departmentId?: string;
  departmentName?: string;
  jobDescriptionId?: string;
  jobTitle?: string;
}

export default function ExportExcelButton({
  departmentId,
  departmentName,
  jobDescriptionId,
  jobTitle,
}: Props) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await analyticsApi.getExportReportData(departmentId, jobDescriptionId);

      const wb = XLSX.utils.book_new();

      // ─────────────────────────────────────────────────────────────
      // SHEET 1: TỔNG QUAN QUẢN TRỊ (EXECUTIVE SUMMARY)
      // ─────────────────────────────────────────────────────────────
      const summaryRows = [
        ['BÁO CÁO QUẢN TRỊ TUYỂN DỤNG - TALENTCORE ATS'],
        ['Thời điểm xuất báo cáo:', new Date(data.exportedAt).toLocaleString('vi-VN')],
        ['Phạm vi phòng ban:', departmentName || 'Toàn bộ công ty'],
        ['Phạm vi vị trí:', jobTitle || 'Tất cả vị trí'],
        [],
        ['CHỈ SỐ ĐIỀU HÀNH CHÍNH', 'GIÁ TRỊ', 'MỤC TIÊU / GHI CHÚ'],
        [
          '1. Chỉ tiêu tuyển dụng (Headcount Plan)',
          `${data.summary.hiredHeadcount} / ${data.summary.targetHeadcount} người`,
          `Đạt ${data.summary.fulfillmentRate}% kế hoạch`,
        ],
        [
          '2. Số vị trí tuyển dụng đang mở (Active Positions)',
          `${data.summary.activeJobs} vị trí`,
          'Tin tuyển dụng đang mở tiếp nhận hồ sơ',
        ],
        [
          '3. Tốc độ tuyển dụng trung bình (Time-to-Hire)',
          `${data.summary.timeToHireDays} ngày`,
          'Thời gian từ khi nộp hồ sơ đến khi nhận offer (Mục tiêu <= 25 ngày)',
        ],
        [
          '4. Tỷ lệ chấp nhận Offer (Offer Acceptance Rate)',
          `${data.summary.offerAcceptanceRate}%`,
          'Mục tiêu ngành >= 80%',
        ],
        [
          '5. Tốc độ đóng vị trí tuyển dụng (Time-to-Fill)',
          `${data.summary.timeToFillDays} ngày`,
          'Thời gian từ khi mở JD đến khi tuyển thành công (Mục tiêu <= 30 ngày)',
        ],
        [
          '6. Tổng hồ sơ ứng viên trong kỳ',
          data.summary.totalCandidates,
          'Tổng ứng viên đã nộp hồ sơ',
        ],
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      wsSummary['!cols'] = [{ wch: 48 }, { wch: 25 }, { wch: 45 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Tong_Quan_KPI');

      // ─────────────────────────────────────────────────────────────
      // SHEET 2: PHỄU TUYỂN DỤNG (RECRUITMENT FUNNEL)
      // ─────────────────────────────────────────────────────────────
      const funnelStages = (data as any).funnel?.stages || [];
      const funnelRows = [
        ['BÁO CÁO TIẾN TRÌNH CHUYỂN ĐỔI ỨNG VIÊN (PHỄU TUYỂN DỤNG)'],
        ['Tổng hồ sơ tiếp nhận:', `${(data as any).funnel?.totalApplications || 0} hồ sơ`],
        ['Tỷ lệ trúng tuyển toàn phễu:', `${(data as any).funnel?.conversionRates?.overallRate || 0}%`],
        [],
        [
          'Thứ tự',
          'Tên giai đoạn pipeline',
          'Số lượng ứng viên đạt',
          'Tỷ lệ toàn phễu (%)',
          'Đang xử lý tại bước này',
          'Chuyển tiếp từ bước trước (%)',
        ],
        ...funnelStages.map((s: any, idx: number) => [
          idx + 1,
          s.name,
          s.count,
          `${s.percentage}%`,
          s.currentCount ?? 'N/A',
          s.order > 1 ? `${s.stepConversionRate}%` : '100%',
        ]),
      ];
      const wsFunnel = XLSX.utils.aoa_to_sheet(funnelRows);
      wsFunnel['!cols'] = [
        { wch: 10 },
        { wch: 30 },
        { wch: 24 },
        { wch: 20 },
        { wch: 24 },
        { wch: 28 },
      ];
      XLSX.utils.book_append_sheet(wb, wsFunnel, 'Pheu_Tuyen_Dung');

      // ─────────────────────────────────────────────────────────────
      // SHEET 3: KẾ HOẠCH & TIẾN ĐỘ PHÒNG BAN (DEPARTMENT FULFILLMENT)
      // ─────────────────────────────────────────────────────────────
      const deptRows = [
        ['TIẾN ĐỘ THỰC HIỆN KẾ HOẠCH TUYỂN DỤNG THEO PHÒNG BAN'],
        [],
        [
          'Mã PB',
          'Tên phòng ban',
          'Chỉ tiêu (Target)',
          'Đã tuyển (Hired)',
          'Tỷ lệ hoàn thành (%)',
          'Số tin JD đang mở',
          'Đánh giá tiến độ',
        ],
        ...data.departments.map((d) => [
          d.code || 'N/A',
          d.name,
          d.targetHeadcount,
          d.hiredCount,
          `${d.percentage}%`,
          d.activeJobs,
          d.percentage >= 100
            ? 'Hoàn thành'
            : d.percentage >= 60
              ? 'Đang tiến hành'
              : 'Chậm tiến độ',
        ]),
      ];

      const wsDept = XLSX.utils.aoa_to_sheet(deptRows);
      wsDept['!cols'] = [
        { wch: 12 },
        { wch: 30 },
        { wch: 18 },
        { wch: 18 },
        { wch: 22 },
        { wch: 18 },
        { wch: 20 },
      ];
      XLSX.utils.book_append_sheet(wb, wsDept, 'Tien_Do_Phong_Ban');

      // ─────────────────────────────────────────────────────────────
      // SHEET 4: DANH SÁCH CHI TIẾT CÁC VỊ TRÍ TUYỂN DỤNG (REQUISITIONS)
      // ─────────────────────────────────────────────────────────────
      const reqRows = [
        ['DANH SÁCH CHI TIẾT CÁC VỊ TRÍ TUYỂN DỤNG (JOB REQUISITIONS)'],
        [],
        [
          'Mã JD',
          'Tiêu đề vị trí',
          'Phòng ban',
          'Mức ưu tiên',
          'Chỉ tiêu',
          'Lương tối thiểu (VND)',
          'Lương tối đa (VND)',
          'Hình thức làm việc',
          'Địa điểm',
          'Trạng thái',
          'Ngày tạo',
          'Hạn nộp hồ sơ',
          'Người tạo yêu cầu',
        ],
        ...data.requisitions.map((r) => [
          r.id.slice(-6).toUpperCase(),
          r.title,
          r.departmentName,
          r.priority,
          r.headcount,
          r.minimumSalary.toLocaleString('vi-VN'),
          r.maximumSalary.toLocaleString('vi-VN'),
          r.employmentType,
          r.location,
          r.status,
          new Date(r.createdAt).toLocaleDateString('vi-VN'),
          r.deadline ? new Date(r.deadline).toLocaleDateString('vi-VN') : 'Không giới hạn',
          r.creatorName,
        ]),
      ];

      const wsReq = XLSX.utils.aoa_to_sheet(reqRows);
      wsReq['!cols'] = [
        { wch: 10 },
        { wch: 32 },
        { wch: 22 },
        { wch: 14 },
        { wch: 10 },
        { wch: 22 },
        { wch: 22 },
        { wch: 18 },
        { wch: 20 },
        { wch: 16 },
        { wch: 14 },
        { wch: 16 },
        { wch: 22 },
      ];
      XLSX.utils.book_append_sheet(wb, wsReq, 'Chi_Tiet_Vi_Tri');

      // ─────────────────────────────────────────────────────────────
      // SHEET 5: DANH SÁCH THƯ MỜI NHẬN VIỆC (OFFERS)
      // ─────────────────────────────────────────────────────────────
      const statusMap: Record<string, string> = {
        ACCEPTED: 'Đã Tuyển',
        SENT: 'Đang phản hồi',
        DECLINED: 'Đã từ chối',
        DRAFT: 'Bản nháp',
        EXPIRED: 'Hết hạn',
        CANCELLED: 'Đã hủy',
      };

      const offerRows = [
        ['DANH SÁCH THƯ MỜI NHẬN VIỆC (OFFERS)'],
        [],
        [
          'Mã Offer',
          'Họ tên ứng viên',
          'Email liên hệ',
          'Vị trí tuyển dụng',
          'Phòng ban',
          'Loại hợp đồng',
          'Trạng thái Offer',
          'Ngày gửi',
          'Hạn phản hồi',
          'Ngày phản hồi',
          'Lý do từ chối (nếu có)',
        ],
        ...data.offers.map((o) => [
          o.id.slice(-6).toUpperCase(),
          o.candidateName,
          o.candidateEmail,
          o.positionTitle,
          o.departmentName,
          o.contractType,
          statusMap[o.status] || o.status,
          new Date(o.sentAt).toLocaleDateString('vi-VN'),
          o.expiresAt ? new Date(o.expiresAt).toLocaleDateString('vi-VN') : 'N/A',
          o.respondedAt ? new Date(o.respondedAt).toLocaleDateString('vi-VN') : 'Chưa phản hồi',
          o.declineReason || '',
        ]),
      ];

      const wsOffers = XLSX.utils.aoa_to_sheet(offerRows);
      wsOffers['!cols'] = [
        { wch: 10 },
        { wch: 24 },
        { wch: 26 },
        { wch: 28 },
        { wch: 20 },
        { wch: 16 },
        { wch: 18 },
        { wch: 14 },
        { wch: 14 },
        { wch: 16 },
        { wch: 30 },
      ];
      XLSX.utils.book_append_sheet(wb, wsOffers, 'Danh_Sach_Offer');

      // Tạo và tải file
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `Bao_Cao_Tuyen_Dung_TalentCore_${timestamp}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error('Lỗi khi xuất file Excel:', err);
      alert('Không thể xuất file báo cáo Excel. Vui lòng thử lại sau.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl
                 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs
                 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
                 cursor-pointer shrink-0"
      title="Tải sổ làm việc Excel đầy đủ các sheet báo cáo quản trị"
    >
      {isExporting ? (
        <>
          <Loader2 size={13} className="animate-spin" />
          <span>Đang tạo file...</span>
        </>
      ) : (
        <>
          <FileSpreadsheet size={13} className="stroke-[2.2]" />
          <span>Xuất Báo cáo Excel</span>
        </>
      )}
    </button>
  );
}
