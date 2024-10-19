import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import VerticalSpace10 from "../../components/VerticleSpace10";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import purchaseOrderService from "../../services/PurchaseOrderService";
import AccountSelect from "../../components/AccountSelect";
import DatePicker from "../../components/DatePicker";
import { ScrollView } from "react-native";
import Tab from "../../components/Tab";
import TabName from '../../helper/Tab';
import { View } from "react-native";
import styles from "../../helper/Styles";
import UserSelect from "../../components/UserSelect";
import addressServices from "../../services/AddressService";
import Select from "../../components/Select";
import TextArea from "../../components/TextArea";
import purchaseOrderProductService from "../../services/PurchaseOrderProductService";
import ProductCard from "../../components/ProductCard";
import NoRecordFound from "../../components/NoRecordFound";
import AlternativeColor from "../../components/AlternativeBackground";
import { MenuItem } from "react-native-material-menu";
import PermissionService from "../../services/PermissionService";
import Permission from "../../helper/Permission";
import AddressSelect from "../../components/AddressSelect";
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";
import ObjectName from "../../helper/ObjectName";
import HistoryList from "../../components/HistoryList";



const Detail = (props) => {
    let params = props?.route?.params?.item
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState(TabName.SUMMARY);
    const [productList,setProductList] = useState([])
    const [address, setAddress] = useState(null);
    const [billingAddress,setBillingAddress]= useState(params?.billingAddress || null)
    const [deliveryAddress,setDeliveryAddress]= useState(params?.deliveryAddress || null)
    const [vendorName, setVendorName] = useState(params?.vendorId || "");
    const [selectedDate, setSelectedDate] = useState(new Date(params?.date) || new Date());
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedDeliveryDate, setSelectedDeliveryDate] = useState(new Date(params?.delivery_date) || new Date())
    const [purchaseOrderEdit, setPurchaseOrderEdit] = useState(false);
    const [disableEdit, setDisableEdit] = useState(true);
    const [visible, setIsVisible] = useState(false);
    const [purchaseOrderDelete,setPurchaseOrderDelete]= useState("")
    const [actionList, setActionList] = useState([])
    const [purchaseOrderDeleteModalOpen, setPurchaseOrderDeleteModalOpen] = useState(false)
    const [historyPermission, setHistoryPermission] = useState("")
    const [isSubmit,setIsSubmit] = useState(false)


    useEffect(()=>{
        getAddress();
        getProducts();
        getPermission();
    },[])


    useEffect(() => {
        getActionItems();

    }, [disableEdit])
    const preloadedValues = {
       vendor_id : vendorName ? vendorName : params?.vendorId,
       date : selectedDate ? selectedDate : new Date(params?.date),
       delivery_date : selectedDeliveryDate ? selectedDeliveryDate : new Date(params?.delivery_date),
       owner_id : selectedUser ? selectedUser : params?.owner_id,
       billingAddress : billingAddress ? billingAddress : params?.billingAddress,
       deliveryAddress : deliveryAddress ? deliveryAddress : params?.deliveryAddress,
       description : params?.description,
      };
      const {
        control,
        handleSubmit,
        formState: { errors },
      } = useForm({
        defaultValues: preloadedValues
      });

    
      const getPermission = async () => {
        const isExist = await PermissionService.hasPermission(Permission.PURCHASE_ORDER_HISTORY_VIEW);
        setHistoryPermission(isExist)
    }

    const UpdatePurchaseOrder = async (values) => {
        setIsSubmit(true)
        const createDate = {
            vendor_id: values &&  values?.vendor_id ? values?.vendor_id?.value : values?.vendor_id?.value,
            date: selectedDate ? selectedDate :  new Date(params?.date),
            delivery_date : selectedDeliveryDate ? selectedDeliveryDate : new Date(params?.delivery_date),
            billingAddress : values && values?.billingAddress && values?.billingAddress?.value,
            deliveryAddress : values && values?.deliveryAddress && values?.deliveryAddress?.value,
            description : values && values?.description,
            owner : values && values?.owner_id && values?.owner_id?.value


        }

        await purchaseOrderService.update(params?.id,createDate, async (response) => {            
            if (response) {
                setIsSubmit(false)
                navigation.navigate("PurchaseOrder")
            }else{
                setIsSubmit(false)
            }

        })
    }
    const getProducts = async () => {
        let props = {purchaseOrderId :params?.id, pagination : false};
        await purchaseOrderProductService.getProductList(props, (response) => {
            setProductList(response && response.data)
          

        });
    }
    const handleVendorChange = (value) => {
        setVendorName(value)
    }
    const onDeliveryDateSelect = (value) => {
        setSelectedDeliveryDate(new Date(value));
    }
    const onDateSelect = (value) => {
        setSelectedDate(new Date(value));
    }
    const billingAddressOnSelect =(value)=>{
        setBillingAddress(value.id)
    }
    const deliveryAddressOnSelect =(value)=>{
        setDeliveryAddress(value.id)
    }
  
      const getAddress = async () => {
        let addressList = [];
     await addressServices.searchAddress(null,(err,response)=>{
    
        const details = response.data.data;
    
        if (details) {
          details.forEach((address) => {
            addressList.push({
              label:
                address?.title +
                " " +
                ` (${address?.name +
                ", " +
                address?.address1 +
                ", " +
                address?.address2 +
                " ," +
                address?.city +
                ", " +
                address?.state +
                ", " +
                address?.pin_code
                })`,
              value: address.id,
            });
          });
        }
        setAddress(addressList);

     });
        
      };


    const purchaseOrderDeleteModalToggle = () => {
        setPurchaseOrderDeleteModalOpen(!purchaseOrderDeleteModalOpen);
    }
    const getActionItems = async () => {
        let actionItems = new Array();
        const puruchaseOrderEdit = await PermissionService.hasPermission(
            Permission.PURCHASE_ORDER_EDIT
        );
        const puruchaseOrderDelete = await PermissionService.hasPermission(
            Permission.PURCHASE_ORDER_DELETE
        );
        if (puruchaseOrderEdit && disableEdit) {
            actionItems.push(
                <MenuItem onPress={() => {
                    setDisableEdit(false) 
                    setIsVisible(true)
                }}>
                    Edit
                </MenuItem>

            )
        }
        if (puruchaseOrderDelete) {
            actionItems.push(
                <MenuItem onPress={() => {
                    setIsVisible(true)
                    setPurchaseOrderDeleteModalOpen(true)

                }
                }>
                    Delete
                </MenuItem>

            )
        }
        setActionList(actionItems)
    }

    const deletePurcaseOrder =()=>{
        if (params?.id) {
            purchaseOrderService.Delete(params?.id, (error, response) => {
                navigation.navigate("PurchaseOrder");
            })
        }
    }
    let title =  [
        {
            title: TabName.SUMMARY,
            tabName: TabName.SUMMARY
        },
        {
            title: TabName.PRODUCTS,
            tabName: TabName.PRODUCTS
        }
    ]
    if(historyPermission){
        title.push({
        title: TabName.HISTORY,
        tabName: TabName.HISTORY
    })
}
    

    return (
        <Layout
            title={`Purchase Order#: ${params?.purchase_order_number}`}
            showBackIcon
            buttonLabel={activeTab === TabName.SUMMARY && !disableEdit ? "Save" : ""}
            buttonOnPress={handleSubmit(values => { UpdatePurchaseOrder(values); })}
            showActionMenu={activeTab === TabName.SUMMARY && params && actionList && actionList.length > 0 ? true : false}
            actionItems={actionList}
            closeModal={visible}
            isSubmit = {isSubmit}

        >

            <View style={styles.tabBar}>
                <Tab
                    title={title}
                  setActiveTab={setActiveTab}
                  defaultTab={activeTab}
                />
            </View>
            <ScrollView>

            <DeleteConfirmationModal
                modalVisible={purchaseOrderDeleteModalOpen}
                toggle={purchaseOrderDeleteModalToggle}
                item={ params?.id}
                updateAction={ deletePurcaseOrder }
                id={params?.purchase_order_number}
                CancelAction = {()=>setIsVisible(false)}

            />

            {activeTab === TabName.SUMMARY && (

                    <><><VerticalSpace10 />

                    <DatePicker
                        title="Date"
                        name="date"
                        onDateSelect={onDateSelect}
                        selectedDate={new Date(params?.date) ? selectedDate : selectedDate}
                         disabled={!disableEdit}
                        />

                        <VerticalSpace10 />
                        <AccountSelect
                            label="Vendor"
                            name="vendor_id"
                            control={control}
                            onChange={handleVendorChange}
                            data={params?.vendorId}
                            placeholder="Select Account" 
                            disable={disableEdit}
                            />

                            <VerticalSpace10 />

                            <DatePicker
                            title="Delivery Date"
                            name="delivery_date"
                            onDateSelect={onDeliveryDateSelect}
                            selectedDate={new Date(params?.delivery_date) ? selectedDeliveryDate : selectedDeliveryDate} 
                            disabled={!disableEdit}
                            />

                            <VerticalSpace10 />

                            <UserSelect
                            label="Owner"
                            selectedUserId={params?.owner_id}
                            name={"owner_id"}
                            onChange={(value) => setSelectedUser(value.value)}
                            control={control}
                            placeholder="Select Owner" 
                            disable={disableEdit}
                            />

                            <VerticalSpace10 />
                            <AddressSelect
                            label="Billing Address"
                            options={address}
                            name = "billingAddress"
                            control={control}
                            data = {params?.billingAddress}
                            onChange={(value) => setBillingAddress(value.value)}
                            placeholder="Select Billing Address"
                            getDetails={billingAddressOnSelect}
                            disable={disableEdit}
                        />
                          <VerticalSpace10 />
                          <AddressSelect
                            label="Delivery Address"
                            options={address}
                            name = "deliveryAddress"
                            control={control}
                            data = {params?.deliveryAddress}
                            placeholder="Select Delivery Address"
                            getDetails={deliveryAddressOnSelect}
                            disable={disableEdit}
                        />
                         <VerticalSpace10 />

                            </>

                            <TextArea
                            name="description"
                            title="Description"
                            control={control} 
                            editable={!disableEdit}
                            />

                            <VerticalSpace10 paddingTop={50} />
                            </>
            )}
     <View style={styles.container}>

     {activeTab === TabName.PRODUCTS && productList && productList.length > 0 ? productList.map((item,index)=>{
                   const containerStyle = AlternativeColor.getBackgroundColor(index)

        return (

                <View>
                    {item && (
                        <ProductCard
                            size={item.size}
                            unit={item.unit}
                            name={item.product_name}
                            image={item.image}
                            brand={item.brand_name}
                            sale_price={item.sale_price}
                            mrp={item.mrp}
                            id={item.id}
                            status={item.status}
                            item={item}
                            quantity={item.quantity}
                            alternative={containerStyle}
                            QuantityField
                            editable
                        />
                    )}
                </View>
        );

    }) : (
        activeTab === TabName.PRODUCTS  && <NoRecordFound iconName={"receipt"} message ={"No Products Found"} />
    ) }
            </View>
            {activeTab === TabName.HISTORY && (
                    <HistoryList
                        objectName={ObjectName.PURCHASE_ORDER}
                        objectId={params?.id}
                    />

            )}
            </ScrollView>
         



        </Layout>
    )
}
export default Detail;