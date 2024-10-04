import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Dimensions } from 'react-native';
import { CalendarList, LocaleConfig } from 'react-native-calendars';
import { loadDiaryEntries, saveDiaryEntry } from './DiaryDatabase';
import DiaryEntry from './DiaryEntry'; // DiaryEntry をインポート
import DatePickerModal from './DatePickerModal'; // モーダルコンポーネントをインポート


// スクリーンの幅を取得
const screenWidth = Dimensions.get('window').width;

// 日本語のローカル設定を追加
LocaleConfig.locales['jp'] = {
  monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
};

LocaleConfig.defaultLocale = 'jp';

const HomeScreen = ({ navigation, route }) => {
  const [diaryEntries, setDiaryEntries] = useState({});

  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7));
  const [lastTap, setLastTap] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarHeight, setCalendarHeight] = useState(0);
  const flatListRef = useRef(null); // FlatListのリファレンス
  const calendarRef = useRef(null);
  const [entriesForCurrentMonth, setEntriesForCurrentMonth] = useState([]); 
  const [modalVisible, setModalVisible] = useState(false); // モーダルの表示状態


  useEffect(() => {
    const loadData = async () => {
      const storedEntries = await loadDiaryEntries();
      console.log('Loaded diary entries:', storedEntries); // ここを確認
      const safeEntries = storedEntries || {};
      setDiaryEntries(safeEntries);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (route.params?.deletedEntry) {
      const updatedEntries = { ...diaryEntries };
      delete updatedEntries[route.params.deletedEntry];
      setDiaryEntries(updatedEntries);
    }
  }, [route.params?.deletedEntry]);

  useEffect(() => {
    if (route.params?.newEntry) {
      const { date, text, image } = route.params.newEntry;
  
      const updatedEntries = { 
        ...diaryEntries, 
        [date]: { text: text, image: image || null }  // 画像が無い場合は null を設定
      };
  
      setDiaryEntries(updatedEntries);
      saveDiaryEntry(date, { text, image: image || null });  // 画像が無い場合は null を設定
    }
  }, [route.params?.newEntry]);

  useEffect(() => {
    const entriesForMonth = getDiaryEntriesForCurrentMonth();
    setEntriesForCurrentMonth(entriesForMonth);
  }, [currentMonth, diaryEntries]);

  useEffect(() => {
    // selectedDateが変更されたときにFlatListをスクロール
    const index = entriesForCurrentMonth.findIndex(entry => entry.date === selectedDate);
    if (index >= 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
          index, 
          animated: true,
          viewPosition: 0, // アイテムがリストの上部に来るように設定
      });
    } else {
        // 最下部のデータも表示するようにする
        const lastIndex = entriesForCurrentMonth.length - 1; // 最後のインデックスを取得
        if (lastIndex >= 0) {
            flatListRef.current.scrollToIndex({
                index: lastIndex,
                animated: true,
                viewPosition: 0, // 最上部に表示
            });
        }
    }
  }, [selectedDate, entriesForCurrentMonth]);

  // 現在の年と月を取得
  const currentYear = new Date().getFullYear(); // 現在の年
  const currentMonthNumber = new Date().getMonth() + 1; // 現在の月（0から始まるため1を足す


   // カレンダーの日付が押された時の処理
  const onDayPress = (day) => {
    const currentTime = Date.now();
    const DOUBLE_TAP_DELAY = 900;
  
    if (lastTap && (currentTime - lastTap) < DOUBLE_TAP_DELAY && selectedDate === day.dateString) {
      const existingText = diaryEntries[day.dateString]?.text || '';
      const existingImage = diaryEntries[day.dateString]?.image || null; // 画像を取得
      navigation.navigate('DiaryEditScreen', { selectedDate: day.dateString, existingText, existingImage });
      setLastTap(null);
    } else {
      setSelectedDate(day.dateString);
      setLastTap(currentTime);

    // 日付に対応するインデックスを取得し、FlatListをスクロール
    const index = entriesForCurrentMonth.findIndex(entry => entry.date === day.dateString);
    
    
    if (index >= 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index, 
        animated: true,
        viewPosition: 0, // アイテムがリストの上部に来るように設定
      });
    }
      
    }
  };

  // 月に含まれる週数を計算する関数
  const calculateWeeksInMonth = ({ year, month }) => {
    try {
      console.log(`calculateWeeksInMonth: Year: ${year}, Month: ${month}`); // 関数が呼び出されたかを確認
  
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
  
      const startWeekDay = firstDay.getDay();
      const endWeekDay = lastDay.getDay();
  
      const daysInMonth = lastDay.getDate();
      const totalDays = daysInMonth + startWeekDay + (6 - endWeekDay);
  
      const weeks = Math.ceil(totalDays / 7);
  
      console.log(`Year: ${year}, Month: ${month}, Weeks: ${weeks}`); // 計算結果をログに出力
  
      return weeks;
    } catch (error) {
      console.error('Error in calculateWeeksInMonth:', error);
      return 0; // デフォルト値
    }
  };
  
   // 月が変更されたときの処理
   const onMonthChange = (months) => {
    console.log('onMonthChange months:', months); // ログを追加して値を確認
  
    if (months && months.length > 0) {
      const month = months[0];
      console.log('Month object:', month); // ログを追加して値を確認
      const year = month.year;
      const monthNumber = month.month;
  
      if (year && monthNumber) {
        const newMonthStr = `${year}-${String(monthNumber).padStart(2, '0')}`;
        // 条件を一時的に外す
        // if (newMonthStr !== currentMonth) {
          setCurrentMonth(newMonthStr);
          console.log('Calling calculateWeeksInMonth with:', month); // ログを追加
          const weeks = calculateWeeksInMonth({ year, month: monthNumber });
          console.log('Weeks:', weeks); // 週間数をログに出力
          if (weeks > 0) {
            const newHeight = weeks * 60;
            console.log('Setting calendar height to:', newHeight); // 新しい高さをログに出力
            setCalendarHeight(newHeight);
          }
        // }
      } else {
        console.error('Month object is missing year or month properties');
      }
    } else {
      console.error('Months array is invalid or empty');
    }
  };
  

  const markedDates = {
    ...Object.keys(diaryEntries).reduce((acc, date) => {
      acc[date] = { marked: true, dotColor: 'pink' };
      return acc;
    }, {}),
    [selectedDate]: {
      selected: true,
      selectedColor: 'gray',
      marked: selectedDate in diaryEntries,
      dotColor: 'pink',
    },
  };

  const today = new Date().toISOString().split('T')[0];
  markedDates[today] = {
    selected: today === selectedDate,
    selectedColor: today === selectedDate ? 'gray' : undefined,
    marked: today in diaryEntries,
    dotColor: today in diaryEntries ? 'pink' : undefined,
    customStyles: {
      text: {
        color: today === selectedDate ? 'white' : 'orange',
        fontWeight: 'bold',
      },
    },
  };

  const handlePreviousMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const newMonth = new Date(year, month - 2); // ゼロベースの月に調整
    const newMonthStr = `${newMonth.getFullYear()}-${String(newMonth.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonthStr);
    calendarRef.current?.scrollToMonth(newMonthStr);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const newMonth = new Date(year, month); // Adjust for zero-based month
    newMonth.setMonth(newMonth.getMonth() + 1);
    const newMonthStr = `${newMonth.getFullYear()}-${String(newMonth.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonthStr);
    calendarRef.current?.scrollToMonth(newMonthStr);
  };

   // 月ごとのエントリーを取得
   const getDiaryEntriesForCurrentMonth = () => {
    const entriesForMonth = [];
    Object.keys(diaryEntries).forEach(date => {
      const [year, month] = date.split('-');
      if (`${year}-${month}` === currentMonth) {
        entriesForMonth.push({ date, ...diaryEntries[date] });
      }
    });
    // 日付順にソート
    entriesForMonth.sort((a, b) => new Date(a.date) - new Date(b.date));
    return entriesForMonth;
  };

  const handleTodayPress = () => {
    // 今日の日付をセットしてカレンダーをリセット
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today); // 選択された日付を今日に設定
    setCurrentMonth(today.slice(0, 7)); // 現在の月を今日の月に設定
    calendarRef.current?.scrollToMonth(today); // カレンダーを今日の月にスクロール

    // 今日の日記のエントリーにスクロール
    const index = entriesForCurrentMonth.findIndex(entry => entry.date === today);
    if (index >= 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index, 
        animated: true,
        viewPosition: 0, // アイテムがリストの上部に来るように設定
      });
    }
  };

  const handleMonthYearPress = () => {
    setModalVisible(true);
  };

  const handleConfirmDate = (year, month) => {
    const newMonthStr = `${year}-${String(month).padStart(2, '0')}`;
    setCurrentMonth(newMonthStr);
    calendarRef.current?.scrollToMonth(newMonthStr); // カレンダーを新しい月にスクロール
  };

  
  return (
    <View style={styles.container}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={handlePreviousMonth} style={styles.arrowButton}>
          <Text style={styles.arrowText}>{"<"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMonthYearPress}>
          <Text style={styles.headerText}>{currentMonth.replace('-', '/')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNextMonth} style={styles.arrowButton}>
          <Text style={styles.arrowText}>{">"}</Text>
        </TouchableOpacity>
        {/* ここに今日ボタンを追加 */}
        <TouchableOpacity onPress={handleTodayPress} style={styles.todayButton}>
          <Text style={styles.todayText}>今日</Text>
        </TouchableOpacity>
      </View>
      {/* 日付選択モーダル */}
      <DatePickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmDate}
        currentYear={currentYear}
        currentMonth={parseInt(currentMonth.split('-')[1])} // ここで現在の月を整数として渡す
      />
      <View
        style={styles.calendarWrapper}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          console.log('Calendar height:', height); // 高さをログに出力
          if (height > 0) {
            setCalendarHeight(height);
          } else {
            console.log('Failed to get calendar height, using default value.');
          }
        }}
      >
      <CalendarList
        ref={calendarRef}
        current={currentMonth}  // 現在の月を反映
        onDayPress={onDayPress}
        markedDates={markedDates}
        horizontal={true}
        pastScrollRange={300} // 過去1年分
        futureScrollRange={1000} // 未来1年分
        minDate={'2000-01-01'}  // 最も古い日付を指定（無制限にしたい場合、古い日付を設定）
        maxDate={'2100-12-31'}  // 最も未来の日付を指定（無制限にしたい場合、未来の日付を設定）
        pagingEnabled={true}
        scrollEnabled={true}
        onVisibleMonthsChange={(months) => {
          const currentMonth = months[0].dateString;
          if (currentMonth < '2000-01-01' || currentMonth > '2100-12-31') {
            Alert.alert(
              '範囲外です',
              'これ以上先の月には移動できません。指定された範囲内で操作をお願いします。',
              [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
            );
          }
          onMonthChange(months);
        }}
        showSixWeeks={false}
        theme={{
          selectedDayBackgroundColor: '#00adf5',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#00adf5',
          monthTextColor: '#000',
          textMonthFontWeight: 'bold',
          textDayFontSize: 16,
          textDayFontWeight: '300',
          textDayHeaderFontSize: 14,
          textDayHeaderFontWeight: '500',
          'stylesheet.calendar.header': {
              header: {
                display: 'none', // デフォルトのヘッダーを非表示にする
              },
            },
          'stylesheet.day.basic': {
            base: {
              width: 60,
              height: 60,
              alignItems: 'center',
              justifyContent: 'center',
            },
            selected: {
              width: 60,
              height: 60,
              borderRadius: 30,
            },
          },
        }}
        style={[styles.calendar, { width: screenWidth }]} // 幅を設定
      />
      </View>
      <FlatList
        ref={flatListRef}
        data={entriesForCurrentMonth}
        renderItem={({ item }) => (
          <DiaryEntry
            date={item.date}
            text={item.text}
            image={item.image}
            onEdit={() => {
              const existingText = diaryEntries[item.date]?.text || '';
              const existingImage = diaryEntries[item.date]?.image || null;
              navigation.navigate('DiaryEditScreen', { selectedDate: item.date, existingText, existingImage });
            }}
          />
        )}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyMessage}>該当月の日記はまだありません。</Text>
        }
        onScrollToIndexFailed={(info) => {
          const offset = info.averageItemLength * info.index;
          flatListRef.current?.scrollToOffset({ offset, animated: true });
          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ index: info.index, animated: true });
            }
          }, 100);
        }}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop:50,
    flex: 1,
    backgroundColor: '#fff',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  arrowButton: {
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  arrowText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  todayButton:{
    position: 'absolute', // 絶対位置に設定
    right: 20, // 右からの距離
    padding: 5,
    backgroundColor: '#fff',
    justifyContent:'flex-end',
  },
  todayText:{
    fontSize:16,
    fontWeight: 'bold',
  },
  calendarWrapper: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 0,
    backgroundColor: "#fff",
  },
  calendar: {
    borderWidth: 0, // カレンダーのボーダーを削除
    backgroundColor: "#fff",
  },
  flatList: {
    flex: 1, // `FlatList` が空きスペースを埋めるようにする
    flexGrow: 1,
  },
  entryContainer: {
    padding: 15,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  entryDate: {
    fontWeight: 'bold',
    color: '#ff6f61',
  },
  entryImage: {
    width: '100%',
    height: 200,
    marginTop: 10,
  },
  emptyMessage:{
    textAlign: 'center', // 中央揃え
    paddingTop: 30
  }
});

export default HomeScreen;
