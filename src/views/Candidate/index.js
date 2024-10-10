// Import React and Component
import React, { useState, useEffect, useCallback } from "react";
import {
    StyleSheet,
    View,
    Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Layout from "../../components/Layout";
import { useIsFocused } from "@react-navigation/native";
import Refresh from "../../components/Refresh";
import ShowMore from "../../components/ShowMore";
import CandidateProfileService from "../../services/CandidateProfileService";
import CandidateCard from "./CandidateCard";
import Permission from "../../helper/Permission";
import PermissionService from "../../services/PermissionService";
import FilterDrawer from "../../components/Filter";
import ObjectName from "../../helper/ObjectName";
import DateTime from "../../lib/DateTime";
import StatusService from "../../services/StatusServices";
import userService from "../../services/UserService";
import SearchBar from "../../components/SearchBar";
import styles from "../../helper/Styles";




const Candidate = (props) => {
    const [candidateList, setCandidateList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [permission, setPermission] = useState("")
    const [refreshing, setRefreshing] = useState(false);
    const [searchPhrase, setSearchPhrase] = useState("");
    const [clicked, setClicked] = useState(false);
    const [search, setSearch] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    //setting tha initial page
    const [page, setPage] = useState(2);
    //we need to know if there is more data
    const [HasMore, setHasMore] = useState(true);
    const [values, setValues] = useState("");
    const [openFilter, setOpenFilter] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedEndDate, setSelectedEndDate] = useState("");
    const [statusList, setStatusList] = useState();
    const [userList, setUserList] = useState();
    const [searchParam, setSearchParam] = useState("");




    const isFocused = useIsFocused();

    const navigation = useNavigation();
    useEffect(() => {
        let mount = true;
        mount && getCandidateList(values)
        mount && getPermission()
        //cleanup function
        return () => {
            mount = false;
        };
    }, [isFocused]);
    useEffect(()=>{
        if(refreshing){
            getCandidateList(values)
        }
    },[refreshing])
    

    useEffect(() => {
        getStatusList();
        getUserList();
    
      }, [])

    const getStatusList = async () => {
        let status = [];
        const response = await StatusService.list(ObjectName.CANDIDATE);

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

    const getCandidateList = async (values) => {
        try {            
            setPage(2);
            candidateList && candidateList.length == 0 && setIsLoading(true);

            let params = { page: 1 };
            if (values?.status) {
                params.status = values.status
            }
            if(values && values?.search){                
                params.search = values?.search
            }
            if (values?.user) {
                params.owner_id = values?.user
            }
            if (values?.startDate) {
                params.startDate = DateTime.formatDate(values?.startDate)
            }
            if (values?.endDate) {
                params.endDate = DateTime.formatDate(values?.endDate)
            }
             
            CandidateProfileService.search(params, (response) => {
                let candidate = response?.data?.data;
                setCandidateList(candidate);

                setIsLoading(false);
                setRefreshing(false)
            })
        } catch (err) {
            console.log(err);
            setIsLoading(false);
        }
    };
    const LoadMoreList = async () => {
        try {
            setIsFetching(true);

            let params = { page: page }
            if (values?.status) {
                params.status = values.status
            }
            if (values?.user) {
                params.owner_id = values?.user
            }
            if (values?.startDate) {
                params.startDate = DateTime.formatDate(values?.startDate)
            }
            if (values?.endDate) {
                params.endDate = DateTime.formatDate(values?.endDate)
            }

            CandidateProfileService.search(params, (response) => {

                let candidate = response?.data?.data;
                // Set response in state
                setCandidateList((prevTitles) => {
                    return [...new Set([...prevTitles, ...candidate])];
                });
                setPage((prevPageNumber) => prevPageNumber + 1);
                setHasMore(candidate.length > 0);
                setIsFetching(false);
            });
        } catch (err) {
            console.log(err);
            setIsLoading(false);
        }
    };


    const AddNew = () => {
        navigation.navigate("Candidate/Form");
    };

    const getPermission = async () => {
        let add = await PermissionService.hasPermission(Permission.CANDIDATE_ADD)
        setPermission(add)
    }
    const closeDrawer = () => {
        setOpenFilter(!openFilter);
    }
    const handleSubmit = () => {
        getCandidateList(values)
        closeDrawer()
    };
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
    const handleChange = async (search) => {
        setSearchParam(search);
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
        getCandidateList({ search: search});
    };


    return (
        <Layout
            title={"Candidate"}
            addButton={permission ? true : false}
            buttonOnPress={AddNew}
            isLoading={isLoading}
            refreshing={refreshing}
            showFilter={true}
            onFilterPress={closeDrawer}

        >
            <FilterDrawer
                values={values}
                isOpen={openFilter}
                closeDrawer={closeDrawer}
                statusOnSelect={statusOnSelect}
                userOnSelect={userOnSelect}
                onDateSelect={onDateSelect}
                onEndDateSelect={onEndDateSelect}
                selectedEndDate={selectedEndDate}
                selectedDate={selectedDate}
                statusList={statusList}
                userList={userList}
                showUser
                label = {"Owner"}
                showStatus
                showDate
                handleSubmit={handleSubmit}
                clearFilter={() => {
                    setValues("");
                    getCandidateList();
                    closeDrawer();
                }}

            />
             
            <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
            <View style={styles.searchBar}>
                        <SearchBar
                            searchPhrase={searchPhrase}
                            setSearchPhrase={setSearchPhrase}
                            setClicked={setClicked}
                            clicked={clicked}
                            setSearch={setSearch}
                            onPress={getCandidateList}
                            handleChange={handleChange}
                            noScanner
                        />
                    </View>
                <View style={styles.container}>
                    <CandidateCard
                        candidateList={candidateList}
                    />
                    <ShowMore List={candidateList} isFetching={isFetching} HasMore={HasMore} onPress={LoadMoreList} />

                </View>
            </Refresh>
        </Layout>
    );
};

export default Candidate;

