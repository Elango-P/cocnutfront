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
    backgroundColor = Color.WHITE, // Default background color
    imageSource,
  } = props;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.sheetContainer, { backgroundColor }]}
        accessibilityLabel={name}
        activeOpacity={0.8} // Feedback on press
      >
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
        <RightArrow />
      </TouchableOpacity>
      
    </View>
  );
};

export default IconCard;

const styles = StyleSheet.create({
  container: {
    marginVertical: 10, // Spacing between cards
    marginHorizontal: 15, // Horizontal spacing for aesthetics
    borderRadius: 12, // More rounded corners
    overflow: "hidden", // Ensure rounded corners are respected
    elevation: 4, // Enhanced shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4, // Deeper shadow effect
    },
    shadowOpacity: 0.3, // Increased shadow opacity
    shadowRadius: 5, // Softer shadow
  },
  iconContainer: {
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Color.PRIMARY, // Use primary color for contrast
    marginRight: 15, // Space between icon and text
  },
  iconImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  textStyles: {
    fontSize: 20, // Larger text for better readability
    fontWeight: "bold", // Bold text
    color: Color.BLACK, // Change to black for better contrast
    flex: 1, // Allow text to grow
  },
  sheetContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15, // Increased padding
    borderRadius: 12, // Match the container's border radius
    backgroundColor: Color.WHITE,
    borderWidth: 1, // Added border for definition
    borderColor: Color.LIGHT_GRAY, // Light border color for subtle definition
    position: "relative", // For potential overlay effects
  },
});
