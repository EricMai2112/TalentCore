import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Circle,
  Line,
  Text as SvgText,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

export interface TrendItem {
  month: string;
  applications: number;
  hired: number;
}

interface Props {
  data?: TrendItem[];
  onSelectMonths?: (months: number) => void;
}

const MONTH_TABS = [
  { label: '3T', value: 3 },
  { label: '6T', value: 6 },
  { label: '12T', value: 12 },
];

export const TimelineTrend: React.FC<Props> = ({ data = [], onSelectMonths }) => {
  const [selectedRange, setSelectedRange] = useState<number>(6);

  const handleRangeChange = (m: number) => {
    setSelectedRange(m);
    if (onSelectMonths) {
      onSelectMonths(m);
    }
  };

  // Filter or slice data based on range
  const displayData = data.slice(-selectedRange);

  // SVG Chart Dimensions
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(280, screenWidth - 64);
  const chartHeight = 150;
  const paddingLeft = 28;
  const paddingRight = 12;
  const paddingTop = 14;
  const paddingBottom = 24;

  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  // Calculate scales (0 to max 100 or higher)
  const maxValRaw = Math.max(
    100,
    ...displayData.map((d) => Math.max(d.applications, d.hired))
  );
  // Round up to nice number
  const maxY = Math.ceil(maxValRaw / 25) * 25;
  const ySteps = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY];

  const numPoints = displayData.length;
  const getX = (i: number) =>
    numPoints <= 1
      ? paddingLeft + plotWidth / 2
      : paddingLeft + (i * plotWidth) / (numPoints - 1);
  const getY = (val: number) =>
    paddingTop + plotHeight - (val / maxY) * plotHeight;

  // Build SVG Paths
  let appLinePath = '';
  let appAreaPath = '';
  let hiredLinePath = '';

  if (numPoints > 0) {
    const appPoints = displayData.map((d, i) => ({ x: getX(i), y: getY(d.applications) }));
    const hiredPoints = displayData.map((d, i) => ({ x: getX(i), y: getY(d.hired) }));

    // Smooth Bezier Curve generator
    const createSmoothPath = (pts: { x: number; y: number }[]) => {
      if (pts.length <= 1) return `M ${pts[0]?.x || 0} ${pts[0]?.y || 0}`;
      let path = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const cpX = (p0.x + p1.x) / 2;
        path += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
      }
      return path;
    };

    appLinePath = createSmoothPath(appPoints);
    hiredLinePath = createSmoothPath(hiredPoints);

    // Area path closes at bottom
    const firstX = appPoints[0].x;
    const lastX = appPoints[appPoints.length - 1].x;
    const bottomY = paddingTop + plotHeight;
    appAreaPath = `${appLinePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }

  return (
    <View style={styles.card}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="trending-up" size={15} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.title}>Xu Hướng Tuyển Dụng</Text>
            <Text style={styles.subtitle}>So sánh số lượng Ứng tuyển & Đã tuyển</Text>
          </View>
        </View>

        {/* 3T / 6T / 12T Segment */}
        <View style={styles.tabContainer}>
          {MONTH_TABS.map((t) => {
            const isSelected = selectedRange === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
                onPress={() => handleRangeChange(t.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ─── SVG Area Chart ─── */}
      <View style={styles.chartWrapper}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <SvgLinearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.22" />
              <Stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </SvgLinearGradient>
          </Defs>

          {/* Grid lines and Y Labels */}
          {ySteps.map((val, idx) => {
            const y = getY(val);
            return (
              <React.Fragment key={idx}>
                <Line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - paddingRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <SvgText
                  x={paddingLeft - 6}
                  y={y + 3.5}
                  fontSize="9"
                  fill="#94A3B8"
                  textAnchor="end"
                  fontWeight="600"
                >
                  {Math.round(val)}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Blue Area Fill under Ứng tuyển */}
          {appAreaPath ? <Path d={appAreaPath} fill="url(#blueAreaGrad)" /> : null}

          {/* Blue Line (Ứng tuyển) */}
          {appLinePath ? (
            <Path
              d={appLinePath}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          ) : null}

          {/* Green Line (Đã tuyển) */}
          {hiredLinePath ? (
            <Path
              d={hiredLinePath}
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
            />
          ) : null}

          {/* Data point dots & X Labels */}
          {displayData.map((d, i) => {
            const x = getX(i);
            const yApp = getY(d.applications);
            const yHired = getY(d.hired);

            return (
              <React.Fragment key={i}>
                {/* Blue dot */}
                <Circle
                  cx={x}
                  cy={yApp}
                  r="3.5"
                  fill="#FFFFFF"
                  stroke="#3B82F6"
                  strokeWidth="2"
                />
                {/* Green dot */}
                <Circle
                  cx={x}
                  cy={yHired}
                  r="3"
                  fill="#FFFFFF"
                  stroke="#10B981"
                  strokeWidth="1.8"
                />
                {/* Month label on X-axis */}
                <SvgText
                  x={x}
                  y={paddingTop + plotHeight + 16}
                  fontSize="9.5"
                  fill="#64748B"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {d.month}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      {/* ─── Legend ─── */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Đã tuyển</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Ứng tuyển</Text>
        </View>
      </View>
    </View>
  );
};

export default TimelineTrend;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  tabButton: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#2563EB',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
});
