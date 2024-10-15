import React, { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import Layout from "../../components/Layout";

import { useNavigation } from "@react-navigation/native";

import { useIsFocused } from "@react-navigation/native";

import Spinner from "react-native-loading-spinner-overlay";

import AlertMessage from "../../helper/AlertMessage";

import ConfirmationModal from "../../components/Modal/ConfirmationModal";

import ProductCard from "../../components/ProductCard";

import { SwipeListView } from "react-native-swipe-list-view";

import ProductEditModal from "../../components/Modal/ProductEditModal";

import BarcodeScanner from "../../components/BarcodeScanner";

import OrderService from "../../services/OrderService";

import ProductSelectModal from "../../components/Modal/ProductSelectModal";

import Order from "../../helper/Order";

import OrderProduct from "../../helper/OrderProduct";

import orderService from "../../services/OrderService";

import FooterContent from "./components/FooterContent";

import Tab from "../../components/Tab";

import General from "./General";

import TabName from "../../helper/Tab";

import productService from "../../services/ProductService";

import Permission from "../../helper/Permission";

import AsyncStorageService from "../../services/AsyncStorageService";

import StatusService from "../../services/StatusServices";

import ObjectName from "../../helper/ObjectName";

import ProductService from "../../services/ProductService";

import ProductModal from "../../components/Modal/GeneralModal";

import { MenuItem } from "react-native-material-menu";

import { FontAwesome5 } from "@expo/vector-icons";

import { Color } from "../../helper/Color";


import CurrencyFormat from "../../lib/Currency";

import ProductSearch from "../../components/ProductSearch";

import SearchBar from "../../components/SearchBar";

import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useForm } from "react-hook-form";
import AlternativeColor from "../../components/AlternativeBackground";
import LabelText from "../../components/Label";
import PermissionService from "../../services/PermissionService";

import SyncService from "../../services/SyncService";

import AlertModal from "../../components/Alert";
import CustomButton from "../../components/Button";
import DropDownMenu from "../../components/DropDownMenu";
import HistoryList from "../../components/HistoryList";
import MediaList from "../../components/MediaList";
import Media from "../../helper/Media";
import { PaymentType } from "../../helper/PaymentType";
import Status from "../../helper/Status";
import styles from "../../helper/Styles";
import Number from "../../lib/Number";
import addressServices from "../../services/AddressService";
import mediaService from "../../services/MediaService";
import OrderProductService from "../../services/OrderProductService";
import CustomerInfo from "./components/CustomerInfo";
import OrderAmountCard from "./components/OrderAmountCard";
import OrderProductCancelModel from "./components/OrderProductCancelModel";
import PriceUpdateModal from "./components/PriceUpdateModel";
import accountService from "../../services/AccountService";
import { Account } from "../../helper/Account";
import Alert from "../../lib/Alert";
import CustomAlertModal from "../../components/CustomAlertModal";
import {Label } from "../../helper/Label";
import asyncStorageService from "../../services/AsyncStorageService";


const Billing = (props) => {
  const id = props?.route?.params?.id;
  const params = props?.route?.params;

  let type = params?.type

  let isDeliveryOrder = params?.type && params?.type?.allow_delivery == true ? true:false


  const [scannedCode, setScannedCode] = useState("");
  const [modalVisible, setScanModalVisible] = useState(false);
  const [quantityUpdateObject, setQuantityUpdateObject] = useState({});
  const [totalAmount, setTotalAmount] = useState("");
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [productCompleteModalOpen, setProductCompleteModalOpen] =
    useState(false);
  const [orderCancelModal, setOrderCancelModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [productExistModalOpen, setProductExistModalOpen] = useState("");
  const [productDeleteModalOpen, setProductDeleteModalOpen] = useState(false);
  const [scanProduct, setScanProduct] = useState("");
  const [productNotFoundModalOpen, setProductNotFoundModalOpen] =
    useState(false);
  const [orderProducts, setOrderProducts] = useState([]);
  const [productSelectModalOpen, setProductSelectModalOpen] = useState(false);
  const [scannedProductList, setScannedProductList] = useState([]);
  const [activeTab, setActiveTab] = useState(
    params?.group == Status.GROUP_DRAFT || params?.isNewOrder
      ? TabName.PRODUCTS
      : TabName.SUMMARY
  );
  const [manageOther, setManageOther] = useState(false);
  const [cancelStatus, setCancelStatus] = useState("");
  const [orderId, setOrderId] = useState(id ? id : params?.orderId);
  const [orderDate, setOrderDate] = useState(
    params && params.orderDetail ? params.orderDetail.date : new Date()
  );
  const [orderDraftStatusId, setOrderDraftStatusId] = useState("");
  const [searchPhrase, setSearchPhrase] = useState("");
  const [clicked, setClicked] = useState(false);
  const [storeProductList, setStoreProductList] = useState([]);
  const [filteredList, setFilteredList] = useState(0);
  const [orderNumber, setOrderNumber] = useState(
    params && params.orderDetail ? params.orderDetail.order_number : null
  );
  const [isProductAdding, setIsProductAdding] = useState(false);
  const [permission, setPermission] = useState("");
  const [selectedDate, setSelectedDate] = useState(params?.date);
  const [selectedShift, setSelectedShift] = useState(params?.shiftId || "");
  const [selectedStore, setSelectedStore] = useState(
    params?.storeId ? parseInt(params?.storeId) : ""
  );
  const [selectedUser, setSelectedUser] = useState(
   params?.owner || ""
  );
  const [status, setStatus] = useState(
    params?.status_id ? parseInt(params?.status_id) : ""
  );
  const [actionList, setActionList] = useState([]);
  const [list, setList] = useState([]);
  const [allowEdit, setEdit] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(
    PaymentType.VALIDATION
  );
  const [cashAmount, setCashAmount] = useState("");
  const [upiAmount, setUpiAmount] = useState("");
  const [orderProductCancelPermission, setOrderProductCancelPermission] =
    useState(false);
  const [accountList, setAccountList] = useState([]);
  const [visible, setVisible] = useState(false);
  const [MediaData, setMediaData] = useState([]);
  const [allowCancel, setAllowCancel] = useState("");
  const [allowProductEdit, setAllowEdit] = useState("");
  const [items, setItems] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [orderProductCancelStatusId, setOrderProductCancelStatusId] =
    useState("");
  const [images, setImages] = useState([]);
  const [manualPrice, setManualPrice] = useState(true);
  const [enableManualPrice, setEnableManualPrice] = useState(false);
  const [moreToggle, setMoreToggle] = useState(true);
  const [reason, setReason] = useState("");
  const [orderHistoryViewPermission, setOrderHistoryViewPermission] = useState("");
  const [accountId,setAccountId] = useState("")
  const [qrCodeScanModalVisible,setQrCodeScanModalVisible] = useState(false)
  const [customerMobileNumber,setCustomerMobileNumber] = useState()
  const [customModalVisible,setCustomModalVisible] = useState(false)
  const [enableButton,setEnableButton] = useState(false)
  const [isSubmit,setIsSubmit] = useState(false)
  const [deliveryStatus,setDeliveryStatus] = useState([])  

  const searchQuery = "...";
  // Remove special characters from the search query using a regular expression
  const sanitizedSearchQuery = searchQuery.replace(/[^\w\s]/gi, "");
  // Filter the list based on the sanitized search query
  const storeProductsList = Array.isArray(storeProductList)
    ? storeProductList.filter((item) =>
        item.product_display_name
          .toLowerCase()
          .includes(sanitizedSearchQuery.toLowerCase())
      )
    : [];
  // Check if the filtered list has any items or not

  const IsFocused = useIsFocused();

  const stateRef = useRef();

  const navigation = useNavigation();
  useEffect(() => {
    if (params.group == Status.GROUP_DRAFT || params?.isNewOrder) {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          return true;
        }
      );
      return () => backHandler.remove();
    }
  }, []);

  useEffect(() => {
    //get order products
    getOrderProducts();
    getStatusId();
    getAction();
    getTotalAmount();
    getOrderProductTotalAmount();
    getDetails();
    getDeliveryStatusList()
    
  }, [IsFocused, props]);
  useEffect(() => {
    getAccountList();
  }, [refreshing, activeTab === TabName.CUSTOMER]);

  useEffect(() => {
    getActionItems();
  }, [IsFocused, props, params?.isNewOrder]);
  useEffect(() => {
    getActionItems();
  }, [IsFocused,deliveryStatus]);

  useEffect(() => {
    let mount = true;
    //get permission
    mount && getPermission(), editPermission();
    return () => {
      mount = false;
    };
  }, []);
 
  useEffect(() => {
    if (activeTab == TabName.ATTACHMENTS) {
      getMediaList();
    }
  }, [activeTab == TabName.ATTACHMENTS])
  
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({});


  useEffect(() => {
    if (params?.isNewOrder ) {
      if(params?.collectCustomerInfo == true){
      qrScanToggle();
    }else{
      toggle()
    }
  }
  }, [navigation]);

  

  function getOrderTotalAmount(orderProductList) {
    let totalAmount = 0;
    for (let i = 0; i < orderProductList.length; i++) {
      if (orderProductList[i].cancelledAt == null) {
        totalAmount +=
        Number.GetFloat(orderProductList[i].manual_price?orderProductList[i].manual_price:orderProductList[i].sale_price, 0) *
        Number.Get(orderProductList[i].quantity, 0);
      }
    }
    return totalAmount;
  }

  const editPermission = async () => {
    const editPermission = await PermissionService.hasPermission(
      Permission.ORDER_EDIT
    );
    setPermission(editPermission);
    const orderHistoryViewPermission = await PermissionService.hasPermission(
      Permission.ORDER_HISTORY_VIEW
    );
    setOrderHistoryViewPermission(orderHistoryViewPermission);
  }  

  const getDeliveryStatusList = async ()=>{
    let deliveryStatus = [];
    const roleId = await asyncStorageService.getRoleId();

    let response = await StatusService.getNextStatus(params?.status_id, null, (currentStatus) => {
      deliveryStatus.push({
          label: currentStatus[0].name,
          value: currentStatus[0].status_id,
          id: currentStatus[0].status_id
      });
  });

  response && response.forEach((statusList) => {
      if (statusList.allowed_role_id && statusList.allowed_role_id.split(",").includes(roleId)) {
        deliveryStatus.push({
              label: statusList.name,
              value: statusList.status_id,
              id: statusList.status_id
          });
      }
  });  
  setDeliveryStatus(deliveryStatus)


  
  }
  

  const getStatusId = async () => {
    let cancelledStatusId = await StatusService.getStatusIdByName(
      ObjectName.ORDER_TYPE,
      Status.GROUP_CANCELLED
    );

    let orderProductFirstStatusId = await StatusService.getFirstStatus(
      ObjectName.ORDER_PRODUCT
    );

    let OrderProductCancelledStatusId = await StatusService.getStatusIdByName(
      ObjectName.ORDER_PRODUCT,
      Status.GROUP_CANCELLED
    );

    setCancelStatus(cancelledStatusId);

    setOrderDraftStatusId(orderProductFirstStatusId);

    setOrderProductCancelStatusId(OrderProductCancelledStatusId);
  };

  const clearStackNavigate = () => {
    setProductCompleteModalOpen(false)
    setOrderProducts("")
    setOrderId("")
    setCancelStatus("")
    setOrderDraftStatusId("")
    setOrderProductCancelStatusId("")
    setMediaData("")
    setSelectedPayment("")
    setImages("")
    setCashAmount("")
    setUpiAmount("")
    setTotalAmount("")
    {
     isDeliveryOrder
        ? navigation.navigate("Delivery")
        : navigation.navigate("Order");
    }
  };

  const getAccountList = () => {
    addressServices.searchAddress(
      { objectName: ObjectName.CUSTOMER, object_id: params?.customerId },
      (error, response) => {
        setAccountList(response && response.data && response.data.data);
      }
    );
  };



  const getDetails = () => {
    if (id) {
      OrderService.searchOrder({ orderId: id }, (error, response) => {
        let orders = response && response?.data && response?.data?.data;
        setItems(orders[0]);
      });
    }
  };

 const handlePaymentChange = (value) => {
    if(value === PaymentType.UPI_VALUE){
      setImages([])
      takePicture()
      setSelectedPayment(value);

    }else if(value === PaymentType.MIXED_VALUE){
      setImages([])
      takePicture()
      setSelectedPayment(value);
    }else{
      setSelectedPayment(value);

    }
  };

  const handleSearchOnChange = async (e) => {
    const products = await productService.SearchFromLocalDB(e);
    setStoreProductList(products);
  };

  const OnCancel = () => {
    let data = {
      status: cancelStatus,
      customer_account : accountId
    };
    if (!orderId || !id) {
      clearStackNavigate();
    }
    OrderService.updateOrder(orderId ? orderId : id, data, () => {
      clearStackNavigate();
      setOrderCancelModal(false) 
    });
  };

  const getTotalAmount = async (orderId) => {
    orderId = orderId ? orderId : id;
    let params = { orderId: orderId };
    if (orderId !== undefined) {
      await orderService.searchOrder(params, (error, response) => {
        setCashAmount(response.data.data[0].cash_amount);
        setUpiAmount(response.data.data[0].upi_amount);
        setTotalAmount(response.data.data[0].total_amount);

      });
    }
  };

  const getOrderProducts = async (UpdatedOrderId, callback) => {
    try {
      let orderIdValue = orderId ? orderId : id ? id : UpdatedOrderId;

      let params = { orderId: orderIdValue, pagination: false };

      if (orderIdValue) {
        //ge order products
        await OrderService.getOrderProducts(
          params,
          (error, orderProducts, amount, totalQuantity) => {
            let filteredOrderProdcts = orderProducts.filter(
              (product) => product.status !== Order.STATUS_CANCEL
            );
            callback && callback(orderProducts);

            //set order products
            setOrderProducts(orderProducts);

            const totalAmount = getOrderTotalAmount(orderProducts);

            setTotalAmount(totalAmount);

            // set non cancelled Products
            setFilteredList(filteredOrderProdcts);
          }
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getOrderProductTotalAmount = async () => {
    let params = {
      orderId: orderId ? orderId : id,
    };
    await OrderProductService.getTotalAmount(params, (res) => {
      const totalAmount = res && res?.data && res?.data?.totalAmount;
        setTotalAmount(totalAmount > 0 ? Number.GetFloat(totalAmount) : 0);
    });
  };

  const addNew = () => {
    //set scan modal open
    setScanModalVisible(true);
  };

  const onReasonInput=(value) => {
   try{
 setReason(value)
   }catch(err){
  console.log(err); 
  }
  }

  //delete order product
  const cancelOrderProduct = async () => {
    if (selectedItem && reason.trim() !== "" ) {
      OrderService.cancel(
        selectedItem.orderProductId,
        {reason:reason},
        async (error, response) => {
          setReason("")
          reset({})
          //close product select modal
          setProductDeleteModalOpen(false);
          //get store products
          getOrderProducts();
        }
      );
    }else{
      setProductDeleteModalOpen(true)
    return AlertModal("Reason Is Required");
    }
  };

  const updateOrderProduct = (orderproductId) => {
    try {
      let orderIDValue = orderId ? orderId : id;

      if (
        orderIDValue &&
        orderDraftStatusId &&
        orderDraftStatusId.status_id &&
        orderproductId
      ) {
        let bodyDaya = {
          orderId: orderIDValue,
          quantity: 1,
          status: orderDraftStatusId.status_id,
          orderProductId: orderproductId,
        };

        OrderService.updateOrderProduct(orderproductId, bodyDaya, () => {
          getOrderProducts();
          setIsProductAdding(false);
          setSearchPhrase("");
          setClicked("");
        });
      }
    } catch (err) {
      console.log(err);
      setIsProductAdding(false);
    }
  };
  
  const addOrderProduct = async (quantity, scannedProduct, callback) => {
    try {
      await OrderService.addOrderProduct(
        {
          orderId: orderId ? orderId : id,
          productId: scannedProduct.product_id,
          quantity: quantity,
          productPriceId: scannedProduct.productPriceId,
        },
        async (error, res) => {
          if (!error && res.data) {
            if (orderProducts != undefined) {
              let statusDetail = await StatusService.get(res.data.statusId);
              orderProducts.splice(0, 0, {
                image: scannedProduct.featured_media_url,
                product_display_name: scannedProduct.product_display_name,
                name: scannedProduct.product_name,
                id: scannedProduct.product_id,
                orderId: orderId ? orderId : id,
                orderProductId: res.data.orderProductId,
                product_id: scannedProduct.product_id,
                brand_name: scannedProduct.brand_name,
                sale_price: scannedProduct.sale_price,
                mrp: scannedProduct.mrp,
                status: statusDetail ? statusDetail.name : "",
                statusId: statusDetail ? statusDetail.status_id : "",
                allowEdit: statusDetail ? statusDetail?.allow_edit : "",
                allowCancel: statusDetail ? statusDetail?.allow_cancel : "",
                quantity: quantity,
              });

              setOrderProducts(orderProducts);

              const totalAmount = getOrderTotalAmount(orderProducts);

              setTotalAmount(
                totalAmount > 0 ? Number.GetFloat(totalAmount) : 0
              );

              setFilteredList(orderProducts);
            }

            setSearchPhrase("");
            setStoreProductList("");
            setClicked("");
          }

          return callback();
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  const updateOrderProductQuantity = async (quantity, orderProductId) => {
    try {
      //validate quantity exist or not
      if (orderProductId) {
        //create body data
        let BodyData = {
          orderId: orderId ? orderId : id,
          quantity: quantity,
          orderProductId: orderProductId,
          product_id: selectedItem?.product_id,
          orderDate: params?.date ? params?.date : orderDate,
        };

        if (
          selectedItem &&
          selectedItem.status == OrderProduct.STATUS_CANCEL &&
          orderDraftStatusId &&
          orderDraftStatusId.status_id
        ) {
          BodyData.status = orderDraftStatusId.status_id;
        }

        await OrderService.updateOrderProduct(
          orderProductId,
          BodyData,
          async (error, response) => {
            if (response && response.data) {
              //close product select modal
              setProductExistModalOpen(false);
              getOrderProducts();

              setSearchPhrase("");

              setClicked("");

              setStoreProductList("");

              setIsProductAdding(false);
            }
          }
        );
      }
    } catch (err) {
      setIsProductAdding(false);
    }
  };

  const createOrderAddOrderProduct = async (quantity, scannedProduct) => {

    try {
      if (orderId) {

        addOrderProduct(quantity, scannedProduct, () => {
          setIsProductAdding(false);
        });
      }
    } catch (err) {
      setIsProductAdding(false);
    }
  };

  const validateProductInOrderProduct = async (selectedProduct) => {

    //validate already added product list
    if (orderProducts && orderProducts.length > 0) {
      //find if a product with the same product_id already exists
      let productDetail = orderProducts.find(
        (data) =>
          data.product_id == selectedProduct.product_id &&
          data.sale_price == selectedProduct.sale_price
      );

      if (productDetail) {
        if (productDetail.status != OrderProduct.STATUS_CANCEL) {
          //get the updated quantity
          let updatedQuantity = productDetail?.quantity
            ? productDetail?.quantity + 1
            : 1;

          //create return object
          let returnObject = {
            updatedQuantity: updatedQuantity,
            product: productDetail,
            orderProductId: productDetail?.orderProductId,
            product_id: selectedProduct?.product_id,
          };

          //update quantity update object
          setQuantityUpdateObject(returnObject);

          setScanProduct(returnObject.product);
          setSelectedItem(returnObject.product);

          //set moda visiblity
          setProductExistModalOpen(true);
        } else {
          // add order product since the barcode is different
          updateOrderProduct(productDetail.orderProductId);
        }
      } else {
        // add order product since the barcode is different
        createOrderAddOrderProduct(1, selectedProduct);
      }
    } else {
      // add inventory product since there are no products in the list
      createOrderAddOrderProduct(1, selectedProduct);
    }
  };

  //Product search click product handler
  const productOnClick = async (selectedProduct) => {
    try {      
      if (!isProductAdding) {
        setIsProductAdding(true);

        const updatedPriceProductList =
          await ProductService.getProductUpdatedPrice(
            null,
            selectedProduct.product_id
          );

        if (updatedPriceProductList && updatedPriceProductList.length == 1) {
          validateProductInOrderProduct(updatedPriceProductList[0]);
        } else if (
          updatedPriceProductList &&
          updatedPriceProductList.length > 1
        ) {
          //set store product list
          setScannedProductList(updatedPriceProductList);

          setProductSelectModalOpen(true);
        } else {
          productNotFoundToggle();

          setIsProductAdding(false);
        }
      }
    } catch (err) {
      console.log(err);
      setIsProductAdding(false);
    }
  };

  const getProducts = async (barCode) => {
    const updatedPriceProductList = await ProductService.getProductUpdatedPrice(
      barCode
    );

    if (updatedPriceProductList && updatedPriceProductList.length == 1) {
      validateProductInOrderProduct(updatedPriceProductList[0]);
    } else if (updatedPriceProductList && updatedPriceProductList.length > 1) {
      //set store product list
      setScannedProductList(updatedPriceProductList);

      setProductSelectModalOpen(true);
    } else {
      productNotFoundToggle();
    }
  };
  const handleScan = async (data) => {

    try{

      let account_id = data?.data

      if(account_id){
        setQrCodeScanModalVisible(false);
      accountService.get(account_id, (err, response) => {
let body={type:type?.id}
        if (response && response?.data && response?.data?.data?.vendorId) {          
          setAccountId(response?.data?.data?.vendorId)
          orderService.createOrder(body, (error, response)=> {
            if(response.data && response?.data){
              setOrderId(response?.data?.orderId)
              setOrderNumber(response?.data?.orderDetail?.order_number)
              
            }
          })
        }
      }
    )
  }
    }catch (err) {
      console.log(err);
    }
       
  }
  const createOrder = async()=>{
    
    let body={type:Number.Get(type?.id)}
    await orderService.createOrder(body, async (err, response) => {    
      if (response && response?.data) {        
        setOrderId(response?.data?.orderId)
        setOrderNumber(response?.data?.orderDetail?.order_number)
        setCustomModalVisible(false) 
        setQrCodeScanModalVisible(false);
        setCustomerMobileNumber("")       
      }
  })
  }
  const handleMobileNumberUpdate = async()=>{
    const createDate = {
      acount_name: customerMobileNumber,
      status: Status.ACTIVE,
      accountType : Account.TYPE_CUSTOMER,
      mobile : customerMobileNumber
  }

  await orderService.createOrder(createDate, async (err, response) => {    
      if (response && response?.data && response?.data?.isCreateAccount) {        
        setCustomModalVisible(true)        
      }else if(response && response?.data && response?.data){        
        setAccountId(response?.data && response?.data?.account_id)
        setOrderId(response?.data?.orderId)
        setOrderNumber(response?.data?.orderDetail?.order_number)
        setCustomModalVisible(false) 
        setQrCodeScanModalVisible(false);
        setCustomerMobileNumber("")
      }
     
  })
  }
  const handleContinue = async () => {
    try{
      const createDate = {
        acount_name: customerMobileNumber,
        status: Status.ACTIVE,
        type : Account.TYPE_CUSTOMER,
        mobile : customerMobileNumber,
        isCreateNewAccount : true
    }
    await orderService.createOrder(createDate, async (err, response) => {    

       if(response && response?.data && response?.data){      
          setAccountId(response?.data && response?.data?.account_id)
          setOrderId(response?.data?.orderId)
          setOrderNumber(response?.data?.orderDetail?.order_number)  
          setCustomModalVisible(false) 
          setQrCodeScanModalVisible(false);
          setCustomerMobileNumber("")
        }
       
       

    })
     
    }catch(err){
      console.log(err);
    }
  };
  const handleAlertClose = async ()=>{
     try{
           setCustomModalVisible(false) 
           setQrCodeScanModalVisible(false);
           setCustomerMobileNumber("")
  }
  catch(err){
      console.log(err);
    }
  }

  const handleMobileNumberChange = (value) => {    
    setCustomerMobileNumber(value)
  }
  //scan product handler
  const handleScannedData = async (data) => {

    try {
      setScanModalVisible(false);

      //get bar code
      let barCode = data?.data;

      //validate bar code exist and loading
      if (barCode) {
        //set scanned code
        setScannedCode(barCode);

        const updatedPriceProductList =
          await ProductService.getProductUpdatedPrice(barCode);

        if (updatedPriceProductList && updatedPriceProductList.length == 1) {
          validateProductInOrderProduct(updatedPriceProductList[0]);
        } else if (
          updatedPriceProductList &&
          updatedPriceProductList.length > 1
        ) {
          //set store product list
          setScannedProductList(updatedPriceProductList);

          setProductSelectModalOpen(true);
        } else {
          SyncService.SyncProduct(barCode, null, (response) => {
            getProducts(barCode);
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const closeRow = (rowMap, rowKey) => {
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  };

  const clearRowDetail = () => {
    if (stateRef) {
      const selectedItem = stateRef.selectedItem;
      const selectedRowMap = stateRef.selecredRowMap;
      if (selectedItem && selectedRowMap) {
        closeRow(selectedRowMap, selectedItem.inventoryTransferProductId);
        if(!productDeleteModalOpen){
          setSelectedItem("");
        }
        stateRef.selectedItem = "";
        stateRef.selecredRowMap = "";
      }
    }
  };

  const getPermission = async () => {
    let permissionList = await AsyncStorageService.getPermissions();
    if (permissionList) {
      permissionList = JSON.parse(permissionList);
      if (permissionList && permissionList.length > 0) {
        let manageOther =
          permissionList &&
          permissionList.find(
            (option) =>
              option.role_permission === Permission.ORDER_MANAGE_OTHERS
          )
            ? true
            : false;

        let orderProductCancel =
          permissionList &&
          permissionList.find(
            (option) =>
              option.role_permission === Permission.ORDER_PRODUCT_CANCEL
          )
            ? true
            : false;
        let enableManualPrice =
          permissionList &&
          permissionList.find(
            (option) =>
              option.role_permission === Permission.ORDER_MANUAL_PRICE_UPDATE
          )
            ? true
            : false;
        setManageOther(manageOther);
        setOrderProductCancelPermission(orderProductCancel);
        setEnableManualPrice(enableManualPrice);
      }
    }
  };

  const productModalToggle = () => {
    setProductModalOpen(!productModalOpen);
    clearRowDetail();
  };
  const priceModalToggle = () => {
    try {
      setPriceModalOpen(!priceModalOpen);
      clearRowDetail();
    } catch (err) {
      console.log(err);
    }
  };

  const productCompleteModalToggle = () => {
    if (images && images.length > 0) {
      setSelectedPayment(PaymentType.UPI_VALUE);
      setProductCompleteModalOpen(!productCompleteModalOpen);
    } else {
      setProductCompleteModalOpen(!productCompleteModalOpen);
      setIsSubmit(false)
      setEnableButton(false)  
      setSelectedPayment(PaymentType.VALIDATION);
    }
  };
  const orderCancelModalToggle = () => {
    setOrderCancelModal(!orderCancelModal);
  };

  const productDeleteModalToggle = () => {
    setProductDeleteModalOpen(!productDeleteModalOpen);
    clearRowDetail();
  };

  const productNotFoundToggle = () => {
    setProductNotFoundModalOpen(!productNotFoundModalOpen);
  };

  const productSelectModalToggle = () => {
    setProductSelectModalOpen(!productSelectModalOpen);
    setIsProductAdding(false);
  };

  const productExistModalToggle = () => {
    setProductExistModalOpen(!productExistModalOpen);
    setIsProductAdding(false);
  };

  const toggle = () => {
    //close the scan modal
    setScanModalVisible(!modalVisible);
  };
  const qrScanToggle = ()=>{
    setQrCodeScanModalVisible(!qrCodeScanModalVisible)
  }


  const cashPaid = (value) => {
    setIsSubmit(true)
    let data = {
      payment_type: selectedPayment,
      customer_account: params?.customerId ? params?.customerId : accountId,
      type: type?.id,
    };
    if (selectedPayment === PaymentType.CASH_VALUE) {
      data.cash = totalAmount;
    }
    if (selectedPayment === PaymentType.UPI_VALUE) {
      data.upi = totalAmount;
    }

    if (selectedPayment === PaymentType.UPI_VALUE) {
      if (images && images.length > 0) {
        setEnableButton(true)
        setIsSubmit(false)
        uploadImages();
        OrderService.completeOrder(orderId ? orderId : id, data, (err, res) => {
          if (err) {
            setIsSubmit(false)
            setEnableButton(false)
          }
        });
      } else {
        setIsSubmit(false)

        return alert("UPI Payment Attachment is Missing");
      }
    }
    if (selectedPayment === PaymentType.CASH_VALUE) {
      setEnableButton(true)
      setIsSubmit(false)
      OrderService.completeOrder(orderId ? orderId : id, data, (err, res) => {
        if (res) {
          setIsSubmit(false)
          clearStackNavigate();
        }else{
          setEnableButton(false)
        }
      });
    }

    if (selectedPayment === PaymentType.MIXED_VALUE) {
      if (value?.cash == 0 || value?.upi == 0) {
        return alert("Enter a valid amount");
      }
      let amount = Number.GetFloat(value?.cash) + Number.GetFloat(value?.upi);

      if (Number.GetFloat(amount) !== Number.GetFloat(totalAmount)) {
        return alert("Amount not matched");
      }

      (data.cash = value?.cash), (data.upi = value?.upi);
        setEnableButton(true)

      if (images && images.length > 0) {
        uploadImages();
        OrderService.completeOrder(orderId ? orderId : id, data, (err, res) => {
          if (err) {
            setEnableButton(false)
          } 
        });
      } else {
        return alert("UPI Payment Attachment is Missing");
      }
    }
  };

  const productExistOnclick = () => {
    if (quantityUpdateObject) {
      updateOrderProductQuantity(
        quantityUpdateObject.updatedQuantity,
        quantityUpdateObject.orderProductId
      );
    }
  };

  const updateQuantity = (quantity) => {
    let quantityValue = quantity > 0 ? quantity : selectedItem?.quantity;
    if (selectedItem && quantityValue > 0) {
      updateOrderProductQuantity(quantityValue, selectedItem.orderProductId);
    }
  };
  const handleUpdate = async (value) => {
    try {
      if (selectedItem && value > 0) {
        setManualPrice(true);
        if (selectedItem?.orderProductId) {
          //create body data
          let BodyData = {
            orderId: orderId ? orderId : id,
            orderProductId: selectedItem?.orderProductId,
            product_id: selectedItem?.product_id,
            orderDate: params?.date ? params?.date : orderDate,
            manual_price: value,
            quantity: selectedItem?.quantity,
          };

          if (
            selectedItem &&
            selectedItem?.status == OrderProduct.STATUS_CANCEL &&
            orderDraftStatusId &&
            orderDraftStatusId.status_id
          ) {
            BodyData.status = orderDraftStatusId.status_id;
          }

          await OrderService.updateOrderProduct(
            selectedItem?.orderProductId,
            BodyData,
            async (error, response) => {
              if (response && response.data) {
                //close product select modal
                setProductExistModalOpen(false);
                getOrderProducts();
                setSearchPhrase("");
                setClicked("");
                setStoreProductList("");
                setIsProductAdding(false);
                setManualPrice(false);
              }
            }
          );
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getMediaList = async () => {
    if (id || orderId) {
      await mediaService.search(
        id ? id : orderId,
        ObjectName.ORDER,
        (callback) => setMediaData(callback.data.data)
      );
    }
  };

  const renderHiddenItem = (data, rowMap) => {
    let item = data?.item;
    setAllowEdit(item.allowEdit);
    setAllowCancel(item.allowCancel);
    return (
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <>
          {item?.status != Order.STATUS_CANCEL &&
            orderProductCancelPermission &&
            item.allowCancel && (
              <TouchableOpacity
                style={
                  (params?.group == Status.GROUP_DRAFT || params?.isNewOrder) &&
                  allowCancel
                    ? styles.productDelete
                    : item.allowEdit === Status.ALLOW_EDIT_ENABLED
                    ? styles.productDelete
                    : styles.actionDeleteButton
                }
                onPress={() => {
                  productDeleteModalToggle();
                  setSelectedItem(data?.item);
                  stateRef.selectedItem = data?.item;
                  stateRef.selecredRowMap = rowMap;
                  closeRow(rowMap, data?.item.orderProductId);
                }}
              >
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            )}
        </>
        <>
          {(item.allowEdit === Status.ALLOW_EDIT_ENABLED ||
            enableManualPrice) &&
          allowCancel ? (
            <View
              style={{
                alignItems: "center",
                bottom: 10,
                justifyContent: "center",
                position: "absolute",
                top: 10,
                width: 70,
                backgroundColor: Color.SECONDARY,
              }}
            >
              <DropDownMenu
                label="More"
                color={Color.WHITE}
                icon="ellipsis-horizontal"
                onPress={() => {
                  setMoreToggle(true);
                }}
                menuStyle={{ position: "absolute" }}
                MenuItems={[
                  <>
                    {item.allowEdit === Status.ALLOW_EDIT_ENABLED &&
                      moreToggle && (
                        <MenuItem
                          onPress={() => {
                            productModalToggle();
                            setMoreToggle(true);
                            setSelectedItem(data?.item);
                            stateRef.selectedItem = data?.item;
                            stateRef.selecredRowMap = rowMap;
                            closeRow(rowMap, data?.item.orderProductId);
                          }}
                        >
                          <Text>Edit</Text>
                        </MenuItem>
                      )}
                    {enableManualPrice && moreToggle && (
                      <MenuItem
                        onPress={() => {
                          priceModalToggle();
                          setSelectedItem(data?.item);
                          stateRef.selectedItem = data?.item;
                          stateRef.selecredRowMap = rowMap;
                          closeRow(rowMap, data?.item.orderProductId);
                          setMoreToggle(true);
                        }}
                      >
                        <Text>Update Price</Text>
                      </MenuItem>
                    )}
                  </>,
                ]}
              />
            </View>
          ) : (
            <>
              {(params?.group == Status.GROUP_DRAFT || params?.isNewOrder) && (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  {item.allowEdit === Status.ALLOW_EDIT_ENABLED && (
                    <TouchableOpacity
                      style={[
                        styles.orderProductEdit,
                        {
                          marginRight: enableManualPrice ? 2 : "",
                          width: !enableManualPrice ? "35%" : "",
                        },
                      ]}
                      onPress={() => {
                        productModalToggle();
                        setSelectedItem(data?.item);
                        stateRef.selectedItem = data?.item;
                        stateRef.selecredRowMap = rowMap;
                        closeRow(rowMap, data?.item.orderProductId);
                      }}
                    >
                      <Text style={styles.btnText}>Edit</Text>
                    </TouchableOpacity>
                  )}
                  {enableManualPrice && (
                    <TouchableOpacity
                      style={[
                        styles.orderProductEdit,
                        { width: !allowProductEdit ? "35%" : "" },
                      ]}
                      onPress={() => {
                        priceModalToggle();
                        setSelectedItem(data?.item);
                        stateRef.selectedItem = data?.item;
                        stateRef.selecredRowMap = rowMap;
                        closeRow(rowMap, data?.item.orderProductId);
                      }}
                    >
                      <Text style={{ color: "white" }}>Update Price</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          )}
        </>
      </View>
    );
  };

  const updateValue = async () => {
    setIsSubmit(true)

    let updateData = new Object();
    if (selectedUser) {
      updateData.owner = parseInt(selectedUser);
    }
    if (selectedStore) {
      updateData.storeId = selectedStore;
    }
    if (selectedShift) {
      updateData.shift = selectedShift;
    }
    if (status) {
      updateData.status = parseInt(status);
    }
    await orderService.updateOrder(id, updateData, (err, response) => {
      if (response) {
          getDetails()
          setEdit(false)
          setIsSubmit(false)

      }
      setIsSubmit(false)

    });
  };

  const renderItem = (data) => {
    let item = data?.item;
    let index = data?.index;

    const containerStyle = AlternativeColor.getBackgroundColor(index);
    return (
      <View style={styles.container}>
        {item && (
          <ProductCard
            size={item.size}
            unit={item.unit}
            name={item.name}
            image={item.image}
            brand={item.brand_name}
            sale_price={
              item?.manual_price ? item?.manual_price : item.sale_price
            }
            mrp={item.mrp}
            id={item.id}
            item={item}
            quantity={item.quantity}
            status={item.status}
            QuantityField
            editable
            alternative={containerStyle}
          />
        )}
      </View>
    );
  };
  const updateCustomerAccount = async()=>{
    let data = {
      customer_account : accountId
    };
    if (!orderId || !id) {
      clearStackNavigate();
    }
    OrderService.updateOrder(orderId ? orderId : id, data, () => {
    });
  }

  const updateDeliveryStatus = async(status)=>{    
    let data ={
      status : status
    }
    OrderService.updateStatus(orderId ? orderId : id,data,(err,response)=>{
      if(response){
        clearStackNavigate();

      }
    })
  }

  const createRefundRequest = async (id) => {
    setVisible(false);
    navigation.navigate("Invoice/invoiceProductList", {
      orderId: id,
      status: params?.status,
      type: type?.id,
    });
    setVisible(true);
  };

  const getActionItems = async () => {
    let actionItems = new Array();

    const cancelPermission = await PermissionService.hasPermission(
      Permission.ORDER_CANCEL
    );    

   if(isDeliveryOrder){
    deliveryStatus && deliveryStatus.forEach(statusItem => {      
      if (statusItem.id !== params?.status_id) {
        actionItems.push(
          <MenuItem key={statusItem.id} onPress={()=>{updateDeliveryStatus(statusItem.id),setVisible(true)}}>{statusItem.label}</MenuItem>
      );      }
  });
   } 

    if (
      cancelPermission &&
      !(params?.status === Order.STATUS_COMPLETED) &&
      !(params?.status === Order.STATUS_CANCEL)
    ) {
      actionItems.push(
        <MenuItem
          onPress={() => {
            setOrderCancelModal(true), setVisible(true);
          }}
        >
          Cancel Order
        </MenuItem>
      );
    }
    if (params?.isNewOrder) {
      actionItems.push(
        <MenuItem
          onPress={() => {
            if (images && images.length > 0) {
              updateCustomerAccount()
              uploadImages();
            } else {
               updateCustomerAccount()
                clearStackNavigate();
            }
          }}
        >
          Save as Draft
        </MenuItem>
      );
    }

    if (params.isNewOrder) {
      null;
    } else {
      actionItems.push(
        <MenuItem
          onPress={() => {
            navigation.navigate("Order/Invoice", {
              item: {
                id: orderId ? orderId : id,
                order_number: orderNumber ? orderNumber : params.orderNumber,
                total_amount: params?.totalAmount,
              },
            });
            setVisible(true);
          }}
        >
          View Invoice
        </MenuItem>
      );

      if (params?.status === Order.STATUS_COMPLETED) {
        actionItems.push(
          <MenuItem
            onPress={() => {
              createRefundRequest(orderId);

              setVisible(true);
            }}
          >
            Refund Request
          </MenuItem>
        );
      }
    }

    setActionList(actionItems);
  };
  const getAction = async () => {
    let actionItems = new Array();

    const editPermission = await PermissionService.hasPermission(
      Permission.ORDER_EDIT
    );

    if (editPermission && params?.allow_edit === Status.ALLOW_EDIT_ENABLED) {
      actionItems.push(
        <MenuItem
          onPress={() => {
            setEdit(true), setVisible(true);
          }}
        >
          Edit
        </MenuItem>
      );
    }

    setList(actionItems);
  };

   const takePicture = async (e) => {
    try{
      const image = await Media.getImage();
      if (image && image.assets && image.assets.length > 0) {
        const imageUrl = image.assets[0];
        setImages((prevImages) => [...prevImages, imageUrl]);
      }
    }catch (error) {
      console.error('Error taking picture:', error);
  }
   
  };

  const handleUploadMedia = async (e) => {
    const image = await Media.getImage();
    if (image && image.assets) {
      const response = await fetch(image.assets[0].uri);
      const blob = await response.blob();
      await Media.uploadImage(
        id ? id : orderId,
        blob,
        image.assets[0].uri,
        ObjectName.ORDER,
        null,
        null,
        async (response) => {
          if (response) {
            getMediaList();
          }
        }
      );
    }
  };
  const handleDelete = (index) => {
    try {
      setImages((prevImages) => {
        // Filter out the image at the specified index
        return prevImages.filter((_, i) => i !== index);
      });
    } catch (err) {
      console.log(err);
    }
  };
  const uploadImages = async () => {
    if (images && images.length > 0) {
      for (const image of images) {
        const response = await fetch(image.uri);
        const blob = await response.blob();
        await Media.uploadImage(
          id ? id : orderId,
          blob,
          image.uri,
          ObjectName.ORDER,
          null,
          null,
          async (response) => {}
        );
      }
      clearStackNavigate();
    }
  };


  let title = [
    {
      title: TabName.SUMMARY,
      tabName: TabName.SUMMARY,
    },
    {
      title: `${TabName.PRODUCTS} (${
        (orderProducts && orderProducts.length) || 0
      })`,
      tabName: TabName.PRODUCTS,
    },
  ];

  if (isDeliveryOrder) {
    title.push({
      title: TabName.CUSTOMER,
      tabName: TabName.CUSTOMER,
    });
  }
  if (params?.paymentType !== PaymentType.CASH_VALUE) {
    title.push({
      title: TabName.ATTACHMENTS,
      tabName: TabName.ATTACHMENTS,
    });
  }
  if(orderHistoryViewPermission && !params?.isNewOrder){
    title.push({
      title: TabName.HISTORY,
      tabName: TabName.HISTORY,
    });
  }

  return (
    <>
    <Layout
      title={
        isDeliveryOrder
          ? orderNumber || params.orderNumber
            ? `Delivery# ${orderNumber ? orderNumber : params.orderNumber}`
            : "Delivery"
          : orderNumber || params.orderNumber
          ? `Order# ${orderNumber ? orderNumber : params.orderNumber}`
          : "Order"
      }
      closeModal={visible}
      showActionMenu={
        activeTab === TabName.PRODUCTS
          ? actionList && actionList.length > 0
          : (activeTab === TabName.SUMMARY) || (activeTab === TabName.ATTACHMENTS)
          ? !allowEdit && list && list.length > 0
            ? true
            : false
          : ""
      }
      isSubmit={isSubmit}
      buttonLabel={
        activeTab === TabName.SUMMARY &&
        allowEdit &&
        params?.allow_edit === Status.ALLOW_EDIT_ENABLED
          ? "Save"
          : activeTab === TabName.ATTACHMENTS && allowEdit
          ? "Upload"
          : ""
      }
      buttonOnPress={
        activeTab === TabName.ATTACHMENTS
          ? (e) => handleUploadMedia(e)
          : handleSubmit((values) => {
              updateValue(values);
            })
      }
      actionItems={activeTab === TabName.PRODUCTS ? actionList : list}
      showBackIcon={
        params?.isNewOrder ? false : true
      }
      defaultFooter={
        params?.group == Status.GROUP_DRAFT || params?.isNewOrder ? true : false
      }
      emptyMenu={
        params?.group == Status.GROUP_DRAFT || params?.isNewOrder ? true : false
      }
      backButtonNavigationUrl= {`${isDeliveryOrder?"Delivery":"Order"}`}
      HideSideMenu={
        params?.group == Status.GROUP_DRAFT || params?.isNewOrder ? true : false
      }
      FooterContent={
        activeTab === TabName.SUMMARY
          ? ""
          : searchPhrase &&
            storeProductList &&
            storeProductsList.length > 0 && (
              <CustomButton
                title={"CANCEL"}
                backgroundColor={Color.CANCEL_BUTTON}
                show={permission ? true : false}
                onPress={() => setSearchPhrase("")}
              />
            )
      }
    >
      {orderCancelModal && (
         <CustomAlertModal 
         visible={orderCancelModal}
         title="Cancel Order"
         message = {
                  orderProducts.length > 0
                   ? `Are you sure, you want to cancel this order?`
                    : `No Products Added. Are you sure, you want to cancel this order?`}
          buttonOptions={[
             { label: Label.TEXT_YES, onPress: () => OnCancel() },
             { label: Label.TEXT_NO, onPress: () => setOrderCancelModal(false) }
             ]}
         />
      
       )}
     

      {params?.isNewOrder ? (
        <View>
          <ScrollView>
            <View style={{ width: searchPhrase ? "100%" : "85%" }}>
              <SearchBar
                searchPhrase={searchPhrase}
                setSearchPhrase={setSearchPhrase}
                setClicked={setClicked}
                clicked={clicked}
                handleChange={handleSearchOnChange}
                noScanner
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                position: "relative",
              }}
            >
              {!searchPhrase && (
                <>
                  <MaterialCommunityIcons
                    name={`cart-outline`}
                    size={26}
                    color="#000"
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "80%",
                      transform: [{ translateY: -45 }],
                    }}
                  />

                  <View style={{ position: "absolute", right: 0 }}>
                    <View
                      style={{
                        backgroundColor: "#ff0000",
                        borderRadius: 10,
                        position: "absolute",
                        right: 10,
                        top: "80%",
                        transform: [{ translateY: -56 }],
                        width: 18,
                        height: 18,
                        borderRadius: 14,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 12,
                          textAlign: "center",
                          lineHeight: 18,
                        }}
                      >
                        {filteredList.length || 0}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            <CustomAlertModal
             visible={customModalVisible}
             title={"Create Account"}
             message="Do you want to Create Account?"
             buttonOptions={[
               { label: Label.TEXT_YES, onPress: () => handleContinue() },
               { label: Label.TEXT_NO, onPress: () => handleAlertClose() }
            ]}
            />

            {searchPhrase &&
              storeProductList &&
              storeProductsList.length > 0 && (
                <View>
                  <ProductSearch
                    searchResult={storeProductList}
                    productOnClick={productOnClick}
                  />
                </View>
              )}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.tabBar}>
          <>
            <Tab
              title={title}
              setActiveTab={setActiveTab}
              defaultTab={activeTab}
            />
          </>
        </View>
      )}
      {activeTab === TabName.CUSTOMER && (
        <CustomerInfo
          accountList={accountList}
          param={items ? items : params}
        />
      )}
      {activeTab === TabName.ATTACHMENTS && (
        <MediaList mediaData={MediaData} getMediaList={getMediaList} />
      )}
      {activeTab === TabName.SUMMARY && (
        <General
          permission={permission}
          param={params}
          setSelectedDate={setSelectedDate}
          setSelectedShift={setSelectedShift}
          setSelectedStore={setSelectedStore}
          setSelectedUser={setSelectedUser}
          selectedUser={selectedUser?selectedUser:(params && params?.owner)}
          selectedDate={selectedDate}
          setStatus={setStatus}
          status={status}
          allowEdit={allowEdit}
         
          onPress={() => setProductCompleteModalOpen(true)}
        />
      )}
  {productCompleteModalOpen && (
            <ProductModal
              modalVisible={productCompleteModalOpen}
              button1Press={(value) =>
                selectedPayment === PaymentType.VALIDATION ||
                selectedPayment === PaymentType.INITIAL
                  ? setSelectedPayment(PaymentType.INITIAL)
                  : cashPaid(value)
              }
              content={`Total Amount  `}
              content2={`${CurrencyFormat.IndianFormat(
                Number.GetFloat(totalAmount)
              )}`}
              toggle={productCompleteModalToggle}
              button1Label="PAID"
              title={isDeliveryOrder?"Complete Delivery" :"Complete Order"}
              handlePaymentChange={handlePaymentChange}
              selectedPayment={selectedPayment}
              MediaData={images ? images : MediaData}
              takePicture={() => takePicture()}
              handleDelete={handleDelete}
              enableButton={enableButton}
              isSubmit = {isSubmit}
            />
          )}
          {modalVisible && (
            <BarcodeScanner
              toggle={toggle}
              modalVisible={modalVisible}
              id={orderId ? orderId : id}
              handleScannedData={handleScannedData}
            />
          )}
           {qrCodeScanModalVisible && (
            <BarcodeScanner
              title="Scan QR Code"
              toggle={qrScanToggle}
              modalVisible={qrCodeScanModalVisible}
              id={orderId ? orderId : id}
              handleScannedData={handleScan}
              showCustomerMobileNumberOption 
              control = {control}
              handleMobileNumberChange = {handleMobileNumberChange}
              handleMobileNumberUpdate = {handleMobileNumberUpdate}
              onPressSkip = {createOrder}
            />
          )}
          

          {productDeleteModalOpen && (
            <OrderProductCancelModel
              modalVisible={productDeleteModalOpen}
              toggle={productDeleteModalToggle}
              item={selectedItem}
              updateAction={cancelOrderProduct}
              heading={AlertMessage.CANCEL_MODAL_TITLE}
              description={AlertMessage.CANCEL_MODAL_DESCRIPTION}
              control={control}
              onReasonInput={onReasonInput}
              showReasonField
              reason={reason}
            />
          )}

          {productModalOpen && (
            <ProductEditModal
              modalVisible={productModalOpen}
              toggle={productModalToggle}
              item={selectedItem}
              updateAction={updateQuantity}
              control={control}
            />
          )}
          {priceModalOpen && (
            <PriceUpdateModal
              modalVisible={priceModalOpen}
              toggle={priceModalToggle}
              item={selectedItem}
              handleUpdate={handleUpdate}
              control={control}
              price={manualPrice}
            />
          )}

      {activeTab === TabName.PRODUCTS && (
        <View style={{ flex: 1 }}>
          {!params.isNewOrder && (
            <View style={{ width: searchPhrase ? "100%" : "85%" }}>
              <SearchBar
                searchPhrase={searchPhrase}
                setSearchPhrase={setSearchPhrase}
                setClicked={setClicked}
                clicked={clicked}
                handleChange={handleSearchOnChange}
                noScanner
              />
            </View>
          )}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              position: "relative",
            }}
          >
            {!searchPhrase && (
              <>
                <MaterialCommunityIcons
                  name={`cart-outline`}
                  size={26}
                  color="#000"
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "80%",
                    transform: [{ translateY: -45 }],
                  }}
                />

                <View style={{ position: "absolute", right: 0 }}>
                  <View
                    style={{
                      backgroundColor: "#ff0000",
                      borderRadius: 10,
                      position: "absolute",
                      right: 10,
                      top: "80%",
                      transform: [{ translateY: -56 }],
                      width: 18,
                      height: 18,
                      borderRadius: 14,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 12,
                        textAlign: "center",
                        lineHeight: 18,
                      }}
                    >
                      {filteredList.length || 0}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {!params.isNewOrder && searchPhrase && storeProductList && storeProductsList.length > 0 && (
            <View>
              <ProductSearch
                searchResult={storeProductList}
                productOnClick={productOnClick}
              />
            </View>
          )}
          <View
            style={
              orderProducts && orderProducts.length > 0
                ? { flex: 0.8 }
                : { flex: 0.8, justifyContent: "center", alignItems: "center" }
            }
          >
            {!searchPhrase && orderProducts && orderProducts.length > 0 ? (
              <>
                <ScrollView>
                  <SwipeListView
                    data={orderProducts}
                    renderItem={renderItem}
                    renderHiddenItem={renderHiddenItem}
                    rightOpenValue={
                      params?.group == Status.GROUP_DRAFT || params?.isNewOrder
                        ? -150
                        : allowCancel || allowProductEdit
                        ? -150
                        : -80
                    }
                    previewOpenValue={-40}
                    previewOpenDelay={3000}
                    closeOnRowOpen={true}
                    keyExtractor={(item) => String(item.orderProductId)}
                    disableLeftSwipe={
                      allowCancel || allowProductEdit ? false : true
                    }
                    disableRightSwipe={true}
                  />
                </ScrollView>
              </>
            ) : storeProductsList.length == 0 &&
              orderProducts &&
              orderProducts.length == 0 ? (
              <View style={{ alignItems: "center" }}>
                <FontAwesome5 name="box-open" size={20} color={Color.PRIMARY} />
                <LabelText text="No Products Added Yet" bold={true} />
              </View>
            ) : (
              <Spinner />
            )}
          </View>


       
          <View style={{ flex: 0.2 }}>
            {!params?.isNewOrder && (
              <View style={styles.cashAmount}>
                {cashAmount > 0 && (
                  <View style={styles.align}>
                    <Text style={styles.letter}>
                      Cash:&nbsp;&nbsp;
                      <Text style={styles.letterColor}>
                        {CurrencyFormat.IndianFormat(
                          cashAmount ? cashAmount : ""
                        )}
                      </Text>
                    </Text>
                  </View>
                )}
                {upiAmount > 0 && (
                  <View style={styles.align}>
                    <Text style={styles.letterText}>
                      Upi:&nbsp;&nbsp;
                      <Text style={styles.letterColor}>
                        {CurrencyFormat.IndianFormat(
                          upiAmount ? upiAmount : ""
                        )}
                      </Text>
                    </Text>
                  </View>
                )}
              </View>
            )}
            {!clicked && (
              <View style={styles.totalAmount}>
                <View style={styles.align}>
                  <Text style={styles.letter}>
                    Total Amount:&nbsp;&nbsp;
                    <Text style={styles.letterColor}>
                      {!params?.isNewOrder
                        ? CurrencyFormat.IndianFormat(
                            Number.GetFloat(totalAmount)
                          )
                        : CurrencyFormat.IndianFormat(
                            Number.GetFloat(totalAmount)
                          )}
                    </Text>
                  </Text>
                </View>
              </View>
            )}
            {!clicked &&
              ((!productExistModalOpen &&
                !productNotFoundModalOpen &&
                params?.group == Status.GROUP_DRAFT) || (params?.group == Status.GROUP_NEW)||
                params?.isNewOrder) && (
                <FooterContent
                  id={orderId ? orderId : id}
                  storeId={params.storeId}
                  locationName={params?.locationName}
                  shift={params?.shift}
                  date={params?.date ? params?.date : orderDate}
                  addNew={addNew}
                  onPress={() =>
                    orderProducts.length > 0
                        ? setProductCompleteModalOpen(true)
                      : setOrderCancelModal(true)
                  }
                  orderProducts={orderProducts}
                  totalAmount={Number.GetFloat(totalAmount)}
                  cashPaid={cashPaid}
                  delivery={isDeliveryOrder}
                />
              )}
          </View>

          {productNotFoundModalOpen && (
            <ConfirmationModal
              toggle={productNotFoundToggle}
              modalVisible={productNotFoundModalOpen}
              title={AlertMessage.PRODUCT_NOT_FOUND}
              description={`BarCode ID ${scannedCode} not found please scan different code or add the product`}
              confirmLabel={"Ok"}
              ConfirmationAction={productNotFoundToggle}
            />
          )}

          {productExistModalOpen && (
            <ConfirmationModal
              toggle={productExistModalToggle}
              scanProduct={scanProduct}
              modalVisible={productExistModalOpen}
              title={AlertMessage.PRODUCT_ALREADY_EXIST}
              description={AlertMessage.QUANTITY_INCREASE_MESSSAGE}
              confirmLabel={"Yes"}
              cancelLabel={"No"}
              ConfirmationAction={productExistOnclick}
              CancelAction={() => productExistModalToggle()}
            />
          )}

          {productSelectModalOpen && (
            <ProductSelectModal
              modalVisible={productSelectModalOpen}
              toggle={productSelectModalToggle}
              items={scannedProductList}
              updateAction={validateProductInOrderProduct}
            />
          )}
        </View>
      )}
       {activeTab === TabName.HISTORY && (
                <ScrollView>
                    <HistoryList
                        objectName={ObjectName.ORDER}
                        objectId={id ? id : params?.orderId}
                    />

                </ScrollView>
            )}

      {activeTab === TabName.SUMMARY && !params?.isNewOrder && ( 
            <OrderAmountCard padding = { Platform.OS === 'ios' ? 20 : 0} totalCash = {cashAmount > 0 && cashAmount ? cashAmount : ""} totalUpi = {upiAmount > 0 ? upiAmount && upiAmount : "" } totalAmount={totalAmount ? totalAmount : ""}/>
      )}
    </Layout>
    </>
  );
};
export default Billing;
