// Loader.js
import React, { useRef, useEffect } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { Color } from "../helper/Color";
import ContentLoader, { Bullets } from "react-native-easy-content-loader";

const Loader = () => {
  return (
    <View style={styles.container}>
      <ContentLoader active />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: "center",
    marginHorizontal: "10%",
    width: "100%",
  },
  loaderBox: {
    height: 20,
    width: 200,
    backgroundColor: Color.LIGHT_GREY,
    marginBottom: 10,
    borderRadius: 4,
  },
});

export default Loader;
