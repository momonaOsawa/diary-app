import React from 'react'; 
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import DialPicker from './component/DialPicker';

const DatePickerModal = ({ visible, onClose, onConfirm, currentYear, currentMonth }) => {
  const [selectedYear, setSelectedYear] = React.useState(currentYear);
  const [selectedMonth, setSelectedMonth] = React.useState(currentMonth);

  // 年と月のリストを生成
  const years = Array.from({ length: 101 }, (_, i) => String(2000 + i)); // 2000年から2100年まで
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1)); // 1月から12月

  // モーダルが表示されたときに選択された年と月を更新
  React.useEffect(() => {
    if (visible) {
      // モーダルが表示されるたびに、selectedYear と selectedMonth を currentYear と currentMonth に設定
      setSelectedYear(String(currentYear)); // Stringに変換
      setSelectedMonth(String(currentMonth)); // Stringに変換
    }
  }, [visible]); // currentYear と currentMonth が変わった場合にも再度反映させる

  React.useEffect(() => {
    // currentYear または currentMonth が変更されたときに selectedYear と selectedMonth を更新
    setSelectedYear(String(currentYear)); 
    setSelectedMonth(String(currentMonth)); 
  }, [currentYear, currentMonth]); // currentYear と currentMonth の変更を監視

  React.useEffect(() => {
    console.log(`Selected Year: ${selectedYear}, Selected Month: ${selectedMonth}`); // デバッグ用ログ
  }, [selectedYear, selectedMonth]);

  return (
    <Modal transparent={true} visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.pickerWrapper}>
            <DialPicker
              items={years}
              selectedValue={selectedYear}
              onValueChange={(itemValue) => {
                console.log(`Selected Year: ${itemValue}です。`); // 追加
                setSelectedYear(itemValue);
              }}
            />
            <DialPicker
              items={months}
              selectedValue={selectedMonth}
              onValueChange={(itemValue) => {
                console.log(`Selected Month: ${itemValue}です。`); // 追加
                setSelectedMonth(itemValue);
              }}
            />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.button}>
              <Text style={styles.buttonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onConfirm(selectedYear, selectedMonth);
                onClose();
              }}
              style={styles.button}>
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  pickerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    margin: 5,
    padding: 10,
    backgroundColor: '#00adf5',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
  },
});

export default DatePickerModal;
