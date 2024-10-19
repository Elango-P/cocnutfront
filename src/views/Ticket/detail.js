import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { MenuItem } from 'react-native-material-menu';
import Comment from '../../components/Comment';
import DatePicker from "../../components/DatePicker";
import FileSelectModal from '../../components/FileSelectModal';
import HistoryList from '../../components/HistoryList';
import Layout from "../../components/Layout";
import MediaList from "../../components/MediaList";
import DeleteConfirmationModal from '../../components/Modal/DeleteConfirmationModal';
import ProjectSelect from '../../components/ProjectSelect';
import ProjectUserSelect from "../../components/ProjectUserSelect";
import Select from '../../components/Select';
import StatusSelect from "../../components/StatusSelect";
import StoryPointSelect from "../../components/StoryPointSelect";
import Tab from "../../components/Tab";
import TextArea from "../../components/TextArea";
import VerticalSpace10 from "../../components/VerticleSpace10";
import Media from '../../helper/Media';
import ObjectName from "../../helper/ObjectName";
import Permission from '../../helper/Permission';
import TabName from '../../helper/Tab';
import asyncStorageService from '../../services/AsyncStorageService';
import mediaService from '../../services/MediaService';
import PermissionService from '../../services/PermissionService';
import StatusService from '../../services/StatusServices';
import ticketService from "../../services/TicketServices";
import ticketTypeService from '../../services/TicketTypeService';
import {
    TICKET_FIELD_ASSIGNEE,
    TICKET_FIELD_DESCRIPTION,
    TICKET_FIELD_DUE_DATE,
    TICKET_FIELD_PROJECT,
    TICKET_FIELD_STATUS,
    TICKET_FIELD_STORY_POINTS,
    TICKET_FIELD_SUMMARY
} from "../../helper/ProjectTicketType";
import Attachment from "../../components/Attachment";

const TicketDetail = (props) => {
    const params = props.route.params.item;
    const param = props?.route?.params
    const [selectedUser, setSelectedUser] = useState(params?.assignee_id || "");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [summary, setSummary] = useState(params?.summary || "");
    const [description, setDescription] = useState(params?.description || "");
    const [status, setStatus] = useState(params?.statusId || "");
    const [activeTab, setActiveTab] = useState(TabName.SUMMARY);
    const [commentModal, setCommentModal] = useState(false)
    const [MediaData, setMediaData] = useState([]);
    const [selectedProject, setSelectedProject] = useState(params?.projectId || "");
    const [ticketType, setTicketType] = useState(params?.ticketTypeId || "");
    const [typeList, setTypeList] = useState([]);
    const [actionList, setActionList] = useState([])
    const [ticketDeleteModalOpen, setTicketDeleteModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(params?.id || "");
    const [storyPoints, setStoryPoints] = useState(params?.story_points || "")
    const [historyPermission, setHistoryPermission] = useState("")
    const [modalVisible, setModalVisible] = useState(false);
    const [userIds, setUserIds] = useState(params?.assignee_id || "")
    const [visible, setVisible] = useState(false)
    const [details, setDetails] = useState("")
    const [isSubmit, setIsSubmit] = useState(false)

    const [ticketDetail, setTicketDetail] = useState(null);
    const isFocused = useIsFocused();
    const navigation = useNavigation();
    const preloadedValues = {
        storyPoints: params?.story_points ? params?.story_points : storyPoints,
        assignee: params?.assignee_id ? params?.assignee_id : selectedUser,
        project: params?.projectId ? params?.projectId : selectedProject,
        user: userIds ? userIds : params?.assignee_id,
        description: params?.description && Array.isArray(params?.description) ? params?.description.join() : params?.description
    }
    const {
        control,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: preloadedValues
    });

    useEffect(() => {
        updateDateValues();
        getPermission()
    }, [params]);

    useEffect(() => {
        if (params?.id) {
            getMediaList()
        }
    }, []);

    useEffect(() => {
        ticketTypeList();
    }, [selectedProject]);

    useEffect(() => {
        getActionItems();

    }, [params])

    useEffect(() => {
        getTicketDetails();
    }, [])

    const getTicketDetails = async () => {
        let ticketParams = {
            slug: params?.slug,
            ticket_number: params?.ticket_number
        }
        await ticketService.get(ticketParams, (error, response) => {
            if (response && response.data) {
                setTicketDetail(response.data);
            }
        });
    };

    const updateDateValues = () => {
        let date = params?.due_date;
        if (date) {
            setSelectedDate(new Date(date));
        }
    };

    const onDateSelect = (value) => {
        setSelectedDate(new Date(value));
    };

    const onSummaryChange = (value) => {
        setSummary(value);

    };

    const onDescriptionChange = (value) => {
        setDescription(value);

    };

    const handleStatusOnChange = (value) => {
        setStatus(value.value)
    }

    const getPermission = async () => {
        const isExist = await PermissionService.hasPermission(Permission.TICKET_HISTORY_VIEW);
        setHistoryPermission(isExist)
    }

    const toggleModal = () => {
        setModalVisible(!modalVisible);
    };

    const ticketTypeList = () => {
        let param = { projectId: selectedProject }
        ticketTypeService.search(param, (err, response) => {

            let data = response && response?.data && response?.data?.data;
            let list = [];
            if (data) {
                for (let i = 0; i < data.length; i++) {
                    const { id, name } = data[i];
                    list.push({
                        label: name,
                        value: id
                    });
                }
            }

            setTypeList(list);
        });
    }

    const UpdatedTicket = (values) => {
        setIsSubmit(true)
        let updateData = {
            assignee: selectedUser.value,
            due_date: selectedDate,
            summary: summary,
            status: values ? values?.status : status,
            project: selectedProject,
            ticketType: ticketType,
            story_points: storyPoints,
            description: description && Array.isArray(description) ? description.join() : description,
        };

        ticketService.update(params?.id, updateData, (err, response) => {
            if (response && response) {
                setIsSubmit(false)
                navigation.navigate("Ticket");
            } else {
                setIsSubmit(false)
            }
        });
    };

    const takePicture = async (e) => {
        const image = await Media.getImage();
        if (image && image.assets) {
            const response = await fetch(image.assets[0].uri);
            const blob = await response.blob();
            await Media.uploadImage(params?.id ? params?.id : param?.id, blob, image.assets[0].uri, ObjectName.TICKET, null, null, async (response) => {
                if (response) {
                    getMediaList();
                }
            })
        }
    };

    const uploadImage = async (e) => {
        const image = await Media.imageUpload();
        if (image && image.assets) {
            const response = await fetch(image.assets[0].uri);
            const blob = await response.blob();
            await Media.uploadImage(params?.id ? params?.id : param?.id, blob, image.assets[0].uri, ObjectName.TICKET, null, null, async (response) => {
                if (response) {
                    getMediaList();
                }
            })
        }
    };

    const ticketDeleteModalToggle = () => {
        setTicketDeleteModalOpen(!ticketDeleteModalOpen);
    }

    const ticketDelete = async () => {
        if (selectedItem) {
            ticketService.delete(selectedItem, (error, response) => {
                navigation.navigate("Ticket");
            })
        }
    };

    const getActionItems = async () => {
        let actionItems = new Array();
        const deletePermission = await PermissionService.hasPermission(
            Permission.TICKET_DELETE
        );
        const roleId = await asyncStorageService.getRoleId();
        let status = [];

        let statusId = params?.statusId ? params?.statusId : details?.statusId;
        let projectId = params?.projectId ? params?.projectId : details?.projectId

        let response = await StatusService.getNextStatus(statusId, projectId, (currentStatus) => {
            status.push({
                label: currentStatus[0].name,
                value: currentStatus[0].status_id,
                id: currentStatus[0].status_id
            });
        });

        response && response.forEach((statusList) => {
            if (statusList.allowed_role_id && statusList.allowed_role_id.split(",").includes(roleId)) {
                status.push({
                    label: statusList.name,
                    value: statusList.status_id,
                    id: statusList.status_id
                });
            }
        });

        status.forEach(statusItem => {
            if (statusItem.id !== params?.statusId) {
                actionItems.push(
                    <MenuItem key={statusItem.id} onPress={() => UpdatedTicket({ status: statusItem.id })}>{statusItem.label}</MenuItem>
                );
            }
        });
        if (deletePermission) {
            actionItems.push(
                <MenuItem onPress={() => { setTicketDeleteModalOpen(true), setVisible(true) }}>
                    Delete
                </MenuItem>
            )
        }

        setActionList(actionItems)
    }


    const getMediaList = async () => {
        await mediaService.search(params?.id, ObjectName.TICKET, (callback) => setMediaData(callback.data.data))
    }

    let title = [
        {
            title: TabName.SUMMARY,
            tabName: TabName.SUMMARY
        },
        {
            title: TabName.COMMENT,
            tabName: TabName.COMMENT
        },
        {
            title: TabName.ATTACHMENTS,
            tabName: TabName.ATTACHMENTS
        }

    ]

    if (historyPermission) {
        title.push({
            title: TabName.HISTORY,
            tabName: TabName.HISTORY
        })
    }

    return (
        <Layout
            title={`Ticket#: ${params?.ticket_number}`}
            buttonLabel={activeTab === TabName.COMMENT ? "Add" : activeTab === TabName.ATTACHMENTS && "Upload"}
            buttonOnPress={() => {
                activeTab === TabName.COMMENT ? setCommentModal(true) : activeTab === TabName.ATTACHMENTS && setModalVisible(true)
            }}
            showBackIcon={true}
            closeModal={visible}
            actionItems={actionList}
            showActionMenu={activeTab === TabName.SUMMARY && actionList && actionList.length > 0 ? true : false}
            buttonLabel2={activeTab === TabName.SUMMARY && "Save"}
            button2OnPress={handleSubmit((values) => UpdatedTicket(values))}
            isSubmit={isSubmit}
        >
            <FileSelectModal isOpen={modalVisible} closeDrawer={toggleModal} takePhoto={() => { takePicture(), setModalVisible(false) }} uploadPhoto={() => { uploadImage(), setModalVisible(false) }} />
            <DeleteConfirmationModal
                modalVisible={ticketDeleteModalOpen}
                toggle={ticketDeleteModalToggle}
                item={selectedItem}
                updateAction={ticketDelete}
                id={selectedItem}
            />
            <View>
                <Tab
                    title={title}
                    setActiveTab={setActiveTab}
                    defaultTab={activeTab}
                />
            </View>
            {activeTab === TabName.SUMMARY && (
                <>
                    <ScrollView>
                        <VerticalSpace10 />
                        {ticketDetail
                            && ticketDetail?.field
                            && ticketDetail?.field?.includes(TICKET_FIELD_STATUS.toString()) && (
                                <>
                                    <StatusSelect
                                        label={"Status"}
                                        name="status"
                                        onChange={handleStatusOnChange}
                                        control={control}
                                        object={ObjectName.TICKET}
                                        disable={true}
                                        placeholder={"Select Status"}
                                        data={params.statusId ? params.statusId : status}
                                        currentStatusId={params.statusId}
                                    />
                                    <VerticalSpace10 />
                                </>
                            )}
                        {ticketDetail
                            && ticketDetail?.field
                            && ticketDetail?.field?.includes(TICKET_FIELD_PROJECT.toString()) && (
                                <>
                                    <ProjectSelect
                                        label="Project"
                                        name="project"
                                        onChange={(values) => setSelectedProject(values.value)}
                                        control={control}
                                        data={params.projectId ? params.projectId : selectedProject}
                                        required
                                        placeholder="Select Project"
                                    />
                                    <VerticalSpace10 />
                                </>
                            )}
                        <Select
                            label={"Ticket Type"}
                            name="ticketType"
                            control={control}
                            options={typeList}
                            data={params?.ticketTypeId ? params?.ticketTypeId : ticketType}
                            placeholder={"Select Ticket Type"}
                            getDetails={(value) => setTicketType(value.value)}

                        />
                        <VerticalSpace10 />
                        {ticketDetail
                            && ticketDetail?.field
                            && ticketDetail?.field?.includes(TICKET_FIELD_STORY_POINTS.toString()) && (
                                <>
                                    <StoryPointSelect
                                        onChange={(values) => setStoryPoints(values)}
                                        placeholder="Select Story Point"
                                        control={control}
                                        name="storyPoints"
                                        data={params?.story_points ? params?.story_points : storyPoints}
                                    />
                                    <VerticalSpace10 />
                                </>
                            )}
                        {ticketDetail
                            && ticketDetail?.field
                            && ticketDetail?.field?.includes(TICKET_FIELD_SUMMARY.toString()) && (
                                <>
                                    <TextArea
                                        name="summary"
                                        title="Summary"
                                        control={control}
                                        showBorder={true}
                                        values={summary}
                                        required={summary ? false : true}
                                        onInputChange={onSummaryChange}
                                    />
                                    <VerticalSpace10 />
                                </>
                            )}

                        {ticketDetail
                            && ticketDetail?.field
                            && ticketDetail?.field?.includes(TICKET_FIELD_DESCRIPTION.toString()) && (
                                <>
                                    <TextArea
                                        name="description"
                                        title="Description"
                                        control={control}
                                        values={description}
                                        onInputChange={onDescriptionChange}
                                    />

                                    <VerticalSpace10 />
                                </>
                            )
                        }

                        {ticketDetail
                            && ticketDetail?.field
                            && ticketDetail?.field?.includes(TICKET_FIELD_ASSIGNEE.toString()) && (
                                <>
                                    <ProjectUserSelect
                                        label="Assignee"
                                        name="assignee"
                                        onChange={(values) => { setSelectedUser(values) }}
                                        required
                                        control={control}
                                        showBorder={true}
                                        placeholder="Select Assignee"
                                        selectedUserId={selectedUser}
                                        projectId={selectedProject}

                                    />
                                    <VerticalSpace10 />
                                </>
                            )
                        }

                        {ticketDetail
                            && ticketDetail?.field
                            && ticketDetail?.field?.includes(TICKET_FIELD_DUE_DATE.toString()) && (
                                <>

                                    <DatePicker
                                        title="Due Date"
                                        onDateSelect={onDateSelect}
                                        selectedDate={selectedDate}
                                        disabled={params.dueDatePermission}
                                        showTime={true}
                                    />
                                </>
                            )}
                    </ScrollView>
                </>
            )}

            {activeTab === TabName.COMMENT && (
                <>
                    <Comment
                        objectId={params?.id}
                        objectName={ObjectName.TICKET}
                        assignee_id={params?.assignee_id}
                        commentModal={commentModal}
                        setCommentModal={setCommentModal}
                        showVoiceNoteRecorder
                    />

                </>
            )}
            {activeTab === TabName.ATTACHMENTS && (

                <Attachment
                    showDeleteButton={true}
                    showPhoto
                    showVideo
                    showAudio
                    objectId={params?.id}
                    objectName={ObjectName.TICKET}
                />

            )}
            {activeTab === TabName.HISTORY && (
                <ScrollView>
                    <HistoryList
                        objectName={ObjectName.TICKET}
                        objectId={params?.id}
                    />

                </ScrollView>
            )}
        </Layout>
    );
};

export default TicketDetail;

