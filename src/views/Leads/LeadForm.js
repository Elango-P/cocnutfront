import React, { useState, useEffect } from "react";
import {
    ScrollView,
    View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import Tab from "../../components/Tab";
import TabName from '../../helper/Tab';
import ObjectName from "../../helper/ObjectName";
import Layout from "../../components/Layout";
import { useIsFocused } from "@react-navigation/native";
import DatePicker from "../../components/DatePicker";
import TextArea from "../../components/TextArea";
import DateTime from "../../lib/DateTime";
import MediaList from "../../components/MediaList";
import VerticalSpace10 from "../../components/VerticleSpace10";
import mediaService from "../../services/MediaService";
import Media from '../../helper/Media';
import leadService from "../../services/LeadService";
import styles from "../../helper/Styles";
import TextInput from "../../components/TextInput";
import PhoneNumber from "../../components/PhoneNumber";
import Button from "../../components/Button";
import { Color } from "../../helper/Color";
import UserSelect from "../../components/UserSelect";
import StatusService from "../../services/StatusServices";
import StatusSelect from "../../components/StatusSelect";
import PermissionService from "../../services/PermissionService";
import Permission from "../../helper/Permission";
import { MenuItem } from "react-native-material-menu";
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";



const LeadForm = (props) => {
    let details = props?.route?.params?.item;
    let id = details?.id
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState(TabName.SUMMARY);
    const [leadId, setLeadId] = useState("");
    const [MediaData, setMediaData] = useState([]);
    const [totalMedia, setTotalMedia] = useState([]);
    const [phoneNumber, setPhoneNumber] = useState(details?.mobile_number || "")
    const [selectedUser, setSelectedUser] = useState("");
    const [status, setStatus] = useState("");
    const [allowEdit, setEdit] = useState(!details ? true : false);
    const [visible, setVisible] = useState(false)
    const [actionList, setActionList] = useState([])
    const [leadDeleteModalOpen, setLeadDeleteModalOpen] = useState(false);
    const [isSubmit,setIsSubmit] = useState(false);
    const [notes, setNotes] = useState(details?.notes || "");


    const isFocused = useIsFocused();
    const navigation = useNavigation();

    const onDateSelect = (value) => {
        setSelectedDate(new Date(value));
    }
    const handlePhoneNumberChange = (value) => {
        setPhoneNumber(value)
    }


    const preloadedValues = {
        date: details?.date ? details?.date : selectedDate,
        notes: details?.notes || "",
        name: details?.name || "",
        phone_number: details?.mobile_number || "",
        designation: details?.designation || "",
        owner_id: details?.owner_id ? details?.owner_id : selectedUser,
        status : details?.status ? details?.status : status,
    };
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: preloadedValues
    });

    const updateDateValues = () => {
        let date = details?.date;
        if (date) {
            setSelectedDate(new Date(date));
        }
    }
    const handleStatusOnChange = (value) => {
        setStatus(value.value)
      }

      const onNotesChange = (value) => {
        setNotes(value)
    }

    useEffect(() => {
        let mount = true;
        //get permission
        mount && updateDateValues()
        mount && getMediaList()
        return () => {
            mount = false;
        }
    }, [])
    useEffect(() => {
        getActionItems()
    }, [allowEdit])
    const getActionItems = async () => {
        let actionItems = new Array();
        const editPermission = await PermissionService.hasPermission(
            Permission.LEADS_EDIT
        );
        const deletePermission = await PermissionService.hasPermission(
            Permission.LEADS_DELETE
        );
        if (editPermission && !allowEdit) {
            actionItems.push(
                <MenuItem onPress={() => {
                    setEdit(true);
                    setVisible(true);
                  }}>
                    Edit
                  </MenuItem>
                  
            )
        }
        if(deletePermission){
            actionItems.push(
                <MenuItem onPress={() => {
                    setLeadDeleteModalOpen(true),
                    setVisible(true);
                  }}>
                    Delete
                  </MenuItem>
                  
            )
        }
        setActionList(actionItems)
    }


    const takePicture = async (e) => {
        setIsSubmit(true)
        const image = await Media.getImage();
        if (image && image.assets) {
            const response = await fetch(image.assets[0].uri);
            const blob = await response.blob();
            await Media.uploadImage(leadId ? leadId : details?.id, blob, image.assets[0].uri, ObjectName.LEAD, null, null, async (response) => {
                if (response) {
                    setIsSubmit(false)
                    getMediaList();
                }
            })
        }
    };


    const getMediaList = async () => {
        if (leadId || details?.id) {
            await mediaService.search(leadId ? leadId : details?.id, ObjectName.LEAD, (callback) => {
                setMediaData(callback.data.data);
                setTotalMedia(callback.data.totalCount);


            });
        }

    };


    const updateLead = async (values) => {
        setIsSubmit(true)
        if (details) {
            const updateData = {
                name: values?.name,
                date: DateTime.formatDate(selectedDate),
                mobile: values?.phone_number,
                notes: values?.notes ? values?.notes : notes ? notes : null,
                designation: values.designation,
                owner_id: values?.owner_id ? values?.owner_id : selectedUser,
                status: values?.status ? values?.status :  values?.status?.value,
            }
            await leadService.update(id, updateData, async (err, response) => {
                if (response) {
                    setIsSubmit(false)
                    navigation.navigate("Lead")
                }else{
                    setIsSubmit(false)
                }
            })
        } else {
            const createData = {
                name: values?.name,
                date: DateTime.formatDate(selectedDate),
                mobile: values?.phone_number,
                notes: values?.notes ? values?.notes : notes ? notes : null,
                designation: values.designation,
                owner_id: values?.owner_id ? values?.owner_id : selectedUser,
                status: values?.status ? values?.status : values?.status,
            }
            await leadService.create(createData, (err, response) => {
                if (response && response.data) {
                    setIsSubmit(false)
                    getMediaList(response.data.id)
                    setLeadId(response.data.id)
                    setActiveTab(TabName.ATTACHMENTS)
                }else{
                    setIsSubmit(false)
                }
            })
        }
    }
    const updateStatus = async () => {
        await leadService.updateStatus(leadId, null, (err, response) => {
            if (response) {
                navigation.navigate("Lead")
            }

        })
    }


    const leadDelete = async () => {
        if (details?.id) {
            leadService.delete(details?.id, (error, response) => {
                navigation.navigate("Lead")
            })
        }
    };
    const leadDeleteModalToggle = () => {
        setLeadDeleteModalOpen(!leadDeleteModalOpen);

    }

    return (
        <Layout
            title={details ? `Lead#: ${details?.id}` : !details && leadId ?  `Lead#: ${leadId}` : "New Lead"}
            buttonLabel={activeTab === TabName.ATTACHMENTS ? "Upload" : details ? allowEdit  ? "Save" : "" : "Next"}
            buttonOnPress={activeTab === TabName.ATTACHMENTS ? (e) => takePicture(e) : handleSubmit(values => { updateLead(values); })}
            FooterContent={!details && activeTab === TabName.ATTACHMENTS ? (<Button backgroundColor={Color.DONE_BUTTON} title={"Submit"}
                onPress={() => {

                    updateStatus()
                }}

            />) : ""}
            closeModal={visible}
            showActionMenu={activeTab === TabName.SUMMARY && details  && actionList && actionList.length > 0 ? true : false}
            actionItems={actionList}
            isSubmit = {isSubmit}



        >

             <DeleteConfirmationModal
                modalVisible={leadDeleteModalOpen}
                toggle={leadDeleteModalToggle}
                item={details?.id}
                updateAction={leadDelete}
                
                id={details?.id}

            />
            <ScrollView
                keyboardShouldPersistTaps="handled"
            >


                <View style={styles.container}>
                    {details && (
                        <View style={styles.tabBar}>
                            <Tab
                                title={
                                    [
                                        {
                                            title: TabName.SUMMARY,
                                            tabName: TabName.SUMMARY
                                        },
                                        {
                                            title: TabName.ATTACHMENTS,
                                            tabName: TabName.ATTACHMENTS
                                        },
                                    ]
                                }
                            setActiveTab={setActiveTab}
                            defaultTab={activeTab}
                            />
                        </View>
                    )}

                    {activeTab === TabName.SUMMARY && (

                        <View style={{ marginTop: 10, padding: 10 }}>
                            <DatePicker
                                title="Date"
                                onDateSelect={onDateSelect}
                                selectedDate={selectedDate ? selectedDate : details?.date}
                                required={true}
                                disabled={allowEdit}



                            />
                            <VerticalSpace10 />
                            <TextInput
                                title="Contact Person"
                                name="name"
                                control={control}
                                editable={allowEdit}
                                required
                            />
                            <VerticalSpace10 />
                            <TextInput
                                title="Designation"
                                name="designation"
                                control={control}
                                editable={allowEdit}
                                required
                            />

                            <VerticalSpace10 />
                            <PhoneNumber
                                title="Phone Number"
                                name="phone_number"
                                control={control}
                                onInputChange={handlePhoneNumberChange}
                                values={phoneNumber}
                                required={true}
                                editable={allowEdit}
                            />

                            <VerticalSpace10 />
                            {details && (
                                <><UserSelect
                                    label="Owner"
                                    selectedUserId={details?.owner_id}
                                    name={"owner_id"}
                                    onChange={(value) => setSelectedUser(value.value)}
                                    control={control}
                                    disable={!allowEdit}
                                    placeholder="Select Owner" /><VerticalSpace10 /></>
                            )}
                            {details && (
                                <><StatusSelect
                                    label={"Status"}
                                    name={"status"}
                                    onChange={handleStatusOnChange}
                                    control={control}
                                    object={ObjectName.LEAD}
                                    placeholder={"Select Status"}
                                    disable={!allowEdit}
                                    data={details?.status ? parseInt(details?.status) : status}
                                    currentStatusId={details?.status} /><VerticalSpace10 /></>
                            )
                            }



                            <TextArea
                                title="Notes"
                                name="notes"
                                placeholder="Notes"
                                control={control}
                                editable={allowEdit}
                                onInputChange={onNotesChange}
                            />
                        </View>
                    )}
                    {activeTab === TabName.ATTACHMENTS && (
                        <>
                            <MediaList
                                mediaData={MediaData}
                                getMediaList={getMediaList}
                            />
                        </>
                    )}

                </View>

            </ScrollView>
        </Layout>
    )

}
export default LeadForm;
