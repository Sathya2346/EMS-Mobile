import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { colors } from '../../theme/colors';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarProps {
  onSelectDate: (isoDate: string) => void;
}

/**
 * Port of the `.calendar` widget and `renderCalendar()` in
 * userAttendance.js: a 6x7 month grid, prev/next navigation, today
 * highlighted (bg-success, circular), and a tappable selected day
 * (bg-primary, square — the original only adds `rounded-circle` for
 * today, not for the clicked/selected day).
 */
export default function Calendar({ onSelectDate }: CalendarProps) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selected, setSelected] = useState<string | null>(null);

  const weeks = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const rows: (number | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [month, year]);

  const goPrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handlePress = (day: number) => {
    const cellDate = new Date(year, month, day);
    const y = cellDate.getFullYear();
    const m = String(cellDate.getMonth() + 1).padStart(2, '0');
    const d = String(cellDate.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${d}`;
    setSelected(iso);
    onSelectDate(iso);
  };

  const isToday = (day: number) =>
    day === now.getDate() && month === now.getMonth() && year === now.getFullYear();

  return (
    <View style={styles.calendar}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goPrev} accessibilityLabel="Previous month">
          <Feather name="chevron-left" size={18} color={colors.calendarLinkBlue} />
        </TouchableOpacity>
        <Text style={styles.monthYear}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <TouchableOpacity onPress={goNext} accessibilityLabel="Next month">
          <Feather name="chevron-right" size={18} color={colors.calendarLinkBlue} />
        </TouchableOpacity>
      </View>

      <View style={styles.dayHeaderRow}>
        {DAY_HEADERS.map((h) => (
          <Text key={h} style={styles.dayHeaderCell}>
            {h}
          </Text>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((day, di) => {
            if (day == null) {
              return <View key={di} style={styles.cell} />;
            }
            const cellDate = new Date(year, month, day);
            const y = cellDate.getFullYear();
            const m = String(cellDate.getMonth() + 1).padStart(2, '0');
            const dd = String(cellDate.getDate()).padStart(2, '0');
            const iso = `${y}-${m}-${dd}`;
            const today = isToday(day);
            const isSelected = selected === iso;
            return (
              <TouchableOpacity
                key={di}
                style={[
                  styles.cell,
                  today && styles.cellToday,
                  isSelected && !today && styles.cellSelected,
                ]}
                onPress={() => handlePress(day)}
              >
                <Text style={[styles.cellText, (today || isSelected) && styles.cellTextActive]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const CELL_SIZE = 32;

const styles = StyleSheet.create({
  // .calendar { background-color:#e9faff; border-radius:12px; padding:10px }
  calendar: {
    backgroundColor: colors.calendarBg,
    borderRadius: 12,
    padding: 10,
  },
  // .calendar-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px }
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  // .calendar-header h6 { font-weight:600; color:#007bff; font-size:.9rem }
  monthYear: {
    fontWeight: '600',
    color: colors.calendarLinkBlue,
    fontSize: 14.4,
  },
  dayHeaderRow: {
    flexDirection: 'row',
  },
  // .calendar th { color:#333; font-weight:600; padding-bottom:3px; border-bottom:1px solid #eee }
  dayHeaderCell: {
    flex: 1,
    textAlign: 'center',
    color: '#333333',
    fontWeight: '600',
    fontSize: 12.8, // .8rem
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  weekRow: {
    flexDirection: 'row',
  },
  // .calendar td { padding:5px; border-radius:6px }
  cell: {
    flex: 1,
    height: CELL_SIZE,
    margin: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // today: bg-success + rounded-circle
  cellToday: {
    backgroundColor: colors.calendarTodayBg,
    borderRadius: CELL_SIZE / 2,
  },
  // selected day: bg-primary (no rounded-circle in the original)
  cellSelected: {
    backgroundColor: colors.calendarSelectedBg,
  },
  cellText: {
    fontSize: 12.8,
    color: '#212529',
  },
  cellTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
});
