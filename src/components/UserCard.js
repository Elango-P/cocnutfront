import React, { useEffect, useState } from "react";
import UserAvatar from "react-native-user-avatar";
import { Color } from "../helper/Color";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getFullName } from "../lib/Format";
import styles from "../helper/Styles";
import { Linking } from 'react-native';
import DateText from "./DateText";
import DateTime from "../lib/DateTime";
import { useNavigation } from "@react-navigation/native";
import asyncStorageService from "../services/AsyncStorageService";
import userService from "../services/UserService";


const UserCard = (props) => {
  const {
    image,
    size,
    firstName,
    lastName,
    mobileNumber,
    email,
    username,
    style,
    onPress,
    avatarStyle,
    text,
    name,
    phoneNumber,
    last_loggedIn_At,
    onLongPress,
    lastSynced,
    textStyle,
    showEditButton,
    showRating
  } = props;

  let navigation = useNavigation();
  const [rating, setRating] = useState(""); 

  let fullName = getFullName(firstName, lastName);

  const show = props.showFullName !== undefined ? props.showFullName : true;

  let onEditProfile=()=>{
    props.onEditProfile && props.onEditProfile()
    navigation.navigate("editProfile");
  }
  const handleStarPress = async (starCount) => {
    setRating(starCount);
    let userId = await asyncStorageService.getUserId();
    userService.update(
      userId,
      { rating: starCount },
      () => {}
    );
};

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress} >
      <View style={style ? style : styles.assigneeRow}>
        <View style={styles.alignment}>
          {image ? (
            <Image source={{ uri: image }} style={avatarStyle ? avatarStyle : styles.source} />
          ) : fullName && (
            <UserAvatar
              size={size ? size : 20}
              name={fullName}
              bgColor={Color.AVATAR_BACKGROUND}
            />
          )}

        </View>
        <View style={styles.infoContainers}>
          {show && <Text style={textStyle ? textStyle : text ? styles.textName : name ? styles.userName : styles.nameText}>{fullName}</Text>}
          {email && <Text style={styles.userText}>{email}</Text>}
          {mobileNumber && <Text style={styles.userText}>{mobileNumber}</Text>}
          {last_loggedIn_At && <><View style={styles?.direction}><Text>Last Logged In : </Text><DateText date={(last_loggedIn_At)} /></View></>}
          {lastSynced && <><View style={styles?.direction}><Text>Last Synced At : </Text><DateText date={DateTime.formatedDate(lastSynced)} /></View></>}

          {phoneNumber && <Text style={styles.userText} onPress={() => {
            Linking.openURL(`tel:${phoneNumber}`);
          }}
          >
            {phoneNumber}
          </Text>}
          {username && <Text style={styles.userText}>{username}</Text>}
          {showEditButton && <TouchableOpacity onPress={onEditProfile}  >
          <Text style={styles.editButton}>Edit Profile</Text>
          </TouchableOpacity>}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default UserCard;


