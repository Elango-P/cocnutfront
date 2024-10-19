import React, {useState} from "react";
import Layout from "../../components/Layout";
import VerticalSpace10 from "../../components/VerticleSpace10";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import purchaseOrderService from "../../services/PurchaseOrderService";
import AccountSelect from "../../components/AccountSelect";


const PurchaseOrderAdd = () => {
    const navigation = useNavigation();
    const [vendorName, setVendorName] = useState("");
    const [isSubmit,setIsSubmit] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({});

    const AddPurchaseOrder = async (values) => {
        setIsSubmit(true)
        const createDate = {
            vendor_id: values?.vendor_id ? values?.vendor_id?.value : values?.vendor_id?.value,
            date : new Date(),



        }

        await purchaseOrderService.create(createDate, async (err, response) => {
            if (response) {
                setIsSubmit(false)
                navigation.navigate("PurchaseOrder")
            }else{
                setIsSubmit(false)
            }

        })
    }
    const handleVendorChange = (value) =>{
        setVendorName(value)
    }
   

    return (
        <Layout
            title={"Add Purchase Order"}
            showBackIcon
            buttonLabel={"Save"}
            buttonOnPress={handleSubmit(values => { AddPurchaseOrder(values); })}
            isSubmit={isSubmit}

        >
            <VerticalSpace10 />
            <AccountSelect
                        label="Vendor"
                        name="vendor_id"
                        required={true}
                        control={control}
                        onChange={handleVendorChange}
                        placeholder="Select Account"

                    />

            <VerticalSpace10 />
        </Layout>
    )
}
export default PurchaseOrderAdd;