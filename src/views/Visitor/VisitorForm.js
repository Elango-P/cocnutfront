import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native";
import { MenuItem } from "react-native-material-menu";
import { KeyboardAvoidingView, Platform, View } from "react-native";

// Components
import Layout from "../../components/Layout";
import TextInput from "../../components/TextInput";
import PhoneNumber from "../../components/PhoneNumber";
import TextArea from "../../components/TextArea";
import TagSelector from "../../components/TagSelector";
import VerticalSpace10 from "../../components/VerticleSpace10";
import DatePicker from "../../components/DatePicker";
import Tab from "../../components/Tab";
import HistoryList from "../../components/HistoryList";
import UserSelect from "../../components/UserSelect";
import Media from "./Media";

// Services
import mediaService from "../../services/MediaService";
import VisitorService from "../../services/VisitorService";
import settingService from "../../services/SettingService";
import PermissionService from "../../services/PermissionService";

// Helpers
import ObjectName from "../../helper/ObjectName";
import { Tag } from "../../helper/Tag";
import Permission from "../../helper/Permission";
import { keyboardVerticalOffset } from "../../helper/keyboardVerticalOffset";
import styles from "../../helper/Styles";
import TabName from "../../helper/Tab";
// lib
import Setting from "../../lib/Setting";
import DateTime from "../../lib/DateTime";
import NetworkStatus from "../../lib/NetworkStatus";
import Select from "../../components/Select";
import JobsService from "../../services/JobService";
import VisitorType from "../../helper/VisitorType";


const VisitorForm = (props) => {
  const params =
    props && props?.route && props?.route?.params && props?.route?.params?.item;
  const [phoneNumber, setPhoneNumber] = useState(params?.phone || "");
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [editPermission, setEditPermission] = useState();
  const [selectedType, setSelectedType] = useState("");
  const [selecteUser, setSelectedUser] = useState("");
  const [allowEdit, setEdit] = useState(true);
  const [actionList, setActionList] = useState([]);
  const [visible, setVisible] = useState(false);
  const [visitorTitle, setVisitorTitle] = useState("");
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState(TabName.SUMMARY);
  const [historyPermission, setHistoryPermission] = useState("");
  const [isSubmit,setIsSubmit] = useState(false)
    
    useEffect(() => {
        getVisitorType()
    }, [props])

  useEffect(() => {
    getPermission();
  }, []);

    useEffect(() => {
        getActionItems();
    }, [allowEdit])

  const preloadedValues = {
    name: params?.name,
    phone_number: params?.phone,
    purpose: params?.purpose,
    notes: params?.notes,
    type: params?.type,
    title: params?.title,
    person_to_meet: params?.person_to_meet,
    position : params?.position
  }
  const getVisitorType = async () => {
    await settingService.getByName(
      Setting.VISITOR_SHOW_TITLE,
      (err, response) => {
        setVisitorTitle(response)
      }
    );
  };

  const getPermission = async () => {
    const isExist = await PermissionService.hasPermission(
      Permission.VISITOR_HISTORY_VIEW
    );
    setHistoryPermission(isExist);
  };


  const getActionItems = async () => {
    let actionItems = new Array();
    const editPermission = await PermissionService.hasPermission(
      Permission.VISITOR_EDIT
    );
    if (editPermission && !allowEdit) {
      actionItems.push(
        <MenuItem
          onPress={() => {
            setEdit(true), setVisible(true);
          }}
        >
          Edit
        </MenuItem>
      );
    }
    setActionList(actionItems);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: preloadedValues,
  });

  const handlePhoneNumberChange = (value) => {
    setPhoneNumber(value);
  };

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

            data.append("object", ObjectName.VISITOR);

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
                      setIsSubmit(false)
                        navigation.navigate("Visitor")
                    })
                }
                //reset the state
                setFile("");
                setImage("");
            })
        } else {
        }
    }

    const createVisitor = (values) => {
      try{
      setIsSubmit(true)
        let data = new FormData()

        let mediaFile = {
            type: file?._data?.type,
            size: file?._data.size,
            uri: image,
            name: file?._data.name
        }
        data.append("name", values && values?.name ? values?.name : "")
        data.append("mobileNumber", values && values?.phone_number ? values?.phone_number : "")
        data.append("purpose", values && values?.purpose ? values?.purpose : "")
        data.append("title", values && values?.title ? values?.title : "")
        data.append("notes", values && values?.notes ? values?.notes : "")
        data.append("name", values && values?.name ? values?.name : "")
        data.append("type", values && values?.type ? values?.type?.id : "")
        data.append("person_to_meet", values && values?.person_to_meet ? values?.person_to_meet?.value : "")
        data.append("position", values && values?.position ? values?.position : "")


        !params && data.append("media_file", file !== null ? mediaFile : "")

        let updateData = new Object()
        updateData.name = values.name
        updateData.phone = values?.phone_number
        updateData.purpose = values?.purpose
        updateData.title = values?.title
        updateData.notes = values?.notes
        updateData.type = values?.type?.id
        updateData.person_to_meet = values?.person_to_meet?.value
        updateData.position = values && values?.position && values?.position


        if (params) {          
            VisitorService.update(params?.id, updateData, (response) => {                         
                if (response?.data) {
                    if (file) {
                        uploadImage(params?.id)
                    } else {
                        setIsSubmit(false)
                        navigation.navigate("Visitor")

                    }
                }else{
                  setIsSubmit(false)
                }
            })
        } else {
            VisitorService.create(data, (err,response) => {                                                         
               if(response){
                  setIsSubmit(false)
                  navigation.navigate("Visitor")

                }else{
                  setIsSubmit(false)

               } 
            })
        }
        
      }
      catch (err) {
        console.log(err);
        setIsSubmit(false)
        return callback(err, null)
      }
    }

  let title = [];

  if (params) {
    title.push({
      title: TabName.SUMMARY,
      tabName: TabName.SUMMARY,
    });
  }

  if (params && historyPermission) {
    title.push({
      title: TabName.HISTORY,
      tabName: TabName.HISTORY,
    });
  }

  return (
    <Layout
      title={params ? "Visitor Detail" : " New Visitor "}
      showBackIcon
      buttonLabel={
        params
          ? allowEdit && activeTab === TabName.SUMMARY
            ? "Save"
            : ""
          : "Add"
      }
      buttonOnPress={handleSubmit((values) => {
        createVisitor(values);
      })}
      showActionMenu={
        activeTab === TabName.SUMMARY &&
        params &&
        !allowEdit &&
        actionList &&
        actionList.length > 0
          ? true
          : false
      }
      actionItems={actionList}
      closeModal={visible}
      isSubmit = {isSubmit}
    >
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
        <>
          <ScrollView automaticallyAdjustKeyboardInsets={true}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "position" : "position"}
              keyboardVerticalOffset={keyboardVerticalOffset()}
            >
              <View style={{ marginTop: 10, padding: 10 }}>
                <Media
                  image={image ? image : ""}
                  allowCamera
                  allowEdit={allowEdit}
                  prefillImage={params?.media_url}
                  setImage={setImage}
                  setFile={setFile}
                />

                {params && (
                  <>
                    <DatePicker
                      title="Date"
                      selectedDate={DateTime.getDate(params?.created_at)}
                      disabled={false}
                    />
                    <VerticalSpace10 />
                  </>
                )}
                <TagSelector
                  label={"Visitor Type"}
                  placeholder={"Select Visitor Type"}
                  name="type"
                  control={control}
                  required
                  disable={!allowEdit}
                  onChange={(value) =>
                    setSelectedType(value)
                  }
                  type={Tag.VISITOR_TYPE}
                  data={
                    selectedType == ""
                      ? selectedType?.value
                      : selectedType?.value
                      ? selectedType?.value
                      : params?.type
                  }
                />
                <VerticalSpace10 />
                {(selectedType?.label === VisitorType.INTERVIEW_CANDIDATE_TEXT) && (
                  <>
                   <TextInput
                  title="Position"
                  name="position"
                  editable={allowEdit}
                  control={control}
                  required
                />
                
                  <VerticalSpace10 />
                  </>
                )}
               
               {(params?.typeName === VisitorType.INTERVIEW_CANDIDATE_TEXT) && (!selectedType) && (
                  <>
                <TextInput
                  title="Position"
                  name="position"
                  editable={allowEdit}
                  control={control}
                  required
                />
                  <VerticalSpace10 />
                  </>
                )}
               
                <TextInput
                  title="Name"
                  name="name"
                  editable={allowEdit}
                  control={control}
                  required
                />
                <VerticalSpace10 />
                {visitorTitle && visitorTitle.includes(selectedType) && (
                  <>
                    <TextInput
                      title="Title"
                      name="title"
                      control={control}
                      editable={allowEdit}
                      required
                    />
                    <VerticalSpace10 />
                  </>
                )}

                <UserSelect
                  label="Person To Meet"
                  selectedUserId={params?.person_to_meet}
                  name={"person_to_meet"}
                  required
                  onChange={(value) => setSelectedUser(value.value)}
                  control={control}
                  placeholder="Select Person To Meet"
                  disable={!allowEdit}
                />
                <VerticalSpace10 />

                <PhoneNumber
                  title="Phone Number"
                  name="phone_number"
                  control={control}
                  values={phoneNumber}
                  onInputChange={handlePhoneNumberChange}
                  editable={allowEdit}
                  required={true}
                />
                <VerticalSpace10 />
                <TextInput
                  title="Purpose"
                  name="purpose"
                  control={control}
                  editable={allowEdit}
                  required={true}
                />
                <VerticalSpace10 />

                <TextArea
                  name="notes"
                  title="Notes"
                  placeholder="Notes"
                  control={control}
                  editable={allowEdit}
                />
                <VerticalSpace10 paddingBottom={70} />
              </View>
            </KeyboardAvoidingView>
          </ScrollView>
        </>
      )}

      {activeTab === TabName.HISTORY && (
        <ScrollView>
          <HistoryList objectName={ObjectName.VISITOR} objectId={params?.id} />
        </ScrollView>
      )}
    </Layout>
  );
};
export default VisitorForm;
