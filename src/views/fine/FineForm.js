import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { useIsFocused } from "@react-navigation/native";
import { MenuItem } from "react-native-material-menu";

// Components
import Tab from "../../components/Tab";
import Layout from "../../components/Layout";
import DatePicker from "../../components/DatePicker";
import Currency from "../../components/Currency";
import UserSelect from "../../components/UserSelect";
import TagSelector from "../../components/TagSelector"
import TextArea from "../../components/TextArea";
import MediaList from "../../components/MediaList";
import NextButton from "../../components/NextButton";
import VerticalSpace10 from "../../components/VerticleSpace10";
import StatusSelect from "../../components/StatusSelect"
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";
import FileSelectModal from "../../components/FileSelectModal";

// Helpers
import TabName from '../../helper/Tab';
import Permission from "../../helper/Permission";
import { Tag } from "../../helper/Tag";
import Media from '../../helper/Media';
import ObjectName from "../../helper/ObjectName";

// Lib
import DateTime from "../../lib/DateTime";

// Services
import fineService from "../../services/FineService";
import mediaService from "../../services/MediaService";
import PermissionService from "../../services/PermissionService";
import Label from "../../components/Label";
import MediaCarousel from "../../components/MediaCarousel";
import StatusService from "../../services/StatusServices";
import asyncStorageService from "../../services/AsyncStorageService";
import HistoryList from "../../components/HistoryList";
import styles from "../../helper/Styles";

const FineForm = (props) => {
  let details = props?.route?.params?.item;
  let params = props?.route?.params;
  let id = details?.id
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState(TabName.SUMMARY);
  const [fineId, setFineId] = useState(details?.id || "");
  const [status, setStatus] = useState("");
  const [MediaData, setMediaData] = useState([]);
  const [selecteUser, setSelectedUser] = useState("");
  const [selectedType, setSelectedType] = useState(details?.typeId || "");
  const [totalMedia, setTotalMedia] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState("")
  const [actionList, setActionList] = useState([])
  const [allowEdit, setEdit] = useState(true);
  const [visible, setVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState(details?.id || "");
  const [fineDeleteModalOpen, setFineDeleteModalOpen] = useState("")
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState(details?.amount || "")
  const [selectedDueDate, setSelectedDueDate] = useState(details && new Date(details?.due_date) || new Date())
  const [historyPermission, setHistoryPermission] = useState("")
  const [isSubmit, setIsSubmit] = useState(false)

  const isFocused = useIsFocused();

  const navigation = useNavigation();

  useEffect(() => {
    getActionItems();
  }, [allowEdit])

  useEffect(() => {
    getActionItems();
    getPermission()
  }, [details])

  const onDateSelect = (value) => {
    setSelectedDate(new Date(value));
  }

  const onDueDateSelect = (value) => {
    setSelectedDueDate(new Date(value))
  }

  const handleStatusOnChange = (value) => {
    setStatus(value.value)
  }

  const amountOnchange = (value) => {
    setAmount(value)
  }

  const typeOnChange = (value) => {
    setSelectedType(value.value)
    setAmount(value?.default_amount)
  }

  const preloadedValues = {
    id: details?.id,
    user: details?.userId ? { label: details?.user, value: details?.userId } : "",
    date: details?.date ? details?.date : selectedDate,
    due_date: details?.due_date ? details?.due_date : selectedDueDate,
    notes: details?.notes || "",
    type: details && details?.typeId,
    reviewer: details?.reviewerId ? { label: details?.reviewer, value: details?.reviewerId } : ""
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

  useEffect(() => {
    let mount = true;
    //get permission
    mount && updateDateValues()
    return () => {
      mount = false;
    }
  }, [])

  useEffect(() => {
    let mount = true;
    if (fineId) {
      mount && getMediaList()

    }
    return () => {
      mount = false;
    }
  }, [])

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const getPermission = async () => {
    const isExist = await PermissionService.hasPermission(Permission.FINE_HISTORY_VIEW);
    setHistoryPermission(isExist)
  }

  const takePicture = async (e) => {
    const image = await Media.getImage();
    if (image && image.assets) {
      setIsSubmit(true)
      const response = await fetch(image.assets[0].uri);
      const blob = await response.blob();
      await Media.uploadImage(fineId ? fineId : details?.id, blob, image.assets[0].uri, ObjectName.FINE, null, null, async (response) => {
        if (response) {
          getMediaList();
          setIsSubmit(false)
        }
      })
    }
  };

  const uploadImage = async (e) => {
    const image = await Media.imageUpload();
    if (image && image.assets) {
      const response = await fetch(image.assets[0].uri);
      const blob = await response.blob();
      await Media.uploadImage(fineId ? fineId : details?.id, blob, image.assets[0].uri, ObjectName.FINE, null, null, async (response) => {
        if (response) {
          getMediaList();
        }
      })
    }
  };

  const getMediaList = async (id) => {
    await mediaService.search(fineId ? fineId : id, ObjectName.FINE, (callback) => {
      setMediaData(callback.data.data);
      setTotalMedia(callback.data.totalCount);


    });
  };

  const updateFineStatus = async (value) => {
    fineService.updateStatus(details.id, { status: value.statusId }, (err, response) => {
      if (response) {
        navigation.navigate("Fine")
      }

    })

  }
  const getActionItems = async () => {
    let actionItems = new Array();
    const editPermission = await PermissionService.hasPermission(Permission.FINE_EDIT);
    const deletePermission = await PermissionService.hasPermission(Permission.FINE_DELETE);
    const fineStatusUpdatePermission = await PermissionService.hasPermission(Permission.FINE_STATUS_UPDATE)
    let statusArray = [];
    let statusId = details && details?.statusId;
    const roleId = await asyncStorageService.getRoleId();

    let response = await StatusService.getNextStatus(statusId, null, (currentStatus) => {
      statusArray.push({
        label: currentStatus[0].name,
        value: currentStatus[0].status_id,
        id: currentStatus[0].status_id
      });
    });

    response && response.forEach((statusList) => {
      if (statusList.allowed_role_id && statusList.allowed_role_id.split(",").includes(roleId)) {
        statusArray.push({
          label: statusList.name,
          value: statusList.status_id,
          id: statusList.status_id
        });
      }
    });


    if (editPermission && !allowEdit) {
      actionItems.push(
        <MenuItem
          onPress={() => {
            setEdit(true);
            setVisible(false);
            setTimeout(() => setVisible(true), 0);
          }}
        >
          Edit
        </MenuItem>
      );
    }

    fineStatusUpdatePermission && statusArray.forEach(statusItem => {
      if (statusItem.id !== details?.statusId) {
        actionItems.push(
          <MenuItem key={statusItem.id} onPress={() => { setVisible(true), updateFineStatus({ statusId: statusItem.id }) }}>{statusItem.label}</MenuItem>
        );
      }
    });

    if (deletePermission) {
      actionItems.push(
        <MenuItem
          onPress={() => {
            setFineDeleteModalOpen(true);
            setVisible(false);
            setTimeout(() => setVisible(true), 0);
          }}
        >
          Delete
        </MenuItem>
      );
    }
    setActionList(actionItems);
  }

  const updateFine = async (values) => {
    setIsSubmit(true)
    const updateData = {
      user: selecteUser ? selecteUser : details?.userId,

      date: DateTime.formatDate(selectedDate),
      due_date: DateTime.formatDate(selectedDueDate),

      type: selectedType ? selectedType : details?.typeId,


      amount: amount ? amount : details?.amount,

      notes: values.notes,
      reviewer: selectedReviewer ? selectedReviewer : details?.reviewerId,
      objectName: params?.isBonusType ? ObjectName.BONUS : ObjectName.FINE,
    }

    const updateStatus = {
      status: status,
    }

    if (details) {
      await fineService.update(id, updateData, async (err, response) => {
        if (response) {
          if (details?.isBonusType) {
            setIsSubmit(false)
            navigation.navigate("Bonus");
          } else {
            setIsSubmit(false)
            navigation.navigate("Fine");
          }
        } else {
          setIsSubmit(false)
        }
        if (status) {
          await fineService.updateStatus(id, updateStatus, (err, response) => {
          })
        }
      })
    }

    else {
      fineService.create(updateData, (err, response) => {
        if (response && response.data) {
          getMediaList(response.data.id)
          setIsSubmit(false)
          setFineId(response.data.id)
          setActiveTab(TabName.ATTACHMENTS)
        } else {
          setIsSubmit(false)
        }
      })
    }
  }

  const fineDelete = async () => {
    if (selectedItem) {
      fineService.delete(selectedItem, (response) => {
        if (response) {
          navigation.navigate("Fine")
        }
      })
    }
  };

  const fineDeleteModalToggle = () => {
    setFineDeleteModalOpen(!fineDeleteModalOpen);
    setVisible(false);
  }

  let title = [
    {
      title: TabName.SUMMARY,
      tabName: TabName.SUMMARY
    },
  ]

  if (historyPermission) {
    title.push({
      title: TabName.HISTORY,
      tabName: TabName.HISTORY
    })
  }

  return (
    <Layout
      title={details?.isBonusType ? `Bonus#: ${details?.id}` : details ? `Fine#: ${details?.id}` : params?.isBonusType ? "Bonus" : "Fines"}
      showBackIcon={true}
      buttonLabel={activeTab === TabName.ATTACHMENTS ? "Upload" : details && allowEdit ? "Save" : !details ? "Add" : ""}
      buttonOnPress={activeTab === TabName.ATTACHMENTS ? () => { setModalVisible(true) } : handleSubmit(values => { updateFine(values); })}
      FooterContent={!details && activeTab === TabName.ATTACHMENTS ? <NextButton errors={errors} onPress={() => {
        navigation.navigate("Fine")
      }} /> : ""}
      showActionMenu={activeTab === TabName.SUMMARY && details && actionList && actionList.length > 0 ? true : false}
      actionItems={actionList}
      closeModal={visible}
      isSubmit={isSubmit}
    >
      <FileSelectModal
        isOpen={modalVisible}
        closeDrawer={toggleModal}
        takePhoto={() => {
          takePicture(),
            setModalVisible(false)
        }} uploadPhoto={() => { uploadImage(), setModalVisible(false) }}
      />

      <DeleteConfirmationModal
        modalVisible={fineDeleteModalOpen}
        toggle={fineDeleteModalToggle}
        item={selectedItem}
        updateAction={fineDelete}
        id={selectedItem}
      />

      {details && historyPermission && <View style={styles.tabBar}>
        <Tab
          title={title}
          setActiveTab={setActiveTab}
          defaultTab={activeTab}
        />
      </View>
      }

      {activeTab === TabName.SUMMARY && (
        <ScrollView
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ marginTop: 10, padding: 10 }}>
            <DatePicker
              title="Date"
              onDateSelect={onDateSelect}
              disabled={allowEdit}
              selectedDate={selectedDate ? selectedDate : details?.date}
            />
            <VerticalSpace10 />
            <UserSelect
              label="User"
              selectedUserId={details?.userId}
              name={"user"}
              showBorder={true}
              required
              onChange={(value) => setSelectedUser(value.value)}
              control={control}
              placeholder="Select User"
              disable={!allowEdit}
            />
            <VerticalSpace10 />
            <TagSelector
              label={"Type"}
              placeholder={"Select Type"}
              name="type"
              control={control}
              disable={!allowEdit}
              required
              onChange={typeOnChange}
              type={details && !details?.isBonusType ? Tag.FINE_TYPE : Tag.BONUS_TYPE}
              data={selectedType ? selectedType : details?.typeId}
            />
            <VerticalSpace10 />
            {details && (
              <><StatusSelect
                label={"Status"}
                name={"status"}
                onChange={handleStatusOnChange}
                control={control}
                object={params?.isBonusType ? ObjectName.BONUS : ObjectName.FINE}
                showBorder={true}
                placeholder={"Select Status"}
                data={details?.statusId ? Number(details?.statusId) : status}
                disable={allowEdit && details?.allow_edit == 1 ? false : true}
                currentStatusId={details?.statusId} />
                <VerticalSpace10 />
              </>
            )
            }
            <Currency
              name="amount"
              title={"Amount"}
              control={control}
              onInputChange={amountOnchange}
              edit={allowEdit}
              values={amount}
              required
              placeholder="Amount" />
            <VerticalSpace10 />
            <DatePicker
              title="Due Date"
              onDateSelect={onDueDateSelect}
              disabled={allowEdit}
              selectedDate={selectedDueDate ? selectedDueDate : details?.due_date}
            />
            <VerticalSpace10 />
            <UserSelect
              label="Reviewer"
              selectedUserId={details?.reviewer}
              name={"reviewer"}
              showBorder={true}
              required
              onChange={(value) => setSelectedReviewer(value.value)}
              control={control}
              placeholder="Select Reviewer"
              disable={!allowEdit}
            />
            <VerticalSpace10 />
            <TextArea
              title="Notes"
              name="notes"
              placeholder="Notes"
              editable={allowEdit}
              control={control}
            />
            <VerticalSpace10 />
            {details &&
              <>
                <Label text={"Attachments"} bold size={13} />
                <MediaCarousel
                  images={MediaData}
                  showAddButton={allowEdit ? true : false}
                  getMediaList={getMediaList}
                  handleAdd={() => allowEdit && setModalVisible(true)}
                  showDeleteButton={allowEdit ? true : false}
                />
              </>
            }

          </View>
        </ScrollView>
      )}

      {activeTab === TabName.ATTACHMENTS && (
        <>
          <MediaList
            mediaData={MediaData}
            getMediaList={getMediaList}
          />
        </>
      )}

      {activeTab === TabName.HISTORY && (
        <ScrollView>
          <HistoryList
            objectName={ObjectName.FINE}
            objectId={details?.id}
          />
        </ScrollView>
      )}
    </Layout>
  )
}
export default FineForm;
