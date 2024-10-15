import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Layout from "../../components/Layout";
import Refresh from "../../components/Refresh";
import AlternativeColor from "../../components/AlternativeBackground";
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";
import { SwipeListView } from "react-native-swipe-list-view";
import { Color } from "../../helper/Color";
import NoRecordFound from "../../components/NoRecordFound";
import billService from "../../services/BillService";
import BillCard from "./component/BillCard";
import ShowMore from "../../components/ShowMore";
import Permission from "../../helper/Permission";
import PermissionService from "../../services/PermissionService";
import DateTime from "../../lib/DateTime";
import { __handlePersistedRegistrationInfoAsync } from "expo-notifications/build/DevicePushTokenAutoRegistration.fx";
import ObjectName from "../../helper/ObjectName";
import FilterDrawer from "../../components/Filter";
import StatusService from "../../services/StatusServices";
import accountService from "../../services/AccountService";
import styles from "../../helper/Styles";

const Bills = () => {
  const [bill, setBill] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const isFocused = useIsFocused();
  const [page, setPage] = useState(2);
  const [billDeleteModalOpen, setBillDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [HasMore, setHasMore] = useState(true);
  const [permission, setPermission] = useState("")
  const [deletePermission, setDeletePermission] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [values, setValues] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [statusList, setStatusList] = useState();
  const [vendorList, setVendorList] = useState();





  const navigation = useNavigation();
  const stateRef = useRef();


  useEffect(() => {
    let mount = true;
    
    mount && getBillList(values);
    return () => {
      mount = false;
    };
  }, [isFocused]);
  useEffect(() => {
    if (refreshing) {
      getBillList(values);
    }
  }, [refreshing]);

  useEffect(() => {
    let mount = true;
    mount && addPermission()
    //cleanup function
    return () => {
      mount = false;
    };
  }, [refreshing]);

  const AddNew = () => {
    navigation.navigate("BillForm");
  };
  useEffect(() => {
    getStatusList();
    getAccountList();

  }, [])

 const getStatusList = async () => {
        let status = [];
        const response = await StatusService.list(ObjectName.BILL);

        response && response.forEach((statusList) => {
            status.push({
                label: statusList.name,
                value: statusList.status_id,
                id: statusList.status_id
            });
        });

        setStatusList(status);
    }
    const getAccountList = ()=>{
              accountService.GetVendorList((callback) => { setVendorList(callback) });
  
          }

  const handleSubmit = () => {
    getBillList(values)
    closeDrawer()
  };

  const addPermission = async () => {
    const addPermission = await PermissionService.hasPermission(Permission.BILL_ADD);
    setPermission(addPermission);
    const deletePermission = await PermissionService.hasPermission(Permission.BILL_DELETE);
    setDeletePermission(deletePermission);
  }
  const getBillList = async (values) => {

    bill && bill.length == 0 && setIsLoading(true);

    let params = { sort: "createdAt", sortDir: "DESC" }
    if (values?.status) {
      params.status = values.status
    }
    if (values?.account) {
      params.account = values?.account
    }
    if (values?.startDate) {
      params.startDate = DateTime.formatDate(values?.startDate)
    }
    if (values?.endDate) {
      params.endDate = DateTime.formatDate(values?.endDate)
    }

    await billService.search(params, response => {
      if (response) {
        setBill(response.data);
        setIsLoading(false);
        setRefreshing(false)
        setPage(2);

      }


    });
  };


  const closeDrawer = () => {
    setOpenFilter(!openFilter);
  }
  const accountOnSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        account: value
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        account: ""
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
  const onDateSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        startDate: new Date(value)
      }));
      setSelectedDate(new Date(value));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        startDate: ""
      }));
      setSelectedDate("");
    }
  }
  const onEndDateSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        endDate: new Date(value)
      }));
      setSelectedEndDate(new Date(value));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        endDate: ""
      }));
      setSelectedEndDate("");
    }
  }
  const LoadMoreList = async () => {
    try {
      setIsFetching(true);

      let params = { page: page }
      if (values?.status) {
        params.status = values.status
      }
      if (values?.account) {
        params.account = values?.account
      }
      if (values?.startDate) {
        params.startDate = DateTime.formatDate(values?.startDate)
      }
      if (values?.endDate) {
        params.endDate = DateTime.formatDate(values?.endDate)
      }

      billService.search(params, (response) => {

        let bills = response.data

        // Set response in state
        setBill((prevTitles) => {
          return [...new Set([...prevTitles, ...bills])];
        });
        setPage((prevPageNumber) => prevPageNumber + 1);
        setHasMore(bills.length > 0);
        setIsFetching(false);
      });
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };
  const billDelete = async () => {
    if (selectedItem) {
      billService.Delete(selectedItem.id, (error, response) => {
        getBillList()
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
  const billDeleteModalToggle = () => {
    setBillDeleteModalOpen(!billDeleteModalOpen);
    clearRowDetail();
  }
  const renderHiddenItem = (data, rowMap) => {
    return (
      <View style={styles.swipeStyle}>
        <TouchableOpacity
          style={styles.actionDeleteButton}
          onPress={() => {
            billDeleteModalToggle()
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
  const renderItem = data => {
    let item = data?.item;
    let index = data?.index;
    return (

      <View style={styles.container}>
        <BillCard
          billNumber={item.bill_number}
          accountName={item.account_name}
          amount={item.netAmount}
          date={item.bill_date}
          status={item.status}
          statusColor={item.colorCode}
          index={index}
          onPress={() => {
            navigation.navigate("BillForm", { item });
          }} />
      </View>
    );
  };
  return (
    <Layout
      title='Bills'
      addButton={permission ? true : false}
      buttonOnPress={AddNew}
      isLoading={isLoading}
      refreshing={refreshing}
      showFilter={true}
      onFilterPress={closeDrawer}
      showBackIcon={false}
    >
      <FilterDrawer
        values={values}
        isOpen={openFilter}
        ObjectName={ObjectName.BILL}
        closeDrawer={closeDrawer}
        accountOnSelect={accountOnSelect}
        statusOnSelect={statusOnSelect}
        onDateSelect={onDateSelect}
        onEndDateSelect={onEndDateSelect}
        selectedEndDate={selectedEndDate}
        selectedDate={selectedDate}
        statusList= {statusList}
        vendorList= {vendorList}

        showAccount
        showStatus
        showDate
        handleSubmit={handleSubmit}
        clearFilter={() => {
          setValues("");
          getBillList();
          closeDrawer();
        }}

      />
      <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
        <View style={styles.container}>
          <DeleteConfirmationModal
            modalVisible={billDeleteModalOpen}
            toggle={billDeleteModalToggle}
            item={selectedItem}
            updateAction={billDelete}
            
            id={selectedItem?.id}
          />

          {bill && bill.length > 0 ?
            <SwipeListView
              data={bill}
              renderItem={renderItem}
              renderHiddenItem={renderHiddenItem}
              rightOpenValue={-70}
              previewOpenValue={-40}
              previewOpenDelay={3000}
              disableRightSwipe={true}
              closeOnRowOpen={true}
              disableLeftSwipe={deletePermission ? false : true}
              keyExtractor={item => String(item.id)}
            />
            :
            <NoRecordFound iconName={"receipt"} />
          }
          <ShowMore List={bill} isFetching={isFetching} HasMore={HasMore} onPress={LoadMoreList} />

        </View>
      </Refresh>
    </Layout>
  )
}
export default Bills;


