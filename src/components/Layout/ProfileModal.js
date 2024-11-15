import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, Animated, Dimensions, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import UserCard from '../UserCard';
import { Color } from '../../helper/Color';
import { Ionicons } from "@expo/vector-icons";
import Card from "../../components/Card";
import VerticalSpace10 from '../VerticleSpace10';
import { version } from '../../../package.json';
import AsyncStorageObject from '../../lib/AsyncStorage';
import { FontAwesome5 } from "@expo/vector-icons";
import CustomDivider from '../Divider';
import style from '../../helper/Styles';
import platform from "../../lib/Platform";
import SyncCard from '../../views/dashboard/SyncCard';
import Permission from '../../helper/Permission';
import PermissionService from '../../services/PermissionService';
import { useEffect } from 'react';

const ProfileModal = ({ showModal, setShowModal, mobileNumber, accountId, profileUrl, Name }) => {
  const navigation = useNavigation();
  const [slideAnim] = useState(new Animated.Value(-Dimensions.get('window').width));
  const [syncViewPermission, setSyncViewPermission] = useState()

  const slideIn = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };  

  const slideOut = () => {
    Animated.timing(slideAnim, {
      toValue: -Dimensions.get('window').width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowModal(false));
  };

  if (showModal) {
    slideIn();
  }

  useEffect(() => {
    getPermission();
  }, [])
  const getPermission = async () => {
   
    const syncViewPermission = await PermissionService.hasPermission(Permission.SYNC_VIEW);
    setSyncViewPermission(syncViewPermission)


    
  }

  const handleLogout = async () => {
    setShowModal(false);
    await AsyncStorageObject.clearAll();
    navigation.navigate("Login");
  };
  
  const onEditProfile=()=>{
    setShowModal(false)
  }

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={showModal}
      onRequestClose={slideOut}
    >
      <View style={styles.modalBackground}>
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateX: slideAnim }],paddingVertical: platform.isIOS() ? "15%" : "5%" }
          ]}
        >
          <View style={[style.swipeStyle,style.menuLayout]}>
            <View style = {style.direction}>
           <TouchableOpacity
                onPress={slideOut}
                accessibilityLabel="menu"
              >
                <Ionicons
                  name="chevron-back"
                  size={35}
                  color={Color.ACTIONBAR_TEXT}
                />
              </TouchableOpacity>
             
              <UserCard
                image={profileUrl}
                mobileNumber={mobileNumber}
                textStyle={{ fontSize: 18, fontWeight: 'bold' }}
                avatarStyle={{ width: 50, height: 50, borderRadius: 25 }}
                firstName={Name}
                showEditButton
                showRating
                onEditProfile={onEditProfile}
                size = {50}
              />
              </View>
              <CustomDivider style = {styles.divider}/> 

            <VerticalSpace10 />
           {syncViewPermission &&  <SyncCard />}
           
          </View>
          <View style={styles.bottomContainer}>
          <CustomDivider style = {styles.divider}/> 

            <View style={styles.logoutContainer}>
              <TouchableOpacity
                style={{ flexDirection: "row", flex: 1, alignItems: "center" }}
                onPress={handleLogout}
              >
                <View style={{ borderRadius: 2, flex: 0.1 }}>
                  <FontAwesome5 name="sign-out-alt" size={20} color={Color.PRIMARY} />
                </View>
                <Text style={styles.logoutText}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>

            <CustomDivider style = {styles.divider}/> 

            <Text style={style.versionText}>{`Version ${version}`}</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backIcon : {
    marginBottom : 60
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').height,
    backgroundColor: 'white',
    position: 'absolute',
    paddingVertical: 20,
    left: 0,
    top: 0,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
qrCodeContainer: {
    alignItems: 'center',
    flex: 1,
  },
  qrCodeCard: {
    backgroundColor: Color.WHITE,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
  },
  logoutContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  logoutText: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
  versionText: {
    textAlign: 'center',
    color: Color.GREY,
    fontSize: 14,
    marginTop: 20,
  },
  divider: {
    backgroundColor: Color.ACTIVE, height: 0.5, marginTop: 20 
},
});

export default ProfileModal;
