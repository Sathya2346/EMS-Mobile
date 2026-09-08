import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { colors } from '../../theme/colors';

interface Props {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

/** RN equivalent of a `<select>` with a short, fixed option list (`.form-select`). */
export default function SelectDropdown({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)}>
        <Text style={styles.triggerText} numberOfLines={1}>
          {value}
        </Text>
        <Feather name="chevron-down" size={16} color="#495057" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.menu}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.option}
                onPress={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                <Text style={[styles.optionText, opt === value && styles.optionTextSelected]}>
                  {opt}
                </Text>
                {opt === value && <Feather name="check" size={16} color={colors.attendanceBtnGreen} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // .form-select (Bootstrap default)
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  triggerText: {
    fontSize: 15,
    color: '#212529',
    flexShrink: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 30,
  },
  menu: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 6,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  optionText: {
    fontSize: 15,
    color: '#212529',
  },
  optionTextSelected: {
    fontWeight: '700',
    color: colors.attendanceBtnGreen,
  },
});
