import React, { useEffect, useState, useCallback } from "react";
import Layout from "../../components/Layout";
import VerticalSpace10 from "../../components/VerticleSpace10";
import Name from "../../components/Name";
import { useForm } from "react-hook-form";
import accountService from "../../services/AccountService";
import { useNavigation } from "@react-navigation/native";
import Status from "../../helper/Status";


const AccountAdd = () => {
    const navigation = useNavigation();
    const [isSubmit,setIsSubmit] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({});

    const AddAccount = async (values) => {
        setIsSubmit(true)
        const createDate = {
            vendor_name: values?.vendor_name,
            status: Status.ACTIVE



        }

        await accountService.create(createDate, async (err, response) => {
            if (response) {
                setIsSubmit(false)
                navigation.navigate("Accounts")
            }else{
                setIsSubmit(false)
            }

        })
    }

    return (
        <Layout
            title={"Add Account"}
            showBackIcon
            buttonLabel={"Save"}
            buttonOnPress={handleSubmit(values => { AddAccount(values); })}
            isSubmit = {isSubmit}

        >
            <VerticalSpace10 />
            <Name
                title={"Name"}
                name="vendor_name"
                control={control}
                required={true} />

            <VerticalSpace10 />
        </Layout>
    )
}
export default AccountAdd;