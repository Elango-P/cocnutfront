// Import React and Component
import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity,Keyboard
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import dateTime from "../../lib/DateTime";
import Layout from "../../components/Layout";
import InventoryTransferService from "../../services/InventoryTransferService";
import { useIsFocused } from "@react-navigation/native";
import { Color } from "../../helper/Color";
import { FontAwesome5 } from "@expo/vector-icons";
import InventoryCard from "./components/TransferCard";
import { SwipeListView } from "react-native-swipe-list-view";
import Permission from "../../helper/Permission";
import StockDeleteModal from "../../components/Modal/StockDeleteModal";
import TransferType from "../../helper/TransferType";
import TransferTypeService from "../../services/TransferTypeService";
import inventoryTransferService from "../../services/InventoryTransferService";
import BarCodeScanner from "../../components/BarcodeScanner";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";
import AlertMessage from "../../helper/AlertMessage";
import { MenuItem } from "react-native-material-menu";
import AlternativeColor from "../../components/AlternativeBackground";
import ShowMore from "../../components/ShowMore";
import Refresh from "../../components/Refresh";
import PermissionService from "../../services/PermissionService"
import DateFilter from "../../components/DateFilter";
import { useForm } from "react-hook-form";
import FilterDrawer from "../../components/Filter";
import storeService from "../../services/StoreService";
import StatusService from "../../services/StatusServices";
import ObjectName from "../../helper/ObjectName";
import { CheckBox } from 'react-native-elements';
import Label from "../../components/Label";
import style from "../../helper/Styles";
import asyncStorageService from "../../services/AsyncStorageService";
import { Filter } from "../../helper/Filter";
import styles from "../../helper/Styles";
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";
const InventoryTransfer = (props) => {
  let params = props?.route?.params
  const [inventoryTransferList, setInventoryTransferList] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [isFetching, setIsFetching] = useState(false);
  //setting tha initial page
  const [page, setPage] = useState(2);
  //we need to know if there is more data
  const [HasMore, setHasMore] = useState(true);


  const [StockDeleteModalOpen, setStockDeleteModalOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  const [manageOther, setManageOther] = useState(false);

  const [transferTypeList, setTransferTypeList] = useState([]);

  const [modalVisible, setScanModalVisible] = useState(false);

  const [transferNotFoundModalOpen, setTransferNotFoundModalOpen] = useState(false);

  const [scannedCode, setScannedCode] = useState("");

  const [filter, SetFilter] = useState(params?.filter )

  const [visible, setVisible] = useState(false)


  const [actionList, setActionList] = useState([])

  const stateRef = useRef();

  const isFocused = useIsFocused();

  const [id, setId] = useState(id);
  const [openFilter, setOpenFilter] = useState(false);

  const [values, setValues] = useState({
    startDate: "",
    endDate:"",
    selectedDate: ""
  });
  const [statusList, setStatusList] = useState();
  const [locationList, setLocationList] = useState();
  const [typeList, setTypeList] = useState();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [showAddButton, setShowAddButton] = useState(false);

  // render the inventory list function
  useEffect(() => {
    let mount = true;

    mount && getTransferTypeByRole();
    mount && getPermission();
    mount && getActionItems()
    mount &&  getTransferList(values)
    //cleanup function
    return () => {
      mount = false;
    };
  }, [isFocused]);
  useEffect(()=>{
    if(refreshing){
      getTransferList(values);
    }

  },[refreshing])


  useEffect(() => {
    getActionItems()
  }, [statusList])

  useEffect(()=>{
    getTypeList();
    getStoreList();
    getStatusList();
  },[])

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
  });

  const transferRef = useRef({
    selectedItems:[]
  })



  const getStatusList = async () => {
    let status = [];
    const response = await StatusService.list(ObjectName.TRANSFER);

    response && response.forEach((statusList) => {
      status.push({
        label: statusList.name,
        value: statusList.status_id,
        id: statusList.status_id,
        allowed_role_id:statusList.allowed_role_id
      });
    });
    setStatusList(status);

  }

  const getActionItems = async () => {
    const roleId = await asyncStorageService.getRoleId()

    let statusLists = new Array();

    if (statusList && statusList.length > 0) {

      statusList.forEach((data) => {
        if (data.allowed_role_id && data.allowed_role_id.split(",").includes(roleId)) {

          statusLists.push(   <MenuItem onPress={() => {
            getTransferList(values)
            updateInventory(data.id, selectedItems)
          }} >
            {data.label}
          </MenuItem>

          )
        }
      })
    }
    statusLists.unshift(
      <MenuItem
        onPress={() => {  setOpenFilter(!openFilter)
          ,setVisible(true)}}
      >
        Filter
      </MenuItem>
    )

    if (statusLists && statusLists.length > 0) {
      let updatedMenu = [statusLists];
      setActionList(updatedMenu);

    }
  }
  const getStoreList = ()=>{
    storeService.list({},(error, response) => {
      const storeListOption = new Array();
      let storeList = response?.data?.data;
      if (storeList && storeList.length > 0) {
        for (let i = 0; i < storeList.length; i++) {
          storeListOption.push({
            label: storeList[i].name,
            value: storeList[i].id,
          });
        }

        setLocationList(storeListOption);
      }

    });
  }

  const getTypeList = ()=>{
    TransferTypeService.list((response) => {
      if (response) {
        setTypeList(response)
      }
    })
  }

  const navigation = useNavigation();

  const getTransferTypeByRole = () => {
    TransferTypeService.searchByRole(null, (error, response) => {
      if (response && response.data && response.data.data) {
        setTransferTypeList(response.data.data)
      }
    })
  }

  const transferNotFoundToggle = () => {
    setTransferNotFoundModalOpen(!transferNotFoundModalOpen);
  }


  const LoadMoreList = async () => {
    try {
      setIsFetching(true);
      setSelectedItems("")

      let params  = {}

      params = {page: page, sort: "id", sortDir: "DESC" }
      if(values?.toLocation){
        params.toLocation = values.toLocation
      }
      if(values?.fromLocation){
        params.fromLocation = values.fromLocation
      }
      if(values?.type){
        params.type = values.type
      }
      if(values?.status){
        params.status = values.status
      }
      if(values?.startDate){
        params.startDate = dateTime.formatDate(values.startDate)
      }
      if(values?.endDate){
        params.endDate = dateTime.formatDate(values.endDate)
      }
      if(values?.selectedDate){
        params.selectedDate = values.selectedDate

      }
      inventoryTransferService.search(params, (error, response) => {

        let inventoryTransferList = response && response?.data && response?.data?.data;
        setInventoryTransferList((prevTitles) => {
          return [...new Set([...prevTitles, ...inventoryTransferList])];
        });
        setPage((prevPageNumber) => prevPageNumber + 1);
        setHasMore(inventoryTransferList.length > 0);
        setIsFetching(false);
      });
    } catch (err) {
      console.log(err);
      setIsLoading(false);
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

  const stockDeleteModalToggle = () => {
    setStockDeleteModalOpen(!StockDeleteModalOpen);
    clearRowDetail();
  }

  const renderHiddenItem = (data, rowMap) => {
    return (
      <View style={styles.swipeStyle}>
        <TouchableOpacity
          style={styles.actionDeleteButton}
          onPress={() => {
            stockDeleteModalToggle()
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
    const containerStyle = AlternativeColor.getBackgroundColor(index)
    return (
      <View style={[containerStyle,styles.leadContainer]} >
        <InventoryCard
          fromLocationName={item?.fromLocationName}
          toLocationName={item?.toLocationName}
          status={item?.status}
          statusColor={item.statusColor}
          date={item?.date}
          type={item?.type}
          onLongPress={() => handleItemLongPress(item.id)}
          id={id}
          item={item}
          alternative={containerStyle}
          transferNumber={item?.transfer_number}
          onPress={() => {
            inventoryClickHandler(item);
          }}
        />
        {selectedItems &&
          <View style={[{ marginTop: -8 }]}>
            <CheckBox
              checked={selectedItems[item.id]}
              onPress={() => handleItemLongPress(item.id)}
              checkedColor="black"
              uncheckedColor="black"
            />
          </View>
        }
      </View>
    );
  };

  const getPermission = async () => {
    let manageOther = await PermissionService.hasPermission(Permission.TRANSFER_MANAGE_OTHERS);
    const addPermission = await PermissionService.hasPermission(Permission.TRANSFER_ADD);
    setShowAddButton(addPermission);
    setManageOther(manageOther)

  }

  const inventoryClickHandler = async (item) => {

    if (item) {
      let isOfflineMode = item?.offlineMode == TransferType.OFFLINE_MODE ? true : false;

      if (isOfflineMode) {
        await InventoryTransferService.syncInventory(item);
      }

      setId(item.id)
      navigation.navigate("Transfer/ProductList", {
        transferId: item?.id,
        toLocationId: item?.to_store_id,
        fromLocationId: item?.from_store_id,
        date: item?.date,
        type: item?.type_id,
        fromLocationName: item?.fromLocationName,
        toLocationName: item?.toLocationName,
        notes: item?.notes,
        offlineMode: item?.offlineMode == TransferType.OFFLINE_MODE ? true : false,
        currentStatusId: item?.currentStatusId,
        transferNumber: item?.transfer_number,
        filter: filter,
        printName: item?.printName
      });
    }
  }

  const transferDelete = async () => {
    if (selectedItem) {
      InventoryTransferService.DeleteTransfer(selectedItem.id, (error, response) => {
        getTransferList(values)

      })
    }
  };


  const getTransferList = async (values) => {
    inventoryTransferList && inventoryTransferList.length == 0 && setIsLoading(true)
    setSelectedItems("")
    try {
      Keyboard.dismiss();
      setPage(2);
      setHasMore("0");
      let param = { page: 1, sort: "id", sortDir: "DESC" };

      if(values?.toLocation){
        param.toLocation = values.toLocation
       }
       if(values?.fromLocation){
        param.fromLocation = values.fromLocation
       }
       if(values?.type){
        param.type = values.type
       }
       if(values?.status){
        param.status = values.status
       }
        if(values?.startDate){
          param.startDate = dateTime.formatDate(values.startDate)
        }
        if(values?.endDate){
          param.endDate = dateTime.formatDate(values.endDate)
        }
        if(values?.selectedDate){
          param.selectedDate = values.selectedDate

      }
      InventoryTransferService.search(param, (err, response) => {
        let transfers = response && response?.data && response?.data?.data;
        setInventoryTransferList(transfers);
        setIsLoading(false);
        setVisible(false)

      })
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  const handleItemLongPress = (itemId) => {
    setSelectedItems((prevSelectedItems) => {
      const newSelectedItems = {
        ...prevSelectedItems,
        [itemId]: !prevSelectedItems[itemId] || false,
      };
      transferRef.current.selectedItems = newSelectedItems; // Update the ref here
      return newSelectedItems;
    });
  };

  const handleSelectAll = () => {
    const AllIds = inventoryTransferList.map((item) => item.id);
    const newSelectedItems = AllIds.reduce((selected, userId) => {
      selected[userId] = true;
      return selected;
    }, {});

    setSelectedItems(newSelectedItems);
    transferRef.current.selectedItems = newSelectedItems;
  };

  const handleCancelSelection = () => {
    setSelectedItems("");
  };
  const toggle = () => {
    setScanModalVisible(!modalVisible);
  }

  const addNewTransfer = () => {
    inventoryTransferService.onTransferTypeClickStoreSelect(transferTypeList, navigation);
  }

  // Get Stock entry list
  const updateInventory = async (statusId) => {
    setVisible(false)

    let selectedItems = transferRef.current.selectedItems
    const selectedIds = [];
    for (const userId in selectedItems) {
      if (selectedItems[userId]) {
        selectedIds.push(userId);
      }
    }


    if (statusId) {
      if (params?.offlineMode) {
        InventoryTransferService.updateStatus({ status: statusId, id: selectedIds && selectedIds.join(",") }, async (err, res) => {
          if (res) {
            getTransferList(values)
            setSelectedItems([])
            transferRef.current = {
              selectedItems: [],

            };
          }
        });
        setVisible(true)
      } else {
        await InventoryTransferService.updateStatus({ status: statusId, id: selectedIds && selectedIds.join(",") }, (err, res) => {
          if (res) {
            getTransferList(values)
            setSelectedItems([])
            transferRef.current = {
              selectedItems: [],

            };
          }
        });
        setVisible(true)

      }
    }
  };




  const onScanAction = async (item) => {

    if (item) {
      let isOfflineMode = item?.offlineMode == TransferType.OFFLINE_MODE ? true : false;

      if (isOfflineMode) {
        await InventoryTransferService.syncInventory(item);
      }

      setId(item.id)
      navigation.navigate("Transfer/ProductList", {
        transferId: item?.id,
        toLocationId: item?.to_store_id,
        fromLocationId: item?.from_store_id,
        date: item?.date,
        type: item?.type,
        fromLocationName: item?.from_location_name,
        toLocationName: item?.to_location_name,
        notes: item?.notes,
        offlineMode: item?.offlineMode == TransferType.OFFLINE_MODE ? true : false,
        currentStatusId: item?.statusId,
        transferNumber: item?.transfer_number,
        printName: item?.printName
      });
    }
  }


  const handleScannedData = async (data) => {
    try {
      //get bar code
      let barCode = data?.data;

      setScannedCode(barCode)

      setScanModalVisible(false);

      //validate bar code exist and loading
      if (barCode) {

        inventoryTransferService.get(barCode, response => {

          //validate store product exist or not
          if (response) {

            onScanAction(response);


          } else {

            transferNotFoundToggle();
          }

        })

      }
    } catch (err) {
      console.log(err);
    }
  };
  const handleDateFilterChange = (value) => {
    setValues({
      selectedDate: value
    })
    getTransferList({
      startDate: values?.startDate,
      endDate: values?.endDate,
      selectedDate: value
    })

  }

  const statusOnSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        status: value,
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        status: "",
      }));
    }
  };

  const fromLocationOnSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        fromLocation: value,
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        fromLocation: "",
      }));
    }
  };
  
  const toLocationOnSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        toLocation: value,
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        toLocation: "",
      }));
    }
  };
  const typeOnSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        type: value.value,
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        type: "",
      }));
    }
  };
  const onDateSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        startDate: new Date(value),
      }));
      setSelectedDate(new Date(value));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        startDate: "",
      }));
      setSelectedDate("");
    }
  };
  const onEndDateSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        endDate: new Date(value),
      }));
      setSelectedEndDate(new Date(value));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        endDate: "",
      }));
      setSelectedEndDate("");
    }
  };
  const closeDrawer = () => {
    setOpenFilter(!openFilter);
  };

  const handleFilterSubmit = async () => {
    getTransferList(values)
    closeDrawer();
  };
  /* Render flat list function end */
  return (
    <Layout title={"Transfer"}
      addButton={showAddButton ? true : false}
      buttonOnPress={() => {
        addNewTransfer()
      }}
      closeModal={visible}
      isLoading={isLoading}
      hideFooterPadding={true}
      showScanner={true}
      showBackIcon={false}
      showActionMenu
      actionItems={actionList}
      openScanner={toggle}
    
      onFilterPress={closeDrawer}

    >
      <View >
        <FilterDrawer
          values={values}
          isOpen={openFilter}
          closeDrawer={closeDrawer}
          locationOnSelect={fromLocationOnSelect}
          toLocationOnSelect={toLocationOnSelect}
          fromLocationOnSelect={fromLocationOnSelect}
          statusOnSelect={statusOnSelect}
          typeOnSelect={typeOnSelect}
          handleSubmit={handleFilterSubmit}
          statusList={statusList}
          locationList={locationList}
          typeList={typeList}
          onDateSelect={onDateSelect}
          onEndDateSelect={onEndDateSelect}
          selectedEndDate={selectedEndDate}
          selectedDate={selectedDate}
          locationLabel={"From Location"}
          showType
          showDate
          showStatus
          showLocation
          showToLocation
          showFromLocation
          clearFilter={() => {
            setValues("");
            inventoryTransferList;
            closeDrawer();
          }}
        />

        {selectedItems && (
          <View style={style.direction}>
            <TouchableOpacity onPress={handleCancelSelection}>
              <Label text={"Cancel"} size={16} bold={true} />
            </TouchableOpacity>
            <View style={style?.alingCount}>
              <TouchableOpacity onPress={handleSelectAll}>
                <Label text={"Select All"} size={16} bold={true} />
              </TouchableOpacity>
            </View>

          </View>
        )}
      </View>
      <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>

        <DeleteConfirmationModal
          modalVisible={StockDeleteModalOpen}
          toggle={stockDeleteModalToggle}
          id={selectedItem?.transfer_number}
          updateAction={transferDelete}
        />
        <BarCodeScanner
          toggle={toggle}
          modalVisible={modalVisible}
          handleScannedData={handleScannedData}
        />

        <ConfirmationModal
          toggle={transferNotFoundToggle}
          modalVisible={transferNotFoundModalOpen}
          title={AlertMessage.TRANSFER_NOT_FOUND}
          description={`BarCode ID ${scannedCode} not found please scan different code`}
          confirmLabel={"Ok"}
          ConfirmationAction={transferNotFoundToggle}
        />


        <View>
          {inventoryTransferList && inventoryTransferList.length > 0 ?
            <>
              <SwipeListView
                data={inventoryTransferList}
                renderItem={renderItem}
                renderHiddenItem={renderHiddenItem}
                rightOpenValue={-70}
                previewOpenValue={-40}
                previewOpenDelay={3000}
                disableRightSwipe={true}
                disableLeftSwipe={manageOther ? false : true}
                closeOnRowOpen={true}
                keyExtractor={item => String(item.id)}
              />

            </>
            : (
              <View
                style={{
                  alignItems: "center",
                  paddingVertical: 350,
                }}
              >
                <FontAwesome5 name="truck-moving" size={20} color={Color.PRIMARY} />
                <Text style={{ fontWeight: "bold", textAlign: "center" }}>
                  No Records Found
                </Text>
              </View>
            )}
        </View>

        <>
          <ShowMore List={inventoryTransferList} isFetching={isFetching} HasMore={HasMore} onPress={LoadMoreList} />
        </>
      </Refresh>
    </Layout>
  );
};

export default InventoryTransfer;


