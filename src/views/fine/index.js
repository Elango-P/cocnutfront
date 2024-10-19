import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    View,
} from "react-native";
import Layout from "../../components/Layout";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import fineService from "../../services/FineService";
import FineCard from "./components/FineCard";
import Permission from "../../helper/Permission";
import PermissionService from "../../services/PermissionService";
import AlternativeColor from "../../components/AlternativeBackground";
import ShowMore from "../../components/ShowMore";
import Refresh from "../../components/Refresh";
import NoRecordFound from "../../components/NoRecordFound";
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";
import { SwipeListView } from "react-native-swipe-list-view";
import DateTime from "../../lib/DateTime";
import FilterDrawer from "../../components/Filter";
import ObjectName from "../../helper/ObjectName";
import StatusService from "../../services/StatusServices";
import userService from "../../services/UserService";
import tagService from "../../services/TagService";
import { Tag } from "../../helper/Tag";
import DateFilter from "../../components/DateFilter";
import { useForm } from "react-hook-form";
import { Filter } from "../../helper/Filter";


const Fine = (props) => {    
    const param = props?.route?.params;
    const [fine, setFine] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const isFocused = useIsFocused();
    const [page, setPage] = useState(2);
    const [permission, setPermission] = useState("")
    const [deletePermission, setDeletePermission] = useState("")
    const [selectedItem, setSelectedItem] = useState("");
    const [fineDeleteModalOpen,setFineDeleteModalOpen] = useState("")
    const [openFilter, setOpenFilter] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedEndDate, setSelectedEndDate] = useState("");
    const [values,setValues] = useState({
        selectedDate: Filter.TODAY_VALUE,
        user : param?.user
    });

    const [HasMore, setHasMore] = useState(true);
    const [statusList, setStatusList] = useState();
    const [userList, setUserList] = useState();
    const [typeList, setTypeList] = useState();
    const [fineManageOters, setFineManageOthers] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0)


    const navigation = useNavigation();
    const stateRef = useRef();


    const addPermission = async () => {
        const addPermission = await PermissionService.hasPermission(Permission.FINE_ADD);
        setPermission(addPermission);
        const deletePermission = await PermissionService.hasPermission(Permission.FINE_DELETE);
        setDeletePermission(deletePermission);
        const manageOthers = await PermissionService.hasPermission(Permission.FINE_MANAGE_OTHERS);
        setFineManageOthers(manageOthers);
    }
    useEffect(() => {
        let mount = true;
        mount && addPermission()
        //cleanup function
        return () => {
            mount = false;
        };
    }, [refreshing]);

    useEffect(() => {
        let mount = true;
        mount && getFineList(values);

        //cleanup function
        return () => {
            mount = false;
        };

    }, [isFocused]);
    useEffect(() => {
        if(refreshing){
            getFineList(values);
        }

    }, [refreshing]);



    useEffect(()=>{
        getStatusList();
        getUserList();
        getTagList();
    },[])

    const {
        control,
        formState: { errors },
    } = useForm();

    const AddNew = () => {
        navigation.navigate("FineForm");
    };
    const getStatusList = async () => {
        let status = [];
        const response = await StatusService.list(ObjectName.FINE);

        response && response.forEach((statusList) => {
            status.push({
                label: statusList.name,
                value: statusList.status_id,
                id: statusList.status_id
            });
        });

        setStatusList(status);
    }
    const getUserList = ()=>{
        userService.list(null, (callback) => { setUserList(callback) });

    }
       const getTagList = ()=>{
        tagService.list({ type: Tag.FINE_TYPE }, (err, response) => {
            let list = response.data.data
            let tagList = []
    
            if(list && list.length > 0) {
                for(let i=0; i<list.length; i++) {
                tagList.push({
                    label : list[i].name,
                    value:list[i].id,
                    id:list[i].id
                })
            }
            }
            setTypeList(tagList)
        })
       }
    const closeDrawer = () => {
        setOpenFilter(!openFilter);
    }
    const userOnSelect = (value) => {
        if (value) {
            setValues((prevValues) => ({
                ...prevValues,
                user: value.value
            }));
        } else {
            setValues((prevValues) => ({
                ...prevValues,
                user: ""
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
    const typeOnSelect = (value) => {
        if (value) {
            setValues((prevValues) => ({
                ...prevValues,
                type: value.value
            }));
        } else {
            setValues((prevValues) => ({
                ...prevValues,
                type: ""
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


    const handleSubmit = () => {
        getFineList(values)
        closeDrawer()
    };

    const fineDelete = async () => {
        if (selectedItem) {
            fineService.delete(selectedItem.id, (error, response) => {
                getFineList()
            })
        }
    };
    const getFineList = async (values) => {

        fine && fine.length == 0 && setIsLoading(true)
        let params = { sort: "id", sortDir: "DESC", isFineType: true }
        if (values?.status) {
            params.status = values.status
        }
        if (values?.user) {
            params.user = values?.user
        }
        if (values?.type) {
            params.type = values?.type
        }
        if (values?.startDate) {
            params.startDate = DateTime.formatDate(values?.startDate)
        }
        if (values?.endDate) {
            params.endDate = DateTime.formatDate(values?.endDate)
        }

        if (values?.selectedDate) {
            params.orderDate = values?.selectedDate
        }

        await fineService.search(params,
            (err, response) => {
                let fines = response && response
                    ?.data && response?.data?.data;
                setFine(fines)
                setTotalAmount(response?.data?.totalAmount ? response?.data?.totalAmount : 0)
                setIsLoading(false);
                setRefreshing(false)

            });
    }

    const LoadMoreList = async () => {
        try {
            setIsFetching(true);
    
            let params = { page: page, sort: "id", sortDir: "DESC"  }
            if(values?.user){
                params.user = values?.user
               }
               if(values?.status){
                params.status = values.status
               }
               if(values?.type){
                params.type = values?.type
               }
               if(values?.startDate){
                params.startDate = DateTime.formatDate(values?.startDate)  
                }
               if(values?.endDate){
                params.endDate = DateTime.formatDate(values?.endDate)
               }
               if(values?.selectedDate){
                params.orderDate = values?.selectedDate
               }
    
            fineService.search(params, (err,response) => {
    
                let fines = response && response?.data && response?.data?.data;
    
                // Set response in state
                setFine((prevTitles) => {
                    return [...new Set([...prevTitles, ...fines])];
                });
                setPage((prevPageNumber) => prevPageNumber + 1);
                setHasMore(fines.length > 0);
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
    const fineDeleteModalToggle = () => {
        setFineDeleteModalOpen(!fineDeleteModalOpen);
        clearRowDetail();
    }


    const renderItem = data => {
        let item = data?.item;
        let index = data?.index;
        const containerStyle = AlternativeColor.getBackgroundColor(index)
        return (
            <FineCard
                id={item.id}
                date={item.date}
                type={item.type}
                user={item.user}
                media_url={item.media_url}
                amount={item.amount}
                status={item.status}
                statusColor={item.statusColor}
                alternative={containerStyle}
                onPress={() => {
                    navigation.navigate("FineForm", { item });
                }}
                data={item}
            />
        );
    };

    const handleDateFilterChange = (value) => {
        setValues((preValue) => ({
            ...preValue,
            selectedDate: value
        }))
        getFineList({
            ...values,
            selectedDate: value,
        })

    }

    return (
        <Layout
            title='Fines'
            addButton={permission ? true : false}
            buttonOnPress={AddNew}
            isLoading={isLoading}
            refreshing={refreshing}
            showFilter={true}
            onFilterPress={closeDrawer}
            showBackIcon={false}
            filter={
                <DateFilter
                    handleDateFilterChange={handleDateFilterChange}
                    control={control}
                    data={values?.selectedDate}
                    showCloseIcon={false}
                />}
            totalAmountValue={totalAmount}
            totalAmountLabel="Total"
        >
            <FilterDrawer
                values={values}
                setValues={setValues}
                isOpen={openFilter}
                closeDrawer={closeDrawer}
                userOnSelect={userOnSelect}
                statusOnSelect={statusOnSelect}
                typeOnSelect={typeOnSelect}
                handleSubmit={handleSubmit}
                onDateSelect={onDateSelect}
                selectedDate={selectedDate}
                selectedEndDate={selectedEndDate}
                onEndDateSelect={onEndDateSelect}
                typeList={typeList}
                statusList={statusList}
                userList={userList}
                showStatus
                showType
                showDate
                showUser={fineManageOters}

            />

            <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
                <View>
                    <DeleteConfirmationModal
                        modalVisible={fineDeleteModalOpen}
                        toggle={fineDeleteModalToggle}
                        item={selectedItem}
                        updateAction={fineDelete}

                        id={selectedItem?.id}

                    />
                    {fine && fine.length > 0 ?

                        <SwipeListView
                            data={fine}
                            renderItem={renderItem}
                            rightOpenValue={-70}
                            previewOpenValue={-40}
                            previewOpenDelay={3000}
                            disableRightSwipe={true}
                            disableLeftSwipe={false}
                            closeOnRowOpen={true}
                            keyExtractor={item => String(item.id)}
                        />
                        :
                        <NoRecordFound iconName={"receipt"} styles={{ paddingVertical: 250, alignItems: "center" }} />

                    }
                    <ShowMore List={fine} isFetching={isFetching} HasMore={HasMore} onPress={LoadMoreList} />
                </View>
            </Refresh>
        </Layout>
    )
}


export default Fine;

