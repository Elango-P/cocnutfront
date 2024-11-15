import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { Color } from "../helper/Color"; // Ensure you have an appropriate Color module
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";

const IconCard = (props) => {
  const {
    onPress,
    Icon,
    name,
    MaterialCommunityIcon,
    imageSource,
  } = props;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container]}
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
    marginHorizontal: 6,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: Color.WHITE,
    shadowColor: "blue",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 30,
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
    width: 30,
    height: 30,
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
