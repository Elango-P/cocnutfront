import React, { useEffect, useState, useRef } from "react";
import {
    View,
} from "react-native";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { SwipeListView } from "react-native-swipe-list-view";

// Components
import Layout from "../../components/Layout";
import FineCard from "../fine/components/FineCard";
import AlternativeColor from "../../components/AlternativeBackground";
import ShowMore from "../../components/ShowMore";
import Refresh from "../../components/Refresh";
import NoRecordFound from "../../components/NoRecordFound";
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";
import FilterDrawer from "../../components/Filter";

// Services
import fineService from "../../services/FineService";
import PermissionService from "../../services/PermissionService";
import StatusService from "../../services/StatusServices";
import userService from "../../services/UserService";
import tagService from "../../services/TagService";

// Helpers
import ObjectName from "../../helper/ObjectName";
import Permission from "../../helper/Permission";
import { Tag } from "../../helper/Tag";

// Lib
import DateTime from "../../lib/DateTime";

const Bonus = () => {
    const [bonus, setBonus] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const isFocused = useIsFocused();
    const [page, setPage] = useState(2);
    const [permission, setPermission] = useState("")
    const [deletePermission, setDeletePermission] = useState("")
    const [selectedItem, setSelectedItem] = useState("");
    const [bonusDeleteModalOpen, setBonusDeleteModalOpen] = useState("")
    const [openFilter, setOpenFilter] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedEndDate, setSelectedEndDate] = useState("");
    const [values, setValues] = useState("");
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
        mount && getBonusList(values);

        //cleanup function
        return () => {
            mount = false;
        };

    }, [isFocused]);

    useEffect(() => {
        if (refreshing) {
            getBonusList(values);
        }
    }, [refreshing]);


    useEffect(() => {
        getStatusList();
        getUserList();
        getTagList();
    }, [])

    const AddNew = () => {
        navigation.navigate("FineForm", { isBonusType: true })
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

    const getUserList = () => {
        userService.list(null, (callback) => { setUserList(callback) });
    }

    const getTagList = () => {
        tagService.list({ type: Tag.BONUS_TYPE }, (err, response) => {
            let list = response.data.data
            let tagList = []

            if (list && list.length > 0) {
                for (let i = 0; i < list.length; i++) {
                    tagList.push({
                        label: list[i].name,
                        value: list[i].id,
                        id: list[i].id
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
        getBonusList(values)
        closeDrawer()
    };

    const fineDelete = async () => {
        if (selectedItem) {
            fineService.delete(selectedItem.id, (error, response) => {
                getBonusList()
            })
        }
    };

    const getBonusList = async (values) => {

        bonus && bonus.length == 0 && setIsLoading(true)
        let params = { sort: "id", sortDir: "DESC", isBonusType: true }
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
        await fineService.search(params,
            (err, response) => {
                let bonus = response && response?.data && response?.data?.data;
                setTotalAmount(response?.data?.totalAmount ? response?.data?.totalAmount : 0)
                setBonus(bonus)
                setIsLoading(false);
                setRefreshing(false)
            });
    }

    const LoadMoreList = async () => {
        try {
            setIsFetching(true);
            let params = { page: page, sort: "id", sortDir: "DESC" }
            if (values?.user) {
                params.user = values?.user
            }
            if (values?.status) {
                params.status = values.status
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
            fineService.search(params, (err, response) => {

                let bonus = response && response?.data && response?.data?.data;

                // Set response in state
                setBonus((prevTitles) => {
                    return [...new Set([...prevTitles, ...bonus])];
                });
                setPage((prevPageNumber) => prevPageNumber + 1);
                setHasMore(bonus.length > 0);
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

    const bonusDeleteModalToggle = () => {
        setBonusDeleteModalOpen(!bonusDeleteModalOpen);
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
                    navigation.navigate("FineForm", { item: { ...item, isBonusType: true } });
                }}
            />
        );
    };

    return (
        <Layout
            title='Bonus'
            addButton={permission ? true : false}
            buttonOnPress={AddNew}
            isLoading={isLoading}
            refreshing={refreshing}
            showFilter={true}
            onFilterPress={closeDrawer}
            totalAmountValue={totalAmount}
            totalAmountLabel="Total Amount"
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
                        modalVisible={bonusDeleteModalOpen}
                        toggle={bonusDeleteModalToggle}
                        item={selectedItem}
                        updateAction={fineDelete}
                        id={selectedItem?.id}
                    />
                    {bonus && bonus.length > 0 ?
                        <SwipeListView
                            data={bonus}
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
                        <NoRecordFound
                            iconName={"receipt"}
                            styles={{ paddingVertical: 250, alignItems: "center" }}
                        />
                    }
                    <ShowMore List={bonus} isFetching={isFetching} HasMore={HasMore} onPress={LoadMoreList} />
                </View>
            </Refresh>
        </Layout>
    )
}


export default Bonus;
