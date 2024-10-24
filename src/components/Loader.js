// Loader.js
import React, { useRef, useEffect } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { Color } from "../helper/Color";

const Loader = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  // Create a looping animation to fade in and out
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.loaderBox, { opacity }]} />
      <Animated.View style={[styles.loaderBox, { opacity, width: 180 }]} />
      <Animated.View style={[styles.loaderBox, { opacity, width: 160 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: "center",
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
