import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Image, Alert, KeyboardAvoidingView  } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { saveDiaryEntry, deleteDiaryEntry } from './DiaryDatabase';

const DiaryEditScreen = ({ route, navigation }) => {
  const { selectedDate, existingText, existingImage } = route.params;
  const [entryText, setEntryText] = useState(existingText || '');
  const [selectedImage, setSelectedImage] = useState(existingImage || null);

  useEffect(() => {
    const getPermission = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need media library permissions to make this work!');
      }
    };

    getPermission();
  }, []);

  const handleSave = () => {
    if (!entryText && !selectedImage) {
      // テキストも画像も入力されていない場合はアラートを表示
      Alert.alert(
        '画像・テキスト どちらかを入力してください', // アラートのタイトル
        '保存するには、テキストか画像のいずれかが必要です。', // アラートのメッセージ
        [{ text: 'OK' }] // ボタン
      );
      return;
    }

    const entryData = {
      text: entryText || '',  // テキストがない場合は空文字を保存
      image: selectedImage,
    };

    saveDiaryEntry(selectedDate, entryData);
    navigation.navigate('Home', { newEntry: { date: selectedDate, ...entryData } });
  };

  

  const handleDelete = async () => {
    try {
      await deleteDiaryEntry(selectedDate);
      navigation.navigate('Home', { deletedEntry: selectedDate });
    } catch (error) {
      console.error('Failed to delete diary entry.', error);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
  
      console.log('ImagePicker result:', result); // 結果全体をログに出力
  
      if (result.canceled) {
        console.log('Image selection was canceled');
      } else {
        console.log('Image selected:', result.assets[0]?.uri); // assets[0] の存在を確認
        setSelectedImage(result.assets[0]?.uri); // uri を設定
      }
    } catch (error) {
      console.error('Image selection failed:', error);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.dateText}>{selectedDate.toString()}</Text> 
      <TextInput
        style={styles.textInput}
        multiline
        placeholder="今日の日記を書きましょう..."
        value={entryText}
        onChangeText={setEntryText}
        keyboardType="default"
      />
      <View> 
        {selectedImage && <Image source={{ uri: selectedImage }} style={styles.image} resizeMode="contain" />} 
      </View>
      <Button title="画像を選択" onPress={handleImagePick} color="#ff6f61" />
      </ScrollView>
      <View style={styles.buttonContainer}>
        <Button title="削除" onPress={handleDelete} color="#ff6347" />
        <Button title="保存" onPress={handleSave} color="#ff6f61" />
      </View>
      </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,  // スクロール時にボタンが見えるように余白を追加
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ff6f61',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    borderColor: '#ff6f61',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    textAlignVertical: 'top',
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
});

export default DiaryEditScreen;
