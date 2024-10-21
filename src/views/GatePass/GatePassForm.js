import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import { useForm } from "react-hook-form";
import TextArea from "../../components/TextArea";
import ObjectName from "../../helper/ObjectName";
import { useNavigation } from "@react-navigation/native";
import { View } from "react-native";
import Media from "../Visitor/Media";
import mediaService from "../../services/MediaService";
import { ScrollView } from "react-native";
import VerticalSpace10 from "../../components/VerticleSpace10";
import GatePassService from "../../services/GatePassService";
import UserSelect from "../../components/UserSelect"
import PermissionService from "../../services/PermissionService";
import Permission from "../../helper/Permission";
import { MenuItem } from "react-native-material-menu";
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";
import gatePassService from "../../services/GatePassService";


const GatePassMedia = (props) => {
    const params = props?.route?.params?.item
    const [image, setImage] = useState(null);
    const [file, setFile] = useState(null);
    const [selecteUser, setSelectedUser] = useState("");
    const [gatePassDeleteModalOpen, setGatePassDeleteModalOpen] = useState(false)
    const [actionList, setActionList] = useState([])
    const [selectedItem, setSelectedItem] = useState(params?.id || "");
    const [allowEdit,setEdit] = useState(true)
    const [visible, setVisible] = useState(false)
    const [isSubmit,setIsSubmit] = useState(false)





    const navigation = useNavigation()

    useEffect(() => {
        getActionItems()
    }, [allowEdit])

    const preloadedValues = {
        notes: params?.notes,
        owner_id : selecteUser
    }

   

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: preloadedValues
    });



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

            data.append("object", ObjectName.GATE_PASS);

            data.append("object_id", id);

            data.append("media_url", image);

            data.append("media_visibility", 1);

            data.append("feature", 1);

            mediaService.uploadMedia(navigation, data, async (error, response) => {
                if (response) {
                    let data = {
                        media_id: response.id
                    }
                    await VisitorService.update(id, data, (response) => {
                        navigation.navigate("GatePass")
                    })
                }
                //reset the state
                setFile("");
                setImage("");
            })
        } else {
        }
    }



    const createGatePass = async (values) => {
        setIsSubmit(true)
        let data = new FormData()
        let mediaFile = {
            type: file?._data?.type,
            size: file?._data.size,
            uri: image,
            name: file?._data.name
        }
        data.append("notes", values && values?.notes ? values?.notes : "")
        data.append("owner_id", values && values?.owner_id?.value ? values?.owner_id?.value : "")
        !params && data.append("media_file", file !== null ? mediaFile : "")

        let updateData = new Object()
        updateData.notes = values?.notes
        updateData.owner_id = values?.owner_id?.value


        if (params) {
            await GatePassService.update(params?.id, updateData, (err,response) => {
                if (response) {
                    setIsSubmit(false)
                    if (file) {
                        uploadImage(params?.id)
                    } else {
                        setIsSubmit(false)
                        navigation.navigate("GatePass")

                    }
                }else{
                    setIsSubmit(false)
                }
            })
        } else {
            await GatePassService.create(data, (err, response) => {
                if (response) {
                    setIsSubmit(false)
                    navigation.navigate("GatePass")
                }else{
                    setIsSubmit(false)
                }
            })
        }
    }
    const getActionItems = async () => {
        let actionItems = new Array();
        const deletePermission = await PermissionService.hasPermission(
            Permission.GATE_PASS_DELETE
        );
        const editPermission = await PermissionService.hasPermission(
            Permission.GATE_PASS_EDIT
        );
        if (deletePermission) {
            actionItems.push(
                <MenuItem onPress={() => {setGatePassDeleteModalOpen(true),setVisible(true)}}>
                    Delete
                </MenuItem>
            )
        }
        if (editPermission && !allowEdit) {
            actionItems.push(
                <MenuItem onPress={() => {setEdit(true),setVisible(true)}}>
                    Edit
                </MenuItem>
            )
        }
        setActionList(actionItems)
    }
    const gatePassDeleteModalToggle = () => {
        setGatePassDeleteModalOpen(!gatePassDeleteModalOpen);
    }
     const Delete = async () => {
        if (selectedItem) {
            gatePassService.delete(selectedItem, (error, response) => {
                navigation.navigate("GatePass");
            })
        }
    };
    


    return (
        <Layout
            title={params ? "Gate Pass Detail" : " Gate Pass "}
            showBackIcon
            buttonLabel={params && allowEdit ? "Save" : !params ? "Add" : ""}
            buttonOnPress={handleSubmit(values => { createGatePass(values) })} 
            showActionMenu={params && actionList && actionList.length > 0 ? true : false}
            actionItems={actionList}
            closeModal={visible}
            isSubmit = {isSubmit}

        >
            <DeleteConfirmationModal
                modalVisible={gatePassDeleteModalOpen}
                toggle={gatePassDeleteModalToggle}
                item={selectedItem}
                updateAction={Delete}
                
                id={selectedItem}

            />
            <ScrollView>
                <View style={{ marginTop: 10, padding: 10 }}>
                    <Media upload image={image ? image : ""} prefillImage={params?.media_url} setImage={setImage} setFile={setFile} />
                        
                    <TextArea
                        name="notes"
                        title="Notes"
                        placeholder="Notes"
                        control={control}
                        editable={allowEdit}
                    />
                    {params && (
                        <>
                        <VerticalSpace10/>
                    <UserSelect
                        label="Owner"
                        selectedUserId={params?.owner_id}
                        name={"owner_id"}
                        onChange={(value) => setSelectedUser(value.value)}
                        control={control}
                        placeholder="Select Owner"
                        disable={!allowEdit}
                        

                    />
                    </>
                    )}
                </View>
            </ScrollView>
        </Layout>
    )

}
export default GatePassMedia