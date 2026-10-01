import { z } from "zod";
import { LocationType } from "../types/interview.types";

export const interviewScheduleSchema = z
  .object({
    date: z.string().min(1, "Vui lòng chọn ngày phỏng vấn"),
    startTime: z.string().min(1, "Vui lòng chọn giờ bắt đầu"),
    endTime: z.string().min(1, "Vui lòng chọn giờ kết thúc"),
    locationType: z.nativeEnum(LocationType),
    meetingLink: z.string().optional(),
    offsiteLocation: z.string().optional(),
    interviewerId: z.string().min(1, "Vui lòng chọn Người phỏng vấn thuộc phòng ban"),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: "Giờ kết thúc phải lớn hơn giờ bắt đầu",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => {
      if (data.locationType === LocationType.ONLINE) {
        return Boolean(data.meetingLink && data.meetingLink.trim().length > 0);
      }
      return true;
    },
    {
      message: "Vui lòng nhập link phỏng vấn online",
      path: ["meetingLink"],
    }
  )
  .refine(
    (data) => {
      if (data.locationType === LocationType.OFFSITE) {
        return Boolean(data.offsiteLocation && data.offsiteLocation.trim().length > 0);
      }
      return true;
    },
    {
      message: "Vui lòng nhập địa chỉ phỏng vấn trực tiếp",
      path: ["offsiteLocation"],
    }
  );

export type InterviewScheduleFormData = z.infer<typeof interviewScheduleSchema>;
