import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const DialPicker = ({ items, selectedValue, onValueChange }) => {
  const scrollViewRef = useRef(null);
  const itemHeight = 60; // 各アイテムの高さ
  const visibleItems = 5; // 表示するアイテム数（中央+上下2つずつ）

  // アイテムを中央に表示するためのスクロール位置を計算
  const scrollToIndex = (index) => {
    const offset = (index * itemHeight) - (itemHeight * Math.floor(visibleItems / 2));
    scrollViewRef.current.scrollTo({ y: offset, animated: true });
  };

  // スクロール終了後に選択中の値を更新
  const handleScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / itemHeight);
    if (index >= 0 && index < items.length) {
      const newValue = items[index];
      if (newValue !== selectedValue) {
        onValueChange(newValue);
      }
    }
  };

  useEffect(() => {
    const index = items.indexOf(selectedValue);
    console.log('Selected Value:', selectedValue); // デバッグ用ログ
    console.log('Items:', items); // デバッグ用ログ
    if (index !== -1) {
      scrollToIndex(index); // 初期値を中央にスクロール
    }
  }, [selectedValue, items]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight} // スナップで中央に合わせる
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd} // スクロール終了時に実行
      >
        <View style={{ height: itemHeight * Math.floor(visibleItems / 2) }} /> {/* 上部余白 */}
        {items.map((item, index) => (
          <Text
            key={index}
            style={[
              styles.item,
              item === selectedValue ? styles.selectedItem : styles.unselectedItem,
            ]}
          >
            {item}
          </Text>
        ))}
        <View style={{ height: itemHeight * Math.floor(visibleItems / 2) }} /> {/* 下部余白 */}
      </ScrollView>
      <View style={styles.overlay} pointerEvents="none"> {/* 選択中のアイテムの背景をオーバーレイ表示 */}
        <Text style={styles.selectedOverlayText}>{selectedValue}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300, // 全体の高さ
    justifyContent: 'center',
    position: 'relative', // オーバーレイのためにpositionを相対にする
  },
  item: {
    height: 60,
    fontSize: 24,
    textAlign: 'center',
  },
  selectedItem: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#008080', // 選択中のアイテムの色を強調
  },
  unselectedItem: {
    fontSize: 20,
    color: '#999',
  },
  overlay: {
    position: 'absolute',
    top: '50%', // コンテナの中央に位置
    left: 0,
    right: 0,
    transform: [{ translateY: -30 }], // 中央寄せのために調整
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // 背景を透明に
  },
  selectedOverlayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#008080',
  },
});

export default DialPicker;
