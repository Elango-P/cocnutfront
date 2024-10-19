import React from "react";
import { StyleSheet, Image, Text, TouchableOpacity, View } from "react-native";
import DateText from "../../../components/DateText";
import IdText from "../../../components/IdText";
import Status from "../../../components/Status";
import styles from "../../../helper/Styles";
import UserAvatar from "react-native-user-avatar";
import { Color } from "../../../helper/Color";

const ActivityCard = (props) => {
  const {
    date,
    user,
    type,
    id,
    onPress,
    lastName,
    alternative,
    imageUrl,
    status,
    statusColor,
    manageOthers,
  } = props;
  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity
          style={[styles.cardAttendance, alternative]}
          onPress={onPress}
        >
          <View>
          {manageOthers &&
            <View style={styles.listContainers}>
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl ? imageUrl : "" }}
                  style={{ width: 55, height: 55, borderRadius: 30 }}
                />
              ) : (
                <UserAvatar size={55} name={user} bgColor={Color.PRIMARY} />
              )}
            </View>
}
          </View>
          <View
            style={{
              justifyContent: "space-between",
              paddingVertical: 5,
              flex: 1,
            }}
          >
            {manageOthers && (
              <Text style={{ fontWeight: "700", textTransform: "capitalize" }}>
                {user} {lastName}
              </Text>
            )}
            <View
              style={style.rowContainer}
            >
             {id &&  <IdText id={id} />}
              <DateText date={date} />
            </View>
            <Text>{type}</Text>
          </View>
            <View style={style.container}>
              {status && (
                <Status status={status} backgroundColor={statusColor} />
              )}
            </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ActivityCard;

const style = StyleSheet.create({
  container: {
    alignItems: "flex-end",
    paddingTop: 5,
    marginRight: 5,
  },
  rowContainer : {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 2,
  }
});
