import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Modal,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InterviewItem } from '../../../services/admin.services';
import InterviewWorkflowBadge, { InterviewResultBadge } from './InterviewWorkflowBadge';

interface InterviewCalendarMobileViewProps {
  interviews: InterviewItem[];
  onOpenCandidateDetail: (interview: InterviewItem) => void;
  onOpenDeptSchedule: (interview: InterviewItem) => void;
  onApproveHrSchedule: (interview: InterviewItem) => void;
  onApproveCancel: (interview: InterviewItem) => void;
  onOpenEvaluate: (interview: InterviewItem) => void;
  isHrAdmin: boolean;
  isDeptManager: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const START_HOUR = 8; // 08:00 AM (Giờ bắt đầu làm việc)
const END_HOUR = 17; // 17:00 (05:00 PM - Giờ kết thúc làm việc)
const HOUR_HEIGHT = 64; // Height per 1-hour slot in pixels

interface PositionedEvent {
  event: InterviewItem;
  colIndex: number;
  totalCols: number;
  topPx: number;
  heightPx: number;
  leftPct: number;
  widthPct: number;
}

export const InterviewCalendarMobileView: React.FC<InterviewCalendarMobileViewProps> = ({
  interviews,
  onOpenCandidateDetail,
  onOpenDeptSchedule,
  onApproveHrSchedule,
  onApproveCancel,
  onOpenEvaluate,
  isHrAdmin,
  isDeptManager,
  refreshing = false,
  onRefresh,
}) => {
  // Selected date for daily agenda (default today)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Expandable mini month dropdown state
  const [isMonthExpanded, setIsMonthExpanded] = useState<boolean>(false);
  const [viewMonth, setViewMonth] = useState<Date>(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  // Quick Action Sheet modal state for selected interview event
  const [selectedEventModal, setSelectedEventModal] = useState<InterviewItem | null>(null);

  // Time grid scroll view ref
  const timeGridScrollRef = useRef<ScrollView>(null);

  // Format ISO Date (YYYY-MM-DD)
  const toISODate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const selectedDateStr = toISODate(selectedDate);
  const todayStr = toISODate(new Date());

  // Week navigation: get 7 days of the active week (Monday -> Sunday)
  const weekDays = useMemo(() => {
    const d = new Date(selectedDate);
    const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay(); // Mon = 1, Sun = 7
    const monday = new Date(d);
    monday.setDate(d.getDate() - dayOfWeek + 1);
    monday.setHours(0, 0, 0, 0);

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      days.push(nextDay);
    }
    return days;
  }, [selectedDate]);

  // Only render official approved interviews on the calendar view grid (Đã lên lịch/xác nhận, Hoàn thành, Đã hủy)
  const isOfficialSchedule = (item: InterviewItem) => {
    if (!item.date || !item.startTime || !item.endTime) return false;

    // 1. Hoàn thành & Đã hủy
    if (
      item.status === 'COMPLETED' ||
      item.status === 'CANCELLED' ||
      item.confirmationStatus === 'CANCELLED'
    ) {
      return true;
    }

    // 2. Đã lên lịch: chỉ khi ứng viên ĐÃ XÁC NHẬN (CONFIRMED) hoặc IN_PROGRESS / UPCOMING
    if (
      item.confirmationStatus === 'CONFIRMED' ||
      item.status === 'IN_PROGRESS' ||
      item.status === 'UPCOMING'
    ) {
      return true;
    }

    // 3. Các trạng thái chưa xác nhận (WAITING_DEPT_SCHEDULE, WAITING_HR_APPROVAL, SCHEDULED/Chờ xác nhận, REJECTED, CANCEL_REQUESTED): ẩn khỏi lịch
    return false;
  };

  // Map counting interviews per date
  const interviewDateMap = useMemo(() => {
    const map: Record<string, InterviewItem[]> = {};
    interviews.forEach((item) => {
      if (!item.date || !isOfficialSchedule(item)) return;
      try {
        const itemDateStr = new Date(item.date).toISOString().split('T')[0];
        if (!map[itemDateStr]) map[itemDateStr] = [];
        map[itemDateStr].push(item);
      } catch {}
    });
    return map;
  }, [interviews]);

  // Mini Month Grid generator (Monday -> Sunday 7 cols)
  const miniMonthDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Convert JavaScript Sunday-first day (0=Sun, 1=Mon, ..., 6=Sat) to Monday-first (0=Mon, ..., 6=Sun)
    const startDay = (firstDayOfMonth.getDay() + 6) % 7;

    const days: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Prev month padding
    for (let i = startDay - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, isCurrentMonth: false, dateStr: toISODate(d) });
    }

    // Current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true, dateStr: toISODate(d) });
    }

    // Next month padding
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false, dateStr: toISODate(d) });
    }

    return days;
  }, [viewMonth]);

  // Helper to convert "HH:MM" to minutes from midnight
  const timeToMinutes = (timeStr?: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    return h * 60 + m;
  };

  // Google Calendar Interval Overlap Layout Algorithm
  const positionedDayEvents = useMemo(() => {
    const dayEvents = interviewDateMap[selectedDateStr] || [];
    if (!dayEvents || dayEvents.length === 0) return [];

    // 1. Sort events: earlier start time first; if equal, longer duration first
    const sorted = [...dayEvents].sort((a, b) => {
      const sA = timeToMinutes(a.startTime);
      const sB = timeToMinutes(b.startTime);
      if (sA !== sB) return sA - sB;
      const eA = timeToMinutes(a.endTime);
      const eB = timeToMinutes(b.endTime);
      const durA = (eA > sA ? eA : sA + 60) - sA;
      const durB = (eB > sB ? eB : sB + 60) - sB;
      return durB - durA;
    });

    // 2. Group into overlapping clusters
    interface OverlapCluster {
      items: {
        event: InterviewItem;
        startMin: number;
        endMin: number;
      }[];
      maxEndMin: number;
    }

    const clusters: OverlapCluster[] = [];
    let currentCluster: OverlapCluster | null = null;

    for (const event of sorted) {
      const sMin = timeToMinutes(event.startTime);
      let eMin = timeToMinutes(event.endTime);
      if (eMin <= sMin) eMin = sMin + 60; // fallback duration: 60 mins

      if (!currentCluster) {
        currentCluster = {
          items: [{ event, startMin: sMin, endMin: eMin }],
          maxEndMin: eMin,
        };
      } else {
        if (sMin < currentCluster.maxEndMin) {
          // Overlaps with current cluster
          currentCluster.items.push({ event, startMin: sMin, endMin: eMin });
          if (eMin > currentCluster.maxEndMin) {
            currentCluster.maxEndMin = eMin;
          }
        } else {
          clusters.push(currentCluster);
          currentCluster = {
            items: [{ event, startMin: sMin, endMin: eMin }],
            maxEndMin: eMin,
          };
        }
      }
    }
    if (currentCluster) {
      clusters.push(currentCluster);
    }

    // 3. For each cluster, assign columns using greedy interval graph coloring
    const results: PositionedEvent[] = [];

    for (const cluster of clusters) {
      const columns: number[] = []; // stores last endMin for each column
      const clusterAssigned: {
        event: InterviewItem;
        startMin: number;
        endMin: number;
        colIndex: number;
      }[] = [];

      for (const item of cluster.items) {
        let assignedCol = -1;
        for (let c = 0; c < columns.length; c++) {
          if (columns[c] <= item.startMin) {
            assignedCol = c;
            columns[c] = item.endMin;
            break;
          }
        }
        if (assignedCol === -1) {
          assignedCol = columns.length;
          columns.push(item.endMin);
        }
        clusterAssigned.push({
          ...item,
          colIndex: assignedCol,
        });
      }

      const totalCols = Math.max(columns.length, 1);

      for (const item of clusterAssigned) {
        const startOffsetMinutes = item.startMin - START_HOUR * 60;
        const durationMinutes = Math.max(item.endMin - item.startMin, 30);

        const topPx = Math.max(0, (startOffsetMinutes / 60) * HOUR_HEIGHT);
        const heightPx = Math.max((durationMinutes / 60) * HOUR_HEIGHT - 2, 44);

        const leftPct = (item.colIndex / totalCols) * 100;
        const widthPct = (1 / totalCols) * 100;

        results.push({
          event: item.event,
          colIndex: item.colIndex,
          totalCols,
          topPx,
          heightPx,
          leftPct,
          widthPct,
        });
      }
    }

    return results;
  }, [interviewDateMap, selectedDateStr]);

  // Auto-scroll to earliest event or current hour
  useEffect(() => {
    const timer = setTimeout(() => {
      if (positionedDayEvents.length > 0) {
        const minTop = Math.min(...positionedDayEvents.map((e) => e.topPx));
        timeGridScrollRef.current?.scrollTo({
          y: Math.max(0, minTop - 20),
          animated: true,
        });
      } else if (selectedDateStr === todayStr) {
        const currentHour = new Date().getHours();
        const currentScrollY = Math.max(0, (currentHour - START_HOUR - 1) * HOUR_HEIGHT);
        timeGridScrollRef.current?.scrollTo({
          y: currentScrollY,
          animated: true,
        });
      } else {
        // Default scroll to 8:00 AM (top of business hours)
        timeGridScrollRef.current?.scrollTo({
          y: 0,
          animated: true,
        });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedDateStr, positionedDayEvents.length]);

  // Navigation handlers
  const prevWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    setSelectedDate(d);
    setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const nextWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    setSelectedDate(d);
    setViewMonth(new Date(d.getFullYear(), d.getMonth(), 1));
  };

  const goToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const handleOpenMeet = (link?: string) => {
    if (!link) {
      Alert.alert('Thông báo', 'Cuộc hẹn này không có liên kết trực tuyến.');
      return;
    }
    Linking.openURL(link).catch(() => {
      Alert.alert('Lỗi', 'Không thể mở liên kết phòng họp.');
    });
  };

  // Color picker for event card
  const getEventCardBg = (status?: string, confirmationStatus?: string) => {
    if (status === 'COMPLETED') return '#059669'; // Emerald
    if (status === 'CANCELLED' || confirmationStatus === 'REJECTED') return '#DC2626'; // Red
    if (confirmationStatus === 'CANCEL_REQUESTED') return '#EA580C'; // Orange
    if (
      confirmationStatus === 'WAITING_DEPT_SCHEDULE' ||
      confirmationStatus === 'WAITING_HR_APPROVAL'
    )
      return '#D97706'; // Amber
    if (status === 'IN_PROGRESS') return '#2563EB'; // Blue
    return '#0284C7'; // Google Calendar Sky Blue default
  };

  const dayOfWeekNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const fullDayNames = [
    'Chủ Nhật',
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
  ];

  // Hours array for vertical timeline
  const hours = useMemo(() => {
    const list: number[] = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      list.push(h);
    }
    return list;
  }, []);

  // Current time position indicator
  const now = new Date();
  const isTodayActive = selectedDateStr === todayStr;
  const currentMinutesFromStart = now.getHours() * 60 + now.getMinutes() - START_HOUR * 60;
  const maxMinutes = (END_HOUR - START_HOUR + 1) * 60;
  const currentLineTop =
    isTodayActive && currentMinutesFromStart >= 0 && currentMinutesFromStart <= maxMinutes
      ? (currentMinutesFromStart / 60) * HOUR_HEIGHT
      : null;

  return (
    <View style={styles.container}>
      {/* ─── 1. TOP HEADER: MONTH DROPDOWN & ACTIONS (GOOGLE CALENDAR STYLE) ─── */}
      <View style={styles.topControlBar}>
        <TouchableOpacity
          style={styles.monthDropdownToggle}
          onPress={() => setIsMonthExpanded(!isMonthExpanded)}
          activeOpacity={0.75}
        >
          <Text style={styles.monthTitleText}>
            Tháng {selectedDate.getMonth() + 1}, {selectedDate.getFullYear()}
          </Text>
          <Ionicons
            name={isMonthExpanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#1E293B"
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>

        <View style={styles.headerRightBtns}>
          <TouchableOpacity
            style={[styles.todayBtn, selectedDateStr === todayStr && styles.todayBtnActive]}
            onPress={goToday}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.todayBtnText,
                selectedDateStr === todayStr && styles.todayBtnTextActive,
              ]}
            >
              Hôm nay
            </Text>
          </TouchableOpacity>

          <View style={styles.navArrowGroup}>
            <TouchableOpacity style={styles.navArrowBtn} onPress={prevWeek} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={17} color="#334155" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navArrowBtn} onPress={nextWeek} activeOpacity={0.7}>
              <Ionicons name="chevron-forward" size={17} color="#334155" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ─── 2. EXPANDABLE MINI MONTH CALENDAR (GOOGLE CALENDAR EXPANDED VIEW) ─── */}
      {isMonthExpanded && (
        <View style={styles.miniMonthContainer}>
          {/* Month selector pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.monthPillsRow}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((mIdx) => {
              const pillDate = new Date(selectedDate.getFullYear(), mIdx, 1);
              const isCurrentPill = viewMonth.getMonth() === mIdx;
              return (
                <TouchableOpacity
                  key={mIdx}
                  style={[styles.monthPill, isCurrentPill && styles.monthPillActive]}
                  onPress={() => setViewMonth(pillDate)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[styles.monthPillText, isCurrentPill && styles.monthPillTextActive]}
                  >
                    Thg {mIdx + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Mini Month Grid Header */}
          <View style={styles.miniWeekHeader}>
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((h, i) => (
              <Text key={i} style={styles.miniWeekHeaderText}>
                {h}
              </Text>
            ))}
          </View>

          {/* Mini Month Day Cells */}
          <View style={styles.miniGridDays}>
            {miniMonthDays.map((cell, idx) => {
              const isSelected = cell.dateStr === selectedDateStr;
              const isToday = cell.dateStr === todayStr;
              const hasEvents = (interviewDateMap[cell.dateStr] || []).length > 0;

              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.miniDayCell}
                  onPress={() => {
                    setSelectedDate(cell.date);
                    setIsMonthExpanded(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.miniDayCircle,
                      isSelected && styles.miniDayCircleSelected,
                      isToday && !isSelected && styles.miniDayCircleToday,
                    ]}
                  >
                    <Text
                      style={[
                        styles.miniDayText,
                        !cell.isCurrentMonth && styles.miniDayTextMuted,
                        isSelected && styles.miniDayTextSelected,
                        isToday && !isSelected && styles.miniDayTextToday,
                      ]}
                    >
                      {cell.date.getDate()}
                    </Text>
                  </View>
                  {hasEvents && (
                    <View
                      style={[
                        styles.miniEventDot,
                        isSelected && { backgroundColor: '#2563EB' },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* ─── 3. WEEK STRIP (7 NGÀY TRONG TUẦN - PINNED GOOGLE CALENDAR BAR) ─── */}
      <View style={styles.weekStrip}>
        {weekDays.map((dateObj, idx) => {
          const dateISO = toISODate(dateObj);
          const isSelected = dateISO === selectedDateStr;
          const isToday = dateISO === todayStr;
          const dayInterviews = interviewDateMap[dateISO] || [];
          const hasEvents = dayInterviews.length > 0;
          const dayName = dayOfWeekNames[dateObj.getDay()];

          return (
            <TouchableOpacity
              key={idx}
              style={[styles.dayPill, isSelected && styles.dayPillSelected]}
              onPress={() => setSelectedDate(dateObj)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.dayPillName,
                  isSelected && styles.dayPillNameSelected,
                  isToday && !isSelected && styles.dayPillNameToday,
                ]}
              >
                {dayName}
              </Text>

              <View
                style={[
                  styles.dayPillNumCircle,
                  isSelected && styles.dayPillNumCircleSelected,
                  isToday && !isSelected && styles.dayPillNumCircleToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayPillNumText,
                    isSelected && styles.dayPillNumTextSelected,
                    isToday && !isSelected && styles.dayPillNumTextToday,
                  ]}
                >
                  {dateObj.getDate()}
                </Text>
              </View>

              {/* Event Indicator Dots */}
              <View style={styles.dotsRow}>
                {hasEvents ? (
                  <View
                    style={[
                      styles.eventDot,
                      isSelected && styles.eventDotSelected,
                      dayInterviews.some((i) => i.status === 'COMPLETED') &&
                        !isSelected && { backgroundColor: '#10B981' },
                    ]}
                  />
                ) : (
                  <View style={styles.eventDotEmpty} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ─── 4. DATE SUB-HEADER WITH EVENT COUNT & QUICK SUMMARY ─── */}
      <View style={styles.dateSubHeader}>
        <View style={styles.dateSubHeaderLeft}>
          <Text style={styles.dateSubHeaderTitle}>
            {fullDayNames[selectedDate.getDay()]}, {selectedDate.getDate()}/
            {selectedDate.getMonth() + 1}/{selectedDate.getFullYear()}
          </Text>
        </View>
        <View style={styles.countBadgePill}>
          <Text style={styles.countBadgePillText}>
            {positionedDayEvents.length} cuộc phỏng vấn
          </Text>
        </View>
      </View>

      {/* ─── 5. GOOGLE CALENDAR TIME-GRID CANVAS (VERTICAL TIME AXIS + EVENTS) ─── */}
      <ScrollView
        ref={timeGridScrollRef}
        style={styles.timeGridScroll}
        contentContainerStyle={styles.timeGridContent}
        showsVerticalScrollIndicator={true}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2563EB']}
            />
          ) : undefined
        }
      >
        <View style={styles.timeGridWrapper}>
          {/* Left Column: Hour labels */}
          <View style={styles.timeLabelsCol}>
            {hours.map((hour) => (
              <View key={hour} style={[styles.timeLabelSlot, { height: HOUR_HEIGHT }]}>
                <Text style={styles.timeLabelText}>{`${hour}:00`}</Text>
              </View>
            ))}
          </View>

          {/* Right Column: Canvas Grid with Horizontal slot lines & Overlapping Events */}
          <View style={styles.gridCanvas}>
            {/* Horizontal Hour Lines */}
            {hours.map((hour) => (
              <View
                key={hour}
                style={[styles.hourDividerLine, { top: (hour - START_HOUR) * HOUR_HEIGHT }]}
              />
            ))}

            {/* Current Time Red Line Indicator (if selected date is today) */}
            {currentLineTop !== null && (
              <View style={[styles.currentTimeIndicator, { top: currentLineTop }]}>
                <View style={styles.currentTimeCircle} />
                <View style={styles.currentTimeLine} />
              </View>
            )}

            {/* Overlapping Event Blocks (Google Calendar Event Blocks) */}
            {positionedDayEvents.map((posEvent, idx) => {
              const { event, topPx, heightPx, leftPct, widthPct } = posEvent;
              const candName =
                event.candidateId?.fullName || event.candidateId?.name || 'Ứng viên';
              const jobTitle = event.jobDescriptionId?.title || 'Phỏng vấn tuyển dụng';
              const isOnline = event.locationType === 'ONLINE';
              const cardBg = getEventCardBg(event.status, event.confirmationStatus);
              const interviewerName =
                typeof event.interviewerId === 'object'
                  ? event.interviewerId?.name || event.interviewerId?.email
                  : undefined;

              return (
                <TouchableOpacity
                  key={event._id || idx}
                  style={[
                    styles.eventBlock,
                    {
                      top: topPx,
                      height: heightPx,
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      backgroundColor: cardBg,
                    },
                  ]}
                  onPress={() => setSelectedEventModal(event)}
                  activeOpacity={0.88}
                >
                  <View style={styles.eventBlockContent}>
                    {/* Header Row: Title & Online icon */}
                    <View style={styles.eventBlockHeaderRow}>
                      <Text style={styles.eventBlockTitle} numberOfLines={1}>
                        {jobTitle}
                      </Text>
                      {isOnline && (
                        <Ionicons
                          name="videocam"
                          size={12}
                          color="#FFFFFF"
                          style={{ marginLeft: 3 }}
                        />
                      )}
                    </View>

                    {/* Time Range */}
                    <Text style={styles.eventBlockTime} numberOfLines={1}>
                      {event.startTime || '09:00'} - {event.endTime || '10:00'}
                    </Text>

                    {/* Candidate Name */}
                    <Text style={styles.eventBlockCandidate} numberOfLines={1}>
                      {candName}
                    </Text>

                    {/* Interviewer if height allows */}
                    {heightPx >= 58 && interviewerName && (
                      <Text style={styles.eventBlockInterviewer} numberOfLines={1}>
                        {interviewerName}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* ─── 6. QUICK ACTION MODAL FOR SELECTED INTERVIEW EVENT ─── */}
      <Modal
        visible={!!selectedEventModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedEventModal(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedEventModal(null)}
        >
          <TouchableOpacity
            style={styles.modalCard}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {selectedEventModal && (
              <>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <InterviewWorkflowBadge
                      status={selectedEventModal.status}
                      confirmationStatus={selectedEventModal.confirmationStatus}
                      isEscalated={selectedEventModal.isEscalated}
                    />
                    {selectedEventModal.result && selectedEventModal.result !== 'PENDING' && (
                      <InterviewResultBadge result={selectedEventModal.result} />
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setSelectedEventModal(null)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Candidate & Job Info */}
                <View style={styles.modalBody}>
                  <Text style={styles.modalCandidateName}>
                    {selectedEventModal.candidateId?.fullName ||
                      selectedEventModal.candidateId?.name ||
                      'Ứng viên'}
                  </Text>
                  <Text style={styles.modalJobTitle}>
                    {selectedEventModal.jobDescriptionId?.title || 'Vị trí ứng tuyển'}
                  </Text>

                  {/* Info rows */}
                  <View style={styles.modalInfoBox}>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="calendar-outline" size={16} color="#2563EB" />
                      <Text style={styles.modalInfoText}>
                        {fullDayNames[new Date(selectedEventModal.date).getDay()]},{' '}
                        {new Date(selectedEventModal.date).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>

                    <View style={styles.modalInfoRow}>
                      <Ionicons name="time-outline" size={16} color="#2563EB" />
                      <Text style={styles.modalInfoText}>
                        {selectedEventModal.startTime || '09:00'} -{' '}
                        {selectedEventModal.endTime || '10:00'} (
                        {Math.max(
                          timeToMinutes(selectedEventModal.endTime) -
                            timeToMinutes(selectedEventModal.startTime),
                          60
                        )}{' '}
                        phút)
                      </Text>
                    </View>

                    <View style={styles.modalInfoRow}>
                      <Ionicons
                        name={
                          selectedEventModal.locationType === 'ONLINE'
                            ? 'videocam-outline'
                            : 'location-outline'
                        }
                        size={16}
                        color={
                          selectedEventModal.locationType === 'ONLINE'
                            ? '#4F46E5'
                            : '#D97706'
                        }
                      />
                      <Text style={styles.modalInfoText}>
                        {selectedEventModal.locationType === 'ONLINE'
                          ? 'Trực tuyến (Google Meet / Jitsi)'
                          : selectedEventModal.offsiteLocation || 'Tại văn phòng công ty'}
                      </Text>
                    </View>

                    {selectedEventModal.interviewerId && (
                      <View style={styles.modalInfoRow}>
                        <Ionicons name="person-outline" size={16} color="#059669" />
                        <Text style={styles.modalInfoText}>
                          Phỏng vấn viên:{' '}
                          <Text style={{ fontWeight: '700', color: '#1E293B' }}>
                            {typeof selectedEventModal.interviewerId === 'object'
                              ? selectedEventModal.interviewerId?.name ||
                                selectedEventModal.interviewerId?.email
                              : 'Phỏng vấn viên'}
                          </Text>
                        </Text>
                      </View>
                    )}

                    {selectedEventModal.cancelReason && (
                      <View style={styles.cancelReasonBox}>
                        <Text style={styles.cancelReasonTitle}>Lý do hủy lịch:</Text>
                        <Text style={styles.cancelReasonText}>
                          {selectedEventModal.cancelReason}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Actions Button Group */}
                  <View style={styles.modalActionsCol}>
                    {/* View Candidate Profile */}
                    <TouchableOpacity
                      style={styles.primaryActionBtn}
                      onPress={() => {
                        const item = selectedEventModal;
                        setSelectedEventModal(null);
                        onOpenCandidateDetail(item);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="person-circle-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.primaryActionBtnText}>Xem hồ sơ ứng viên</Text>
                    </TouchableOpacity>

                    {/* Join Meet Link */}
                    {selectedEventModal.locationType === 'ONLINE' &&
                      selectedEventModal.meetingLink && (
                        <TouchableOpacity
                          style={styles.meetActionBtn}
                          onPress={() => handleOpenMeet(selectedEventModal.meetingLink)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="videocam" size={18} color="#FFFFFF" />
                          <Text style={styles.meetActionBtnText}>Vào phòng Meet</Text>
                        </TouchableOpacity>
                      )}

                    {/* Dept Schedule / Edit Schedule */}
                    {(selectedEventModal.confirmationStatus === 'WAITING_DEPT_SCHEDULE' ||
                      (isHrAdmin &&
                        selectedEventModal.confirmationStatus === 'WAITING_HR_APPROVAL')) && (
                      <TouchableOpacity
                        style={styles.secondaryActionBtn}
                        onPress={() => {
                          const item = selectedEventModal;
                          setSelectedEventModal(null);
                          onOpenDeptSchedule(item);
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="calendar-outline" size={17} color="#2563EB" />
                        <Text style={styles.secondaryActionBtnText}>
                          {selectedEventModal.confirmationStatus === 'WAITING_DEPT_SCHEDULE'
                            ? 'Xếp lịch phỏng vấn'
                            : 'Chỉnh sửa lịch phỏng vấn'}
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* HR Approve Schedule */}
                    {isHrAdmin &&
                      selectedEventModal.confirmationStatus === 'WAITING_HR_APPROVAL' && (
                        <TouchableOpacity
                          style={styles.approveScheduleBtn}
                          onPress={() => {
                            const item = selectedEventModal;
                            setSelectedEventModal(null);
                            onApproveHrSchedule(item);
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="checkmark-done" size={17} color="#FFFFFF" />
                          <Text style={styles.approveScheduleBtnText}>
                            Phê duyệt lịch phỏng vấn
                          </Text>
                        </TouchableOpacity>
                      )}

                    {/* Candidate Cancel Approval */}
                    {isHrAdmin &&
                      selectedEventModal.confirmationStatus === 'CANCEL_REQUESTED' && (
                        <TouchableOpacity
                          style={styles.cancelApproveBtn}
                          onPress={() => {
                            const item = selectedEventModal;
                            setSelectedEventModal(null);
                            onApproveCancel(item);
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="checkmark-circle-outline" size={17} color="#FFFFFF" />
                          <Text style={styles.cancelApproveBtnText}>
                            Duyệt yêu cầu hủy lịch
                          </Text>
                        </TouchableOpacity>
                      )}

                    {/* Evaluate Result */}
                    {['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(
                      selectedEventModal.status
                    ) && (
                      <TouchableOpacity
                        style={styles.evaluateActionBtn}
                        onPress={() => {
                          const item = selectedEventModal;
                          setSelectedEventModal(null);
                          onOpenEvaluate(item);
                        }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="create-outline" size={17} color="#059669" />
                        <Text style={styles.evaluateActionBtnText}>Đánh giá kết quả</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // 1. Top control bar
  topControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  monthDropdownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  monthTitleText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerRightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  todayBtnActive: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  todayBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  todayBtnTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  navArrowGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  navArrowBtn: {
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  // 2. Expandable Mini Month
  miniMonthContainer: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 12,
  },
  monthPillsRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  monthPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  monthPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  monthPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  monthPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  miniWeekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  miniWeekHeaderText: {
    width: 38,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  miniGridDays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  miniDayCell: {
    width: `${100 / 7}%`,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDayCircleSelected: {
    backgroundColor: '#2563EB',
  },
  miniDayCircleToday: {
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  miniDayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E293B',
  },
  miniDayTextMuted: {
    color: '#CBD5E1',
  },
  miniDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  miniDayTextToday: {
    color: '#2563EB',
    fontWeight: '700',
  },
  miniEventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0284C7',
    marginTop: 2,
  },

  // 3. Week Strip (Pinned Google Calendar 7 days bar)
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dayPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  dayPillSelected: {
    backgroundColor: '#EFF6FF',
  },
  dayPillName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  dayPillNameSelected: {
    color: '#2563EB',
    fontWeight: '700',
  },
  dayPillNameToday: {
    color: '#0F172A',
    fontWeight: '700',
  },
  dayPillNumCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPillNumCircleSelected: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  dayPillNumCircleToday: {
    borderWidth: 1.5,
    borderColor: '#2563EB',
  },
  dayPillNumText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  dayPillNumTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayPillNumTextToday: {
    color: '#2563EB',
    fontWeight: '700',
  },
  dotsRow: {
    height: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#0284C7',
  },
  eventDotSelected: {
    backgroundColor: '#2563EB',
  },
  eventDotEmpty: {
    width: 5,
    height: 5,
  },

  // 4. Date Sub-Header
  dateSubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dateSubHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateSubHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  countBadgePill: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countBadgePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },

  // 5. Time Grid Canvas
  timeGridScroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  timeGridContent: {
    paddingBottom: 110, // Avoid bottom tab bar obstruction
  },
  timeGridWrapper: {
    flexDirection: 'row',
    height: (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT,
  },
  timeLabelsCol: {
    width: 52,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  timeLabelSlot: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 0,
  },
  timeLabelText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    transform: [{ translateY: -7 }],
  },
  gridCanvas: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  hourDividerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#F1F5F9',
  },

  // Current Time Red Indicator
  currentTimeIndicator: {
    position: 'absolute',
    left: -6,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 40,
    pointerEvents: 'none',
  },
  currentTimeCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  currentTimeLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#EF4444',
  },

  // Google Calendar Event Block
  eventBlock: {
    position: 'absolute',
    borderRadius: 7,
    paddingHorizontal: 3,
    paddingVertical: 2,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  eventBlockContent: {
    flex: 1,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  eventBlockHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  eventBlockTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  eventBlockTime: {
    fontSize: 10.5,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.92)',
    marginBottom: 2,
  },
  eventBlockCandidate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  eventBlockInterviewer: {
    fontSize: 9.5,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 1,
  },

  // 6. Quick Action Modal / Bottom Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    maxHeight: Dimensions.get('window').height * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    marginTop: 14,
  },
  modalCandidateName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalJobTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 2,
  },
  modalInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    gap: 9,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalInfoText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
  },
  cancelReasonBox: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cancelReasonTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 2,
  },
  cancelReasonText: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
  },
  modalActionsCol: {
    marginTop: 18,
    gap: 10,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  meetActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 12,
    borderRadius: 10,
  },
  meetActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  secondaryActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  approveScheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#059669',
    paddingVertical: 11,
    borderRadius: 10,
  },
  approveScheduleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cancelApproveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 11,
    borderRadius: 10,
  },
  cancelApproveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  evaluateActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  evaluateActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#059669',
  },
});

export default InterviewCalendarMobileView;
