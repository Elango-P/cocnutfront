import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from "react-native";
import Layout from "../../components/Layout";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import apiClient from "../../apiClient";
import { endpoints } from "../../helper/ApiEndPoint";
import ticketService from "../../services/TicketServices";
import AlternativeColor from "../../components/AlternativeBackground";
import ShowMore from "../../components/ShowMore";
import TicketCard from "./components/TicketCard";
import NoRecordFound from "../../components/NoRecordFound";
import Refresh from "../../components/Refresh";
import SearchBar from "../../components/SearchBar";
import style from "../../helper/Styles";
import Tab from "../../components/Tab";
import TabName from '../../helper/Tab';
import asyncStorageService from "../../services/AsyncStorageService";
import FilterDrawer from "../../components/Filter";
import StatusService from "../../services/StatusServices";
import ObjectName from "../../helper/ObjectName";
import ProjectService from "../../services/ProjectService";
import DateTime from "../../lib/DateTime";
import userService from "../../services/UserService";
import SprintService from "../../services/SprintService";
import { groupOption } from "../../helper/Group";
import PermissionService from "../../services/PermissionService";
import Permission from "../../helper/Permission";
import ticketTypeService from "../../services/TicketTypeService";
import Status from "../../helper/Status";
import styles from "../../helper/Styles";


const Ticket = () => {
  const [ticket, setTicket] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const [page, setPage] = useState(2);
  const [HasMore, setHasMore] = useState(true);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [clicked, setClicked] = useState(false);
  const [search, setSearch] = useState(false);
  const [searchParam, setSearchParam] = useState("")
  const [activeTab, setActiveTab] = useState(TabName.ASSIGNED);
  const [selectedUser, setSelectedUser] = useState(null);
  const [values, setValues] = useState();
  const [openFilter, setOpenFilter] = useState(false);
  const [statusList, setStatusList] = useState([])
  const [userList, setUserList] = useState([])
  const [sprintList, setSprintList] = useState([])
  const [projectList, setProjectList] = useState([])
  const [projectId, setProjectId] = useState(null)
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [permission, setPermission] = useState({});
  const [ticketTypeList, setTicketTypeList] = useState([]);

  const navigation = useNavigation();
  useEffect(() => {
      getTicketList(selectedUser,values);
  }, [isFocused, searchPhrase,selectedUser,activeTab]);

  useEffect(() => {
    if (refreshing) {
      getTicketList(selectedUser,values);
    }

  }, [refreshing,searchPhrase,activeTab]);
  
  
  useEffect(() => {
    getAsyncStorageItem()
    getProjectList();
    getTicketTypeList()
    getUserList();
    getSprint();
    getStatusList();
    getPermission();

  }, [isFocused])
  
  useEffect(() => {
    if (projectId) {
      getStatusList()

    }

  }, [projectId])

  const closeDrawer = () => {
    setOpenFilter(!openFilter);
  }
  
  const getPermission = async () => {
    let addPermission = await PermissionService.hasPermission(Permission.TICKET_ADD);
    let manageOthers = await PermissionService.hasPermission(Permission.TICKET_MANAGE_OTHERS);
    let filterViewPermission = await PermissionService.hasPermission(Permission.TICKET_ALLOW_ADVANCED_FILTER);
    setPermission({ addPermission : addPermission, manageOthers: manageOthers, filterViewPermission: filterViewPermission})
  }



  const getTicketList = async (id, values) => {
    setPage(2);
    ticket && ticket.length == 0 && setIsLoading(true);    

    let params = {ObjectName : ObjectName.TICKET}
      params = { ...params, search: searchPhrase ? searchPhrase : ""};
    if (values && values.project) {
      params = { ...params, projectId: values.project };
    }
    if (values && values.status) {
      params = { ...params, status: values.status };
    }
    if (values && values.user) {
      params = { ...params, user: values.user };
    }
    if (values && values.reporter) {
      params = { ...params, reporter: values.reporter };
    }
    if (values && values.sprint) {
      params = { ...params, sprint: values.sprint };
    }
    if (values && values.group) {
      params = { ...params, group: values.group };
    }
    if (values && values.startDate) {
      params = { ...params, startDate: DateTime.formatDate(values?.startDate) };
    }
    if (values && values.endDate) {
      params = { ...params, endDate: DateTime.formatDate(values?.endDate) };
    }




    if (activeTab === TabName.ASSIGNED) {
      if (id) {
        params = { ...params, user: id };
      }

    }
    if (activeTab === TabName.REPORTED) {

      params = { ...params, reporter: selectedUser }
      
    }
    if (activeTab === TabName.ALL) {

      params = {...params}

    }    

    await ticketService.searchTicket(params, (error, response) => {
      setTicket(response && response.data  && response.data.data)
      setIsLoading(false)
      setRefreshing(false)

    })

  }

  const handleChange = async (search) => {   
    setSearchParam(search)  
    getTicketList()

  };
  const handleSubmit = () => {
    getTicketList(null, values)
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
  const groupOnSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        group: value
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        group: ""
      }));
    }
  }
  const userOnselect = (value) => {
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
  const reporterOnselect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        reporter: value.value
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        reporter: ""
      }));
    }
  }
  const projectOnSelect = (value) => {
    setProjectId(value)
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        project: value
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        project: ""
      }));
    }
  }
  const sprintOnSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        sprint: value
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        sprint: ""
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

   const getUserList = ()=>{
    userService.list(null, (callback) => { setUserList(callback) });

}

const getSprint = ()=>{
     SprintService.search(null,(callback)=>{setSprintList(callback)})
}

const getStatusList = async () => {
  const roleId = await asyncStorageService.getRoleId()
  let status = [];
  if(projectId){
    let response = await StatusService.getList(ObjectName.TICKET, projectId, (currentStatus) => {
      status.push({
        label: currentStatus[0].name,
        value: currentStatus[0].status_id,
        id: currentStatus[0].status_id
      })
    });
    response && response.forEach((statusList) => {
      if (statusList.allowed_role_id && statusList.allowed_role_id.split(",").includes(roleId)) {
        status.push({
          label: statusList.name,
          value: statusList.status_id,
          id: statusList.status_id
        });
      }
    });
    setStatusList(status);

  }else {
    let statusList = [];
    let status = await StatusService.list(ObjectName.TICKET);
    
    for (let i = 0; i < status.length; i++) {
      statusList.push({
        label: status[i].name,
        value: status[i].status_id,
        id: status[i].status_id
      });
    }
    
    setStatusList(statusList);
  }
 

};
const getProjectList = () => {
  ProjectService.list(null, (response) => {
    setProjectList(response);

  })
}


  const LoadMoreList = async () => {
    try {
      setIsFetching(true);
      let params = {ObjectName : ObjectName.TICKET}

      if (values && values.project) {
        params = { ...params, projectId: values.project };
      }
      if (values && values.status) {
        params = { ...params, status: values.status };
      }
      if (values && values.user) {
        params = { ...params, user: values.user };
      }
      if (values && values.reporter) {
        params = { ...params, reporter: values.reporter };
      }
      if (values && values.sprint) {
        params = { ...params, sprint: values.sprint };
      }
      if (values && values.startDate) {
        params = { ...params, startDate: DateTime.formatDate(values?.startDate) };
      }
      if (values && values.endDate) {
        params = { ...params, endDate: DateTime.formatDate(values?.endDate) };
      }
      if (values && values.group) {
        params = { ...params, group: values.group };
      }
      if (activeTab === TabName.ASSIGNED) {
        params = { ...params,user: selectedUser, page: page, search: searchPhrase ? searchPhrase : "" }
      }
      if (activeTab === TabName.REPORTED) {
        params = { ...params,reporter: selectedUser, page: page, search: searchPhrase ? searchPhrase : "" }
      }
      if (activeTab === TabName.ALL) {

        params = { ...params,page: page, search: searchPhrase ? searchPhrase : "" }
      }
      ticketService.searchTicket(params, (error, response) => {
        let tickets = response.data.data;
        // Set response in state
        setTicket((prevTitles) => {
          return [...new Set([...prevTitles, ...tickets])];
        });
        setPage((prevPageNumber) => prevPageNumber + 1);
        setHasMore(tickets.length > 0);
        setIsFetching(false);
      })

    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };
  const getTicketTypeList = () => {
    ticketTypeService.search({projectId : projectList && projectList.length == 1 ? projectList[0].value : "",status : Status.ACTIVE}, (err, response) => {
  
        let data = response && response?.data && response?.data?.data;
        let list = [];
        if (data) {
            for (let i = 0; i < data.length; i++) {
                const { id, name, default_story_point, userId,fields} = data[i];
                list.push({
                    label: name,
                    value: id,
                    default_story_point: default_story_point,
                    userId: userId,
                    fields : fields
  
                });
            }
        }
  
        setTicketTypeList(list);
    });
  }

  const getAsyncStorageItem = async () => {

    let userId = await asyncStorageService.getUserId();
    setSelectedUser(userId)

  }  

  const addNew = () => {
    if(projectList && projectList.length == 1 && ticketTypeList && ticketTypeList.length == 1){
      navigation.navigate("Ticket/Add",{projectId : projectList[0].value, ticketTypeValue : ticketTypeList[0]});

    }else if(projectList && projectList.length == 1){
      navigation.navigate("ticketTypeSelector",{projectId : projectList[0].value})
    }else(
      navigation.navigate("projectSelector")
    )
  }

  return (
    <Layout
    title='Tickets'
      addButton={permission && permission.addPermission ? true : false}
      buttonOnPress={addNew}
      isLoading={isLoading}
      refreshing={refreshing}
      showBackIcon={false}
      showFilter={permission && permission.filterViewPermission ? true : false}
      onFilterPress={closeDrawer}
    >
      <FilterDrawer
        values={values}
        isOpen={openFilter}
        closeDrawer={closeDrawer}
        statusOnSelect={statusOnSelect}
        projectOnSelect={projectOnSelect}
        userOnSelect={userOnselect}
        groupOnSelect={groupOnSelect}
        reporterOnselect={reporterOnselect}
        statusList={statusList}
        sprintList={sprintList}
        sprintOnSelect={sprintOnSelect}
        projectList={projectList}
        userList={userList}
        reporterList={userList}
        onDateSelect={onDateSelect}
        onEndDateSelect={onEndDateSelect}
        selectedEndDate={selectedEndDate}
        selectedDate={selectedDate}
        groupOption={groupOption}
        label={'Assignee'}
        placeholder={'Select Assignee'}
        showDate
        showGroup
        showUser={permission && permission.manageOthers}
        showSprint
        showReporter
        showProject={projectList && projectList.length > 1 ? true : false}
        showStatus
        handleSubmit={handleSubmit}
      />
      <View style={style.tabBar}>
        <Tab
          title={[
            {
              title: TabName.ASSIGNED,
              tabName: TabName.ASSIGNED,
            },
            {
              title: TabName.REPORTED,
              tabName: TabName.REPORTED,
            },
            {
              title: TabName.ALL,
              tabName: TabName.ALL,
            },
          ]}
          setActiveTab={setActiveTab}
          defaultTab={activeTab}
        />
      </View>
      <View style={styles.searchBar}>
        <SearchBar
          searchPhrase={searchPhrase}
          setSearchPhrase={setSearchPhrase}
          setClicked={setClicked}
          clicked={clicked}
          setSearch={setSearch}
          onPress={getTicketList}
          handleChange={handleChange}
          noScanner
        />
      </View>
      <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
        <View>
          <>
            {ticket && ticket.length > 0 ? (
              ticket.map((item, index) => {
                const containerStyle =
                  AlternativeColor.getBackgroundColor(index);
                return (
                  <TicketCard
                    due_date={item.due_date}
                    summary={item.summary}
                    assignee_name={item.assignee_name}
                    avatarUrl={item.avatarUrl}
                    status={item.statusName}
                    ticket_number={item.ticket_number}
                    statusColor={item.statusColor}
                    alternative={containerStyle}
                    onPress={() =>
                      navigation.navigate('Ticket/Detail', { item: item })
                    }
                  />
                );
              })
            ) : (
              <NoRecordFound iconName='receipt' />
            )}

            <ShowMore
              List={ticket}
              isFetching={isFetching}
              HasMore={HasMore}
              onPress={LoadMoreList}
            />
          </>
        </View>
      </Refresh>
    </Layout>
  );
};
export default Ticket;
