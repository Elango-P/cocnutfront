import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { Color } from "../helper/Color"; // Ensure you have an appropriate Color module
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import RightArrow from "./RightArrow"; // Ensure this is correctly imported

const IconCard = (props) => {
  const {
    onPress,
    Icon,
    name,
    MaterialCommunityIcon,
    backgroundColor = "#e5e5e5", // Default background color
    imageSource,
  } = props;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { backgroundColor }]}
      accessibilityLabel={name}
      activeOpacity={0.8} // Feedback on press
    >
      <View style={styles.contentContainer}>
        {imageSource ? (
          <Image source={imageSource} style={styles.iconImage} />
        ) : (
          <View style={styles.iconContainer}>
            {MaterialCommunityIcon ? (
              <MaterialCommunityIcons
                name={Icon}
                size={30} // Increased size for better visibility
                color={Color.WHITE} // Change icon color for contrast
              />
            ) : (
              <FontAwesome5
                name={Icon}
                size={30} // Increased size for better visibility
                color={Color.WHITE} // Change icon color for contrast
              />
            )}
          </View>
        )}

        <Text style={styles.textStyles}>{name}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default IconCard;

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: Color.WHITE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    backgroundColor: Color.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  iconImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    borderRadius: 8,
  },
  textStyles: {
    fontSize: 18,
    fontWeight: "600",
    color: Color.BLACK,
    flex: 1,
  },
});
