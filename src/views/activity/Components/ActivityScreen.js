// Import React and Component
import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { MenuItem } from "react-native-material-menu";

// Components
import ActivitySelector from "../../../components/ActivityTypeSelector";
import AddButton from "../../../components/AddButton";
import DatePicker from "../../../components/DatePicker";
import Layout from "../../../components/Layout";
import DeleteConfirmationModal from "../../../components/Modal/DeleteConfirmationModal";
import Select from "../../../components/Select";
import UserSelect from "../../../components/UserSelect";
import VerticalSpace10 from "../../../components/VerticleSpace10";

// Helpers
import { Color } from "../../../helper/Color";
import Media from "../../../helper/Media";
import ObjectName from "../../../helper/ObjectName";
import Permission from "../../../helper/Permission";
import Status from "../../../helper/Status";
import TabName from "../../../helper/Tab";

// Lib
import Alert from "../../../lib/Alert";

// Services
import Attachment from "../../../components/Attachment";
import activityService from "../../../services/ActivityService";
import mediaService from "../../../services/MediaService";
import PermissionService from "../../../services/PermissionService";

const ActivityTypeScreen = (props) => {
  const params = props?.route?.params?.item;
  const [activeTab, setActiveTab] = useState(
    params ? TabName.GENERAL : TabName.TYPE
  );
  const [activityDetail, setActivityDetail] = useState(null);
  const [MediaData, setMediaData] = useState([]);
  const [activityId, setActivityId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activityTypeList, setActivityTypeList] = useState([]);
  const [startAt, setStartAt] = useState(null);
  const [completedAt, setCompletedAt] = useState(null);
  const [notesValue, setNotesValue] = useState(null);
  const [date, setDate] = useState(null);
  const [activityEditPermission, setActivityEditPermission] = useState(false);
  const [actionList, setActionList] = useState([]);
  const [visible, setVisible] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [manageOthers, setManageOthers] = useState("");
  const [isSubmit,setIsSubmit] = useState(false)
  const [allowEdit,setAllowEdit] = useState(true)
  const navigation = useNavigation();

  const isFocused = useIsFocused();

  useEffect(() => {
    getActivityDetail(activityId);
    getActivityTypeList();
    renderFieldValue();
    getMediaList();
    getPermissions();
  }, [isFocused, activityId, props]);

  useEffect(() => {
    renderFieldValue();
    getPermissions();
  }, [isFocused, activityDetail, activityEditPermission]);

  const deleteModalToggle = () => {
    setDeleteModalOpen(!deleteModalOpen);
    setVisible(false);
  };

  const getPermissions = async () => {
  const editPermission = await PermissionService.hasPermission(Permission.ACTIVITY_EDIT);
  const deletePermission = await PermissionService.hasPermission(Permission.ACTIVITY_DELETE);
  const manageOthers = await PermissionService.hasPermission(Permission.ACTIVITY_MANAGE_OTHERS);

  let permission = activityDetail?.allowEdit === 1 && editPermission === true;
  setActivityEditPermission(permission)
  let actionItems = new Array();
  if(params && editPermission === true){
    actionItems.push(
      <MenuItem
        onPress={() => {
          setAllowEdit(true);
          setVisible(false);
          setTimeout(() => setVisible(true), 0);
        }}
      >
        Edit
      </MenuItem>
    );
  }

  if (deletePermission === true) {
    actionItems.push(
      <MenuItem
        onPress={() => {
          setDeleteModalOpen(true);
          setVisible(false);
          setTimeout(() => setVisible(true), 0);
        }}
      >
        Delete
      </MenuItem>
    );
  }
  setActionList(actionItems);
  setManageOthers(manageOthers);
};


  const getActivityDetail = async (id) => {
    await activityService.get(
      activityId ? activityId : params?.id ? params?.id : id,
      (err, response) => {
        if (response && response?.data) {
          setActivityDetail(response?.data);
        }
      }
    );
  };

  const getActivityTypeList = () => {
    let activityList = new Array();
    activityService.getActivityType((error, response) => {
      let activityTypeList = response?.data?.data;
      for (let i = 0; i < activityTypeList.length; i++) {
        activityList.push({
          value: activityTypeList[i].id,
          label: activityTypeList[i].name,
          type: activityTypeList[i].type,
        });
      }
      setActivityTypeList(activityList);
    });
  };

  const renderFieldValue = () => {
    if (activityDetail?.started_at) {
      setStartAt(activityDetail?.started_at);
    }

    if (activityDetail?.completed_at) {
      setCompletedAt(activityDetail?.completed_at);
    }

    if (params && params?.id) {
      setActivityId(params?.id);
    }

    if (activityDetail?.notes) {
      setNotesValue(activityDetail?.notes);
    }

    if (activityDetail?.date) {
      setDate(activityDetail?.date);
    }
  };

  const getMediaList = async (id) => {
    if (activityId || id) {
      await mediaService.search(
        activityId ? activityId : id,
        ObjectName.ACTIVITY,
        (callback) => {
          if (callback?.data?.data && callback?.data?.data.length > 0) {
            setMediaData(callback.data.data);
          } else {
            setMediaData([]);
          }
        }
      );
    }
  };

  const onActivityPress = async (activityValue) => {
    handleActivityCreate(activityValue)
  };

  const handleActivityCreate = async (activityValue) => {
    const media = await Media.getImage();
    const response = await fetch(media.assets[0].uri);
    let blob = await response.blob();
    if (media && media.canceled !== true) {
      if (activityValue) {
        let data = {};

        data.activity = activityValue?.label ? activityValue?.label : "";
        data.activity_type = activityValue?.type ? activityValue?.type : "";
        data.activity_type_id = activityValue?.value ? activityValue?.value : "";

        activityService.create(data, async (err, activityResponse) => {
          if (activityResponse) {
            setActivityId(activityResponse.data.activity_id);
            getMediaList(activityResponse.data.activity_id);
            setActiveTab(TabName.GENERAL);
            getActivityDetail(activityResponse.data.activity_id);
            await Media.uploadImage(
              activityResponse.data.activity_id,
              blob,
              media.assets[0].uri,
              ObjectName.ACTIVITY,
              null,
              null,
              async (response) => {
                if (response) {
                  getMediaList(activityId ? activityId : activityResponse.data.activity_id);
                }
              }
            );
          }
        });
      }
    }
  }



  const handleComplete = async () => {
    setIsSubmit(true)
    activityService.updateStatus(activityId, {}, (err, response) => {
      if (response) {    
        setIsSubmit(false)

        navigation.navigate("ActivityList");
      }else{
        setIsSubmit(false)

      }
    });
  };

  const preloadedValues = {
    notes: notesValue,
    started_at: startAt,
    completed_at: completedAt,
    activity: activityDetail?.activity_type_id,
    date: date,
    user: activityDetail?.user_id,
    status: parseInt(activityDetail?.status),
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: preloadedValues,
  });

  const updateActivity = (values) => {
    setIsSubmit(true)        
    const updateData = {
      activity: values?.activity?.label
        ? values?.activity?.label
        : activityDetail?.activity,
      activity_type: values?.activity?.type
        ? values?.activity?.type
        : activityDetail?.activity_type,
      activity_type_id: values?.activity?.value
        ? values?.activity?.value
        : activityDetail?.activity_type_id,
      notes: notesValue ? notesValue : "",
      started_at: startAt ? startAt : "",
      completed_at: completedAt ? completedAt : "",
      date: date ? date : "",
      owner : values?.user?.value ?  values?.user?.value : activityDetail?.user_id
    }; 

    activityService.update(activityId, updateData, (err, response) => {
      if (response) {
        setIsSubmit(false)
        navigation.navigate("ActivityList");
      }else{
        setIsSubmit(false)
      }
    });
  };

  const onCompletedAtChange = (value) => {
    setCompletedAt(new Date(value));
  };


  const onDateChange = (value) => {
    setDate(new Date(value));
  };

  const handleDelete = async () => {
    if (activityId) {
      activityService.delete(activityId, (error, response) => {
        navigation.navigate("ActivityList");
      });
    }
  };

  let isDetailPage = props?.route?.params?.isDetailPage == true ? true : false;


  return (
    <Layout
      title={
        activeTab == "Type" ? "Select Activity Type" : `Activity# ${activityId}`
      }
      HideSideMenu={false}
      emptyMenu={false}
      defaultFooter={true}
      showBackIcon={true}
      backButtonNavigationUrl={"ActivityList"}
      buttonLabel={params && activeTab === TabName.GENERAL && allowEdit && "Save"}
      isSubmit = {isSubmit}
      buttonOnPress={ handleSubmit((values) => {
        updateActivity(values);
      })}
      backButtonNavigationOnPress={() => {
        if (activeTab === TabName.GENERAL) {
          setActiveTab(TabName.TYPE);
        }
      }}
      showActionMenu={
        activeTab === TabName.TYPE
          ? false
          : actionList && actionList.length > 0 && true
      }
      closeModal={visible}
      actionItems={actionList}
      FooterContent={
        (activeTab === TabName.COMMENT &&
          activityEditPermission &&
          props?.route?.params?.item?.statusGroup == Status.GROUP_PENDING) ||
        (props?.route?.params?.isAddPage == true &&
          activeTab === TabName.COMMENT) ||
        (props?.route?.params?.isAddPage == true &&
          activeTab === TabName.GENERAL) ||
        (activeTab === TabName.GENERAL &&
          activityEditPermission &&
          props?.route?.params?.item?.statusGroup == Status.GROUP_PENDING) ? (
          <View>
           
              <AddButton
                color={Color.GREEN}
                label="Complete"
                isSubmit = {isSubmit}
                onPress={() => {
                  if (MediaData && MediaData.length > 0) {
                    handleComplete();
                    handleSubmit((values) => {
                      updateActivity(values);
                    })
                  } else {
                    setIsSubmit(false)
                    Alert.Error("Image Is Required");
                  }
                }}
              />
            </View>
        ) : (
          ""
        )
      }
    >
    
      <DeleteConfirmationModal
        modalVisible={deleteModalOpen}
        toggle={deleteModalToggle}
        item={activityId}
        updateAction={handleDelete}
        id={activityId}
      />
      {activeTab == TabName.TYPE && (
        <ActivitySelector onPress={onActivityPress} />
      )}
      {activeTab == TabName.GENERAL && (
        <>
          <ScrollView>
            <VerticalSpace10 />
            {isDetailPage && (
              <>
                <DatePicker
                  name="date"
                  title="Date"
                  onDateSelect={onDateChange}
                  onClear={() => onDateChange("")}
                  selectedDate={date ? new Date(date) : null}
                  disabled={params ? allowEdit : false }
                />
                <VerticalSpace10 />
                {manageOthers && (
                  <UserSelect
                    label="Owner"
                    name={"user"}
                    selectedUserId={activityDetail?.user_id}
                    control={control}
                    placeholder="Select Owner"
                    disable={!allowEdit}
                  />
                )}
                <VerticalSpace10 />
              </>
            )}
            <Select
              label={"Activity"}
              name="activity"
              options={activityTypeList}
              data={activityDetail?.activity_type_id}
              control={control}
              placeholder="Select Activity"
              disable={!allowEdit}
            />
            <VerticalSpace10 />
            {params?.completed_at && (
              <DatePicker
                name="completed_at"
                title="Completed At"
                displayFormat={"DD-MMM-YYYY hh:mm A"}
                onDateSelect={onCompletedAtChange}
                onClear={() => onCompletedAtChange("")}
                selectedDate={completedAt ? new Date(completedAt) : null}
                disabled={params ? allowEdit : false }
              />
            )}
            <VerticalSpace10 />
                  <Attachment
                    showPhoto
                    showVideo
                    showAudio
                    objectId={activityId}
                    objectName={ObjectName.ACTIVITY}
                    showAddButton={
                      props?.route?.params?.isAddPage == true
                        ? true
                        : allowEdit
                    }
                    showDeleteButton={
                      props?.route?.params?.isAddPage == true
                        ? true 
                        : allowEdit
                    }
                />

          <VerticalSpace10 />

          </ScrollView>
        </>
      )}
     
    </Layout>
  );
};

export default ActivityTypeScreen;
