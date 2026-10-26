import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  style?: ViewStyle;
}

export const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  style,
}) => {
  if (totalItems === 0) {
    return null;
  }

  const safeTotalPages = Math.max(1, totalPages);
  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate pagination buttons array with ellipsis (...)
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (safeTotalPages <= maxVisible) {
      for (let i = 1; i <= safeTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(safeTotalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        start = 2;
        end = 4;
      } else if (currentPage >= safeTotalPages - 2) {
        start = safeTotalPages - 3;
        end = safeTotalPages - 1;
      }

      if (start > 2) pages.push('...');

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < safeTotalPages - 1) pages.push('...');

      pages.push(safeTotalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <View style={[styles.container, style]}>
      {/* Page item summary info */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>
          Hiển thị{' '}
          <Text style={styles.summaryHighlight}>{startItem}</Text> -{' '}
          <Text style={styles.summaryHighlight}>{endItem}</Text> trên tổng số{' '}
          <Text style={styles.summaryHighlight}>{totalItems}</Text> bản ghi
        </Text>
      </View>

      {/* Pagination control buttons */}
      {safeTotalPages > 1 && (
        <View style={styles.controlsRow}>
          {/* Previous Button */}
          <TouchableOpacity
            style={[styles.navBtn, currentPage === 1 && styles.navBtnDisabled]}
            disabled={currentPage === 1}
            onPress={() => onPageChange(currentPage - 1)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={18}
              color={currentPage === 1 ? '#94A3B8' : '#334155'}
            />
          </TouchableOpacity>

          {/* Page numbers */}
          <View style={styles.pageNumbersRow}>
            {pageNumbers.map((page, idx) => {
              if (typeof page === 'string') {
                return (
                  <View key={`ellipsis-${idx}`} style={styles.ellipsisBox}>
                    <Text style={styles.ellipsisText}>...</Text>
                  </View>
                );
              }

              const isActive = page === currentPage;
              return (
                <TouchableOpacity
                  key={`page-${page}`}
                  style={[styles.pageBtn, isActive && styles.pageBtnActive]}
                  onPress={() => onPageChange(page)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.pageBtnText,
                      isActive && styles.pageBtnTextActive,
                    ]}
                  >
                    {page}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={[
              styles.navBtn,
              currentPage === safeTotalPages && styles.navBtnDisabled,
            ]}
            disabled={currentPage === safeTotalPages}
            onPress={() => onPageChange(currentPage + 1)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={currentPage === safeTotalPages ? '#94A3B8' : '#334155'}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryRow: {
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryHighlight: {
    color: '#0F172A',
    fontWeight: '700',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnDisabled: {
    opacity: 0.45,
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  pageNumbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pageBtn: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  pageBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  pageBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  ellipsisBox: {
    minWidth: 20,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ellipsisText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
});

export default CustomPagination;
