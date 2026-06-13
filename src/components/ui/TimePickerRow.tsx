import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../theme/ThemeContext';
import { formatTimeDisplay, parseTimeString, formatTimeString } from '../../utils/helpers';

interface TimePickerRowProps {
  label: string;
  time: string;
  enabled?: boolean;
  onTimeChange: (time: string) => void;
}

export function TimePickerRow({ label, time, enabled = true, onTimeChange }: TimePickerRowProps) {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const { hour, minute } = parseTimeString(time);

  const dateValue = new Date();
  dateValue.setHours(hour, minute, 0, 0);

  const handleChange = (_: unknown, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) {
      onTimeChange(formatTimeString(selected.getHours(), selected.getMinutes()));
    }
  };

  return (
    <View style={[styles.row, { borderBottomColor: colors.border, opacity: enabled ? 1 : 0.5 }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity
        onPress={() => enabled && setShowPicker(true)}
        style={[styles.timeBtn, { backgroundColor: colors.surfaceSecondary }]}
        disabled={!enabled}
      >
        <Text style={[styles.timeText, { color: colors.primary }]}>{formatTimeDisplay(time)}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={dateValue}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: 16, fontWeight: '500', flex: 1 },
  timeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  timeText: { fontSize: 15, fontWeight: '600' },
});
