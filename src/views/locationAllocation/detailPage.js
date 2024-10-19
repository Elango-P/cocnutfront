import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import LocationAllocationUserService from '../../services/LocationAllocationUserService';
import shiftService from '../../services/ShiftService';
import storeService from '../../services/StoreService';
import {
  Image,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import ArrayList from '../../lib/ArrayList';
import userService from '../../services/UserService';
import String from '../../lib/String';
import UserAvatar from 'react-native-user-avatar';
import { Color } from '../../helper/Color';
import Status from '../../helper/LocationAllocationUser';
import DropDownMenu from '../../components/DropDownMenu';
import { MenuItem } from 'react-native-material-menu';
import CoreModal from '../../components/Modal';
import { useForm } from 'react-hook-form';
import ShareModal from "./components/ShareModal";
import Number from '../../lib/Number';
import UserSelect from '../../components/UserSelect';
import Table, { Column } from '../../components/Table';
import { endpoints } from '../../helper/ApiEndPoint';
import UserCard from '../../components/UserCard';

const LocationAllocationUserPage = (props) => {
  let data = props?.route?.params?.item;
  const [detail, setDetail] = useState([]);
  const [shiftList, setShiftList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [allowedShiftIds, setAllowedShiftIds] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [rowValue, setRowValue] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    getDetail();
    getShiftList();
    getLocationList();
    getUserList();
  }, []);

  const getDetail = async () => {
    await LocationAllocationUserService.search(
      { location_allocation_id: data?.id },
      (err, res) => {
        setDetail(res && res?.data && res?.data?.data);
      }
    );
  };

  const getShiftList = async () => {
    await shiftService.getShiftList({}, (err, res) => {
      setShiftList(res && res?.data && res?.data?.data);
    });
  };

  const getLocationList = async () => {
    await storeService.list({ type: 3 }, (error, res) => {
      let shiftIds = [];
      if (res && res?.data?.data && res?.data?.data.length > 0) {
        for (let i = 0; i < res?.data?.data.length; i++) {
          const { allowedShift } = res?.data?.data[i];
          let allowedShiftIds = allowedShift ? allowedShift?.split(',') : [];
          shiftIds.push(...allowedShiftIds);
        }
      }
      setAllowedShiftIds(shiftIds);
      setLocationList(res && res?.data && res?.data?.data);
    });
  };

  const getUserList = async () => {
    await userService.list({}, (list) => {
      setUserList(list);
    });
  };

  let handleStatusChange = async (location, shift, status) => {
    let objValue = {};
    objValue.location_allocation_id = data?.id;
    objValue.location_id = location?.id;
    objValue.shift_id = shift?.id;
    objValue.status = status;
    await LocationAllocationUserService.updateStatus(objValue, (err, res) => {
      getDetail();
    });
  };

  const handleUserSelect = async (location, shift, selectedUser) => {
    let objData = new Object();
    objData.location_allocation_id = data?.id;
    objData.location_id = location?.id;
    objData.shift_id = shift?.id;
    objData.user_id = selectedUser ? selectedUser : null;
    await LocationAllocationUserService.create(objData, (error, res) => {
      getDetail();
      setRowValue({});
      reset()
      setIsOpen(false);
    });
  };

  let isValidate = (location, shift) => {
    let isAllowedShift = location?.allowedShift?.includes(
      shift?.id?.toString()
    );
    return isAllowedShift;
  };

  let isRecord = (location, shift) => {
    let isDetail =
      (ArrayList.isArray(detail) &&
        detail.find(
          (data) =>
            data.location_id === location.id &&
            data.shift_id === shift.id &&
            data.user_id !== null
        )) ||
      null;
    return isDetail ? true : false;
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { user: "" },
  });

  const renderUserDetail = (location, shift) => {
    let isDetail =
      (ArrayList.isArray(detail) &&
        detail.find(
          (data) =>
            data.location_id === location.id && data.shift_id === shift.id
        )) ||
      null;
    let userValue =
      (ArrayList.isArray(userList) &&
        userList.find((data) => data?.id == isDetail?.user_id)) ||
      null;

    let isPendingStatus =
      isDetail && isDetail?.status === Status.STATUS_PENDING ? true : false;

    return isRecord(location, shift) ? (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View>
          {userValue?.image ? (
            <Image
              source={{ uri: userValue?.image }}
              style={styles.avatarStyle}
            />
          ) : (
            <UserAvatar
              size={55}
              style={{ width: 50, height: 50, borderRadius: 25 }}
              name={String.concatName(
                userValue?.firstName,
                userValue?.lastName
              )}
              bgColor={Color.PRIMARY}
            />
          )}
        </View>
        <View
          style={styles.userDetailTextContainer}
        >
          <View style={{ width: 100, }}>
            <Text numberOfLines={2} ellipsizeMode="tail" style={styles.userName}>
              {String.concatName(userValue?.firstName, userValue?.lastName)}
            </Text>
            {isPendingStatus && (
              <Text style={styles.pendingStatus}>
                ({Status.STATUS_PENDING_TEXT})
              </Text>
            )}
          </View>
          <View>
            <DropDownMenu
              menuStyle={styles.dropdownMenu}
              MenuItems={[
                <>
                  {!isPendingStatus && (
                    <MenuItem
                      onPress={() => {
                        handleStatusChange(
                          location,
                          shift,
                          Status.STATUS_PENDING
                        );
                      }}
                    >
                      Pending
                    </MenuItem>
                  )}
                  {isPendingStatus && (
                    <MenuItem
                      onPress={() => {
                        handleStatusChange(
                          location,
                          shift,
                          Status.STATUS_CONFIRMED
                        );
                      }}
                    >
                      Confirmed
                    </MenuItem>
                  )}
                  <MenuItem
                    onPress={() => {
                      handleUserSelect(location, shift, null);
                    }}
                  >
                    Remove
                  </MenuItem>
                  <MenuItem
                    onPress={() => {
                      setIsOpen(true);
                      setRowValue({ location, shift });
                    }}
                  >
                    Change
                  </MenuItem>
                </>,
              ]}
              onPress={{}}
            />
          </View>
        </View>
      </View>
    ) : (
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => {
          setIsOpen(true),
            setRowValue({
              location,
              shift,
              isAdd: true,
            });
        }}
      >
        <Text style={styles.selectButtonText}>Select</Text>
      </TouchableOpacity>
    );
  };

  const filteredUserList =
  ArrayList.isArray(userList) &&
  userList.filter(
    (obj) => !detail?.map((data) => data?.user_id)?.includes(obj?.id)
  );

  let modelBody = (
    <View style={{ marginBottom: 20, marginTop: 10 }}>
      <UserSelect
        label="User"
        name={"user"}
        showBorder={true}
        control={control}
        placeholder="Select User"
        customOption={filteredUserList}
      />
    </View>
  );

  const filteredShifts =
    ArrayList.isArray(shiftList) &&
    shiftList?.filter((shift) =>
      allowedShiftIds?.includes(shift?.id?.toString())
    );

  const buttonOnPress = () => {
    setModalVisible(!modalVisible);
  }


  return (
    <Layout title={`${data?.date}${Number.isNotNull(data?.statusName) ? `-${data?.statusName}` : ""}`} showBackIcon buttonLabel={"Share"} buttonOnPress={() => buttonOnPress()} >
      <ShareModal
        visible={modalVisible}
        onClose={buttonOnPress}
        filteredShifts={filteredShifts}
        locationList={locationList}
        date={data?.date}
        isRecord={isRecord}
        detail={detail}
        userList={userList}
      />
      <CoreModal
        modalVisible={isOpen}
        transparent={true}
        animationType='slide'
        toggle={() => {
          setIsOpen(false);
          setRowValue({});
          reset()
        }}
        modalBody={modelBody}
        title={rowValue?.isAdd ? 'Add' : 'Change'}
        button1Label={rowValue?.isAdd ? 'Add' : 'Change'}
        button1Press={handleSubmit((values) => {
          handleUserSelect(
            rowValue?.location,
            rowValue?.shift,
            values && values?.user?.id
          );
        })}
      />
<ScrollView>
      <ScrollView horizontal>
        <View style={{ width: '100%' }}>
          <ScrollView vertical>
            <View style={styles.container}>
              <View style={styles.tableHeader}>
                <Text style={[styles.locationName]}></Text>
                {ArrayList.isArray(filteredShifts) &&
                  filteredShifts.map((shift, index) => (
                    <Text
                      key={index}
                      style={[
                        styles.locationName, styles.filteredShift
                      ]}
                    >
                      {shift.name}
                    </Text>
                  ))}
              </View>

              {locationList.map((location, locationIndex) => (
                <View key={locationIndex} style={styles.tableRow}>
                  <Text style={styles.locationName}>{location.name}</Text>
                  {ArrayList.isArray(filteredShifts) &&
                    filteredShifts.map((shift, shiftIndex) => {
                      const isValid = isValidate(location, shift);
                      return (
                        <View
                          key={shiftIndex}
                          style={[
                            styles.shiftCell,
                            !isValid && styles.emptyShiftCell,
                          ]}
                        >
                          {isValid && renderUserDetail(location, shift)}
                        </View>
                      );
                    })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
      <Table
        apiURL={`${endpoints().LocationAllocationUserAPI}/leaveList`}
        params={{
          date: data?.date
        }}
      >
        <Column
          fieldName="userName"
          style={{ textAlign: "left" }}
          renderField={(row) => {
            return <>
              <UserCard
                firstName={row.first_name}
                lastName={row.last_name}
                image={row.media_url}
              />
            </>;
          }}
        >
          User Name
        </Column>
      </Table>
      <Table
    
        arrayList={filteredUserList}
      >
        <Column
          fieldName="userName"
          style={{ textAlign: "left" }}
          renderField={(row) => {
            return <>
              <UserCard
                firstName={row.firstName}
                lastName={row.lastName}
                image={row.image}
              />
            </>;
          }}
        >
          User Name
        </Column>
      </Table>
      </ScrollView>
      
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    minHeight: 50,
  },
  emptyShiftCell: {
    flex: 1,
    paddingVertical: 50,
    backgroundColor: 'white',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    minHeight: 50,
  },
  headerText: {
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: 'white',
    backgroundColor: 'black',
  },
  locationName: {
    paddingHorizontal: 10,
    paddingVertical: 30,
    backgroundColor: 'black',
    color: 'white',
    fontWeight: 'bold',
    minHeight: 100,
    width: 100,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shiftCell: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 40,
    backgroundColor: 'white',
    color: 'blac',
    borderRightWidth: 1,
    borderColor: '#ccc',
    Height: 100,
    maxHeight: 100,
    minWidth: 200,
    maxWidth: 200,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerShiftCell: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    textAlign: 'left',
  },
  avatarStyle: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  filteredShift: {
    Height: 100,
    maxHeight: 100,
    minWidth: 200,
    maxWidth: 200,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  userDetailTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '75%',
  },
  userName: {
    color: Color.BLACK,
    marginLeft: 5,
  },
  pendingStatus: {
    color: Color.RED,
    marginLeft: 2,
  },
  dropdownMenu: {
    position: 'absolute',
  },
  selectButton: {
    color: Color.BLUE,
    textAlign: 'center',
    alignItems: 'center',
    minWidth: '100%',
  },
  selectButtonText: {
    color: Color.BLUE,
  },
});

export default LocationAllocationUserPage;
