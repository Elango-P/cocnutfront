import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Audio, Video } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { MenuItem } from 'react-native-material-menu';
import Swiper from 'react-native-swiper';
import DeleteModal from "./Modal/DeleteConfirmationModal";
import { Color } from '../helper/Color';
import MediaHelper from "../helper/Media";
import style from "../helper/Styles";
import ArrayList from '../lib/ArrayList';
import Media from "../lib/Media";
import platform from "../lib/Platform";
import mediaService from "../services/MediaService";
import DropDownMenu from './DropDownMenu';
import Spinner from './Spinner';
import Label from './Label';

const { width, height } = Dimensions.get('window');

const Attachment = (props) => {
    const {
        isAddPage = false,
        showDeleteButton,
        showPhoto,
        showVideo,
        showAudio,
        handleSelectedFiles,
        objectId,
        objectName,
        showAddButton=true
    } = props;

    {/* ✴---Video State---✴ */ }
    const [currentIndex, setCurrentIndex] = useState(0);
    const [mediaDeleteModal, setMediaDeleModal] = useState(false);
    const [rowData, setRowData] = useState(null);
    const [isLoading, setIsLoading] = useState(props?.isLoading ? props?.isLoading : false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [insideSelectedFiles, setInsideSelectedFiles] = useState([]);

    {/* ✴---Audio state---✴ */ }
    const [mp3Recording, setMp3Recording] = useState(null);
    const [mp3RecordingTime, setMp3RecordingTime] = useState(0);
    const [mp3RecordingInterval, setMp3RecordingInterval] = useState(null);
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [playbackPosition, setPlaybackPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [mediaData, setMediaData] = useState([])


    const recordingAnimation = useRef(new Animated.Value(1)).current;
    const graphAnimation = useRef(new Animated.Value(0)).current;


    const videoRef = useRef(null);
    const audioRef = useRef(new Audio.Sound());

    useEffect(() => {
        getMediaList()
    }, [objectId, objectName])


    const getMediaList = async (id) => {
        if (objectId && objectName) {
            await mediaService.search(objectId, objectName, (callback) => setMediaData(callback?.data?.data))
        }
    };

    const uploadImage = async (file) => {
        if (file) {
            const data = new FormData();
            data.append("media_file", file);
            data.append("media_name", file?.name);
            data.append("object", objectName);
            data.append("object_id", objectId);
            data.append("media_visibility", 1);
            await mediaService.uploadMedia(null, data, async (error, response) => {
                if (response) {
                    getMediaList()
                }
            });
        }
    };



    const toggleVideoPlayback = async () => {
        if (videoRef.current) {
            if (isPlaying) {
                await videoRef.current.pauseAsync();
            } else {
                await videoRef.current.playAsync();
            }
            setIsPlaying(prevState => !prevState);
        }
    };



    const handleAudioPlayback = async (uri) => {

        try {
            const status = await audioRef.current.getStatusAsync();

            if (isAudioPlaying) {
                await audioRef.current.pauseAsync();
                setIsAudioPlaying(false);
            } else {
                if (!status.isLoaded) {
                    console.log('Loading audio...');
                    await audioRef.current.loadAsync({ uri });
                    const loadedStatus = await audioRef.current.getStatusAsync();
                    setDuration(loadedStatus.durationMillis);
                }

                await audioRef.current.playAsync();
                setIsAudioPlaying(true);

                audioRef.current.setOnPlaybackStatusUpdate(async (status) => {
                    if (status.isLoaded) {
                        setPlaybackPosition(status.positionMillis);
                        if (status.didJustFinish) {
                            setIsAudioPlaying(false);
                            setPlaybackPosition(0);
                            await audioRef.current.stopAsync();
                        }
                    }
                });
            }
        } catch (error) {
            console.log('Error in audio playback:', error);
        }
    };


    const mediaDeleteToggle = () => {
        setMediaDeleModal(!mediaDeleteModal);
    };


    const removeImage = (id, index) => {
        if (!id && isAddPage) {
            const newImages = [...props.selectedFiles];
            newImages.splice(index, 1);
            handleSelectedFiles && handleSelectedFiles(newImages);
        } else {
            setIsLoading(true);
            mediaService.deleteMedia(id, (error, response) => {
                getMediaList();
                setIsLoading(false);
            });
        }
    };

    const handleDelete = (index, imageData) => {
        setRowData({
            imageData,
            index
        });
        mediaDeleteToggle();
    };

    const handleImagePress = (index) => {
        setCurrentIndex(index);
        setModalVisible(true);
        setIsPlaying(false);
        videoRef.current?.stopAsync();
    };

    const handleImageAdd = async (isImage) => {
        const image = isImage ? await MediaHelper.getImage() : await MediaHelper.getVideo();
        if (image && image.assets && image.assets.length > 0) {
            const response = await fetch(image.assets[0].uri);
            if (response) {
                const blob = await response.blob();
                let imgProp = {
                    type: blob?._data?.type,
                    size: blob?._data?.size,
                    uri: image.assets[0]?.uri,
                    name: blob?._data?.name
                }
                if (isAddPage) {
                    setInsideSelectedFiles([...insideSelectedFiles, imgProp])
                    handleSelectedFiles && handleSelectedFiles([...insideSelectedFiles, imgProp])
                } else {
                  await uploadImage(imgProp)
                }
            }
        }
    };



    const mp3PlaySoundEffect = async (soundUri) => {
        try {
            const { sound: mp3Sound } = await Audio.Sound.createAsync(soundUri);
            await mp3Sound.playAsync();
            mp3Sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    mp3Sound.unloadAsync();
                }
            });
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    };


    async function stopMp3Recording() {
        try {
            if (mp3Recording) {
                await mp3PlaySoundEffect(require('../assets/audio/recording_stop.mp3'));
                await mp3Recording.stopAndUnloadAsync();
                await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

                const response = await fetch(mp3Recording.getURI());
                const blob = await response.blob();
                let imgProp = {
                    type: blob?._data?.type,
                    size: blob?._data?.size,
                    uri: mp3Recording.getURI(),
                    name: `ticket-${Date.now()}.m4a`
                }
                if (isAddPage) {
                    setInsideSelectedFiles([...insideSelectedFiles, imgProp])
                    handleSelectedFiles && handleSelectedFiles([...insideSelectedFiles, imgProp])
                } else {
                    await uploadImage(imgProp)
                }

                setMp3Recording(null);
                recordingAnimation.stopAnimation();
                graphAnimation.stopAnimation();
                clearInterval(mp3RecordingInterval);
                setMp3RecordingInterval(null);
            }
        } catch (error) {
            console.log('Error in stopMp3Recording:', error);
        }
    }


    const startMp3Recording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                alert("Permission to access the microphone is required!");
                return;
            }

            await mp3PlaySoundEffect(require('../assets/audio/recording_start.mp3'))

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const recordingOptions = {
                android: {
                    extension: '.mp4',
                    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
                    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.caf',
                    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                },
            };

            const { recording } = await Audio.Recording.createAsync(recordingOptions);

            console.log("Recording created: ", recording);

            if (!recording) {
                console.log('Recording is undefined, something went wrong.');
                return;
            }

            setMp3Recording(recording);
            setMp3RecordingTime(0);

            startRecordingAnimations();

            const intervalId = setInterval(() => {
                setMp3RecordingTime(prevTime => prevTime + 1);
            }, 1000);
            setMp3RecordingInterval(intervalId);

        } catch (err) {
            console.error("Error in startMp3Recording:", err);
            alert("Error starting recording: " + err.message);
        }
    };


    const startRecordingAnimations = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(recordingAnimation, {
                    toValue: 1.2,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(recordingAnimation, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(graphAnimation, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: false,
                }),
                Animated.timing(graphAnimation, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                }),
            ])
        ).start();
    };


    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
    };

    const formatDuration = (millis) => {
        const minutes = Math.floor(millis / 60000);
        const seconds = Math.floor((millis % 60000) / 1000);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const actionItems = [
        <>
            {showPhoto && <MenuItem
                onPress={() => {
                    handleImageAdd(true)
                }}
            >
                <Ionicons name="camera" size={12} color="red" /> Add Photo
            </MenuItem>}

            {showVideo && <MenuItem onPress={() => {
                handleImageAdd(false)
            }}>
                <Ionicons name="videocam" size={12} color="red" /> Add Video
            </MenuItem>
            }
            {(showAudio && !mp3Recording) && <MenuItem onPress={() => {
                startMp3Recording()
            }}>
                <Ionicons name="mic" size={15} color="red" /> Add Audio
            </MenuItem>}


        </>
    ];


    let currentFileArray = isAddPage ? props?.selectedFiles : mediaData;

    if (props?.isLoading === true || isLoading) {
        return <Spinner />;
    }

    return (
        <>
            <DeleteModal
                modalVisible={mediaDeleteModal}
                toggle={mediaDeleteToggle}
                updateAction={() => removeImage(rowData?.imageData?.id ? rowData?.imageData?.id : null, rowData?.imageData?.index ? rowData?.imageData?.index : rowData?.index)}
                id={rowData?.imageData?.id ? rowData?.imageData?.id : rowData?.mediaData?.name ? rowData?.mediaData?.name : rowData?.imageData?.name}
            />

            <View style={styles.container}>
                <View style={{ marginTop: 20, flexDirection: "row", justifyContent: "space-between" }}>
                    <Label text={"Attachments"} bold size={13} />
                    <View style={{ flexDirection: "row" }}>
                        {showAddButton && <DropDownMenu MenuItems={actionItems} onPress={() => closeModal()} icon={"add"} iconSize={34} />}
                    </View>
                </View>

                {/* ✴---Audio record button---✴ */}
                {mp3Recording && <View style={styles.controls}>
                    <Pressable
                        style={styles.button}
                        onPress={mp3Recording ? stopMp3Recording : startMp3Recording}
                    >
                        <View style={{ flexDirection: "row" }}>
                            {mp3Recording && <Text style={styles.buttonText}>
                                {mp3Recording ? "Stop Recording" : ""}
                            </Text>}
                            {mp3Recording && (
                                <Text
                                    style={[
                                        styles.recordingTimeText,
                                        { marginLeft: 15 },
                                    ]}
                                >
                                    {formatTime(mp3RecordingTime)}
                                </Text>
                            )}
                        </View>
                        {mp3Recording && (
                            <Animated.View
                                style={[
                                    styles.recordingAnimation,
                                    {
                                        transform: [{ scale: recordingAnimation }],
                                    },
                                ]}
                            >
                                <Ionicons name="mic" size={20} color="red" />
                            </Animated.View>
                        )}
                    </Pressable>
                </View>}

                {ArrayList.isArray(currentFileArray) ? (
                    <>
                        <Swiper
                            style={styles.wrapper}
                            showsPagination={false}
                            index={0}
                            bounces={true}
                            loop={false}
                        >
                            {currentFileArray.map((file, index) => (
                                <View key={index} style={styles.imageWrapper}>
                                    <TouchableOpacity
                                        onPress={() => handleImagePress(index)}
                                        style={{ width: "100%", height: "100%" }}
                                    >
                                        {Media.isImage(file?.name) && (
                                            <Image
                                                source={{ uri: file?.uri ? file?.uri : file?.url }}
                                                style={{ width: "100%", height: "100%" }}
                                                resizeMode='contain'
                                            />
                                        )}
                                        {Media.isVideo(file?.name) && (
                                            <TouchableOpacity
                                                style={styles.playIconWrapper}
                                                onPress={() => {
                                                    setCurrentIndex(index);
                                                    setModalVisible(true);
                                                    setIsPlaying(false);
                                                }}
                                            >
                                                <FontAwesome5 name='play-circle' size={104} color='black' />
                                            </TouchableOpacity>
                                        )}
                                        {Media.isAudio(file?.name) && (
                                            <TouchableOpacity
                                                style={styles.playIconWrapper}
                                                onPress={() => {
                                                    setCurrentIndex(index);
                                                    setModalVisible(true);
                                                    setIsPlaying(false);
                                                }}
                                            >
                                                <FontAwesome5 name='microphone' size={104} color='black' />
                                            </TouchableOpacity>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </Swiper>

                        <Modal
                            visible={modalVisible}
                            transparent={true}
                            onRequestClose={() => {
                                setModalVisible(false);
                                setIsPlaying(false);
                                videoRef.current?.pauseAsync();
                            }}
                        >
                            <View style={[styles.modalContainer, { marginTop: platform.isIOS() ? "12%" : 0 }]}>
                                <TouchableOpacity style={styles.closeButton} onPress={() => {
                                    setModalVisible(false);
                                    setIsPlaying(false);
                                    videoRef.current?.pauseAsync();
                                }}>
                                    <FontAwesome5 name='times-circle' size={50} color='white' />
                                </TouchableOpacity>

                                <Swiper
                                    style={styles.modelWrapper}
                                    index={currentIndex}
                                    loop={false}
                                    showsPagination={false}
                                >
                                    {currentFileArray.map((file, index) => (
                                        <View key={index} style={styles.slide}>
                                            {Media.isImage(file?.name) && (
                                                <Image
                                                    source={{ uri: file?.uri ? file?.uri : file.url }}
                                                    style={styles.modelImage}
                                                    resizeMode='contain'
                                                />
                                            )}
                                            {Media.isVideo(file?.name) && (
                                                <View style={styles.videoContainer}>
                                                    <Video
                                                        ref={videoRef}
                                                        source={{ uri: file?.uri ? file?.uri : file.url }}
                                                        style={style.imageSize}
                                                        resizeMode="contain"
                                                        shouldPlay={currentIndex == index && isPlaying}
                                                        isMuted={false}
                                                        onPlaybackStatusUpdate={(status) => {
                                                            if (status.didJustFinish) {
                                                                setIsPlaying(false);
                                                                videoRef.current?.pauseAsync();
                                                                videoRef.current?.stopAsync();
                                                            }
                                                        }}
                                                    />
                                                    <TouchableOpacity onPress={() => toggleVideoPlayback()} style={styles.playIconWrapper}>
                                                        <FontAwesome5 name={isPlaying ? 'pause-circle' : 'play-circle'} size={104} color={isPlaying ? 'gray' : "white"} />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                            {Media.isAudio(file?.name) && (
                                                <View style={styles.audioContainer}>
                                                    <View>
                                                        <TouchableOpacity onPress={() => handleAudioPlayback(file?.uri ? file?.uri : file.url)} style={styles.modelPlayIconWrapper}>
                                                            <FontAwesome5 name={isAudioPlaying ? 'pause-circle' : 'play-circle'} size={40} color={isAudioPlaying ? 'gray' : 'black'} />
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View>
                                                        <Text style={styles.durationText}>
                                                            {formatDuration(playbackPosition)} / {formatDuration(duration)}
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}
                                            {showDeleteButton && (
                                                <TouchableOpacity
                                                    style={styles.deleteButton}
                                                    onPress={() =>
                                                        handleDelete(index, file)
                                                    }
                                                >
                                                    <FontAwesome5 name='trash' size={50} color='red' />
                                                </TouchableOpacity>
                                            )}
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
    durationText: {
        fontSize: 16,
        color: 'black',
    },
    audioContainer: {
        position: 'relative',
        width: '100%',
        height: 100,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderRadius: 10,
        flexDirection: "row"
    },
    imageWrapper: {
        flex: 1,
        alignItems: "center",
        position: "relative",
        marginHorizontal: 5,
        backgroundColor: "gray"
    },
    videoContainer: {
        position: 'relative',
        width: width * 0.8,
        height: height * 0.9,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        marginBottom: 50
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    wrapper: {
        height: height - 250,
    },
    modelWrapper: {
        height: height,
    },
    closeButton: {
        top: 20,
        right: 20,
        left: 150,
        zIndex: 1,
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modelImage: {
        width: '100%',
        height: '100%',
    },
    playIconWrapper: {
        position: 'absolute',
        top: '40%',
        left: '40%',
    },
    modelPlayIconWrapper: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: -52,
        marginTop: -73,
    },
    deleteButton: {
        position: 'absolute',
        bottom: 30,
        zIndex: 1,
    },
    controls: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    button: {
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        margin: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
    },
    recordingTimeText: {
        color: "red",
        fontSize: 18,
    },
    recordingAnimation: {
        marginLeft: 10,
    },
    recordingName: {
        fontSize: 16,
        color: "#fff",
        fontWeight: "bold",
        flex: 1,
        marginLeft: 10,
    },
});

export default Attachment;

