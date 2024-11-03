import React from "react";
import { Button, Image, View, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Color } from "../helper/Color";
import Spinner from "../components/Spinner";
import { Text } from "react-native";

const FileUpload = (props) => {
  const {
    image,
    setImage,
    prefillImage,
    setFile,
    customCameraIconWith,
    customCameraCircleHeight,
    customCameraCircleWidth,
    profileImage = true,
    onPressRemove,
    onImageCapture,
    delay = 500,
    showTakePhotoButton,
    isImageLoading,
    showDelete,
    deleteImage,
  } = props;

  let timeoutId;

  // Convert base64 to binary
  async function dataURItoBlob(data) {
    const response = await fetch(data);
    const blob = await response.blob();
    if (blob) {
      setFile && setFile(blob);
      onImageCapture && onImageCapture(blob, data);
    }
  }

  // Select image from device storage
  const selectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage && setImage(result.assets[0].uri);
      dataURItoBlob(result.assets[0].uri);
    }
  };

  const handlePressIn = () => {
    timeoutId = setTimeout(() => {
      onPressRemove();
    }, delay);
  };

  const handlePressOut = () => {
    clearTimeout(timeoutId);
  };

  return (
    <View style={{ paddingVertical: 20, flexDirection: "row", justifyContent: "center" }}>
      <View>
        <TouchableOpacity onPress={selectImage}>
          {image || prefillImage ? (
            <>
              {profileImage ? (
                <Image
                  source={{ uri: image ? image : prefillImage }}
                  style={{ height: 150, width: 150, borderRadius: 400 / 2 }}
                />
              ) : (
                <View style={styles.container}>
                  <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
                    <View style={styles.container}>
                      {showDelete && (
                        <TouchableOpacity onPress={() => deleteImage()} style={styles.deleteIcon}>
                          <Ionicons name="trash" size={24} color="red" />
                        </TouchableOpacity>
                      )}
                      <Image source={{ uri: image ? image : prefillImage }} style={styles.image} />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              )}
            </>
          ) : (
            <>
              {showTakePhotoButton ? (
                <>
                  {isImageLoading ? (
                    <Spinner />
                  ) : (
                    <Button
                      title={"Select Image"}
                      color={Color.BLACK}
                      onPress={selectImage}
                    />
                  )}
                </>
              ) : (
                <View
                  style={{
                    alignItems: "center",
                    backgroundColor: Color.PRIMARY,
                    flex: 1,
                    height: customCameraCircleHeight ? customCameraCircleHeight : 150,
                    width: customCameraCircleWidth ? customCameraCircleWidth : 150,
                    borderRadius: 400 / 2,
                  }}
                >
                  <View style={{ marginTop: 20 }}>
                    <Ionicons
                      name="image-outline"
                      size={customCameraIconWith ? customCameraIconWith : 100}
                      borderRadius={5}
                      color="white"
                    />
                  </View>
                </View>
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FileUpload;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: 350,
    height: 250,
  },
  deleteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
});
