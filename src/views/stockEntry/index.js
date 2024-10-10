// Import React and Component
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
	StyleSheet,
	View,
	Text,
	FlatList,
	TouchableOpacity,
	ScrollView
} from "react-native";

import { useNavigation } from "@react-navigation/native";

// icons
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "../../lib/AsyncStorage";

import AsyncStorageConstants from "../../helper/AsyncStorage";
import apiClient from "../../apiClient";
import { endpoints } from "../../helper/ApiEndPoint";

// Spinner

import { useIsFocused } from "@react-navigation/native";

import Layout from "../../components/Layout";

import { Color } from "../../helper/Color";

import { FontAwesome5 } from "@expo/vector-icons";

import { SwipeListView } from "react-native-swipe-list-view";
import stockEntryService from "../../services/StockEntryService";
import Permission from "../../helper/Permission";
import StockDeleteModal from "../../components/Modal/StockDeleteModal";
import StockEntryCard from "./components/StockEntryCard";
import ShowMore from "../../components/ShowMore";
import AlternativeColor from "../../components/AlternativeBackground";
import PermissionService from "../../services/PermissionService";
import FilterDrawer from "../../components/Filter";
import DateTime from "../../lib/DateTime";
import NoRecordFound from "../../components/NoRecordFound";
import Refresh from "../../components/Refresh";
import StatusService from "../../services/StatusServices";
import ObjectName from "../../helper/ObjectName";
import userService from "../../services/UserService";
import storeService from "../../services/StoreService";
import Alert from "../../lib/Alert";
import { getFullName } from "../../lib/Format";

const Index = () => {

	const [stockEntryList, setStockEntryList] = useState([]);

	const [isLoading, setIsLoading] = useState(false);

	const [isFetching, setIsFetching] = useState(false);
	//setting tha initial page
	const [page, setPage] = useState(2);
	//we need to know if there is more data
	const [HasMore, setHasMore] = useState(true);

	const [StockDeleteModalOpen, setStockDeleteModalOpen] = useState(false);

	const [selectedItem, setSelectedItem] = useState("");

	const [selectedRowMap, setSelectedRowMap] = useState("");

	const [totalStock, setTotalStock] = useState();

	const [storeId, setStoreId] = useState("");

	const [locationName, setName] = useState("");

	const [ownerName, setOwnerName] = useState("");

	const [deletePermission, setDeletePermission] = useState("")

	const [openFilter, setOpenFilter] = useState(false);
    const [values, setValues] = useState();
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedEndDate, setSelectedEndDate] = useState("");
	const [refreshing, setRefreshing] = useState(false);

	const [statusList, setStatusList] = useState([]);
	const [userList, setUserList] = useState([]);
	const [locationList,setLocationList] = useState([]);

	const [permission, setPermission] = useState({});



	const stateRef = useRef();

	const isFocused = useIsFocused();

	const navigation = useNavigation();


	// render the stock entry list function
	useEffect(() => {
		let mount = true;

		mount && getStockEntryList(values)
		//cleanup function
		return () => {
			mount = false;
		};
	}, [isFocused]);
	useEffect(()=>{
		if(refreshing){
			getStockEntryList(values)

		}
	},[refreshing])

	useEffect(() => {
		let mount = true;

		//get permission
		mount && getPermission();
		mount && stockEntryDeletePermission();
		mount && storeSelect();
		return () => {
			mount = false;
		}
	}, [])
	

	useEffect(() => {
		storeSelect();
		getFilterList();
	}, [isFocused])

	const getStockEntryList = (values)=>{

		let param = {sort : "createdAt" , sortDir : "DESC"};
		if (values?.status) {
			param.status = values?.status;
		}

	
		if (values?.user) {
			param.user = values?.user;
		}
		if (values?.location) {
			param.location = values?.location;
		}
		if (values?.startDate) {
			param.startDate = DateTime.formatDate(values?.startDate);
		}
		if (values?.endDate) {
			param.endDate = DateTime.formatDate(values?.endDate);
		}
		stockEntryList && stockEntryList.length == 0 && setIsLoading(true);

		stockEntryService.search(param, (error, response) => {
			if(response){
				let stockEntry = response && response?.data && response?.data?.data;
				setStockEntryList(stockEntry);
				setIsLoading(false);
				setRefreshing(false)
			}
			
		});
	}

	const getPermission = async () => {
		let stockEntryManageOtherPermission = await PermissionService.hasPermission(Permission.STOCK_ENTRY_MANAGE_OTHERS)
		let addPermission = await PermissionService.hasPermission(Permission.STOCK_ENTRY_ADD)

		setPermission({stockEntryManageOtherPermission: stockEntryManageOtherPermission, addPermission: addPermission})

	}

	const storeSelect = async () => {
		await AsyncStorage.getItem(AsyncStorageConstants.SELECTED_LOCATION_ID).then((res) => setStoreId(res))
		await AsyncStorage.getItem(AsyncStorageConstants.SELECTED_LOCATION_NAME).then((res) => setName(res))
		await AsyncStorage.getItem(AsyncStorageConstants.USER_NAME).then((res) => setOwnerName(res));

	}

	const stockEntryDeletePermission = async () => {
         const deletePermission = await PermissionService.hasPermission(Permission.STOCK_ENTRY_DELETE);
        setDeletePermission(deletePermission);
    }

	const onSelectStore = (selectedStore) => {
		if (selectedStore) {
			stockEntryService.addStockEntry(selectedStore.id, new Date(), async (error, response) => {
				if (response && response.data) {
					await stockEntryService.syncStockEntry(response.data.stockEntryDetails);
					navigation.navigate("StockEntry/Product", {
						stockEntryId: response.data.stockEntryDetails.id,
						storeId: storeId,
						locationName: locationName,
						date: response.data.stockEntryDetails.date,
						owner: ownerName,
						isNewStockEntry: true,

					});
				}
			});
		}
	}

	const AddNew = () => {
			stockEntryService.addStockEntry(storeId, new Date(), async (error, response) => {
				if (response && response.data) {
					await stockEntryService.syncStockEntry(response.data.stockEntryDetails);
					navigation.navigate("StockEntry/Product", {
						stockEntryId: response.data.stockEntryDetails.id,
						storeId: storeId,
						locationName: locationName,
						date: response.data.stockEntryDetails.date,
						owner: ownerName,
						isNewStockEntry: true,
						stockEntryNumber : response.data.stockEntryDetails.stock_entry_number

					});
				}
			});
	}

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
				setSelectedRowMap("");
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
						setSelectedRowMap(rowMap);
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
		let fullName = getFullName(item?.owner_first_name,item?.owner_last_name);
		return (
			<StockEntryCard
				onPress={() => {
					stockEntryService.syncStockEntry(item);
					navigation.navigate("StockEntry/Product", {
						stockEntryId: item?.id,
						locationName: item?.location,
						storeId: item?.store_id,
						date: item?.date,
						owner: fullName,
						status: item.status,
						stockEntryNumber : item?.stock_entry_number
						
					});
				}}
				stock_entry_number={item.stock_entry_number}
				date={item.date}
				store={item.location}
				firstName={item.owner_first_name}
				lastName={item.owner_last_name}
				status={item.status}
				media = {item.media_url}
				alternative={containerStyle}
				statusColor = {item.statusColor}
				stockEntryManageOtherPermission = {permission && permission.stockEntryManageOtherPermission}
			/>
		);
	};

	const handleSubmit = async () => {
        getStockEntryList(values);
        closeDrawer();
    };
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
    const userOnSelect = (value) => {
        if (value) {
            setValues((prevValues) => ({
                ...prevValues,
                user: value?.value,
            }));
        } else {
            setValues((prevValues) => ({
                ...prevValues,
                user: "",
            }));
        }
    };
    const locationOnSelect = (value) => {
        if (value) {
            setValues((prevValues) => ({
                ...prevValues,
                location: value,
            }));
        } else {
            setValues((prevValues) => ({
                ...prevValues,
                location: "",
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
	const LoadMoreList = async () => {
		try {
		  setIsFetching(true);
		  let param = {sort : "createdAt" , sortDir : "DESC", page : page};
		  if (values?.status) {
			param.status = values?.status;
		}

	
		if (values?.user) {
			param.user = values?.user;
		}
		if (values?.location) {
			param.location = values?.location;
		}
		if (values?.startDate) {
			param.startDate = DateTime.formatDate(values?.startDate);
		}
		if (values?.endDate) {
			param.endDate = DateTime.formatDate(values?.endDate);
		}

		  stockEntryService.search(param, (error, response) => {
			let stockEntry = response.data.data;
			// Set response in state
			setStockEntryList((prevTitles) => {
			  return [...new Set([...prevTitles, ...stockEntry])];
			});
			setPage((prevPageNumber) => prevPageNumber + 1);
			setHasMore(stockEntry.length > 0);
			setIsFetching(false);
		  })
	
		} catch (err) {
		  console.log(err);
		  setIsLoading(false);
		}
	  };

	const stockEntryDelete = async () => {
		if (selectedItem) {
			stockEntryService.DeleteStockEntry(selectedItem.id, (error, response) => {
				getStockEntryList(response)
			})
		}
	};

 const getFilterList = async () => {
    let status = [];
    const response = await StatusService.list(ObjectName.STOCK_ENTRY);
    
    response && response.forEach((statusList) => {
            status.push({
                label: statusList.name,
                value: statusList.status_id,
                id: statusList.status_id
            });
    });

    setStatusList(status);
    userService.list(null, (callback) => { setUserList(callback) });
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


	/* Render flat list funciton end */

	return (
		<Layout 
		title={"Stock Entry"} 
		addButton={permission && permission.addPermission ? true : false} 
		buttonOnPress={AddNew} 
		isLoading={isLoading} 
        refreshing={refreshing}
		
		showFilter
		onFilterPress={closeDrawer}

		>
			 <FilterDrawer
                values={values}
                isOpen={openFilter}
                closeDrawer={closeDrawer}
                locationOnSelect={locationOnSelect}
                statusOnSelect={statusOnSelect}
                userOnSelect={userOnSelect}
                onDateSelect={onDateSelect}
                onEndDateSelect={onEndDateSelect}
                selectedEndDate={selectedEndDate}
				userList={userList}
                selectedDate={selectedDate}
                handleSubmit={handleSubmit}
				showUser={permission && permission.stockEntryManageOtherPermission}
				showDate
				statusList={statusList}
				showStatus
				locationList={locationList}
				showLocation
                clearFilter={() => {
                    setValues("");
                    stockEntryList;
                    closeDrawer();
                }}
                applyFilter={(value) => applyFilter(value)}
            />
            <Refresh refreshing={refreshing} isLoading = {isLoading} setRefreshing={setRefreshing}>

				<View>

					<StockDeleteModal
						modalVisible={StockDeleteModalOpen}
						toggle={stockDeleteModalToggle}
						item={selectedItem}
						updateAction={stockEntryDelete}
						
					/>


					{stockEntryList && stockEntryList.length > 0 ?
						<SwipeListView
							data={stockEntryList}
							renderItem={renderItem}
							renderHiddenItem={renderHiddenItem}
							rightOpenValue={-70}
							previewOpenValue={-40}
							previewOpenDelay={3000}
							disableRightSwipe={true}
							disableLeftSwipe={deletePermission ? false : true}
							closeOnRowOpen={true}
							keyExtractor={item => String(item.id)}
						/>

						: (

							<NoRecordFound iconName="receipt" />
						)}

				<ShowMore List={stockEntryList} isFetching={isFetching} HasMore={HasMore} onPress={LoadMoreList} />
				</View>
				</Refresh>


		</Layout>
	);
};

export default Index;

const styles = StyleSheet.create({

	container: {
		flex: 1,
		overflow: "scroll",
		backgroundColor: "#fff",
	},
	card: {
		paddingLeft: 20,
		height: 70,
		backgroundColor: "#fff",
		borderColor: "#fff",
		elevation: 5,
	},
	cartText: {
		fontSize: 16,
		fontWeight: "600",
		textTransform: "capitalize",
	},
	swipeStyle: {
		flex: 1,

	},
	actionDeleteButton: {
		alignItems: 'center',
		bottom: 10,
		justifyContent: 'center',
		position: 'absolute',
		top: 16,
		width: 70,
		backgroundColor: '#D11A2A',
		right: 7
	},
	btnText: {
		color: Color.WHITE,
	},


});
