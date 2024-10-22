import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import EmailInput from "../../../components/CustomEmailInput";
import PhoneNumber from "../../../components/CustomPhoneNumberInput";
import TextInput from "../../../components/CustomTextInput";
import Form from "../../../components/Form";
import Layout from "../../../components/Layout";
import ContactService from "../../../services/ContactService";
import { MenuItem } from "react-native-material-menu";
import DeleteConfirmationModal from "../../../components/Modal/DeleteConfirmationModal";
import PermissionService from "../../../services/PermissionService";
import Permission from "../../../helper/Permission";

const ContactForm = (props) => {
  const isAddPage = props?.route?.params?.isAddPage || false;
  const item = props?.route?.params?.item || false;
  const [isDeleteModelOpen, setIsDeleteModelOpen] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [actionList, setActionList] = useState([]);
  const [allowEdit, setEdit] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    getActionItems();
  }, [allowEdit]);

  const formRef = useRef(null);

  const getActionItems = async () => {
    let actionItems = new Array();
    const editPermission = await PermissionService.hasPermission(
      Permission.CONTACT_EDIT
    );
    const deletePermission = await PermissionService.hasPermission(
      Permission.CONTACT_DELETE
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
    if (deletePermission) {
      actionItems.push(
        <MenuItem
          onPress={() => {
            setIsDeleteModelOpen(!isDeleteModelOpen);
          }}
        >
          Delete
        </MenuItem>
      );
    }
    setActionList(actionItems);
  };

  let navigation = useNavigation();
  const handleFormSubmit = async (values) => {
    setIsSubmit(true);
    const createData = new Object();
    let id = item?.id;
    createData.first_name = values.first_name ? values.first_name : "";
    createData.last_name = values.last_name ? values.last_name : "";
    createData.email = values.email ? values.email : "";
    createData.mobile = values.mobile ? values.mobile : "";
    createData.designation = values.designation ? values.designation : "";

    createData.work_phone = values.work_phone ? values.work_phone : "";

    if (isAddPage) {
      await ContactService.create(createData, (response) => {
        if (response) {
          setIsSubmit(false);
          navigation.navigate("ContactList");
        } else {
          setIsSubmit(false);
        }
      });
    } else {
      createData.id = item?.id;
      await ContactService.update(id, createData, (res) => {
        if (res) {
          setIsSubmit(false);
          navigation.navigate("ContactList");
        } else {
          setIsSubmit(false);
        }
      });
    }
  };

  let initialValues = {
    first_name: item?.first_name ? item?.first_name : "",
    last_name: item?.last_name ? item?.last_name : "",
    mobile: item?.mobile ? item?.mobile : "",
    email: item?.email ? item?.email : "",
    designation: item?.designation ? item?.designation : "",
    work_phone: item?.work_phone ? item?.work_phone : "",
  };

  const handleSumbmit = () => {
    if (formRef.current) {
      formRef.current.submitForm();
    }
  };

  const deleteToggle = () => {
    setIsDeleteModelOpen(!isDeleteModelOpen);
  };

  const contactDelete = async () => {
    if (item) {
      await ContactService.delete(item?.id, (response) => {
        navigation.navigate("ContactList");
      });
    }
  };

  return (
    <Layout
      title={isAddPage ? `Contacts Add` : `Contacts Detail`}
      buttonLabel={isAddPage ? "Add" : allowEdit ? "Save" : ""}
      buttonOnPress={handleSumbmit}
      showBackIcon={true}
      showActionMenu={!isAddPage && actionList && actionList.length > 0 ? true : false}
      actionItems={actionList}
      isSubmit={isSubmit}
      closeModal={visible}
    >
      <DeleteConfirmationModal
        modalVisible={isDeleteModelOpen}
        toggle={deleteToggle}
        updateAction={contactDelete}
        name={item?.name}
      />
      <Form
        initialValues={initialValues}
        enableReinitialize={true}
        onSubmit={handleFormSubmit}
        ref={formRef}
      >
        <TextInput
          name="first_name"
          label="First Name"
          required
          editable={allowEdit}
        />
        <TextInput name="last_name" label="Last Name" editable={allowEdit} />
        <EmailInput name="email" label="Email" editable={allowEdit} />
        <PhoneNumber name="mobile" label="Mobile" editable={allowEdit} />
        <PhoneNumber
          name="work_phone"
          label="Work Phone"
          editable={allowEdit}
        />
        <TextInput
          name="designation"
          label="Designation"
          editable={allowEdit}
        />
      </Form>
    </Layout>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: "white",
    width: "100%",
    borderColor: "gray",
    borderRadius: 8,
    minWidth: "100%",
  },
  input: {
    fontSize: 16,
    minHeight: 50,
    paddingLeft: 10,
  },
  errorText: {
    fontSize: 12,
    color: "red",
    marginTop: 5,
  },
});

export default ContactForm;
