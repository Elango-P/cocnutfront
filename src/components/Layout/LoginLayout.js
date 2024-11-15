import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import { Color } from '../../helper/Color';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import styles from '../../helper/Styles';
const Layout = ({ children ,showBackIcon,backNavigationUrl}) => {

  const [isInternetConnection, setIsInternetConnection] = useState(false)
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(handleConnectivityChange);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleConnectivityChange = (state) => {
    setIsInternetConnection(state && state.isConnected)
    if (!state.isConnected) {
      navigation.navigate('NoInternet');
    }
  };

  StatusBar.setBackgroundColor(!isInternetConnection ? Color.RED : Color.SKY_BLUE)
  StatusBar.setBarStyle("light-content")

  return (
    <View style={styles.container}>
     {showBackIcon && (
              <TouchableOpacity
                onPress={()=>{backNavigationUrl ? navigation.navigate(backNavigationUrl) : navigation.goBack()}}
                accessibilityLabel="menu"
              >
                <Ionicons
                  name="chevron-back"
                  size={35}
                  color={Color.ACTIONBAR_TEXT}
                  style = {styles.backIcon}
                />
              </TouchableOpacity>

            )}
      <View style={styles.swipeStyle}>{children}</View>
    </View>
  );
};



export default Layout;
    