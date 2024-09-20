import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

// 日記エントリを保存する関数
export const saveDiaryEntry = async (date, entryData) => {
  try {
    let imagePath = null;
    
    // 画像が選択されている場合、ファイルシステムに保存
    if (entryData.image) {
      try {
        const fileUri = entryData.image;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (fileInfo.exists) {
          const fileName = `${date.replace(/-/g, '')}.jpg`; // 日付をファイル名に
          const destPath = `${FileSystem.documentDirectory}/${fileName}`;
          
          await FileSystem.copyAsync({
            from: fileUri,
            to: destPath,
          });
          imagePath = destPath;
        } else {
          console.error('File does not exist:', fileUri);
        }
      } catch (error) {
        console.error('Failed to copy image file:', error);
      }
    }
    
    // テキストと画像パスを保存
    const storedEntries = await AsyncStorage.getItem('diaryEntries');
    const diaryEntries = storedEntries ? JSON.parse(storedEntries) : {};
    
     // entryData にテキストが正しく含まれているか確認
     diaryEntries[date] = { text: entryData.text, image: imagePath }; // 画像パスを保存
     await AsyncStorage.setItem('diaryEntries', JSON.stringify(diaryEntries));
     console.log("保存できました。");
   } catch (error) {
     console.error('Failed to save diary entry.', error);
   }
};


// 日記エントリを取得する関数
export const loadDiaryEntries = async () => {
  try {
    const storedEntries = await AsyncStorage.getItem('diaryEntries');
    return storedEntries ? JSON.parse(storedEntries) : {};
  } catch (error) {
    console.error('Failed to load diary entries.', error);
    return {};
  }
};


// 日記エントリを削除する関数
export const deleteDiaryEntry = async (date) => {
  try {
    const storedEntries = await AsyncStorage.getItem('diaryEntries');
    if (storedEntries !== null) {
      const diaryEntries = JSON.parse(storedEntries);
      
      // ファイルシステムから画像を削除
      if (diaryEntries[date].image) {
        await FileSystem.deleteAsync(diaryEntries[date].image);
      }

      delete diaryEntries[date];
      await AsyncStorage.setItem('diaryEntries', JSON.stringify(diaryEntries));
      console.log("削除されました。");
    }
  } catch (error) {
    console.error('Failed to delete diary entry.', error);
  }
};
