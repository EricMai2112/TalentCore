/**
 * Định dạng mức lương công việc cho ứng viên theo định dạng VNĐ.
 * Nếu min và max đều là 0 (hoặc không xác định), hiển thị "Thương lượng".
 */
export function formatJobSalary(
  min?: number | null,
  max?: number | null,
  options?: { showSuffix?: boolean }
): string {
  const minVal = Number(min ?? 0);
  const maxVal = Number(max ?? 0);
  const showSuffix = options?.showSuffix ?? true;

  if (minVal === 0 && maxVal === 0) {
    return "Thương lượng";
  }

  const suffix = showSuffix ? " / tháng" : "";

  if (minVal > 0 && maxVal > 0) {
    if (minVal === maxVal) {
      return `${minVal.toLocaleString("vi-VN")} VNĐ${suffix}`;
    }
    return `${minVal.toLocaleString("vi-VN")} - ${maxVal.toLocaleString("vi-VN")} VNĐ${suffix}`;
  }

  if (minVal > 0) {
    return `Từ ${minVal.toLocaleString("vi-VN")} VNĐ${suffix}`;
  }

  if (maxVal > 0) {
    return `Lên đến ${maxVal.toLocaleString("vi-VN")} VNĐ${suffix}`;
  }

  return "Thương lượng";
}
