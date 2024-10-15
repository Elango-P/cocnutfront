// Import necessary components and icons
import { FontAwesome5 } from '@expo/vector-icons';
import { Video } from "expo-av";
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Swiper from 'react-native-swiper';
import DeleteModal from "../components/Modal/DeleteConfirmationModal";
import { Color } from '../helper/Color';
import style from "../helper/Styles";
import Media from "../lib/Media";
import mediaService from "../services/MediaService";
import Label from "./Label";
import Spinner from './Spinner';
import platform from "../lib/Platform";
const { width, height } = Dimensions.get('window');

const ImageSwiper = (props) => {

    let { imageTitle, images, setImages, handleAdd, deleteOnPress, getMediaList, showAddButton, showDeleteButton, videoTitle, swipeContent } = props;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mediaDeleteModal, setMediaDeleModal] = useState(false)
    const [rowData, setRowData] = useState(null);
    const [isLoading, setIsLoading] = useState(props?.isLoading ? props?.isLoading : false);
    const [modalVisible, setModalVisible] = useState(false);

    const mediaDeleteToggle = () => {
        setMediaDeleModal(!mediaDeleteModal);
    }

    const videoRef = useRef(null);

    const handleDelete = (index, imageData) => {
        setRowData(imageData)
        const newImages = [...images];
        newImages.splice(currentIndex, 1);
        setImages && setImages(newImages);
        mediaDeleteToggle()
    };

    const removeImage = (id) => {
        if (id) {
            setIsLoading(true)
            mediaService.deleteMedia(id, (error, response) => {
                getMediaList && getMediaList();
                setIsLoading(false)
            });
        }
    }

    const handleImagePress = (index) => {
        setCurrentIndex(index);
        setModalVisible(true);
    };

    const chunkArray = (arr, chunkSize) => {
        const results = [];
        for (let i = 0; i < arr?.length; i += chunkSize) {
            results.push(arr.slice(i, i + chunkSize));
        }
        return results;
    };

    const chunkedMediaData = chunkArray(images, swipeContent ? swipeContent : 1);

    if (props?.isLoading == true ? props?.isLoading : isLoading) {
        return <Spinner />;
    }

    return (
        <>
            <DeleteModal
                modalVisible={mediaDeleteModal}
                toggle={mediaDeleteToggle}
                updateAction={() => removeImage(rowData?.id)}
                id={rowData?.id}
            />
            <View style={styles.container}>
                <View style={{ marginTop: 20, flexDirection: "row", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row" }}>
                        {imageTitle && <Label text={imageTitle} bold={true} />}
                        {videoTitle && <Label text={videoTitle} bold={true} marginLeft={4} />}
                    </View>
                    <View style={{ flexDirection: "row" }}>
                        {showAddButton && !videoTitle && <TouchableOpacity
                            style={{ marginRight: 5 }}
                            onPress={() => handleAdd && handleAdd(true)}
                        >
                            <Text style={{ color: "blue" }}> Add Photo</Text>
                        </TouchableOpacity>}
                        {showAddButton && videoTitle && <TouchableOpacity
                            style={{ marginRight: 5 }}
                            onPress={() => handleAdd && handleAdd(false)}
                        >
                            <Text style={{ color: "blue" }}> Add Video</Text>
                        </TouchableOpacity>}
                    </View>
                </View>
                {images && images.length > 0 ? (
                    <>
                        <Swiper
                            style={styles.wrapper}
                            showsPagination={false}
                            index={0}
                            bounces={true}
                            loop={false}
                            key={3}
                        >

                            {chunkedMediaData.map((chunk, chunkIndex) => (
                                <View key={chunkIndex} style={styles.slideContainer}>
                                    {chunk.map((image, index) => (
                                        <View key={index} style={styles.imageWrapper}>
                                            <TouchableOpacity
                                                onPress={() => handleImagePress(index)}
                                                style={{ width: "100%", height: "100%" }}
                                            >
                                                {Media.isImage(image?.fileName) && <Image
                                                    source={{ uri: image?.uri ? image?.uri : image?.url }}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                    }}
                                                    resizeMode='contain'
                                                />}
                                                {Media.isVideo(image?.fileName) &&
                                                    <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
                                                        <FontAwesome5 name='play-circle' size={104} color='black' />
                                                    </View>
                                                }
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </Swiper>
                        <Modal
                            visible={modalVisible}
                            transparent={true}
                            onRequestClose={() => setModalVisible(false)}
                        >
                            <View style={[styles.modalContainer,{marginTop: platform.isIOS() ? "12%": 0}]}>
                                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                    <FontAwesome5 name='times-circle' size={50} color='white' />
                                </TouchableOpacity>
                                <Swiper
                                    style={styles.modelWrapper}
                                    index={currentIndex}
                                    loop={false}
                                    showsPagination={false}
                                >
                                    {images.map((image, index) => (

                                        <View key={index} style={styles.slide}>
                                            {Media.isImage(image?.fileName) &&
                                                <Image
                                                    source={{ uri: image?.uri ? image?.uri : image.url }}
                                                    style={styles.modelImage}
                                                    resizeMode='contain'
                                                />
                                            }

                                            {Media.isVideo(image?.fileName) &&
                                                <Video
                                                    ref={videoRef}
                                                    source={{ uri: image?.uri ? image?.uri : image.url }}
                                                    style={style.imageSize}
                                                    resizeMode="contain"
                                                    shouldPlay={true}
                                                    isMuted={false}
                                                />
                                            }
                                            {showDeleteButton && <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={() => deleteOnPress ? deleteOnPress(index) : handleDelete(index, image)}
                                            >
                                                <FontAwesome5 name='trash' size={50} color='red' />
                                            </TouchableOpacity>}
                                        </View>
                                    ))}
                                </Swiper>
                            </View>
                        </Modal>
                    </>
                ) : (
                    <View style={{ paddingVertical: 90, alignItems: 'center' }}>
                        <FontAwesome5 name='receipt' size={20} color={Color.PRIMARY} />
                        <Text style={{ fontWeight: 'bold' }}>No Media Uploaded</Text>
                    </View>
                )}
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    imageWrapper: {
        flex: 1,
        alignItems: "center",
        position: "relative",
        marginHorizontal: 5,
    },
    slideContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    video: {
        width: 300,
        height: 200,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    imageTitle: {
        position: 'absolute',
        top: 20,
        fontSize: 20,
        color: Color.PRIMARY,
    },
    wrapper: {
        height: (height - 510),
    },
    modelWrapper: {
        height: height,
    },
    closeButton: {
        top: 20,
        right: 20,
        left: 150,
        zIndex: 1
    },
    closeButtonText: {
        color: 'white',
        fontSize: 18,
    },
    slide: {
        flex: 1,
        marginTop: 5,
        alignItems: 'center',
    },
    image: {
        width: width,
        height: 300,
    },
    modelImage: {
        width: width,
        height: height,
        alignItems: "center",
        flex: 1
    },
    deleteButton: {
        bottom: 60,
        zIndex: 1,
    },
});

export default ImageSwiper;
