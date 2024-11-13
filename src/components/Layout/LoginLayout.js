import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, ImageBackground } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import { Color } from '../../helper/Color';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import styles from '../../helper/Styles';

const Layout = ({ children, showBackIcon, backNavigationUrl }) => {
  const [isInternetConnection, setIsInternetConnection] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleConnectivityChange = (state) => {
    setIsInternetConnection(state && state.isConnected);
    if (!state.isConnected) {
      navigation.navigate('NoInternet');
    }
  };

  StatusBar.setBackgroundColor(!isInternetConnection ? Color.RED : Color.WHITE);
  StatusBar.setBarStyle("light-content");

  return (
    <ImageBackground 
      source={require('../../assets/coco1.jpg')} // Path to your background image
      style={styles.container}
      resizeMode="cover" // Adjusts how the image is scaled
    >
      {showBackIcon && (
        <TouchableOpacity
          onPress={() => { backNavigationUrl ? navigation.navigate(backNavigationUrl) : navigation.goBack() }}
          accessibilityLabel="menu"
        >
          <Ionicons
            name="chevron-back"
            size={35}
            color={Color.ACTIONBAR_TEXT}
            style={styles.backIcon}
          />
        </TouchableOpacity>
      )}
      <View style={styles.swipeStyle}>{children}</View>
    </ImageBackground>
  );
};

export default Layout;
