import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView } from "react-native";
import Attachment from "../../components/Attachment";
import DatePicker from "../../components/DatePicker";
import Layout from "../../components/Layout";
import ProjectSelect from "../../components/ProjectSelect";
import ProjectUserSelect from "../../components/ProjectUserSelect";
import Select from "../../components/Select";
import StoryPointSelect from "../../components/StoryPointSelect";
import TextArea from "../../components/TextArea";
import VerticalSpace10 from "../../components/VerticleSpace10";
import {
    TICKET_FIELD_ASSIGNEE,
    TICKET_FIELD_ATTACHMENT_IMAGE,
    TICKET_FIELD_DESCRIPTION,
    TICKET_FIELD_DUE_DATE,
    TICKET_FIELD_PROJECT,
    TICKET_FIELD_STORY_POINTS,
    TICKET_FIELD_SUMMARY,
    TICKET_FIELD_TYPE,
    TICKET_FIELD_VOICE_NOTES
} from "../../helper/ProjectTicketType";
import TabName from '../../helper/Tab';
import DateTime from "../../lib/DateTime";
import mediaService from "../../services/MediaService";
import ticketService from "../../services/TicketServices";
import ticketTypeService from "../../services/TicketTypeService";

const TicketForm = (props) => {

    const { projectId, ticketTypeValue, allow_for_assignee_change_permission } = props && props.route && props.route.params && props.route.params;

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedProject, setSelectedProject] = useState(null);
    const [storyPoints, setStoryPoints] = useState(ticketTypeValue && ticketTypeValue.default_story_point)
    const [typeList, setTypeList] = useState([]);
    const [MediaData, setMediaData] = useState([]);
    const [activeTab, setActiveTab] = useState(TabName.SUMMARY);
    const [isSubmit, setIsSubmit] = useState(false)
    const navigation = useNavigation();
    const [selectedFiles, setSelectedFiles]=useState([]);

    const preloadedValues = {
        assignee: (selectedUser || selectedUser == "") ? selectedUser : ticketTypeValue?.default_assignee,
        storyPoints: storyPoints,
        project: projectId ? projectId : "",
        ticketType: ticketTypeValue && ticketTypeValue?.value

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
        createData.append("due_date", selectedDate ? DateTime.formatDate(selectedDate) : "")
        createData.append("projectId", projectId && projectId)
        createData.append("ticketType", ticketTypeValue && ticketTypeValue?.value)
        createData.append("summary", values.summary)
        createData.append("description", values.description)
        createData.append("story_points", storyPoints ? storyPoints : values?.storyPoints?.value)


        await ticketService.create(createData, (err, response) => {
            if (response && response?.data) {
                if (selectedFiles && selectedFiles.length > 0) {
                    for (let i = 0; i < selectedFiles.length; i++) {
                        const file = selectedFiles[i];
                        uploadImage(file, response.data.ticketDetails.id)
                    }

                } else {
                    navigation.navigate("Ticket")
                }

            } else {
                setIsSubmit(false)
            }
            navigation.navigate("Ticket")
        })

    }

    const uploadImage = (file, id) => {
        if (file) {
            const data = new FormData();
          
            data.append("media_file", file);
            data.append("media_name", file?.name);
            data.append("object", "TICKET");
            data.append("object_id", id);
            data.append("media_visibility", 1);

            let mediaObj = [{
                url: file?.uri
            }];

            if (MediaData && MediaData.length > 0) {
                let updatedMediaList = [...mediaObj, ...MediaData]
                setMediaData(updatedMediaList);
            } else {
                setMediaData(mediaObj)
            }

            mediaService.uploadMedia(navigation, data, async (error, response) => {

                if (response) {
                    setIsSubmit(false)
                }
            });
        }
    };

    const ticketTypeList = () => {
        let params = {}

        if (selectedProject) {
            params.projectId = selectedProject?.value
        } else {
            params.projectId = projectId

        }
        ticketTypeService.search(params, (err, response) => {

            let data = response && response?.data && response?.data?.data;
            let list = [];
            if (data) {
                for (let i = 0; i < data.length; i++) {
                    const { id, name, default_story_point, default_assignee } = data[i];
                    list.push({
                        label: name,
                        value: id,
                        default_story_point: default_story_point,
                        default_assignee: default_assignee

                    });
                }
            }

            setTypeList(list);
        });
    }


    const handleTypeChange = (value) => {
        setStoryPoints(value?.default_story_point)
        setSelectedUser(value?.default_assignee ? value?.default_assignee : "")
    }

    return (
        <Layout
            title="Ticket - Create"
            showBackIcon={true}
            isSubmit={isSubmit}
            buttonLabel={activeTab === TabName.SUMMARY ? "Save" : ""}
            buttonOnPress={
                activeTab === TabName.SUMMARY
                    ? handleSubmit((values) => addTicket(values))
                    :  ""
            }
        >
         
            <ScrollView>
                <VerticalSpace10 />
                {activeTab === TabName.SUMMARY && (
                    <>
                        {ticketTypeValue
                            && ticketTypeValue?.fields
                            && ticketTypeValue?.fields?.includes(TICKET_FIELD_PROJECT.toString()) && (
                                <>
                                    <ProjectSelect
                                        label="Project"
                                        name="project"
                                        onChange={(values) => setSelectedProject(values)}
                                        control={control}
                                        required
                                        placeholder="Select Project"
                                    />

                                    <VerticalSpace10 />
                                </>
                            )}
                        {ticketTypeValue
                            && ticketTypeValue?.fields
                            && ticketTypeValue?.fields?.includes(TICKET_FIELD_TYPE.toString()) && (
                                <>
                                    <Select
                                        label={"Ticket Type"}
                                        name="ticketType"
                                        control={control}
                                        options={typeList}
                                        required={true}
                                        placeholder={"Select Ticket Type"}
                                        getDetails={(value) => handleTypeChange(value)}

                                    />

                                    <VerticalSpace10 />
                                </>
                            )}

                        {ticketTypeValue
                            && ticketTypeValue?.fields
                            && ticketTypeValue?.fields?.includes(TICKET_FIELD_ASSIGNEE.toString()) && (
                                <>
                                    <ProjectUserSelect
                                        label="Assignee"
                                        getDetails={(values) => setSelectedUser(values)}
                                        name="assignee"
                                        control={control}
                                        required={selectedUser ? false : true}
                                        selectedUserId={(selectedUser || selectedUser == "") ? selectedUser : ticketTypeValue?.default_assignee}
                                        placeholder="Select Assignee"
                                        projectId={projectId && projectId}
                                        disable={(selectedProject || selectedProject == "") ? !selectedProject?.allow_for_assignee_change_permission : !allow_for_assignee_change_permission}
                                    />
                                    <VerticalSpace10 />
                                </>
                            )}

                        {ticketTypeValue
                            && ticketTypeValue?.fields
                            && ticketTypeValue?.fields?.includes(TICKET_FIELD_DUE_DATE.toString()) && (
                                <>
                                    <DatePicker
                                        title="Due Date"
                                        name="due_date"
                                        onDateSelect={onDateSelect}
                                        selectedDate={selectedDate}
                                    />
                                    <VerticalSpace10 />
                                </>
                            )}

                        {ticketTypeValue
                            && ticketTypeValue?.fields
                            && ticketTypeValue?.fields?.includes(TICKET_FIELD_STORY_POINTS.toString()) && (
                                <>
                                    <StoryPointSelect
                                        onChange={(values) => setStoryPoints(values)}
                                        placeholder="Select Story Point"
                                        control={control}
                                        name="storyPoints"
                                        required={storyPoints ? false : true}
                                        data={storyPoints}
                                    />
                                    <VerticalSpace10 />
                                </>
                            )}

                        {ticketTypeValue
                            && ticketTypeValue?.fields
                            && ticketTypeValue?.fields?.includes(TICKET_FIELD_SUMMARY.toString()) && (
                                <>
                                    <TextArea
                                        name="summary"
                                        title="Summary"
                                        control={control}
                                        required={true}
                                    />
                                    <VerticalSpace10 />
                                </>
                            )}

                        {ticketTypeValue
                            && ticketTypeValue?.fields
                            && ticketTypeValue?.fields?.includes(TICKET_FIELD_DESCRIPTION.toString()) && (
                                <>
                                    <TextArea
                                        name="description"
                                        title="Description"
                                        control={control}
                                    />
                                    <VerticalSpace10 />
                                </>
                            )}

                        <Attachment
                            showDeleteButton={true}
                            showPhoto
                            showVideo
                            showAudio
                            handleSelectedFiles={setSelectedFiles}
                            isAddPage
                            selectedFiles={selectedFiles}
                        />
                    </>
                )}
            </ScrollView>
        </Layout>
    )
}

export default TicketForm;