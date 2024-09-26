import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import moment from 'moment';
import 'moment/locale/ja'; // 日本語ロケールの設定

const DiaryEntry = ({ date, text, image }) => {

  // テキストを行ごとに分割
  const lines = text.split('\n');
  
  // 1行目と2行目を取得
  const firstLine = lines[0] || 'タイトルなし';
  const secondLine = lines[1] || '';
  
  // 3行目以降を「...」で省略
  const thirdAndBeyond = lines.length > 2 ? '...' : '';

  return (
    <View style={styles.entryContainer}>
      <View style={styles.row}>
        {/* 左側に縦並びで曜日・日付 */}
        <View style={styles.leftColumn}>
          <Text style={styles.entryDate}>{moment(date).format('YYYY/MM/DD')}</Text>
          <Text style={styles.entryWeekday}>{moment(date).format('dddd')}</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
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
    width: 80,   // 正方形にするために幅と高さを同じに設定
    height: 80,  // 高さを幅と同じに設定
    marginTop: 10,
  },
  entryWeekday: {
    fontSize: 12,
    color: '#999',
  },
  row: {
    flexDirection: 'row', // 各項目を横並びに
    alignItems: 'center',
  },
  leftColumn: {
    width: 80, // 左側の幅を固定
    alignItems: 'flex-start',
  },
  centerColumn: {
    flex: 1, // 中央のカラムが幅を最大限に使用するように
    paddingHorizontal: 10,
    justifyContent: 'flex-start'
  },
  entryTitle: {
    fontWeight: 'bold',
    fontSize: 20,
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
