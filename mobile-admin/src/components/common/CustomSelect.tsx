import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface CustomSelectOption {
  value: string;
  label: string;
  subLabel?: string;
  icon?: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  icon?: keyof typeof Ionicons.glyphMap | string;
  disabled?: boolean;
  minDropdownWidth?: number;
  align?: 'left' | 'right';
  maxHeight?: number;
  containerStyle?: StyleProp<ViewStyle>;
  triggerStyle?: StyleProp<ViewStyle>;
  triggerTextStyle?: StyleProp<TextStyle>;
  activeTriggerStyle?: StyleProp<ViewStyle>;
  activeTriggerTextStyle?: StyleProp<TextStyle>;
  dropdownStyle?: StyleProp<ViewStyle>;
  children?:
    | React.ReactNode
    | ((props: { isOpen: boolean; selectedOption?: CustomSelectOption }) => React.ReactNode);
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Chọn...',
  icon,
  disabled = false,
  minDropdownWidth = 190,
  align = 'left',
  maxHeight = 260,
  containerStyle,
  triggerStyle,
  triggerTextStyle,
  activeTriggerStyle,
  activeTriggerTextStyle,
  dropdownStyle,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<View>(null);
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: minDropdownWidth,
  });

  const selectedOption = options.find((opt) => opt.value === value);
  const isActive = Boolean(value && value !== 'ALL' && value !== '');

  const handleOpen = () => {
    if (disabled) return;
    if (triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
        const menuWidth = Math.max(width, minDropdownWidth);

        // Calculate vertical position (space below vs above)
        const estimatedHeight = Math.min(options.length * 44 + 16, maxHeight);
        const spaceBelow = screenHeight - (y + height);
        let top = y + height + 6;

        if (spaceBelow < estimatedHeight && y > estimatedHeight) {
          top = Math.max(10, y - estimatedHeight - 6);
        }

        // Calculate horizontal position (left / right / bounds)
        let left = x;
        if (align === 'right') {
          left = x + width - menuWidth;
        }

        if (left + menuWidth > screenWidth - 12) {
          left = screenWidth - menuWidth - 12;
        }
        if (left < 12) {
          left = 12;
        }

        setMenuCoords({ top, left, width: menuWidth });
        setIsOpen(true);
      });
    }
  };

  const flatContainerStyle = StyleSheet.flatten(containerStyle) as ViewStyle | undefined;
  const flatTriggerStyle = StyleSheet.flatten(triggerStyle) as ViewStyle | undefined;
  const hasFlex =
    (flatContainerStyle && flatContainerStyle.flex !== undefined) ||
    (flatTriggerStyle && flatTriggerStyle.flex !== undefined);

  const resolvedContainerStyle: StyleProp<ViewStyle> = [
    Boolean(
      flatTriggerStyle &&
        flatTriggerStyle.flex !== undefined &&
        (!flatContainerStyle || flatContainerStyle.flex === undefined)
    ) && {
      flex: flatTriggerStyle?.flex,
    },
    containerStyle,
  ];

  const resolvedTriggerStyle: StyleProp<ViewStyle> = [
    styles.triggerPill,
    hasFlex && { width: '100%' },
    (isActive || isOpen) && styles.triggerPillActive,
    disabled && styles.triggerPillDisabled,
    triggerStyle,
    (isActive || isOpen) && activeTriggerStyle,
  ];

  return (
    <View style={resolvedContainerStyle} ref={triggerRef} collapsable={false}>
      <TouchableOpacity
        onPress={handleOpen}
        activeOpacity={disabled ? 1 : 0.7}
        disabled={disabled}
        style={resolvedTriggerStyle}
      >
        {children ? (
          typeof children === 'function' ? (
            children({ isOpen, selectedOption })
          ) : (
            children
          )
        ) : (
          <>
            {icon && (
              <Ionicons
                name={icon as any}
                size={14}
                color={isActive || isOpen ? '#1E3A8A' : '#64748B'}
                style={styles.triggerIcon}
              />
            )}
            <Text
              style={[
                styles.triggerText,
                (isActive || isOpen) && styles.triggerTextActive,
                triggerTextStyle,
                (isActive || isOpen) && activeTriggerTextStyle,
              ]}
              numberOfLines={1}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </Text>
            {!disabled && (
              <Ionicons
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={13}
                color={isActive || isOpen ? '#1E3A8A' : '#64748B'}
              />
            )}
          </>
        )}
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <View
            style={[
              styles.dropdownCard,
              {
                top: menuCoords.top,
                left: menuCoords.left,
                width: menuCoords.width,
              },
              dropdownStyle,
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <ScrollView
              style={{ maxHeight }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {options.length === 0 ? (
                <View style={styles.emptyItem}>
                  <Text style={styles.emptyText}>Không có lựa chọn nào</Text>
                </View>
              ) : (
                options.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.optionItem, isSelected && styles.optionItemActive]}
                      onPress={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      activeOpacity={0.65}
                    >
                      <View style={styles.optionContent}>
                        <Text
                          style={[styles.optionText, isSelected && styles.optionTextActive]}
                          numberOfLines={1}
                        >
                          {opt.label}
                        </Text>
                        {opt.subLabel && (
                          <Text style={styles.optionSubText} numberOfLines={1}>
                            {opt.subLabel}
                          </Text>
                        )}
                      </View>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color="#2563EB"
                          style={styles.checkIcon}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default CustomSelect;

const styles = StyleSheet.create({
  triggerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  triggerPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  triggerPillDisabled: {
    opacity: 0.55,
  },
  triggerIcon: {
    marginRight: 1,
  },
  triggerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    flexShrink: 1,
  },
  triggerTextActive: {
    color: '#1E3A8A',
    fontWeight: '700',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.001)', // Hoàn toàn trong suốt, không làm tối màn hình
  },
  dropdownCard: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 16,
    zIndex: 999999,
  },
  emptyItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9.5,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 2,
  },
  optionItemActive: {
    backgroundColor: '#EFF6FF',
  },
  optionContent: {
    flex: 1,
    paddingRight: 6,
  },
  optionText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  optionTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  optionSubText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  checkIcon: {
    marginLeft: 4,
  },
});

