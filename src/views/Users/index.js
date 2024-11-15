import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Keyboard
} from "react-native";
import userService from "../../services/UserService";
import Layout from "../../components/Layout";
import Refresh from "../../components/Refresh";
import AlternativeColor from "../../components/AlternativeBackground";
import ShowMore from "../../components/ShowMore";
import UserCard from "../../components/UserCard";
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";
import { SwipeListView } from "react-native-swipe-list-view";
import { Color } from "../../helper/Color";
import NoRecordFound from "../../components/NoRecordFound";
import Status from "../../helper/Status";
import SearchBar from "../../components/SearchBar";
import styles from "../../helper/Styles";
import FilterDrawer from "../../components/Filter";
import { Checkbox } from 'react-native-paper';
import { MenuItem } from "react-native-material-menu";
import Label from "../../components/Label";
import PermissionService from "../../services/PermissionService";
import Permission from "../../helper/Permission";
import UserRoleService from "../../services/UserRoleService";




const Users = () => {
  const [user, setUser] = useState([]);
  console.debug("user--------------->>>", user)
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const isFocused = useIsFocused();
  const [page, setPage] = useState(2);
  const [userDeleteModalOpen, setUserDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [HasMore, setHasMore] = useState(true);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [clicked, setClicked] = useState(false);
  const [search, setSearch] = useState(false);
  const [searchParam, setSearchParam] = useState("")
  const [values, setValues] = useState({ status: Status.ACTIVE });
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [visible, setVisible] = useState(false);
  const [actionList, setActionList] = useState([]);
  const [permission, setPermission] = useState({});
  const [roleList, setRoleList]=useState([]);

  const navigation = useNavigation();
  const stateRef = useRef();

  useEffect(() => {
    getActionItems()
  }, [selectedItems])

  useEffect(() => {      
      getUserList(values);
      getPermission();
      getRole()

  }, [isFocused]);
  useEffect(()=>{
    if(refreshing){
      getUserList(values);
    }

  },[refreshing])

  const AddNew = () => {
    navigation.navigate("UserForm");
  };

  const getPermission = async () => {
     let addPermission = await PermissionService.hasPermission(Permission.USER_ADD);
     let manageOthers = await PermissionService.hasPermission(Permission.USER_MANAGE_OTHERS);
     setPermission({ addPermission: addPermission, manageOthers: manageOthers })
  }

  const getRole = () => {
    UserRoleService.search(null,(response) => {
        setRoleList(response);

    })
}

  const getUserList = async (values) => {
    try {

      setSelectedItems("")
      user && user.length == 0 && setIsLoading(true);

      let params = { page: 1, status: Status.ACTIVE }

      if (values?.status) {
        params.status = values.status
      }
      if(values?.search){
        params.search = values?.search
      }
      if (values?.role) {
        params.role = values?.role
      }

      await userService.search(params, response => {
        if (response) {
          setUser(response);
          setIsLoading(false);

        }

      });
      console.debug("response--------------->>>", response)
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }

  };
  const handleChange = async (search) => {
    setSearchParam(search)
    if (search) {
      setValues((prevValues) => ({
        ...prevValues,
        search: search
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        search: ""
      }));
    }
    getUserList({search : search})

  };
  const LoadMoreList = async () => {
    try {
      setIsFetching(true);

      let params = { page: page, search: searchParam ? searchParam : "", status: Status.ACTIVE }
      if (values?.status) {
        params.status = values.status
      }
      if (values?.role) {
        params.role = values?.role
      }

      userService.search(params, (response) => {

        let users = response

        // Set response in state
        setUser((prevTitles) => {
          return [...new Set([...prevTitles, ...users])];
        });
        setPage((prevPageNumber) => prevPageNumber + 1);
        setHasMore(users.length > 0);
        setIsFetching(false);
      });
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };
  const userDelete = async () => {
    if (selectedItem) {
      userService.Delete(selectedItem.id, (error, response) => {
        getUserList()
      })
    }
  };
  const closeRow = (rowMap, rowKey) => {
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  }

  const clearRowDetail = () => {
    if (stateRef) {
      const selectedItem = stateRef.selectedItem;
      const selectedRowMap = stateRef.selecredRowMap;
      if (selectedItem && selectedRowMap) {
        closeRow(selectedRowMap, selectedItem.id)
        setSelectedItem("");
        stateRef.selectedItem = "";
        stateRef.selecredRowMap = "";
      }
    }
  }
  const userDeleteModalToggle = () => {
    setUserDeleteModalOpen(!userDeleteModalOpen);
    clearRowDetail();
  }
  const renderHiddenItem = (data, rowMap) => {
    return (
      <View style={styles.swipeStyle}>
        <TouchableOpacity
          style={styles.actionDeleteButton}
          onPress={() => {
            userDeleteModalToggle()
            setSelectedItem(data?.item);
            stateRef.selectedItem = data?.item;
            stateRef.selecredRowMap = rowMap;
            closeRow(rowMap, data?.item.id);
          }}
        >
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>

    )
  };
  const getSelectedUserIds = (selectedItems) => {
    const selectedIds = [];
    for (const userId in selectedItems) {
      if (selectedItems[userId]) {
        selectedIds.push(userId);
      }
    }
    return selectedIds;
  };

  const handleItemLongPress = (itemId) => {
    setSelectedItems((prevSelectedItems) => {
      return {
        ...prevSelectedItems,
        [itemId]: !prevSelectedItems[itemId] || false,
      };
    });
  };
  const handleSelectAll = () => {
    const allUserIds = user.map((item) => item.id);
    setSelectedItems(
      allUserIds.reduce((selected, userId) => {
        selected[userId] = true;
        return selected;
      }, {})
    );
  };

  const handleCancelSelection = () => {
    setSelectedItems("");
    getUserList()
  };




  const renderItem = data => {
    let item = data?.item;
    let index = data?.index;
    const containerStyle = AlternativeColor.getBackgroundColor(index)
    return (
      <TouchableOpacity activeOpacity={1.2} >
        <View style={[containerStyle,styles.leadContainer]}>
          <UserCard
            firstName={item.fullname}
            mobileNumber={item.mobileNumber}
            email={item.email}
            image={item.media_url}
            avatarStyle={styles.avatarStyle}
            last_loggedIn_At={item.last_loggedIn_At}
            size={55}
            onLongPress={() => handleItemLongPress(item.id)}
            onPress={() => {
              navigation.navigate("UserForm", { item });
            }}

          />

          {selectedItems &&
          <View style = {[styles.alingCount,{marginTop : -8}]}>
          <Checkbox
                status={selectedItems[item.id] ? 'checked' : 'unchecked'}
                onPress={() => handleItemLongPress(item.id)}
                color={Color.BLACK}
              />
          </View>
            

           } 
        </View>
      </TouchableOpacity>
    );
  };

  const closeDrawer = () => {
    setOpenFilter(!openFilter);
  }
  const roleOnSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        role: value
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        role: ""
      }));
    }

  }
  const statusOnSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        status: value
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        status: ""
      }));
    }
  }

  const handleSubmit = () => {
    getUserList(values)
    closeDrawer()
  };

  const Options = [
    {
      label: Status.ACTIVE_TEXT,
      value: Status.ACTIVE
    },
    {
      label: Status.INACTIVE_TEXT,
      value: Status.INACTIVE
    },

  ];

  const forceLogout = async () => {
    if (selectedItems) {
      const selectedUserIds = getSelectedUserIds(selectedItems);
      if (selectedUserIds) {
        let bodyData = { userIds: selectedUserIds, forceLogout: true };
        await userService.bulkUpdate(bodyData, (err, response) => {

        })
      }
    }

  }
  const forceSync = async () => {
    if (selectedItems) {
      const selectedUserIds = getSelectedUserIds(selectedItems);
      if (selectedUserIds) {
        let bodyData = { userIds: selectedUserIds, force_sync: true };
        await userService.bulkUpdate(bodyData, (err, response) => {

        })
      }

    }

  }

  const getActionItems = async () => {
    let actionItems = new Array();
    actionItems.push(
      <MenuItem onPress={() => {setOpenFilter(!openFilter),
        setVisible(true) }}>
        Filter
      </MenuItem>
    )
    actionItems.push(
      <MenuItem onPress={() => { forceLogout(), setVisible(true) }}>
        Force Logout
      </MenuItem>
    )
    actionItems.push(
      <MenuItem onPress={() => { forceSync(), setVisible(true) }}>
        Force Sync
      </MenuItem>
    )


    setActionList(actionItems)
  }



  return (
    <Layout
      title='Users'
      addButton={permission && permission.addPermission ? true : true}
      buttonOnPress={AddNew}
      isLoading={isLoading}
      refreshing={refreshing}
      onFilterPress={closeDrawer}
      showBackIcon={true}
      showActionMenu={permission && permission.manageOthers}
      actionItems={actionList}
      closeModal={visible}




    >
      <FilterDrawer
        values={values}
        isOpen={openFilter}
        closeDrawer={closeDrawer}
        roleOnSelect={roleOnSelect}
        statusOnSelect={statusOnSelect}
        statusOptions={Options}
        showRole
        role={roleList}
        showStatusOption
        handleSubmit={handleSubmit} />
            <SearchBar
              searchPhrase={searchPhrase}
              setSearchPhrase={setSearchPhrase}
              setClicked={setClicked}
              clicked={clicked}
              setSearch={setSearch}
              onPress={getUserList}
              handleChange={handleChange}
              noScanner
            />
      <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>

         
          <View style={styles.container}>

          {selectedItems && (
            <View style={styles.direction}>
              <TouchableOpacity onPress={handleCancelSelection}>
                <Label text={"Cancel"} size={16} bold={true} />
              </TouchableOpacity>
              <View style={styles?.alingCount}>
                <TouchableOpacity onPress={handleSelectAll}>
                  <Label text={"Select All"} size={16} bold={true} />
                </TouchableOpacity>
              </View>

            </View>
          )}
          <DeleteConfirmationModal
            modalVisible={userDeleteModalOpen}
            toggle={userDeleteModalToggle}
            item={selectedItem}
            updateAction={userDelete}
            
            id={selectedItem?.id}

          />


          {user && user.length > 0 ?
            <SwipeListView
              data={user}
              renderItem={renderItem}
              renderHiddenItem={renderHiddenItem}
              rightOpenValue={-70}
              previewOpenValue={-40}
              previewOpenDelay={3000}
              disableRightSwipe={true}
              disableLeftSwipe={false}
              closeOnRowOpen={true}
              keyExtractor={item => String(item.id)}
            />
            :
            <NoRecordFound iconName={"receipt"} />
          }
          <ShowMore List={user} isFetching={isFetching} HasMore={HasMore} onPress={LoadMoreList} />



        </View>

      </Refresh>


    </Layout>
  )
}
export default Users;



