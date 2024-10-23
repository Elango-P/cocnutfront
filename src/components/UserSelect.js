import React, { useState, useEffect } from "react";
import Select from '../components/Select'
import { useIsFocused } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import userService from "../services/UserService";
import User from "../helper/User";
import accountService from "../services/AccountService";


const UserSelect = ({ selectedUserId, label, onChange, required, placeholder, divider, disable, control, name, showBorder, customOption=null }) => {
    const [userList, setUserList] = useState([]);
    const isFocused = useIsFocused();


    useEffect(() => {
        getUserList();
    }, [isFocused]);


    const getUserList = () => {
        accountService.GetList(null, (response) => {
            setUserList(response);

        })
    }

    return (
        <Select
            control={control}
            options={customOption ? customOption : userList}
            getDetails={(values) => onChange && onChange(values)}
            label={label}
            placeholder={placeholder}
            data={selectedUserId}
            name={name}
            divider={divider}
            disable={disable}
            showBorder={showBorder}
            required={required}
            userCard
        />
    )
};
export default UserSelect;
