import React, { useEffect } from "react";
import Layout from "../../components/Layout";
import { ScrollView } from "react-native";
import ProjectSelect from "../../components/ProjectSelect";
import { useState } from "react";
import { useForm } from "react-hook-form";
import VerticalSpace10 from "../../components/VerticleSpace10";
import Select from "../../components/Select";
import ProjectUserSelect from "../../components/ProjectUserSelect";
import ticketTypeService from "../../services/TicketTypeService";
import TextArea from "../../components/TextArea";
import DatePicker from "../../components/DatePicker";
import CheckBox from "../../components/CheckBox";
import styles from "../../helper/Styles";
import { View } from "react-native";
import recurringTaskService from "../../services/RecurringTaskService";
import { useNavigation } from "@react-navigation/native";
import TabName from '../../helper/Tab';
import Tab from "../../components/Tab";
import HistoryList from "../../components/HistoryList";
import ObjectName from "../../helper/ObjectName";
import TicketCard from "../Ticket/components/TicketCard"
import TicketService from "../../services/TicketServices";
import AlternativeColor from "../../components/AlternativeBackground";
import NoRecordFound from "../../components/NoRecordFound";
import Refresh from "../../components/Refresh";
import PermissionService from "../../services/PermissionService";
import Permission from "../../helper/Permission";
import { MenuItem } from "react-native-material-menu";
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";
import RecurringTask from "../../helper/RecurringTask";

const RecurringTaskForm = (props) => {
    const params = props && props.route.params && props.route.params.item;
    const [selectedProject, setSelectedProject] = useState(params?.project_id || "");
    const [typeList, setTypeList] = useState([]);
    const [selectedUser, setSelectedUser] = useState(params?.assignee_id || "");
    const [ticketType, setTicketType] = useState(params?.type_id || "");
    const [selectedDate, setSelectedDate] = useState(params ? new Date(params?.start_date) : "");
    const [selectedRecurringTask, setSelectedRecurringTask] = useState(params?.type || "");
    const [date, setDateOption] = useState(params?.date || [])
    const [selectedDays, setSelectedDays] = useState(params?.day || []);
    const [summary, setSummary] = useState(params?.summary || "");
    const [activeTab, setActiveTab] = useState(TabName.SUMMARY);
    const [ticketList, setTicketList] = useState()
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [actionList, setActionList] = useState([])
    const [visible, setVisible] = useState(false)
    const [allowEdit, setEdit] = useState(true)
    const [recurringTaskHistoryViewPermission, setRecurringTaskHistoryViewPermission] = useState("")
    const [isSubmit,setIsSubmit] = useState(false)

    const navigation = useNavigation();

    const preloadedValues = {
        taskType: selectedRecurringTask,
        date: params && params?.date,
        month: params && params?.month && params?.month.value,
        day: params && selectedDays,
        summary: summary,
    }

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: preloadedValues
    });

    useEffect(() => {
        ticketTypeList();
    }, [selectedProject]);
    useEffect(() => {
        dateOption()
        getActionItems();
        getPermission()
    }, [allowEdit])
    useEffect(() => {
         getTicketList()
    }, [activeTab === TabName.TICKET])

    const getPermission = async () => {
        const isExist = await PermissionService.hasPermission(Permission.RECURRING_TASK_HISTORY_VIEW);
        setRecurringTaskHistoryViewPermission(isExist)
    }

    const ticketTypeList = () => {
        let param = {}

        if (selectedProject) {
            param.projectId = selectedProject?.value ? selectedProject?.value : params?.project_id
        }
        ticketTypeService.search(param, (err, response) => {

            let data = response && response?.data && response?.data?.data;
            let list = [];
            if (data) {
                for (let i = 0; i < data.length; i++) {
                    const { id, name, userId } = data[i];
                    list.push({
                        label: name,
                        value: id,
                        userId: userId

                    });
                }
            }

            setTypeList(list);
        });
    }
   

   
    const dateOption = () => {
        const options = [];
        for (let i = 1; i <= 31; i++) {
            options.push(
                {
                    label: i.toString(),
                    value: i.toString(),
                }
            );
        }
        setDateOption(options)
    };

    const handleTypeChange = (value) => {
        setTicketType(value.value)
        setSelectedUser(value?.userId)
    }
    const handleRecurringTypeChange = (value) => {
        setSelectedRecurringTask(value.value)
    }
    const onDateSelect = (value) => {
        setSelectedDate(new Date(value));
    }
    const handleCheckBox = (day,isChecked) => {
        
        let updatedSelectedDays = [...selectedDays];
        if (updatedSelectedDays.includes(day.trim()) && !isChecked) {
            updatedSelectedDays = updatedSelectedDays.filter((selectedDay) => selectedDay !== day.trim());
        } else if(!updatedSelectedDays.includes(day.trim())) {
            updatedSelectedDays.push(day.trim());
        }
        setSelectedDays(updatedSelectedDays);
    };

    const getActionItems = async () => {
        let actionItems = new Array();
        const deletePermission = await PermissionService.hasPermission(
            Permission.RECURRING_TASK_DELETE
        );  
        const editPermission = await PermissionService.hasPermission(
            Permission.RECURRING_TASK_EDIT
        );  

        if(editPermission && !allowEdit){
            actionItems.push(
                <MenuItem onPress={() => {setEdit(true),setVisible(true)}}>
                    Edit
                </MenuItem>
            )
        }
        if (deletePermission) {
            actionItems.push(
                <MenuItem onPress={() => {setDeleteModalOpen(true),setVisible(true)}}>
                    Delete
                </MenuItem>
            )
        }
        
        setActionList(actionItems)
    }
    const deleteModalToggle = () => {
        setDeleteModalOpen(!deleteModalOpen);
    }

    const getTicketList = async () => {

        let param = { ObjectName: ObjectName.TICKET, recurring_task_id: params?.id }
        setIsLoading(true)
        await TicketService.searchTicket(param, (error, response) => {
            setTicketList(response.data.data)

        })
        setIsLoading(false)

    }

    const addRecurringTask = (data) => {
        setIsSubmit(true)
        const updateData = {
            taskType: data.taskType ? data.taskType.value : data.taskType.value,
            day: selectedDays && selectedDays.length > 0 ? JSON.stringify(selectedDays) : [],
            month: data?.month ? data?.month?.value : data?.month?.value,
            summary: data.summary ? data.summary : data.summary,
            date: data?.date ? data?.date?.value : data?.date?.value,
            assignee: data.assignee ? data.assignee.value : params?.assignee_id,
            project_id: data?.projectName?.value ? data?.projectName?.value : params?.project_id,
            ticketType: data?.ticketType?.value ? data?.ticketType?.value : params?.type_id,
            start_date: selectedDate,
            objectName : ObjectName.RECURRING_TASK
        }
        if (params) {
            recurringTaskService.update(params?.id, updateData, (err, response) => {
                if (response) {
                    setIsSubmit(false)
                    navigation.navigate("RecurringTask")

                }else{
                    setIsSubmit(false)
                }

            })

        } else {
            recurringTaskService.create(updateData, (err, response) => {                
                if (response) {
                    setIsSubmit(false)
                    navigation.navigate("RecurringTask")

                }else{
                    setIsSubmit(false)
                }

            })
        }


    }
    const onSummaryChange = (value) => {
        setSummary(value);

    };

    let title = [
        {
            title: TabName.SUMMARY,
            tabName: TabName.SUMMARY
        },
        {
            title: TabName.TICKET,
            tabName: TabName.TICKET
        },
      

    ]
    if(recurringTaskHistoryViewPermission){
        title.push({
                title: TabName.HISTORY,
                tabName: TabName.HISTORY
        })
    }
    const recurringTaskDelete = async () => {
        if (params?.id) {
            recurringTaskService.delete(params?.id, (error, response) => {
                    navigation.navigate("RecurringTask");

            })
        }
    };
    return (
        <Layout
            title={params?.id ? `Task# ${params.item}` : "Add Recurring Task"}
            buttonLabel={params  ? activeTab === TabName.SUMMARY && allowEdit ? "Save" : "" : "Add"}
            buttonOnPress={handleSubmit((values) => addRecurringTask(values))}
            actionItems={actionList}
            closeModal={visible}
            showBackIcon ={params?.id ? true : false}
            showActionMenu={params && activeTab === TabName.SUMMARY && actionList && actionList.length > 0 ? true : false}
            isSubmit = {isSubmit}
        >
             <DeleteConfirmationModal
                modalVisible={deleteModalOpen}
                toggle={deleteModalToggle}
                item={params?.id}
                updateAction={recurringTaskDelete}          
                id={params?.id}

            />
            {params && (
                <View>
                    <Tab
                        title={title}
                        setActiveTab={setActiveTab}
                        defaultTab={activeTab}
                    />
                </View>
            )}

            {activeTab === TabName.SUMMARY && (
                <ScrollView>
                    <VerticalSpace10 />
                    <ProjectSelect
                        label="Project"
                        name="projectName"
                        onChange={(values) => setSelectedProject(values)}
                        data={params ? params.project_id : selectedProject}
                        control={control}
                        placeholder="Select Project"
                        disable={!allowEdit}

                    />
                    <VerticalSpace10 />

                    <Select
                        label={"Ticket Type"}
                        name="ticketType"
                        control={control}
                        options={typeList}
                        disable={!allowEdit}
                        data={params?.type_id ? params?.type_id : ticketType}
                        placeholder={"Select Ticket Type"}
                        getDetails={(value) => handleTypeChange(value)}

                    />

                    <VerticalSpace10 />

                    <ProjectUserSelect
                        label="Assignee"
                        getDetails={(values) => setSelectedUser(values)}
                        name="assignee"
                        control={control}
                        selectedUserId={selectedUser}
                        placeholder="Select Assignee"
                        disable={!allowEdit}
                        projectId={selectedProject?.value ? selectedProject?.value : params?.project_id}
                    />
                    <VerticalSpace10 />
                    <TextArea
                        name="summary"
                        title="Summary"
                        control={control}
                        values={summary}
                        onInputChange={onSummaryChange}
                        required={summary ? false : true}
                        editable={allowEdit}
                    />
                    <VerticalSpace10 />
                    <Select
                        label={"Recurring Type"}
                        name="taskType"
                        control={control}
                        options={RecurringTask.typeOptions}
                        placeholder={"Select Recurring Type"}
                        data={params?.type ? params?.type : selectedRecurringTask}
                        getDetails={(value) => handleRecurringTypeChange(value)}
                        disable={!allowEdit}

                    />
                    <VerticalSpace10 />
                    {(selectedRecurringTask === "Monthly" || selectedRecurringTask === "Annually") ? (
                        <>
                            <Select
                                options={date}
                                label={"Date"}
                                placeholder={"Select Date"}
                                disable={!allowEdit}
                                name={"date"}
                                control={control} />
                            <VerticalSpace10 /></>
                    ) : ""}
                    {(selectedRecurringTask === "Annually") ? (
                        <>
                            <Select
                                options={RecurringTask.monthOption}
                                label={"Month"}
                                placeholder={"Select Month"}
                                name={"month"}
                                data={params?.month.value}
                                disable={!allowEdit}
                                control={control} />
                            <VerticalSpace10 />
                        </>
                    ) : ""}
                    {selectedRecurringTask === "Weekly" && (
                        <>

                            <View style={styles.tableRow}>
                                <CheckBox label={"Monday"} disabled={!allowEdit} isChecked={selectedDays.includes("Monday")} toggleCheckbox={handleCheckBox} />
                                <CheckBox label={"Tuesday"} disabled={!allowEdit} isChecked={selectedDays.includes("Tuesday")} toggleCheckbox={handleCheckBox} />
                                <CheckBox label={"Wednesday"} disabled={!allowEdit} isChecked={selectedDays.includes("Wednesday")} toggleCheckbox={handleCheckBox} />
                            </View>
                            <View style={styles.tableRow}>
                                <CheckBox label={"Thursday"} disabled={!allowEdit} isChecked={selectedDays.includes("Thursday")} toggleCheckbox={handleCheckBox} />
                                <CheckBox label={"Friday      "} disabled={!allowEdit} isChecked={selectedDays.includes("Friday")} toggleCheckbox={handleCheckBox} />
                                <CheckBox label={"Saturday     "} disabled={!allowEdit} isChecked={selectedDays.includes("Saturday")} toggleCheckbox={handleCheckBox} />

                            </View>
                            <CheckBox label={"Sunday"} disabled={!allowEdit} isChecked={selectedDays.includes("Sunday")} toggleCheckbox={handleCheckBox} />
                        </>
                    )}

                    <DatePicker
                        title="Start Date"
                        onDateSelect={onDateSelect}
                        selectedDate={selectedDate}
                        disabled={props?.route?.params?.isAddPage ? props?.route?.params?.isAddPage :allowEdit}
                    />
                    <VerticalSpace10 paddingBottom={70} />
                </ScrollView>
            )}
             <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
            {activeTab === TabName.TICKET && ticketList && ticketList.length > 0 ? ticketList.map((item, index) => {
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


                )

            }) : activeTab === TabName.TICKET && <NoRecordFound iconName='receipt'/>}



            {activeTab === TabName.HISTORY && (
                <ScrollView>
                    <HistoryList
                        objectName={ObjectName.RECURRING_TASK}
                        objectId={params?.id}
                    />

                </ScrollView>
            )}
                        </Refresh>




        </Layout>
    )

}
export default RecurringTaskForm;