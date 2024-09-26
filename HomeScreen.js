import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import { CalendarList, LocaleConfig } from 'react-native-calendars';
import { loadDiaryEntries, saveDiaryEntry } from './DiaryDatabase';
import DiaryEntry from './DiaryEntry'; // DiaryEntry をインポート
import { Dimensions } from 'react-native';

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
  const calendarRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      const storedEntries = await loadDiaryEntries();
      setDiaryEntries(storedEntries);
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
      
      // データ構造を確認し、不足しているフィールドがないかチェック
      if (!date || !text) {
        console.error('Invalid entry data: date or text is missing');
        return;
      }
  
      const updatedEntries = { 
        ...diaryEntries, 
        [date]: { text: text, image: image || null }  // 画像が無い場合は null を設定
      };
  
      setDiaryEntries(updatedEntries);
      saveDiaryEntry(date, { text, image: image || null });  // 画像が無い場合は null を設定
    }
  }, [route.params?.newEntry]);

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
  


  

  const diaryList = selectedDate in diaryEntries
  ? [{ date: selectedDate, text: diaryEntries[selectedDate]?.text || '', image: diaryEntries[selectedDate]?.image || null }]  // 画像が無い場合は null を設定
  : [];
  

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

  return (
    <View style={styles.container}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={handlePreviousMonth} style={styles.arrowButton}>
          <Text style={styles.arrowText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>{currentMonth.replace('-', '/')}</Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.arrowButton}>
          <Text style={styles.arrowText}>{">"}</Text>
        </TouchableOpacity>
      </View>
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
        onDayPress={onDayPress}
        markedDates={markedDates}
        horizontal={true}
        pagingEnabled={true}
        scrollEnabled={true}
        onVisibleMonthsChange={(months) => {
          console.log('onVisibleMonthsChange months:', months); // ログを追加して値を確認
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
        data={diaryList}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <DiaryEntry 
            date={item.date}
            text={item.text}
            image={item.image}
          />
        )}
        contentContainerStyle={{ flexGrow: 1 }} // FlatListの高さを調整するために追加
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
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  arrowText: {
    fontSize: 20,
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
  // calendar: {
  //   borderWidth: 1,
  //   borderColor: '#e0e0e0',
  //   borderRadius: 10,
  //   padding: 0,
  //   backgroundColor: "#fff",
  // },
  flatList: {
    flex: 1, // `FlatList` が空きスペースを埋めるようにする
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
});

export default HomeScreen;
