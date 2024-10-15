import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView } from "react-native";
import VoiceNoteRecorder from "../../components/VoiceNoteRecorder";
import DatePicker from "../../components/DatePicker";
import Label from "../../components/Label";
import Layout from "../../components/Layout";
import MediaCarousel from "../../components/MediaCarousel";
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";
import ProjectUserSelect from "../../components/ProjectUserSelect";
import StoryPointSelect from "../../components/StoryPointSelect";
import TextArea from "../../components/TextArea";
import VerticalSpace10 from "../../components/VerticleSpace10";
import ObjectName from "../../helper/ObjectName";
import TabName from '../../helper/Tab';
import ArrayList from "../../lib/ArrayList";
import mediaService from "../../services/MediaService";
import ticketService from "../../services/TicketServices";
import ticketTypeService from "../../services/TicketTypeService";
import NetworkStatus from "../../lib/NetworkStatus";
import DateTime from "../../lib/DateTime";
import Media from "../../helper/Media";





const TicketForm = (props) => {

    const { projectId, ticketTypeValue } = props && props.route && props.route.params && props.route.params



    const [selectedUser, setSelectedUser] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedProject, setSelectedProject] = useState("");
    const [storyPoints, setStoryPoints] = useState(ticketTypeValue && ticketTypeValue.default_story_point)
    const [typeList, setTypeList] = useState([]);
    const [ticketType, setTicketType] = useState("");
    const [file, setFile] = useState(null);
    const [image, setImage] = useState(null);
    const [images, setImages] = useState([]);
    const [MediaData, setMediaData] = useState([]);
    const [activeTab, setActiveTab] = useState(TabName.SUMMARY);
    const [ticketId, setId] = useState("")
    const [ids, setIds] = useState("")
    const [files, setFiles] = useState([])
    const [mediaDeleteModal, setMediaDeleModal] = useState(false)
    const [selectedImage, setSelectImage] = useState("");
    const [audioRecordings, setAudioRecordings] = useState([])
    const [isSubmit, setIsSubmit] = useState(false)

    const navigation = useNavigation()
    const preloadedValues = {
        assignee: selectedUser,
        storyPoints: storyPoints
    }

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: preloadedValues
    });

    useEffect(() => {
        ticketTypeList();
    }, [selectedProject]);

    const onDateSelect = (value) => {
        //update the selected date
        setSelectedDate(new Date(value));
    }

    const addTicket = async (values) => {
        setIsSubmit(true)
        
        let createData = new FormData();
        createData.append("assignee_id", values?.assignee?.value ? values?.assignee?.value : selectedUser)
        createData.append("due_date", selectedDate ? DateTime.formatDate(selectedDate) :"")
        createData.append("projectId", projectId && projectId)
        createData.append("ticketType", ticketTypeValue && ticketTypeValue?.value)
        createData.append("summary", values.summary)
        createData.append("description", values.description)
        createData.append("story_points", storyPoints ? storyPoints : values?.storyPoints?.value)

        if (ArrayList.isArray(audioRecordings)) {
            for (const recording of audioRecordings) {
                const fileUri = recording.recording.getURI();

                createData.append('files', {
                    uri: fileUri,
                    type: 'audio/m4a',
                    name: recording.name,
                });
            }
        }
            
        await ticketService.create(createData, (err, response) => {
            if (response && response?.data) {
                setId(response.data.ticketDetails.id)
                if (files && files.length > 0) {
                    for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        const image = images[i];
                        uploadImage(file, image && image.uri, response.data.ticketDetails.id)


                    }

                } else {
                    uploadImage(file, image, response.data.ticketDetails.id)
                    navigation.navigate("Ticket")

                }

            } else {
                setIsSubmit(false)
            }
            navigation.navigate("Ticket")
        })

    }

    const handleDelete = (index) => {
        mediaDeleteToggle()
        setSelectImage(index)
    };
    const mediaDeleteToggle = () => {
        setMediaDeleModal(!mediaDeleteModal);
    }
    const removeImage = () => {
        try {
            setImages((prevImages) => {
                return prevImages.filter((_, i) => i !== selectedImage);
            });
        } catch (err) {
            console.log(err);
        }
    };
    const getMediaList = async (id) => {
        await mediaService.search(ticketId ? ticketId : id, ObjectName.TICKET, (callback) => setMediaData(callback.data.data))
    }
    const uploadImage = (file, image, id) => {
        if (file) {
            const data = new FormData();
            let files = {
                type: file?._data?.type,
                size: file?._data.size,
                uri: image,
                name: file?._data.name,
            };
            data.append("media_file", files);
            data.append("media_name", file?._data.name);
            data.append("object", "TICKET");
            data.append("object_id", id);
            data.append("media_visibility", 1);

            let mediaObj = [{
                url: image
            }];

            if (MediaData && MediaData.length > 0) {
                let updatedMediaList = [...mediaObj, ...MediaData]
                setMediaData(updatedMediaList);
            } else {
                setMediaData(mediaObj)
            }


            mediaService.uploadMedia(navigation, data, async (error, response) => {

                if (response) {
                    setIds(response?.id)
                    setIsSubmit(false)
                }
            });
        }
    };


    const addNewEntry = async (file, image) => {
        await uploadImage(file, image)
    }


    const takePicture = async (e) => {
        try{
          const image = await Media.imageUpload();
          if (image && image.assets && image.assets.length > 0) {
            const response = await fetch(image.assets[0].uri);
            if (response) {
                const blob = await response.blob();
                setFile(blob)
                setFiles([...files, blob])
            }
            const imageUrl = image.assets[0];
            setImages((prevImages) => [...prevImages, imageUrl]);
          }
        }catch (error) {
          console.error('Error taking picture:', error);
      }
       
      };

    const ticketTypeList = () => {
        let params = {}

        if (selectedProject) {
            params.projectId = selectedProject?.value
        }
        ticketTypeService.search(params, (err, response) => {

            let data = response && response?.data && response?.data?.data;
            let list = [];
            if (data) {
                for (let i = 0; i < data.length; i++) {
                    const { id, name, default_story_point, userId } = data[i];
                    list.push({
                        label: name,
                        value: id,
                        default_story_point: default_story_point,
                        userId: userId

                    });
                }
            }

            setTypeList(list);
        });
    }

    const handleTypeChange = (value) => {
        setTicketType(value.value)
        setStoryPoints(value?.default_story_point)
        setSelectedUser(value?.userId)
    }

    return (
        <Layout
            title="Add Ticket"
            showBackIcon={true}
            isSubmit={isSubmit}
            buttonLabel={activeTab === TabName.SUMMARY ? "Save" : activeTab === TabName.ATTACHMENTS && "Upload"}
            buttonOnPress={
                activeTab === TabName.SUMMARY
                    ? handleSubmit((values) => addTicket(values))
                    : activeTab === TabName.ATTACHMENTS
                        ? () => takePicture()
                        : ""
            }
        >
            <DeleteConfirmationModal
                modalVisible={mediaDeleteModal}
                toggle={mediaDeleteToggle}
                updateAction={(value) => removeImage(value)}
            />
            <ScrollView>


                <VerticalSpace10 />
                {activeTab === TabName.SUMMARY && (
                    <>
                        <ProjectUserSelect
                            label="Assignee"
                            getDetails={(values) => setSelectedUser(values)}
                            name="assignee"
                            control={control}
                            required={selectedUser ? false : true}
                            selectedUserId={selectedUser}
                            placeholder="Select Assignee"
                            projectId={projectId && projectId}
                        />
                        <VerticalSpace10 />


                        <DatePicker
                            title="Due Date"
                             name="due_date"
                            onDateSelect={onDateSelect}
                            selectedDate={selectedDate}
                        />
                        <VerticalSpace10 />
                        <StoryPointSelect
                            onChange={(values) => setStoryPoints(values)}
                            placeholder="Select Story Point"
                            control={control}
                            name="storyPoints"
                            required={storyPoints ? false : true}
                            data={storyPoints}
                        />
                        <VerticalSpace10 />

                        <TextArea
                            name="summary"
                            title="Summary"
                            control={control}
                            required={true}
                        />
                        <VerticalSpace10 />
                        <TextArea
                            name="description"
                            title="Description"
                            control={control}
                        />
                        <VerticalSpace10 />
                        <Label text={"Attachments"} bold size={13} />
                        <MediaCarousel
                            images={images}
                            showAddButton={true}
                            getMediaList={getMediaList}
                            handleAdd={() => takePicture()}
                            showDeleteButton={true}
                            deleteOnPress={handleDelete}
                            swipeContent = {2}
                        />
                        <VerticalSpace10 />
                        <VoiceNoteRecorder setAudioRecordings={setAudioRecordings} isAddPage={true} />
                        <VerticalSpace10 />
                        <VerticalSpace10 />
                    </>
                )}


            </ScrollView>





        </Layout>

    )

}
export default TicketForm;