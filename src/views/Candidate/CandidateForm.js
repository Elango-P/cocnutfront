import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { MenuItem } from "react-native-material-menu";
import Comment from "../../components/Comment";
import DatePicker from "../../components/DatePicker";
import Email from "../../components/Email";
import HistoryList from "../../components/HistoryList";
import Layout from "../../components/Layout";
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";
import PhoneNumber from "../../components/PhoneNumber";
import Select from "../../components/Select";
import StatusSelect from "../../components/StatusSelect";
import Tab from "../../components/Tab";
import TextArea from "../../components/TextArea";
import TextInput from "../../components/TextInput";
import UserSelect from "../../components/UserSelect";
import VerticalSpace10 from "../../components/VerticleSpace10";
import ObjectName from "../../helper/ObjectName";
import Permission from "../../helper/Permission";
import styles from "../../helper/Styles";
import TabName from '../../helper/Tab';
import Number from "../../lib/Number";
import asyncStorageService from "../../services/AsyncStorageService";
import CandidateProfileService from "../../services/CandidateProfileService";
import CommentService from "../../services/CommentService";
import JobsService from "../../services/JobService";
import mediaService from "../../services/MediaService";
import PermissionService from "../../services/PermissionService";
import Media from "../Visitor/Media";
import String from "../../lib/String";

const CandidateForm = (props) => {
    const params = props?.route?.params?.item
    const [phoneNumber, setPhoneNumber] = useState("")
    const [permission, setPermission] = useState("")
    const [image, setImage] = useState(null);
    const [file, setFile] = useState(null);
    const [jobOptions, setJobOptions] = useState([])
    const [actionList, setActionList] = useState([])
    const [allowEdit, setEdit] = useState(true);
    const [visible, setVisible] = useState(false)
    const [candidateDeleteModalOpen, setCandidateDeleteModalOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState(params?.candidateId || "");
    const [activeTab, setActiveTab] = useState(TabName.SUMMARY);
    const [status, setStatus] = useState("");
    const [notes, setNotes] = useState(params?.notes || "");
    const [selectedUser, setSelectedUser] = useState("");
    const [email, setEmail] = useState("");
    const [commentModal, setCommentModal] = useState(false)
    const [comments, setComments] = useState([])
    const [message, setMessage] = useState("")
    const [messageId, setMessageId] = useState("")
    const [userId, setUserId] = useState("")
    const [historyPermission, setHistoryPermission] = useState("")
    const [isSubmit, setIsSubmit] = useState(false)
    const navigation = useNavigation()


    useEffect(() => {
        getJobOption()
        getPermission();
    }, [])

    const preloadedValues = {
        firstName: params?.firstName,
        lastName: params?.lastName,
        phone_number: params?.phone,
        email: params?.email,


    }

    const {
        control,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: preloadedValues
    });

    const getPermission = async () => {
        const isExist = await PermissionService.hasPermission(Permission.CANDIDATE_HISTORY_VIEW);
        setHistoryPermission(isExist)
    }

    const handlePhoneNumberChange = (value) => {
        setPhoneNumber(value)
    }
    const onEmailChange = (value) => {
        setEmail(value)
    }

    useEffect(() => {
        getActionItems();

    }, [allowEdit])
    const onNotesChange = (value) => {

        setNotes(value)

    }

    const candidateDeleteModalToggle = () => {
        setCandidateDeleteModalOpen(!candidateDeleteModalOpen);
    }


    const getActionItems = async () => {
        let actionItems = new Array();
        const editPermission = await PermissionService.hasPermission(
            Permission.CANDIDATE_EDIT
        );
        const deletePermission = await PermissionService.hasPermission(
            Permission.CANDIDATE_DELETE
        );
        if (editPermission && !allowEdit) {
            actionItems.push(
                <MenuItem onPress={() => {
                    setEdit(true),
                        setVisible(true);
                }}>
                    Edit
                </MenuItem>

            )
        }
        if (deletePermission) {
            actionItems.push(
                <MenuItem onPress={() => {
                    setCandidateDeleteModalOpen(true),
                        setVisible(true);
                }
                }>
                    Delete
                </MenuItem>

            )
        }
        setActionList(actionItems)
    }

    const uploadImage = (id) => {

        if (file) {

            const data = new FormData();

            let mediaFile = {
                type: file?._data?.type,
                size: file?._data.size,
                uri: image,
                name: file?._data.name
            }

            data.append("media_file", mediaFile)

            data.append("image_name", file?._data.name);

            data.append("name", file?._data.name);

            data.append("media_name", file?._data.name);

            data.append("object", ObjectName.CANDIDATE);

            data.append("object_id", id);

            data.append("media_url", image);

            data.append("media_visibility", 1);

            data.append("feature", 1);

            mediaService.uploadMedia(navigation, data, async (error, response) => {
                if (response) {
                    let data = {
                        media_id: response.id
                    }
                    await CandidateProfileService.update(id, data, (response) => {
                        navigation.navigate("Candidate")
                    })
                }
                setFile("");
                setImage("");
            })
        } else {
        }
    }

    const getJobOption = async () => {
        let jobs = new Array()
        await JobsService.search((error, response) => {
            if (response && response.data && response.data.data) {
                for (let i = 0; i < response.data.data.length; i++) {
                    jobs.push({
                        label: response.data.data[i].job_title,
                        value: response.data.data[i].id
                    })
                }
                setJobOptions(jobs)
            }
        })
    }
    const candidateDelete = async () => {
        if (selectedItem) {
            CandidateProfileService.delete(selectedItem, (error, response) => {
                navigation.navigate("Candidate");
            })
        }
    };

    const candidateUpdate = async (values) => {
        setIsSubmit(true)
        let data = new FormData()
        let mediaFile = {
            type: file?._data?.type,
            size: file?._data.size,
            uri: image,
            name: file?._data.name
        }

        data.append("firstName", values.firstName)
        data.append("lastName", values.lastName)
        data.append("phone", values.phone_number)
        data.append("position", values?.position?.label)
        data.append("positionType", values?.position?.value)
        data.append("owner_id", values?.owner_id ? values?.owner_id?.value : selectedUser ? selectedUser : null)
        data.append("status", values?.status ? values?.status?.value : values?.status?.value)
        data.append("notes", values?.notes ? values?.notes : notes ? notes : null)
        data.append("email", values?.email ? values?.email : email)
        !params && data.append("media_file", file !== null ? mediaFile : "")

        let updateData = new Object()

        updateData.firstName = values.firstName
        updateData.lastName = values.lastName
        updateData.phone = values?.phone_number
        updateData.position = values?.position?.label
        updateData.positionType = values?.position?.value
        updateData.owner_id = values?.owner_id ? values?.owner_id?.value : selectedUser ? selectedUser : null
        updateData.status = values?.status ? values?.status?.value : values?.status?.value
        updateData.notes = values?.notes ? values?.notes : notes ? notes : null
        updateData.email = values?.email ? values?.email : email

        if (params) {

            await CandidateProfileService.update(params?.candidateId, updateData, (response) => {
                if (response) {
                    setIsSubmit(false)
                    if (file) {
                        uploadImage(params?.candidateId)
                    } else {
                        navigation.navigate("Candidate")

                    }
                } else {
                    setIsSubmit(false)
                }
            })
        } else {
            await CandidateProfileService.create(data, (err, response) => {
                if (response && response.data && response.data.candidateId) {
                    setIsSubmit(false)
                    navigation.navigate("Candidate")
                } else {
                    setIsSubmit(false)
                }

            })
        }

    }


    let title = [];

    if (params) {
        title.push(
            {
                title: TabName.SUMMARY,
                tabName: TabName.SUMMARY,
            },
            {
                title: TabName.COMMENT,
                tabName: TabName.COMMENT,
            }
        );
    }

    if (params && historyPermission) {
        title.push({
            title: TabName.HISTORY,
            tabName: TabName.HISTORY,
        });
    }


    return (
        <Layout
            title={params ? "Candidate Detail" : "Candidate Add"}
            buttonLabel={params ? allowEdit && activeTab === TabName.SUMMARY ? "Save" : "" : "Add"}
            closeModal={visible}
            buttonLabel2={params && activeTab === TabName.COMMENT ? "Add" : ""}
            button2OnPress={() => { setCommentModal(true) }}
            buttonOnPress={handleSubmit((values) => { candidateUpdate(values) })}
            showActionMenu={activeTab === TabName.SUMMARY && params && actionList && actionList.length > 0 ? true : false}
            actionItems={actionList}
            isSubmit={isSubmit}
        >
            <DeleteConfirmationModal
                modalVisible={candidateDeleteModalOpen}
                toggle={candidateDeleteModalToggle}
                item={params?.candidateId}
                updateAction={candidateDelete}
                name={String.concatName(params?.firstName, params?.lastName)}
                CancelAction={() => setVisible(false)}

            />

            {params && (
                <View style={styles.tabBar}>
                    <Tab
                        title={title}
                        setActiveTab={setActiveTab}
                        defaultTab={activeTab}
                    />
                </View>

            )}


            {activeTab === TabName.SUMMARY && (
                <ScrollView>

                    <View style={{ marginTop: 10, padding: 10 }}>
                        <Media image={image ? image : ""} prefillImage={params?.candidate_url} setImage={setImage} setFile={setFile} />

                        {params && (
                            <>
                                <DatePicker
                                    title="Date"
                                    selectedDate={params?.createdAt}
                                    disabled={false}
                                />
                                <VerticalSpace10 />
                            </>
                        )}
                        <TextInput
                            title="First Name"
                            name="firstName"
                            control={control}
                            showBorder={true}
                            required
                            editable={allowEdit}

                        />
                        <VerticalSpace10 />

                        <TextInput
                            title="Last Name"
                            name="lastName"
                            control={control}
                            showBorder={true}
                            required
                            editable={allowEdit}
                        />
                        <VerticalSpace10 />

                        <PhoneNumber
                            title="Phone Number"
                            name="phone_number"
                            control={control}
                            required
                            onInputChange={handlePhoneNumberChange}
                            editable={allowEdit}
                        />
                        <VerticalSpace10 />

                        {params && (
                            <><Email
                                title={"Email"}
                                name="email"
                                control={control}
                                editable={allowEdit}
                                onInputChange={onEmailChange} />
                                <VerticalSpace10 /></>
                        )}

                        <Select
                            label={"Position"}
                            placeholder={"Select Job Position"}
                            name={'position'}
                            control={control}
                            options={jobOptions}
                            data={params?.positionType && Number.Get(params?.positionType)}
                            disable={!allowEdit}
                        />

                        {params && (
                            <><><VerticalSpace10 />
                                <UserSelect
                                    label="Owner"
                                    selectedUserId={params?.owner_id}
                                    name={"owner_id"}
                                    onChange={(value) => setSelectedUser(value.value)}
                                    control={control}
                                    disable={!allowEdit}
                                    placeholder="Select Owner" />
                                <VerticalSpace10 />

                                <StatusSelect
                                    label={"Status"}
                                    name="status"
                                    control={control}
                                    placeholder={"Select Status"}
                                    object={ObjectName.CANDIDATE}
                                    data={params?.status ? parseInt(params?.status) : ""}
                                    currentStatusId={params?.status}
                                    disable={!allowEdit}
                                    onChange={(value) => setStatus(value.value)} /></>
                                <VerticalSpace10 />
                                <TextArea
                                    name="notes"
                                    title="Notes"
                                    control={control}
                                    values={notes}
                                    onInputChange={onNotesChange}
                                    editable={allowEdit} />
                                <VerticalSpace10 paddingTop={50} />
                            </>
                        )}

                    </View>
                </ScrollView>
            )}

            {activeTab === TabName.COMMENT && (
                <>
                    <Comment
                        objectId={params?.candidateId}
                        objectName={ObjectName.CANDIDATE}
                        assignee_id={params?.assignee_id}
                        commentModal={commentModal}
                        setCommentModal={setCommentModal}
                        showVoiceNoteRecorder
                        showUserSelect={false}
                    />
                </>
            )}

            {activeTab === TabName.HISTORY && (
                <ScrollView>
                    <HistoryList
                        objectName={ObjectName.CANDIDATE}
                        objectId={params?.candidateId}
                    />

                </ScrollView>
            )}



        </Layout>
    )

}
export default CandidateForm