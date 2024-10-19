import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    View
} from "react-native";
import AlternativeColor from "../../components/AlternativeBackground";
import FilterDrawer from "../../components/Filter";
import Layout from "../../components/Layout";
import NoRecordFound from "../../components/NoRecordFound";
import Refresh from "../../components/Refresh";
import ShowMore from "../../components/ShowMore";
import ObjectName from "../../helper/ObjectName";
import Permission from "../../helper/Permission";
import Status from "../../helper/Status";
import TabName from "../../helper/Tab";
import DateTime from "../../lib/DateTime";
import activityService from "../../services/ActivityService";
import PermissionService from "../../services/PermissionService";
import StatusService from "../../services/StatusServices";
import userService from "../../services/UserService";
import ActivityCard from "./Components/ActivityCard";
import { useForm } from "react-hook-form";
import DateFilter from "../../components/DateFilter";
import { Filter } from "../../helper/Filter";


const Activity = (props) => {
    const param = props?.route?.params;
    const [activity, setActivity] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const isFocused = useIsFocused();
    const [page, setPage] = useState(2);
    const [HasMore, setHasMore] = useState(true);
    const [isNew, setIsNew] = useState("")
    const [activeTab, setActiveTab] = useState(TabName.PENDING)
    const [userList, setUserList] = useState([]);

    const [values, setValues] = useState({
        status: null,
        selectedDate: Filter.TODAY_VALUE,
        user : param?.user
    });
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedEndDate, setSelectedEndDate] = useState(new Date());
    const [isOpenFilter, setIsOpenFilter] = useState(false);
    const [activityTypeList, setActivityTypeList] = useState([])
    const [statusList, setStatusList] = useState([]);
    const [manageOthers, setManageOthers] = useState("");

    const navigation = useNavigation();

    useEffect(() => {
        if (isFocused) {
            getActivityList(values);
            getPermission()
            getUserList()
            getActivityTypeList()
            getStatusList();
        }

    }, [isFocused, navigation, activeTab]);
    useEffect(() => {
        if (refreshing) {
            getActivityList(values);
        }
    }, [refreshing])
    const {
        control,
        formState: { errors },
    } = useForm();

    const getActivityTypeList = () => {
        let activityList = new Array();
        activityService.getActivityType((error, response) => {

            let activityTypeList = response?.data?.data;
            for (let i = 0; i < activityTypeList.length; i++) {
                activityList.push({
                    value: activityTypeList[i].id,
                    label: activityTypeList[i].name,
                    type: activityTypeList[i].type

                })

            }
            setActivityTypeList(activityList)
        })
    }

    const getStatusList = async () => {
        let status = [];
        const response = await StatusService.list(ObjectName.ACTIVITY);
        response && response.forEach((statusList) => {
            status.push({
                label: statusList.name,
                value: statusList.status_id,
                id: statusList.status_id
            });
        });

        let pendingStatusId = await StatusService.getStatusIdByName(
            ObjectName.ACTIVITY,
            Status.GROUP_PENDING
        );

        if (values && values?.status == null) {
            setValues((prevValues) => ({
                ...prevValues,
                status: pendingStatusId,
            }));
        }

        setStatusList(status);
    }



    const getActivityList = async (values) => {
        activity && activity.length == 0 && setIsLoading(true)
        let pendingStatusId = await StatusService.getStatusIdByName(
            ObjectName.ACTIVITY,
            Status.GROUP_PENDING
        );

        let param = {};

        param.status =values?.status ? values?.status : values?.status == "" ? "":  pendingStatusId

        if (values?.user) {
            param.user = values?.user;
        }

        if (values?.activityType) {
            param.activityType = values?.activityType;
        }
        if (values?.selectedDate) {
            param.date = values.selectedDate

        }

        if (values?.startDate) {
            param.startDate = DateTime.formatDate(values?.startDate);
        }
        if (values?.endDate) {
            param.endDate = DateTime.formatDate(values?.endDate);
        }
        let mount = true;
        mount && await activityService.search(param,
            (err, res) => {
                let data = res && res?.data?.data
                setActivity(data)
                setIsLoading(false)
                setRefreshing(false)
            });
        setPage(2);

        return () => {
            mount = false;
        };
    }

    const getUserList = () => {
        userService.list(null, (callback) => { setUserList(callback) });

    }
    const handleDateFilterChange = (value) => {
        setValues((preValue) => ({
            ...preValue,
            selectedDate: value
        }))
        getActivityList({
            startDate: values?.startDate,
            endDate: values?.endDate,
            user : values?.user,
            selectedDate: value
        })

    }

    const getPermission = async () => {
        const isNew = await PermissionService.hasPermission(Permission.ACTIVITY_ADD);
        const manageOthers = await PermissionService.hasPermission(Permission.ACTIVITY_MANAGE_OTHERS);
        setIsNew(isNew);
        setManageOthers(manageOthers)
    }


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
                user: value.value,
            }));
        } else {
            setValues((prevValues) => ({
                ...prevValues,
                user: "",
            }));
        }
    };

    const activityTypeSelect = (value) => {
        if (value) {
            setValues((prevValues) => ({
                ...prevValues,
                activityType: value,
            }));
        } else {
            setValues((prevValues) => ({
                ...prevValues,
                activityType: "",
            }));
        }
    };



    const LoadMoreList = async () => {
        try {
            setIsFetching(true);

            let param = {};

            if (values?.status) {
                param.status = values?.status
            }

            if (values?.user) {
                param.user = values?.user;
            }

            if (values?.activityType) {
                param.activityType = values?.activityType;
            }

            param.page = page

            param.pageSize = 25

            if (values?.selectedDate) {
                param.date = values.selectedDate

            }
            if (values?.startDate) {
                param.startDate = DateTime.formatDate(values?.startDate);
            }
            if (values?.endDate) {
                param.endDate = DateTime.formatDate(values?.endDate);
            }
            await activityService.search(param,
                (err, res) => {
                    let data = res && res?.data?.data
                    setActivity((prevTitles) => {
                        return [...new Set([...prevTitles, ...data])];
                    });
                    setPage((prevPageNumber) => prevPageNumber + 1);
                    setHasMore(data.length > 0);
                    setIsFetching(false);

                });
        } catch (err) {
            console.log(err);
            setIsLoading(false);
        }
    };

    const closeAndOpenFilterDrawer = () => {
        setIsOpenFilter(!isOpenFilter);
    }

    const handleSubmit = async () => {
        getActivityList({ ...values });
        closeAndOpenFilterDrawer();
    };

    return (

        <Layout
            title="Activity"
            addButton={isNew ? true : false}
            buttonOnPress={() => {
                navigation.navigate("/ActivityTypeScreen", { isAddPage: true })
            }}
            showBackIcon={false}
            refreshing={refreshing}
            onFilterPress={closeAndOpenFilterDrawer}
            showFilter
            filter={
                <DateFilter
                    handleDateFilterChange={handleDateFilterChange}
                    control={control}
                    data={values?.selectedDate}
                    showCloseIcon={false}
                />}
        >

            <FilterDrawer
                values={values}
                isOpen={isOpenFilter}
                closeDrawer={closeAndOpenFilterDrawer}
                statusOnSelect={statusOnSelect}
                userOnSelect={userOnSelect}
                onDateSelect={onDateSelect}
                onEndDateSelect={onEndDateSelect}
                selectedEndDate={selectedEndDate}
                selectedDate={selectedDate}
                userList={userList}
                showUser={manageOthers}
                showActivityType
                showDate
                statusOnSelec={statusOnSelect}
                showStatus
                statusList={statusList}
                activityTypeOption={activityTypeList}
                activityTypeSelect={activityTypeSelect}
                handleSubmit={handleSubmit}
                clearFilter={() => {
                    setValues("");
                    getActivityList();
                    closeAndOpenFilterDrawer();
                }}
            />
            <Refresh refreshing={refreshing} setRefreshing={setRefreshing} isLoading={isLoading}>
                <View>
                    {activity && activity.length > 0 ? (activity.map((item, index) => {

                        const containerStyle = AlternativeColor.getBackgroundColor(index)
                        return (
                            <ActivityCard
                                id={item.id}
                                date={item.date}
                                type={item.activityTypeName}
                                user={item.userName}
                                lastName={item.userLastName}
                                imageUrl={item.userAvatarUrl}
                                status={item.status}
                                statusColor={item.statusColor}
                                alternative={containerStyle}
                                manageOthers={manageOthers}
                                onPress={() => {
                                    navigation.navigate("/ActivityTypeScreen", { item, isDetailPage: true });
                                }}
                            />
                        )
                    })) : (
                        <NoRecordFound iconName={"receipt"} />
                    )

                    }
                    <ShowMore List={activity} isFetching={isFetching} HasMore={HasMore} onPress={LoadMoreList} />

                </View>

            </Refresh>
        </Layout >
    );
};

export default Activity;
