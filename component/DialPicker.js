import React, { useRef, useEffect, useState } from 'react';    
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const DialPicker = ({ items = [], selectedValue = '', onValueChange }) => {
  const scrollViewRef = useRef(null);
  const itemHeight = 60;  // アイテムの高さ
  const visibleItems = 3;  // 表示するアイテム数
  const halfVisibleItems = Math.floor(visibleItems / 2);
  const [isScrolling, setIsScrolling] = useState(false);  // スクロール中かどうかを管理

  // スタイルを作成する関数
  const styles = createStyles(itemHeight);

  // 選択された項目を中央にスクロール
  const scrollToIndex = (index, animated = true) => {
    const maxOffset = (items.length - 1) * itemHeight;
    const offset = Math.min(index * itemHeight, maxOffset);
    scrollViewRef.current.scrollTo({ y: offset, animated });
  };

  // スクロール終了時、画面中央にあるアイテムを選択
  const handleScrollEnd = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / itemHeight);  // 中央アイテムのインデックスを計算
    const maxIndex = items.length - 1;

    // インデックスが範囲内にあることを確認
    if (index >= 0 && index <= maxIndex) {
      const newValue = items[index];
      if (newValue !== selectedValue) {
        onValueChange(newValue);  // 新しい値を反映
      }
      // 中央アイテムを中央に固定するために再スクロール
      scrollToIndex(index, false);  // アニメーションなしでスクロール
    }

    setIsScrolling(false);  // スクロールが完了したらフラグを下ろす
  };

  useEffect(() => {
    if (items.length > 0 && !isScrolling) {
      const index = items.indexOf(selectedValue);
      console.log(`Attempting to scroll to index: ${index}`);  // デバッグ用
      if (index !== -1) {
        scrollToIndex(index, false);  // 初回ロード時に中央に設定
      }
    }
  }, [selectedValue, items]);

  const handleScrollBegin = () => {
    setIsScrolling(true);  // スクロール開始時にフラグをセット
  };

  const handleScrollEndDrag = () => {
    setIsScrolling(false);  // ドラッグ終了時にフラグを下ろす
  };

  // 各アイテムの表示
  const renderItem = (item, index) => {
    const isSelected = item === selectedValue;
    const itemStyle = isSelected
      ? [styles.item, styles.selectedItem]
      : [styles.item, styles.unselectedItem];

    return (
      <View style={styles.itemContainer} key={index}>
        <Text style={itemStyle}>
          {item}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 中央の選択アイテム部分（上下のライン） */}
      <View style={styles.lineContainer}>
        {/* 真上のライン */}
        <View style={[styles.line, styles.topLine]} />
        {/* 真下のライン */}
        <View style={[styles.line, styles.bottomLine]} />
      </View>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}  // アイテムごとにスナップ
        decelerationRate="fast"  // スクロールを速く終わらせる
        onMomentumScrollBegin={handleScrollBegin}  // スクロール開始時にフラグをセット
        onMomentumScrollEnd={handleScrollEnd}  // スクロール終了時に処理
        onScrollEndDrag={handleScrollEndDrag}  // ドラッグ終了時にフラグを下ろす
        contentContainerStyle={styles.scrollViewContent}
      >
        {/* 上部の余白: 最上部アイテムを選択した場合のみ */}
        <View style={{ height: itemHeight * halfVisibleItems }} />

        {/* アイテムリスト */}
        {items.map((item, index) => renderItem(item, index))}
        
        {/* 下部の余白: 最下部アイテムを選択した場合は常に表示 */}
        <View style={{ height: itemHeight * halfVisibleItems + 10 }} />
        </ScrollView>

      
      
    </View>
  );
};

// stylesを作成する関数
const createStyles = (itemHeight) => StyleSheet.create({
  container: {
    height: itemHeight * 3,  // 全体の高さを60 * 3（表示するアイテム数）に設定
    justifyContent: 'center',
    position: 'relative',
  },
  scrollViewContent: {
    justifyContent: 'center', // スクロールビュー内のアイテムを中央に配置
  },
  itemContainer: {
    height: itemHeight,  // アイテムの高さを設定
    justifyContent: 'center', // アイテムを上下中央に配置
    width: '100%',  // 幅を100%に設定して広くする
    alignItems: 'center', // アイテムを水平方向の中央に配置
  },
  item: {
    // height: itemHeight,  // アイテムの高さ
    fontSize: 22,
    textAlign: 'center',
    color: '#333',
    opacity: 0.6,
    paddingHorizontal: 20,  // 横方向のパディングを追加してスクロールしやすくする
  },
  selectedItem: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    opacity: 1,
  },
  unselectedItem: {
    fontSize: 22,
    color: '#666',
    opacity: 0.4,
  },
  lineContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',  // 中央に基づいて配置
    transform: [{ translateY: -(itemHeight / 2) + 1 }], // 微調整
    justifyContent: 'center',  // ラインを中央に配置
    height: itemHeight, // ラインコンテナの高さ
  },
  line: {
    height: 1,
    backgroundColor: '#000',  // ラインの色
    width: '100%',
  },
  topLine: {
    position: 'absolute',
    top: 0,  // 上のラインを選択アイテムの真上に配置
  },
  bottomLine: {
    position: 'absolute',
    bottom: 0,  // 下のラインを選択アイテムの真下に配置
  },
});

export default DialPicker;
