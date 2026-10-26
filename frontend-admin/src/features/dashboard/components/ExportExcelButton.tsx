'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import ExcelJS from 'exceljs';
import { analyticsApi } from '../services/analytics.api';

interface Props {
  departmentId?: string;
  departmentName?: string;
  jobDescriptionId?: string;
  jobTitle?: string;
}

const FONT_FAMILY = 'Calibri';

// Bảng màu thiết kế chuyên nghiệp
const COLORS = {
  navyDark: '1E3A8A',    // Header chính (Xanh navy đậm)
  navyLight: 'EFF6FF',   // Title background
  slateDark: '0F172A',   // Chữ đậm
  slateMuted: '64748B',  // Chữ phụ / Subtitle
  borderGray: 'CBD5E1',  // Viền bảng (slate-300)
  zebraBg: 'F8FAFC',     // Hàng xen kẽ (slate-50)
  white: 'FFFFFF',

  // Badges màu trạng thái
  greenBg: 'DCFCE7',
  greenText: '166534',
  amberBg: 'FEF3C7',
  amberText: '92400E',
  roseBg: 'FEE2E2',
  roseText: '991B1B',
  blueBg: 'DBEAFE',
  blueText: '1E40AF',
  purpleBg: 'EDE9FE',
  purpleText: '5B21B6',
  grayBg: 'F1F5F9',
  grayText: '475569',
};

const BORDER_THIN: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: `FF${COLORS.borderGray}` } },
  left: { style: 'thin', color: { argb: `FF${COLORS.borderGray}` } },
  bottom: { style: 'thin', color: { argb: `FF${COLORS.borderGray}` } },
  right: { style: 'thin', color: { argb: `FF${COLORS.borderGray}` } },
};

const ZEBRA_FILL: ExcelJS.FillPattern = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: `FF${COLORS.zebraBg}` },
};

const WHITE_FILL: ExcelJS.FillPattern = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: `FF${COLORS.white}` },
};

/** Áp dụng banner tiêu đề trang nhã cho đầu mỗi sheet */
function applyBanner(
  ws: ExcelJS.Worksheet,
  title: string,
  mergeToCol: string,
  metaLines: string[]
) {
  ws.views = [{ showGridLines: true }];

  // Hàng 1: Tiêu đề báo cáo
  ws.mergeCells(`A1:${mergeToCol}1`);
  const titleCell = ws.getCell('A1');
  titleCell.value = title;
  titleCell.font = { name: FONT_FAMILY, size: 13, bold: true, color: { argb: `FF${COLORS.navyDark}` } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: `FF${COLORS.navyLight}` },
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  titleCell.border = {
    bottom: { style: 'medium', color: { argb: `FF${COLORS.navyDark}` } },
  };
  ws.getRow(1).height = 32;

  // Hàng metadata (Thời điểm, Phòng ban, Vị trí)
  metaLines.forEach((line, idx) => {
    const rowNum = idx + 2;
    const cell = ws.getCell(`A${rowNum}`);
    cell.value = line;
    cell.font = { name: FONT_FAMILY, size: 9.5, italic: true, color: { argb: `FF${COLORS.slateMuted}` } };
    ws.getRow(rowNum).height = 18;
  });
}

/** Định dạng hàng tiêu đề bảng dữ liệu */
function styleHeaderRow(row: ExcelJS.Row, colCount: number) {
  row.height = 28;
  for (let c = 1; c <= colCount; c++) {
    const cell = row.getCell(c);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: `FF${COLORS.navyDark}` },
    };
    cell.font = {
      name: FONT_FAMILY,
      size: 10,
      bold: true,
      color: { argb: `FF${COLORS.white}` },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = BORDER_THIN;
  }
}

/** Tự động căn chỉnh độ rộng cột có padding */
function autoFitColumns(ws: ExcelJS.Worksheet, minWidths: number[] = []) {
  ws.columns.forEach((col, idx) => {
    let maxLen = minWidths[idx] || 12;
    col.eachCell?.({ includeEmpty: false }, (cell, rowNum) => {
      if (rowNum > 1) {
        const valStr = cell.value ? String(cell.value) : '';
        if (valStr.length > maxLen) {
          maxLen = valStr.length;
        }
      }
    });
    col.width = Math.min(Math.max(maxLen + 4, minWidths[idx] || 12), 48);
  });
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

      const wb = new ExcelJS.Workbook();
      wb.creator = 'TalentCore ATS';
      wb.lastModifiedBy = 'TalentCore Recruitment Analytics';
      wb.created = new Date();
      wb.modified = new Date();

      const metaInfo = [
        `• Thời điểm xuất báo cáo: ${new Date(data.exportedAt).toLocaleString('vi-VN')}`,
        `• Phạm vi phòng ban: ${departmentName || 'Toàn bộ công ty'}`,
        `• Phạm vi vị trí tuyển dụng: ${jobTitle || 'Tất cả vị trí'}`,
      ];

      // ─────────────────────────────────────────────────────────────
      // SHEET 1: TỔNG QUAN QUẢN TRỊ (EXECUTIVE SUMMARY)
      // ─────────────────────────────────────────────────────────────
      const wsSummary = wb.addWorksheet('Tong_Quan_KPI');
      applyBanner(wsSummary, 'BÁO CÁO QUẢN TRỊ TUYỂN DỤNG - TALENTCORE ATS', 'C', metaInfo);

      // Header bảng ở dòng 6
      const summaryHeaderRow = wsSummary.getRow(6);
      summaryHeaderRow.values = ['CHỈ SỐ ĐIỀU HÀNH CHÍNH', 'GIÁ TRỊ THỰC TẾ', 'MỤC TIÊU & ĐÁNH GIÁ CHUẨN'];
      styleHeaderRow(summaryHeaderRow, 3);

      const kpiItems = [
        {
          metric: '1. Chỉ tiêu tuyển dụng (Headcount Plan)',
          value: `${data.summary.hiredHeadcount} / ${data.summary.targetHeadcount} người`,
          note: `Đạt ${data.summary.fulfillmentRate}% kế hoạch định biên`,
          highlight: data.summary.fulfillmentRate >= 80 ? 'green' : 'amber',
        },
        {
          metric: '2. Số vị trí tuyển dụng đang mở (Active Positions)',
          value: `${data.summary.activeJobs} vị trí`,
          note: 'Tin tuyển dụng đang mở tiếp nhận hồ sơ',
          highlight: 'blue',
        },
        {
          metric: '3. Tốc độ tuyển dụng trung bình (Time-to-Hire)',
          value: `${data.summary.timeToHireDays} ngày`,
          note: 'Thời gian từ nộp đơn đến khi nhận việc (Mục tiêu SLA <= 25 ngày)',
          highlight: data.summary.timeToHireDays <= 25 ? 'green' : 'rose',
        },
        {
          metric: '4. Tỷ lệ chấp nhận Offer (Offer Acceptance Rate)',
          value: `${data.summary.offerAcceptanceRate}%`,
          note: 'Mục tiêu chuẩn ngành >= 80%',
          highlight: data.summary.offerAcceptanceRate >= 80 ? 'green' : 'amber',
        },
        {
          metric: '5. Tốc độ đóng vị trí tuyển dụng (Time-to-Fill)',
          value: `${data.summary.timeToFillDays} ngày`,
          note: 'Thời gian từ mở JD đến khi tuyển thành công (Mục tiêu <= 30 ngày)',
          highlight: data.summary.timeToFillDays <= 30 ? 'green' : 'amber',
        },
        {
          metric: '6. Tổng hồ sơ ứng viên tiếp nhận trong kỳ',
          value: `${data.summary.totalCandidates} hồ sơ`,
          note: 'Tổng ứng viên đã nộp đơn qua các kênh',
          highlight: 'gray',
        },
      ];

      kpiItems.forEach((item, idx) => {
        const rowNum = idx + 7;
        const row = wsSummary.getRow(rowNum);
        row.values = [item.metric, item.value, item.note];
        row.height = 24;

        // Cell 1: Metric name
        const c1 = row.getCell(1);
        c1.font = { name: FONT_FAMILY, size: 10, bold: true, color: { argb: `FF${COLORS.slateDark}` } };
        c1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        c1.border = BORDER_THIN;
        c1.fill = idx % 2 === 1 ? ZEBRA_FILL : WHITE_FILL;

        // Cell 2: Value
        const c2 = row.getCell(2);
        c2.font = { name: FONT_FAMILY, size: 10.5, bold: true, color: { argb: `FF${COLORS.navyDark}` } };
        c2.alignment = { vertical: 'middle', horizontal: 'center' };
        c2.border = BORDER_THIN;
        if (item.highlight === 'green') {
          c2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${COLORS.greenBg}` } };
          c2.font = { ...c2.font, color: { argb: `FF${COLORS.greenText}` } };
        } else if (item.highlight === 'amber') {
          c2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${COLORS.amberBg}` } };
          c2.font = { ...c2.font, color: { argb: `FF${COLORS.amberText}` } };
        } else {
          c2.fill = idx % 2 === 1 ? ZEBRA_FILL : WHITE_FILL;
        }

        // Cell 3: Note
        const c3 = row.getCell(3);
        c3.font = { name: FONT_FAMILY, size: 9.5, color: { argb: `FF${COLORS.slateMuted}` } };
        c3.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
        c3.border = BORDER_THIN;
        c3.fill = idx % 2 === 1 ? ZEBRA_FILL : WHITE_FILL;
      });

      autoFitColumns(wsSummary, [46, 22, 50]);

      // ─────────────────────────────────────────────────────────────
      // SHEET 2: PHỄU TUYỂN DỤNG (RECRUITMENT FUNNEL)
      // ─────────────────────────────────────────────────────────────
      const wsFunnel = wb.addWorksheet('Pheu_Tuyen_Dung');
      const funnelMeta = [
        ...metaInfo,
        `• Tổng hồ sơ tiếp nhận: ${(data as any).funnel?.totalApplications || 0} hồ sơ`,
        `• Tỷ lệ trúng tuyển toàn phễu: ${(data as any).funnel?.conversionRates?.overallRate || 0}%`,
      ];
      applyBanner(wsFunnel, 'BÁO CÁO PHỄU TUYỂN DỤNG THEO PIPELINE CHUẨN', 'F', funnelMeta);

      const funnelHeaderRow = wsFunnel.getRow(7);
      funnelHeaderRow.values = [
        'STT',
        'Giai đoạn Pipeline',
        'Ứng viên lũy kế',
        'Tỷ lệ toàn phễu (%)',
        'Đang xử lý tại bước này',
        'Chuyển tiếp từ bước trước (%)',
      ];
      styleHeaderRow(funnelHeaderRow, 6);

      const funnelStages = (data as any).funnel?.stages || [];
      funnelStages.forEach((s: any, idx: number) => {
        const rowNum = idx + 8;
        const row = wsFunnel.getRow(rowNum);
        row.values = [
          idx + 1,
          s.name,
          s.count,
          `${s.percentage}%`,
          s.currentCount ?? 'N/A',
          s.order > 1 ? `${s.stepConversionRate}%` : '100%',
        ];
        row.height = 24;

        for (let c = 1; c <= 6; c++) {
          const cell = row.getCell(c);
          cell.border = BORDER_THIN;
          cell.fill = idx % 2 === 1 ? ZEBRA_FILL : WHITE_FILL;
          cell.font = { name: FONT_FAMILY, size: 10, color: { argb: `FF${COLORS.slateDark}` } };

          if (c === 1) cell.alignment = { vertical: 'middle', horizontal: 'center' };
          else if (c === 2) {
            cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
            cell.font = { ...cell.font, bold: true };
          } else if (c === 3 || c === 5) {
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
            cell.numFmt = '#,##0';
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { ...cell.font, bold: true };
          }
        }
      });

      autoFitColumns(wsFunnel, [8, 28, 20, 20, 24, 28]);

      // ─────────────────────────────────────────────────────────────
      // SHEET 3: TIẾN ĐỘ THEO PHÒNG BAN (DEPARTMENT FULFILLMENT)
      // ─────────────────────────────────────────────────────────────
      const wsDept = wb.addWorksheet('Tien_Do_Phong_Ban');
      applyBanner(wsDept, 'TIẾN ĐỘ THỰC HIỆN KẾ HOẠCH TUYỂN DỤNG THEO PHÒNG BAN', 'G', metaInfo);

      const deptHeaderRow = wsDept.getRow(6);
      deptHeaderRow.values = [
        'Mã PB',
        'Tên phòng ban',
        'Chỉ tiêu (Target)',
        'Đã tuyển (Hired)',
        'Tỷ lệ hoàn thành (%)',
        'Vị trí đang mở',
        'Đánh giá tiến độ',
      ];
      styleHeaderRow(deptHeaderRow, 7);

      data.departments.forEach((d, idx) => {
        const rowNum = idx + 7;
        const row = wsDept.getRow(rowNum);
        const evalText =
          d.percentage >= 100
            ? 'Hoàn thành'
            : d.percentage >= 60
              ? 'Đang tiến hành'
              : 'Chậm tiến độ';

        row.values = [
          d.code || `PB0${idx + 1}`,
          d.name,
          d.targetHeadcount,
          d.hiredCount,
          `${d.percentage}%`,
          d.activeJobs,
          evalText,
        ];
        row.height = 24;

        for (let c = 1; c <= 7; c++) {
          const cell = row.getCell(c);
          cell.border = BORDER_THIN;
          cell.fill = idx % 2 === 1 ? ZEBRA_FILL : WHITE_FILL;
          cell.font = { name: FONT_FAMILY, size: 10, color: { argb: `FF${COLORS.slateDark}` } };

          if (c === 1) cell.alignment = { vertical: 'middle', horizontal: 'center' };
          else if (c === 2) {
            cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
            cell.font = { ...cell.font, bold: true };
          } else if (c === 3 || c === 4 || c === 6) {
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
            cell.numFmt = '#,##0';
          } else if (c === 5) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { ...cell.font, bold: true };
          } else if (c === 7) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { name: FONT_FAMILY, size: 9.5, bold: true };
            if (evalText === 'Hoàn thành') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${COLORS.greenBg}` } };
              cell.font = { ...cell.font, color: { argb: `FF${COLORS.greenText}` } };
            } else if (evalText === 'Đang tiến hành') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${COLORS.amberBg}` } };
              cell.font = { ...cell.font, color: { argb: `FF${COLORS.amberText}` } };
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${COLORS.roseBg}` } };
              cell.font = { ...cell.font, color: { argb: `FF${COLORS.roseText}` } };
            }
          }
        }
      });

      autoFitColumns(wsDept, [12, 28, 18, 18, 22, 18, 20]);

      // ─────────────────────────────────────────────────────────────
      // SHEET 4: DANH SÁCH CHI TIẾT CÁC VỊ TRÍ TUYỂN DỤNG (REQUISITIONS)
      // ─────────────────────────────────────────────────────────────
      const wsReq = wb.addWorksheet('Chi_Tiet_Vi_Tri');
      applyBanner(wsReq, 'DANH SÁCH CHI TIẾT CÁC VỊ TRÍ TUYỂN DỤNG (JOB REQUISITIONS)', 'M', metaInfo);

      const reqHeaderRow = wsReq.getRow(6);
      reqHeaderRow.values = [
        'Mã JD',
        'Tiêu đề vị trí',
        'Phòng ban',
        'Mức ưu tiên',
        'Chỉ tiêu',
        'Lương tối thiểu (VNĐ)',
        'Lương tối đa (VNĐ)',
        'Hình thức',
        'Địa điểm',
        'Trạng thái',
        'Ngày tạo',
        'Hạn nộp hồ sơ',
        'Người tạo yêu cầu',
      ];
      styleHeaderRow(reqHeaderRow, 13);

      data.requisitions.forEach((r, idx) => {
        const rowNum = idx + 7;
        const row = wsReq.getRow(rowNum);
        row.values = [
          r.id.slice(-6).toUpperCase(),
          r.title,
          r.departmentName,
          r.priority,
          r.headcount,
          r.minimumSalary,
          r.maximumSalary,
          r.employmentType,
          r.location,
          r.status,
          new Date(r.createdAt).toLocaleDateString('vi-VN'),
          r.deadline ? new Date(r.deadline).toLocaleDateString('vi-VN') : 'Không giới hạn',
          r.creatorName,
        ];
        row.height = 24;

        for (let c = 1; c <= 13; c++) {
          const cell = row.getCell(c);
          cell.border = BORDER_THIN;
          cell.fill = idx % 2 === 1 ? ZEBRA_FILL : WHITE_FILL;
          cell.font = { name: FONT_FAMILY, size: 9.5, color: { argb: `FF${COLORS.slateDark}` } };

          if (c === 1 || c === 8 || c === 11 || c === 12) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          } else if (c === 2) {
            cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
            cell.font = { ...cell.font, bold: true };
          } else if (c === 4) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { ...cell.font, bold: true };
            if (r.priority === 'HIGH') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${COLORS.roseBg}` } };
              cell.font = { ...cell.font, color: { argb: `FF${COLORS.roseText}` } };
            }
          } else if (c === 5) {
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
            cell.numFmt = '#,##0';
          } else if (c === 6 || c === 7) {
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
            cell.numFmt = '#,##0 "₫"';
          } else if (c === 10) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { ...cell.font, bold: true };
            if (r.status === 'APPROVED') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${COLORS.greenBg}` } };
              cell.font = { ...cell.font, color: { argb: `FF${COLORS.greenText}` } };
            } else if (r.status === 'COMPLETED') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${COLORS.blueBg}` } };
              cell.font = { ...cell.font, color: { argb: `FF${COLORS.blueText}` } };
            } else if (r.status === 'PENDING') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${COLORS.amberBg}` } };
              cell.font = { ...cell.font, color: { argb: `FF${COLORS.amberText}` } };
            }
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
          }
        }
      });

      autoFitColumns(wsReq, [10, 30, 22, 14, 10, 20, 20, 16, 18, 16, 14, 16, 22]);

      // ─────────────────────────────────────────────────────────────
      // SHEET 5: DANH SÁCH THƯ MỜI NHẬN VIỆC (OFFERS)
      // ─────────────────────────────────────────────────────────────
      const wsOffers = wb.addWorksheet('Danh_Sach_Offer');
      applyBanner(wsOffers, 'DANH SÁCH THƯ MỜI NHẬN VIỆC (OFFERS)', 'K', metaInfo);

      const statusMap: Record<string, string> = {
        ACCEPTED: 'Đã Tuyển',
        SENT: 'Đang phản hồi',
        DECLINED: 'Đã từ chối',
        DRAFT: 'Bản nháp',
        EXPIRED: 'Hết hạn',
        CANCELLED: 'Đã hủy',
      };

      const offerHeaderRow = wsOffers.getRow(6);
      offerHeaderRow.values = [
        'Mã Offer',
        'Họ tên ứng viên',
        'Email liên hệ',
        'Vị trí tuyển dụng',
        'Phòng ban',
        'Loại HĐ',
        'Trạng thái Offer',
        'Ngày gửi',
        'Hạn phản hồi',
        'Ngày phản hồi',
        'Lý do từ chối (nếu có)',
      ];
      styleHeaderRow(offerHeaderRow, 11);

      data.offers.forEach((o, idx) => {
        const rowNum = idx + 7;
        const row = wsOffers.getRow(rowNum);
        const stLabel = statusMap[o.status] || o.status;

        row.values = [
          o.id.slice(-6).toUpperCase(),
          o.candidateName,
          o.candidateEmail,
          o.positionTitle,
          o.departmentName,
          o.contractType,
          stLabel,
          new Date(o.sentAt).toLocaleDateString('vi-VN'),
          o.expiresAt ? new Date(o.expiresAt).toLocaleDateString('vi-VN') : 'N/A',
          o.respondedAt ? new Date(o.respondedAt).toLocaleDateString('vi-VN') : 'Chưa phản hồi',
          o.declineReason || '',
        ];
        row.height = 24;

        for (let c = 1; c <= 11; c++) {
          const cell = row.getCell(c);
          cell.border = BORDER_THIN;
          cell.fill = idx % 2 === 1 ? ZEBRA_FILL : WHITE_FILL;
          cell.font = { name: FONT_FAMILY, size: 9.5, color: { argb: `FF${COLORS.slateDark}` } };

          if (c === 1 || c === 6 || c === 8 || c === 9 || c === 10) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          } else if (c === 2) {
            cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
            cell.font = { ...cell.font, bold: true };
          } else if (c === 7) {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.font = { ...cell.font, bold: true };
            if (o.status === 'ACCEPTED') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${COLORS.greenBg}` } };
              cell.font = { ...cell.font, color: { argb: `FF${COLORS.greenText}` } };
            } else if (o.status === 'SENT') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${COLORS.amberBg}` } };
              cell.font = { ...cell.font, color: { argb: `FF${COLORS.amberText}` } };
            } else if (o.status === 'DECLINED') {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${COLORS.roseBg}` } };
              cell.font = { ...cell.font, color: { argb: `FF${COLORS.roseText}` } };
            }
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
          }
        }
      });

      autoFitColumns(wsOffers, [10, 24, 26, 28, 20, 14, 18, 14, 14, 16, 30]);

      // ─────────────────────────────────────────────────────────────
      // XUẤT BUFFER & TẢI FILE TRÊN TRÌNH DUYỆT
      // ─────────────────────────────────────────────────────────────
      const buffer = await wb.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().slice(0, 10);
      a.download = `Bao_Cao_Tuyen_Dung_TalentCore_${timestamp}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
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
      title="Tải sổ làm việc Excel chuẩn phong cách báo cáo quản trị"
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
