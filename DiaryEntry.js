import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';
import 'moment/locale/ja'; // 日本語ロケールの設定

const DiaryEntry = ({ date, text, image, onEdit }) => {
  const [lastTap, setLastTap] = useState(null);

  const handlePress = () => {
    const currentTime = Date.now();
    const DOUBLE_TAP_DELAY = 900;

    if (lastTap && (currentTime - lastTap) < DOUBLE_TAP_DELAY) {
      onEdit(); // ダブルタップ時にonEditを呼び出す
    } else {
      setLastTap(currentTime);
    }
  };

  // テキストを行ごとに分割
  const lines = (text || '').split('\n'); // textがundefinedの場合は空文字列を使う
  
  // 1行目と2行目を取得
  const firstLine = lines[0] || 'タイトルなし';
  const secondLine = lines[1] || '';
  
  // 3行目以降を「...」で省略
  const thirdAndBeyond = lines.length > 2 ? '...' : '';

  return (

    <TouchableOpacity onPress={handlePress} style={styles.entryContainer}>
      {/* 上部に年月日と曜日を表示 */}
      <View style={styles.dateHeader}>
        <Text style={styles.dateHeaderText}>
          {moment(date).format('YYYY年MM月DD日(ddd)')}
        </Text>
      </View>
      <View style={styles.row}>
        {/* 左側に縦並びで曜日・日付 */}
        <View style={styles.leftColumn}>
          <Text style={styles.entryWeekday}>{moment(date).format('ddd')}</Text>
          <Text style={styles.entryDate}>{moment(date).format('D')}</Text>
        </View>

        {/* 中央に見出し（タイトル）とテキストの最初の行 */}
        <View style={styles.centerColumn}>
          <Text style={styles.entryTitle}>
            {firstLine} {/* 最初の行をタイトルとして使用 */}
          </Text>
          <Text style={styles.entryPreview}>
            {secondLine} {/* 2行目と3行目以降の省略を表示 */}
          </Text>
          <Text style={styles.entryPreview}>
            {thirdAndBeyond} {/* 2行目と3行目以降の省略を表示 */}
          </Text>
        </View>

        {/* 右側に画像を表示 */}
        {image && (
          <View style={styles.rightColumn}>
            <Image source={{ uri: image }} style={styles.entryImage} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  entryContainer: {
    padding: 0,
    // borderRadius: 10,
    backgroundColor: '#f8f8f8',
    // elevation: 2, // Android用の影
    // shadowColor: '#000', // iOS用の影
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
  },
  // 上部の年月日と曜日のスタイル
  dateHeader: {  
    backgroundColor: '#e0e0e0',
    marginTop: 0, // 上部の余白を0に設定
    paddingTop: 0, // 上部のパディングを0に設定
    paddingBottom: 5, // 下部のパディングを少し追加してバランスを取る
    paddingVertical: 5, // 上下のパディングを追加
  },
  dateHeaderText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'flex-start',
    // margin: 0, // 不要なマージンを排除
    // padding: 0, // 不要なパディングを排除
    marginLeft:10
  },
  entryDate: {
    fontSize: 18, // 日付を大きく表示
    fontWeight: 'bold',
    color: '#4db6ac',
    textAlign: 'center', // 中央揃え
  },
  entryWeekday: {
    fontSize: 14, // 曜日を少し小さく表示
    color: '#4db6ac',
    marginBottom: 5,
    textAlign: 'center', // 中央揃え
  },
  entryImage: {
    width: 80,   // 正方形にするために幅と高さを同じに設定
    height: 80,  // 高さを幅と同じに設定
    justifyContent: 'center', // 上下中央に配置
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row', // 各項目を横並びに
    alignItems: 'center',
  },
  leftColumn: {
    width: 60, // 左側の幅を固定
    alignItems: 'center', // 中央揃えにする
  },
  centerColumn: {
    flex: 1, // 中央のカラムが幅を最大限に使用するように
    paddingHorizontal: 10,
    justifyContent: 'flex-start'
  },
  entryTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  entryPreview: {
    fontSize: 14,
    color: '#666',
  },
  rightColumn: {
    width: 80, // 右側の幅を固定
    alignItems: 'center',
    justifyContent: 'center'
  },
});

export default DiaryEntry;
