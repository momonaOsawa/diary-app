import React, { memo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const DiaryEntry = memo(({ date, text, image }) => (
  <View style={styles.entryContainer}>
    <Text style={styles.entryDate}>{date ? date : '日付なし'}</Text>
    <Text style={styles.entryText}>{text ? text : 'テキストなし'}</Text>
    {image ? <Image source={{ uri: image }} style={styles.entryImage} resizeMode="contain" /> : null}
  </View>
));

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
    width: '100%',
    height: 200,
    marginTop: 10,
  },
});

export default DiaryEntry;
