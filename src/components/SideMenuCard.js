import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { Color } from "../helper/Color";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import RightArrow from "./RightArrow";

const IconCard = (props) => {
  const {
    onPress,
    Icon,
    name,
    MaterialCommunityIcon,
    backgroundColor,
    imageSource,
  } = props;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.sheetContainer, { backgroundColor }]}
        accessibilityLabel={name}
        activeOpacity={0.7} // Provide feedback on press
      >
        {imageSource ? (
          <Image source={imageSource} style={styles.iconImage} />
        ) : (
          <View style={styles.iconContainer}>
            {MaterialCommunityIcon ? (
              <MaterialCommunityIcons
                name={Icon}
                size={24}
                color={Color.PRIMARY}
              />
            ) : (
              <FontAwesome5 name={Icon} size={24} color={Color.PRIMARY} />
            )}
          </View>
        )}

        <Text style={[styles.textStyles, { flex: imageSource ? 0.7 : 1 }]}>
          {name}
        </Text>
        <RightArrow />
      </TouchableOpacity>
    </View>
  );
};

export default IconCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    elevation: 1.5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  iconContainer: {
    borderRadius: 2,
    flex: 0.15,
    padding: 5,
    alignItems: "center",
  },
  iconImage: {
    width: 40, // Adjust width according to your design
    height: 40, // Adjust height according to your design
    resizeMode: "contain", // Ensure the image maintains its aspect ratio
  },
  textStyles: {
    fontSize: 18,
    fontWeight: "500",
    color: Color.PRIMARY,
    padding: 10,
  },
  sheetContainer: {
    flexDirection: "row",
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: Color.WHITE,
  },
});
