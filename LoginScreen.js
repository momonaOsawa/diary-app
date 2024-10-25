import React, { useState, useEffect, useRef } from 'react';     
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [passcode, setPasscode] = useState('');
  const [storedPasscode, setStoredPasscode] = useState(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const savedPasscode = await AsyncStorage.getItem('appPasscode');
      if (savedPasscode === null) {
        setIsFirstLaunch(true);
      } else {
        setStoredPasscode(savedPasscode);
        setIsFirstLaunch(false);
      }
    };
    checkFirstLaunch();
  }, []);

  const handleSetPasscode = async () => {
    if (passcode.length < 4) {
      Alert.alert('パスコードは4桁である必要があります。');
      return;
    }
    await AsyncStorage.setItem('appPasscode', passcode);
    Alert.alert('パスコードが設定されました。');
    navigation.replace('Home');
  };

  const handlePasscodeChange = (text) => {
    setPasscode(text);

    // 4桁入力されたらパスコードのチェック
    if (text.length === 4 && !isFirstLaunch) {
      if (text === storedPasscode) {
        navigation.replace('Home');
      } else {
        Alert.alert('パスコードが間違っています。');
        setTimeout(() => {
          setPasscode('');
          inputRef.current.focus();
        }, 1000);
      }
    }
  };

  const renderPasscodeBoxes = () => {
    const passcodeArray = passcode.split('');
    return (
      <TouchableOpacity onPress={() => inputRef.current.focus()} style={styles.passcodeContainer}>
        {Array(4)
          .fill(0)
          .map((_, index) => (
            <View key={index} style={styles.passcodeBox}>
              <Text style={styles.passcodeText}>
                {passcodeArray[index] ? '*' : ''}
              </Text>
            </View>
          ))}
      </TouchableOpacity>
    );
  };

  // パスコードリセット関数
  const handleResetPasscode = async () => {
    setPasscode(''); // 現在のパスコードをクリア
    await AsyncStorage.removeItem('appPasscode'); // ストレージからパスコードを削除
    setIsFirstLaunch(true); // パスコード設定画面に遷移
    Alert.alert('パスコードがリセットされました。', '新しいパスコードを設定してください。');
  };

  return (
    <View style={styles.container}>
        {isFirstLaunch ? (
        <>
            <Text style={styles.title}>パスコードを設定してください</Text>
            {renderPasscodeBoxes()}
            <TouchableOpacity onPress={() => inputRef.current.focus()} style={styles.hiddenInputContainer}>
            <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                value={passcode}
                onChangeText={handlePasscodeChange}
                keyboardType="numeric"
                maxLength={4}
                autoFocus={true}
            />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSetPasscode} style={styles.button}>
            <Text style={styles.buttonText}>設定</Text>
            </TouchableOpacity>
        </>
        ) : (
        <>
            <Text style={styles.title}>パスコードを入力してください</Text>
            {renderPasscodeBoxes()}
            <TouchableOpacity onPress={() => inputRef.current.focus()} style={styles.hiddenInputContainer}>
            <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                value={passcode}
                onChangeText={handlePasscodeChange}
                keyboardType="numeric"
                maxLength={4}
                autoFocus={true}
            />
            </TouchableOpacity>
            {/* パスコードリセットボタンはここに表示 */}
            <TouchableOpacity onPress={handleResetPasscode} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>パスコードをリセット</Text>
            </TouchableOpacity>
        </>
        )}
    </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  passcodeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  passcodeBox: {
    width: 60,
    height: 100,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  passcodeText: {
    fontSize: 24,
  },
  hiddenInputContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenInput: {
    opacity: 0,
    height: 100,
    width: '100%',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  resetButton:{
    marginTop:30,
    backgroundColor: '#007BFF',
    padding: 5,
    borderRadius: 5,
  },
  resetButtonText:{
    color: '#fff',
  }

});

export default LoginScreen;
