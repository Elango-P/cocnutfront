// Import React and Component
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    View,
    Text,
    RefreshControl,
    TouchableOpacity,
    ScrollView,
    NativeModules
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import { useIsFocused } from "@react-navigation/native";

import Layout from "../../components/Layout";

import Spinner from "../../components/Spinner";

import InventoryTransferService from "../../services/InventoryTransferService";

import { SwipeListView } from 'react-native-swipe-list-view';

import { Transfer } from "../../helper/InventoryTransfer";

import AlertMessage from "../../helper/AlertMessage";

import ProductCard from "../../components/ProductCard";

import BarCodeScanner from "../../components/BarcodeScanner";

import ConfirmationModal from "../../components/Modal/ConfirmationModal";

import ProductEditModal from "../../components/Modal/ProductEditModal";

import DeleteModal from "../../components/Modal/DeleteModal";

import ProductSelectModal from "../../components/Modal/ProductSelectModal";

import OnePortalDB from "../../lib/SQLLiteDB";

import Object from "../../lib/Object";

import dateTime from "../../lib/DateTime";

import Tab from "../../components/Tab";

import TabName from '../../helper/Tab';

import FooterContent from "./components/FooterContent";

import NoRecordFound from "../../components/NoRecordFound";

import GeneralTab from "./components/GeneralTab";

import transferTypeService from "../../services/TransferTypeService";

import StatusService from "../../services/StatusServices";

import { Color } from "../../helper/Color";

import Print from "../../components/Print";

import SharePdf from '../../components/Share';

import { MenuItem, MenuDivider } from 'react-native-material-menu';

import ObjectName from "../../helper/ObjectName";

import ProductService from "../../services/ProductService";

import TransferTypeReasonModal from "../../components/Modal/TransferTypeReasonModal";

import TransferTypeReasonService from '../../services/TransferTypeReasonService';

import PermissionService from "../../services/PermissionService";

import Permission from "../../helper/Permission";

import CountSelectModal from "../../components/Modal/CountSelectModal";

import Setting from "../../lib/Setting";

import StatusUpdateModal from "./components/StatusUpdateModal";
import ShowMore from "../../components/ShowMore";

import DateTime from "../../lib/DateTime";

import SyncService from "../../services/SyncService";

import Status from "../../helper/Status";
import asyncStorageService from "../../services/AsyncStorageService";
import ReplenishList from "./ReplenishList";

import BottomDrawer from "../../components/BottomDrawer";
import ActionMenuDrawer from "../../components/ActionMenuDrawer";
import SearchBar from "../../components/SearchBar";
import ProductSearch from "../../components/ProductSearch";
import productService from "../../services/ProductService";
import inventoryTransferService from "../../services/InventoryTransferService";
import HistoryList from "../../components/HistoryList";
import styles from "../../helper/Styles";


const ProductList = (props) => {

    const [inventoryTransferProducts, setInventoryTransferProducts] = useState([]);


    const [totalQuantity, setTotalQuantity] = useState(0);

    const [modalVisible, setScanModalVisible] = useState(false);

    const [scannedProductList, setScannedProductList] = useState("");

    const [productExistModalOpen, setProductExistModalOpen] = useState("");

    const [productReceiveModalOpen, setProductReceiveModalOpen] = useState("");

    const [quantityUpdateObject, setQuantityUpdateObject] = useState({});

    const [scannedCode, setScannedCode] = useState("");

    const [productEditModalOpen, setProductEditModalOpen] = useState(false);

    const [selectedItem, setSelectedItem] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const [productNotFoundModalOpen, setProductNotFoundModalOpen] = useState(false);

    const [productDeleteModalOpen, setProductDeleteModalOpen] = useState(false);

    const [productSelectModalOpen, setProductSelectModalOpen] = useState(false);

    const [reasonSelectModalOpen, setReasonSelectModalOpen] = useState(false);

    const [activeTab, setActiveTab] = useState(TabName.SUMMARY);

    const [transferType, setTransferType] = useState("");

    const [refreshing, setRefreshing] = useState(false);

    const [statusId, setStatusId] = useState("");

    const [draftStatus, setDraftStatus] = useState("");

    const [lastAddedTransferProductId, setLastAddedTransferProductId] = useState("");

    const [transferTypeReasonList, setTransferTypeReasonList] = useState([]);

    const [transferPermission, setTransferPermission] = useState("")

    const [statusList, setStatusList] = useState([])

    const [actionList, setActionList] = useState([])

    const [list, setList] = useState([])

    const [openCopySelectModal, setShowNumberOfCopySelectModal] = useState(false);

    const [numberofCopies, setNumberofCopies] = useState("");

    const [productStatus, setProductStatus] = useState("")

    const [selectedQuantity, setSelectedQuantity] = useState("");

    const [visible, setVisible] = useState(false)

    const [openActionDrawer, setActionDrawerOpen] = useState(false);

    const [page, setPage] = useState(2);

    const [showScan,setShowScan] = useState([])
    const [totalCount, setTotalCount] = useState(0)

    const [permission, setPermission] = useState("")

    const [allowEdit, setEdit] = useState(true);
    const [replenishProducts, setReplenishProducts] = useState([]);

    const [replenishProductCount, setReplenishProductsCount] = useState(0);
    const [searchPhrase, setSearchPhrase] = useState("");
    const [clicked, setClicked] = useState(false);
    const [storeProductList, setStoreProductList] = useState("");
    const [searchParam, setSearchParam] = useState("")
    const [transferHistoryViewPermission,setTransferHistoryViewPermission] = useState("")

    const { BluetoothManager } = NativeModules;

    let BlueTooth;

    if (BluetoothManager) {
        BlueTooth = require("../../services/BluetoothService");
    }


    const isFocused = useIsFocused();

    let params = props?.route?.params;

    const navigation = useNavigation();

    const stateRef = useRef();

    let DB = OnePortalDB.open('oneportal.db')

    //    Pull down to refresh the page
    const wait = (timeout) => {
        return new Promise((resolve) => setTimeout(resolve, timeout));
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        wait(2000).then(() => setRefreshing(false));
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            await getInventoryTransferProducts();
        };
        fetchData();
        getTransferType();
        getTransferTypeReasonList();
        getActionInitialMenu();
        initialMenu();
        getProductNextStatus();
        getReplenishProducts()
    }, [refreshing, isFocused]);
    useEffect(()=>{
        getStatusList();

    },[props])

    useEffect(() => {
        getActionItem();
    }, [statusList]);

    useEffect(() => {
        editPermission();
    }, [isFocused]);
    useEffect(() => {
        getPrintActionItem();
    }, [statusId]);


    const quantityOnChange = (value) => {
        setSelectedQuantity(value)
    }

    const getProductNextStatus = async () => {

        if (params?.currentStatusId) {
            let statusList = await StatusService.getNextStatus(params?.currentStatusId, null);
            if (statusList) {
                setStatusList(statusList);
            }
        }
    }
    const editPermission = async () => {
        const editPermission = await PermissionService.hasPermission(Permission.TRANSFER_EDIT);
        setPermission(editPermission);
        const transferHistoryViewPermission = await PermissionService.hasPermission(Permission.ACCOUNT_MANAGE_OTHERS)
        setTransferHistoryViewPermission(transferHistoryViewPermission)
    }
    const getTransferTypeReasonList = () => {

        if (params && params.type) {
            let urlParams = { transferType: params.type, pagination: false }
            TransferTypeReasonService.search(urlParams, (err, response) => {
                if (response && response.data && response.data.data) {
                    let reasonList = response.data.data;

                    if (reasonList && reasonList.length > 0) {
                        setTransferTypeReasonList(reasonList);
                    }
                }
            })
        }
    }

    const getStatusList = async () => {
        let completedStatusId = await StatusService.getStatusIdByName(ObjectName.TRANSFER, Status.GROUP_COMPLETED);
        setStatusId(completedStatusId)
        let draftStatus = await StatusService.getStatusIdByName(ObjectName.TRANSFER, Status.GROUP_DRAFT);
        setDraftStatus(draftStatus)
        let status = await StatusService.list(
            ObjectName.TRANSFER
        );
        const filteredStatuses = status.filter(status => status.allow_product_add === 1);
            const statusId = filteredStatuses.map(status => status.status_id);
            setShowScan(statusId)
    };
    const handleChange = async (search) => {
        setSearchParam(search)
        let param
        param =  {transferId : params.transferId,fromLocationId: params.fromLocationId,search: search ? search : ""}
       await inventoryTransferService.searchTransferProduct(param,(err,response)=>{
        setInventoryTransferProducts(response && response.data && response.data.data);
            if (searchPhrase.length == 0) {
                getInventoryTransferProducts;
              }
        });
    
    
      };

    const getPermission = async () => {
        const isExist = await PermissionService.hasPermission(Permission.TRANSFER_MANAGE_OTHERS);
        setTransferPermission(isExist)
    }

    const getTransferType = () => {
        transferTypeService.search("", (tranferTypes) => {
            if (tranferTypes && tranferTypes.length > 0 && params.type) {
                let tranferType = tranferTypes.find((tranferType) => tranferType.id == params.type);
                if (tranferType) {
                    setTransferType(tranferType.label)
                }
            }
        })
    }

    const getInventoryTransferProducts = async (callback) => {

        if (params?.offlineMode) {
            await InventoryTransferService.getInventoryProducts(params.transferId, (error, inventoryProductList, totalQuantity) => {

                if (inventoryProductList) {
                    setInventoryTransferProducts(inventoryProductList);
                }
                stateRef.inventoryProductList = inventoryProductList;
                setTotalQuantity(totalQuantity);
                callback && callback(inventoryProductList)
            })
        } else {
            await InventoryTransferService.getInventoryProductList(params.transferId, params?.fromLocationId, (error, inventoryProductList, totalQuantity, totalCount) => {

                if (inventoryProductList) {
                    setInventoryTransferProducts(inventoryProductList);
                }
                stateRef.inventoryProductList = inventoryProductList;
                setTotalQuantity(totalQuantity);
                setTotalCount(totalCount)
                callback && callback(inventoryProductList)
            })
        }
    }

    // Get Stock entry list
    const updateInventory = async (statusId) => {
        if (statusId) {

            if (params?.offlineMode) {
                InventoryTransferService.updateStatus( { status: statusId, id:params.transferId }, async () => {
                    await InventoryTransferService.updateInventoryProducts(params.transferId, params?.fromLocationId, params?.toLocationId);
                    navigation.navigate(params.isDistribution ? "distributionTransfer" : "inventoryTransfer", { filter: params?.filter });
                });
            } else {
                await InventoryTransferService.updateStatus({ status: statusId, id:params.transferId }, () => {
                    navigation.navigate(params.isDistribution ? "distributionTransfer" : "inventoryTransfer", { filter: params?.filter });
                });
            }
        }
    };

    const toggle = () => {
        setScanModalVisible(!modalVisible);
    }

    const productExistModalToggle = () => {
        setProductExistModalOpen(!productExistModalOpen);

    }
    const productReceiveModalToggle = () => {
        setProductReceiveModalOpen(false);
        setSelectedQuantity("");
        setSelectedItem("");
        setProductStatus("");
    }


    const clearRowDetail = () => {
        if (stateRef) {
            const selectedItem = stateRef.selectedItem;
            const selectedRowMap = stateRef.selecredRowMap;
            if (selectedItem && selectedRowMap) {
                closeRow(selectedRowMap, selectedItem.inventoryTransferProductId)
                setSelectedItem("");
                stateRef.selectedItem = "";
                stateRef.selecredRowMap = "";
            }
        }
    }

    const onPrintClickHandler = async () => {

        let bluetoothDevices = await OnePortalDB.runQuery(DB, `SELECT * FROM setting WHERE name='${Setting.BLUETOOTH_PRINTER_SETTING}'`);

        if (bluetoothDevices && bluetoothDevices.length > 0) {

            let deviceDetail = bluetoothDevices[0];

            if (deviceDetail) {

                let address = deviceDetail.value;

                await BlueTooth.Connect(address)

                if (numberofCopies && numberofCopies > 0) {
                    for (let i = 0; i < numberofCopies; i++) {
                        await printLabel(i);
                    }
                    setShowNumberOfCopySelectModal(false);
                }
            }
        } else {
            Toast.show("Printer Not Connected");
        }
    }

    const toggleModal = () => {
        setShowNumberOfCopySelectModal(!openCopySelectModal);
    }

    const OnSelectNumberOfCopy = (selectedValue) => {
        if (selectedValue) {
            setNumberofCopies(parseInt(selectedValue.value));
        }
    }

    const printLabel = async (i) => {
        try {
            let locationName = params?.printName ? params?.printName : params?.toLocationName;

            let barCode = params?.transferId;

            await BlueTooth.PrintLabel(barCode, locationName, i + 1)
        } catch (err) {
            console.log(err);
        }
    }

    const deleteInventoryProduct = async (item) => {

        if (params?.offlineMode) {
            //validate transfer prodcut eixst or not
            if (item && item.inventoryTransferProductId) {
                await OnePortalDB.runQuery(DB, `DELETE FROM transfer_product WHERE transfer_product_id=${item.inventoryTransferProductId}`);
                //delete the inventory products
                InventoryTransferService.deleteInventoryTransferProduct(item.inventoryTransferProductId, async () => {
                    //refreesh the inventory product list
                    await getInventoryTransferProducts();
                    //clear the selected row
                    clearRowDetail();
                });
            } else if (item && item.local_transfer_product_id) {
                //delete the product from transfer product
                await OnePortalDB.runQuery(DB, `DELETE FROM transfer_product WHERE id=${item.local_transfer_product_id}`);
                //refresh the list
                getInventoryTransferProducts();
            }
        } else {
            //delete the inventory products
            InventoryTransferService.deleteInventoryTransferProduct(item.inventoryTransferProductId, async () => {
                //refreesh the inventory product list
                await getInventoryTransferProducts();
                //clear the selected row
                clearRowDetail();
            });
        }
    }
  

    const addInventory = async (quantity, scannedProduct) => {
        try {
            //validate quantity and scanned prodcut exist or not
            if (scannedProduct) {

                if (params?.offlineMode) {

                    let bodyData = {
                        transfer_id: params.transferId,
                        quantity: quantity,
                        product_id: scannedProduct?.product_id,
                        unit_price: scannedProduct?.unit_price,
                        amount: scannedProduct?.sale_price,
                        company_id: scannedProduct?.company_id,
                        created_at: dateTime.DateAndTime(new Date())
                    };

                    let isTransferProductExist = await OnePortalDB.runQuery(DB, `SELECT * FROM transfer_product WHERE product_id=${scannedProduct?.product_id} AND transfer_id=${params.transferId}`);

                    if (isTransferProductExist && isTransferProductExist.length == 0) {

                        let tranferProductObjectKeyValue = Object.getKeyValue(bodyData);

                        await OnePortalDB.runQuery(DB, `INSERT INTO transfer_product (${tranferProductObjectKeyValue.keyString}) VALUES (${tranferProductObjectKeyValue.createPlaceHolderString})`, tranferProductObjectKeyValue.valuesArrray);

                        getInventoryTransferProducts();
                    }
                } else {
                    let bodyData = {
                        id: params.transferId,
                        quantity: quantity,
                        storeId: params?.toLocationId,
                        productId: scannedProduct?.product_id,
                    };
                   
                    InventoryTransferService.addInventoryProduct(bodyData, (err, response) => {

                        if (response && response.data && response.data.transferProductDetails) {
                            setSearchPhrase("")

                            let transferProductDetail = response.data.transferProductDetails;

                            let transferProductData = {
                                brand_name: scannedProduct?.brand_name,
                                image: scannedProduct?.featured_media_url,
                                product_display_name: scannedProduct?.product_display_name,
                                name: scannedProduct?.product_name,
                                inventoryTransferProductId: transferProductDetail?.id,
                                id: transferProductDetail?.transfer_id,
                                quantity: quantity,
                                name: scannedProduct?.product_name,
                                product_id: scannedProduct?.product_id,
                                sale_price: scannedProduct?.sale_price,
                                mrp: scannedProduct?.mrp,
                                currentStatusId: transferProductDetail?.status
                            }
                           

                            if (inventoryTransferProducts != undefined) {

                                let inventoryProduct = [...inventoryTransferProducts]

                                inventoryProduct.splice(0, 0, transferProductData)

                                stateRef.inventoryProductList = inventoryProduct;

                                setInventoryTransferProducts(inventoryProduct);

                                setTotalCount(inventoryProduct.length)

                            }


                            if (transferTypeReasonList && transferTypeReasonList.length > 1) {

                                setLastAddedTransferProductId(transferProductDetail.id);

                                setReasonSelectModalOpen(true);

                            } else if (transferTypeReasonList && transferTypeReasonList.length == 1) {

                                let transferTypeReasonDeail = transferTypeReasonList[0];

                                let lastAddedTransferProductId = transferProductDetail.id;

                                if (transferTypeReasonDeail) {

                                    InventoryTransferService.updateInventoryProduct({ reasonId: transferTypeReasonDeail.id }, lastAddedTransferProductId, () => { });
                                }
                            }


                        }
                    })
                }

            }
        } catch (err) {
            console.log(err);
        }
    };

    const updateInventoryQuantity = async (quantity, transferProductId) => {
        try {
            //validate quantity exist or not
            if (quantity) {

                if (params?.offlineMode) {

                    //get unit price
                    let unit_price = selectedItem?.sale_price;

                    let bodyData = {
                        amount: parseFloat(unit_price) * quantity,
                        quantity: quantity
                    }

                    let tranferProductObjectKeyValue = Object.getKeyValue(bodyData);

                    //update the product data
                    await OnePortalDB.runQuery(DB, `UPDATE transfer_product SET ${tranferProductObjectKeyValue.updatePlaceHolderArray} WHERE id=${transferProductId}`, tranferProductObjectKeyValue.valuesArrray);

                    getInventoryTransferProducts();

                    //set update quantity object
                    setQuantityUpdateObject({});

                    clearRowDetail();

                    //set modal visibile
                    setProductExistModalOpen(false);

                } else {
                    //get unit price
                    let unit_price = selectedItem?.sale_price;

                    let bodyData = {
                        amount: parseFloat(unit_price) * quantity,
                        quantity: quantity
                    }

                    InventoryTransferService.updateInventoryProduct(bodyData, transferProductId, () => {


                        let inventoryProduct = [...inventoryTransferProducts]

                        if (inventoryProduct != undefined) {

                            let iventoryProductIndex = inventoryProduct.findIndex((data) => data.inventoryTransferProductId == transferProductId);

                            if (iventoryProductIndex > -1) {

                                inventoryProduct[iventoryProductIndex].quantity = quantity;

                                setInventoryTransferProducts(inventoryProduct);

                            }
                        }

                        //set update quantity object
                        setQuantityUpdateObject({});

                        clearRowDetail();

                        //set modal visibile
                        setProductExistModalOpen(false);

                    });
                }

            }
        } catch (err) {
            console.log(err);
        }
    };

    const updateProductStatus = (status, transferProductId) => {
        let bodyData = {
            status: status,
            quantity: selectedItem.quantity
        }

        InventoryTransferService.updateInventoryProduct(bodyData, transferProductId, () => {

            getInventoryTransferProducts();

            productReceiveModalToggle();

            //set update quantity object
            setQuantityUpdateObject({});

            clearRowDetail();

            //set modal visibile
            setProductExistModalOpen(false);

        });
    }

    const onScanAction = async (selectedProduct) => {

        const inventoryProductList = stateRef?.inventoryProductList;

        //validate already added product list
        if (inventoryProductList && inventoryProductList.length > 0) {

            //find the product already exist or not
            let productExist = inventoryProductList.find((data) => data.product_id == selectedProduct.product_id);

            //validate product exist or not
            if (productExist) {

                //get the updated quantity
                let updatedQuantity = productExist?.quantity ? productExist?.quantity + 1 : 1;

                //create return object
                let returnObject = {
                    updatedQuantity: updatedQuantity,
                    product: productExist,
                    inventoryTransferProductId: productExist?.inventoryTransferProductId,
                    localTransferProductId: productExist?.local_transfer_product_id,
                    product_id: selectedProduct?.product_id
                }

                //update quantity update object
                setQuantityUpdateObject(returnObject);


                setSelectedItem(returnObject.product)

                //set moda visiblity
                setProductExistModalOpen(true);

            } else {
                //add inventory product
                addInventory(1, selectedProduct);
            }
        } else {
            //add invenotry product
            addInventory(1, selectedProduct);
        }
    }


    const getProducts = async (barCode) => {

        const updatedPriceProductList = await ProductService.getProductUpdatedPrice(barCode);

        if (updatedPriceProductList && updatedPriceProductList.length == 1) {

            onScanAction(updatedPriceProductList[0]);

        } else if (updatedPriceProductList && updatedPriceProductList.length > 1) {

            //set store product list
            setScannedProductList(updatedPriceProductList);

            setProductSelectModalOpen(true);

        } else {
            productNotFoundToggle();
        }
    }

    const handleScannedData = async (data) => {
        try {

            setScanModalVisible(false);

            //get bar code
            let barCode = data?.data;

            //validate bar code exist and loading
            if (barCode) {

                //set scanned code
                setScannedCode(barCode);

                const updatedPriceProductList = await ProductService.getProductUpdatedPrice(barCode);


                if (updatedPriceProductList && updatedPriceProductList.length == 1) {

                    onScanAction(updatedPriceProductList[0]);

                } else if (updatedPriceProductList && updatedPriceProductList.length > 1) {

                    //set store product list
                    setScannedProductList(updatedPriceProductList);

                    setProductSelectModalOpen(true);

                } else {
                    SyncService.SyncProduct(barCode, null, (response) => {
                        getProducts(barCode);
                    })
                }

            }
        } catch (err) {
            console.log(err);
        }
    };

    const updateInventoryProduct = async () => {
        if (quantityUpdateObject) {

            let transferProductId = params?.offlineMode ? quantityUpdateObject?.localTransferProductId : quantityUpdateObject?.inventoryTransferProductId;
            // update the quantity
            await updateInventoryQuantity(quantityUpdateObject?.updatedQuantity, transferProductId);
        }
    }

    const productEditModalToggle = () => {
        setProductEditModalOpen(!productEditModalOpen);
        clearRowDetail();
    }

    const productDeleteModalToggle = () => {
        setProductDeleteModalOpen(!productDeleteModalOpen);
        clearRowDetail();
    }
    const updatedQuantity = (quantity) => {
        let transferProductId = params?.offlineMode ? selectedItem?.local_transfer_product_id : selectedItem?.inventoryTransferProductId;
        if (selectedItem && quantity > 0) {
            updateInventoryQuantity(quantity, transferProductId);
        }
    }

    const closeRow = (rowMap, rowKey) => {
        if (rowMap[rowKey]) {
            rowMap[rowKey].closeRow();
        }
    }

    const productNotFoundToggle = () => {
        setProductNotFoundModalOpen(!productNotFoundModalOpen);
    }

    const productSelectModalToggle = () => {
        setProductSelectModalOpen(!productSelectModalOpen);
    }

    const onScanClick = () => {
        setScanModalVisible(true);

    }

    const onSearchClick = () => {
        navigation.navigate("Transfer/ProductSearch", {
            transferId: params?.transferId,
            toLocationId: params?.toLocationId,
            fromLocationId: params?.fromLocationId,
            date: params?.date,
            type: params?.type,
            fromLocationName: params?.fromLocationName,
            transferNumber: params?.transferNumber,
            toLocationName: params?.toLocationName,
            notes: params?.notes,
            offlineMode: params?.offlineMode,
            currentStatusId: params?.currentStatusId,
            filter: params?.filter,
            printName: params?.printName
        });
    }

    const handleReasonOnclick = (selectedReason) => {

        if (lastAddedTransferProductId && selectedReason) {

            let bodyData = {
                reasonId: selectedReason.id
            }

            InventoryTransferService.updateInventoryProduct(bodyData, lastAddedTransferProductId, () => {

                setLastAddedTransferProductId("");

                setReasonSelectModalOpen(false);
            });
        }
    }

    const onStoreUpdate = (selectedStore, params) => {
        //validate transfer Id exist or not
        if (params?.transferId) {
            //create update object
            let updateData = {
                date: params?.date,
                fromLocationId: params.destinationStore == "fromStoreSelect" ? selectedStore.id : params?.fromLocationId,
                toLocationId: params.destinationStore == "toStoreSelect" ? selectedStore.id : params?.toLocationId,
                type: params?.type
            }
            // update the inventory
            InventoryTransferService.updateInventory(params?.transferId, updateData, (error, response) => {
                navigation.navigate("Transfer/ProductList", {
                    fromLocationId: params.destinationStore == "fromStoreSelect" ? selectedStore.id : params?.fromLocationId,
                    toLocationId: params.destinationStore == "toStoreSelect" ? selectedStore.id : params?.toLocationId,
                    transferId: params.transferId,
                    transferNumber : params.transferNumber,
                    fromLocationName: params.destinationStore == "fromStoreSelect" ? selectedStore.name : params?.fromLocationName,
                    toLocationName: params.destinationStore == "toStoreSelect" ? selectedStore.name : params?.toLocationName,
                    date: params?.date,
                    type: params?.type,
                    offlineMode: params?.offlineMode,
                    printName: params?.printName
                });
            })
        }
    }

    const renderItem = data => {
        let item = data?.item;
        return (
            <View style={styles.container}>

                <View>
                    {item && (
                        <ProductCard
                            size={item.size}
                            unit={item.unit}
                            name={item.name ? item.name : item.product_display_name}
                            image={item.image}
                            brand={item.brand_name}
                            sale_price={item.sale_price}
                            mrp={item.mrp}
                            statusUpdate={updateProductStatus}
                            id={item.id}
                            item={item}
                            quantity={item.quantity}
                            QuantityField
                            editable
                        />

                    )}
                </View>
            </View>
        );
    };
    const getReplenishProducts = () => {
        try {
            InventoryTransferService.getReplenishProducts(params.transferId, params?.toLocationId, (res) => {

                if (res) {
                    setReplenishProductsCount(res.totalCount);

                    setReplenishProducts(res.data);
                }
            })
        } catch (err) {
            console.log(err);
        }
    }

    const renderHiddenItem = (data, rowMap) => {
        return (
            <View style={styles.swipeStyle}>
                <TouchableOpacity
                    style={styles.productDelete}
                    onPress={() => {
                        productDeleteModalToggle()
                        setSelectedItem(data?.item);
                        stateRef.selectedItem = data?.item;
                        stateRef.selecredRowMap = rowMap;
                        closeRow(rowMap, data?.item.inventoryTransferProductId?data?.item.inventoryTransferProductId:data?.item?.id);
                    }}
                >
                    <Text style={styles.btnText}>Delete</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.productEdit}
                    onPress={() => {
                        productEditModalToggle()
                        setSelectedItem(data?.item);
                        stateRef.selectedItem = data?.item;
                        stateRef.selecredRowMap = rowMap;
                        closeRow(rowMap, data?.item.inventoryTransferProductId?data?.item.inventoryTransferProductId:data?.item?.id);
                    }}
                >
                    <Text style={styles.btnText}>Edit</Text>
                </TouchableOpacity>
            </View>
        )
    };
   

    const Replenish = () => (
        <View style={styles.container}>
            {replenishProducts && replenishProducts.length > 0 ? (
                <ReplenishList data={replenishProducts} />
            ) : (
                <NoRecordFound
                    styles={{ paddingVertical: 250, alignItems: "center" }}
                    iconName="box-open"
                />
            )}
        </View>)

    const Products = () => (
        <View style={{ flex: 1 }}>
            <View style={inventoryTransferProducts && inventoryTransferProducts.length > 0 ? { flex: 0.8 } : { flex: 0.8, justifyContent: "center", alignItems: "center" }}>

                {modalVisible && (
                    <BarCodeScanner
                        toggle={toggle}
                        modalVisible={modalVisible}
                        id={params.transferId}
                        fromLocationId={params.fromLocationId}
                        toLocationId={params.toLocationId}
                        handleScannedData={handleScannedData}
                    />
                )}

                {productEditModalOpen && (
                    <ProductEditModal
                        modalVisible={productEditModalOpen}
                        toggle={productEditModalToggle}
                        item={selectedItem}
                        updateAction={updatedQuantity}
                        quantityOnChange={updatedQuantity}
                    />
                )}

                {productSelectModalOpen && (
                    <ProductSelectModal
                        modalVisible={productSelectModalOpen}
                        toggle={productSelectModalToggle}
                        items={scannedProductList}
                        updateAction={onScanAction}
                    />
                )}

                {productDeleteModalOpen && (
                    <DeleteModal
                        modalVisible={productDeleteModalOpen}
                        toggle={productDeleteModalToggle}
                        item={selectedItem}
                        updateAction={deleteInventoryProduct}
                    />
                )}

                {productExistModalOpen && (
                    <ConfirmationModal
                        toggle={productExistModalToggle}
                        scanProduct={selectedItem}
                        modalVisible={productExistModalOpen}
                        title={AlertMessage.PRODUCT_ALREADY_EXIST}
                        description={AlertMessage.QUANTITY_INCREASE_MESSSAGE}
                        confirmLabel={"Yes"}
                        cancelLabel={"No"}
                        ConfirmationAction={updateInventoryProduct}
                    />
                )}

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


            </View>
        </View>
    );

    const onHandleLablePrintClick = async () => {
        let bluetoothDevices = await OnePortalDB.runQuery(DB, `SELECT * FROM setting WHERE name='${Setting.BLUETOOTH_PRINTER_SETTING}'`);

        if (bluetoothDevices && bluetoothDevices.length > 0) {
            setShowNumberOfCopySelectModal(true)
        } else {
            navigation.navigate("Bluetooth/Setting");
        }
    }

    const onEditPress = () => {
        setEdit(true);
        setVisible(true)
    }

    const onSharePress = () => {
        SharePdf(params.fromLocationName, transferType, params.toLocationName, params.date, inventoryTransferProducts);
    }

    const getActionInitialMenu = () => {

        let actionList = [{ label: 'SEARCH', onPress: onSearchClick },{ label: 'PRINT LABEL', onPress: onHandleLablePrintClick, }, { label: 'SHARE', onPress: onSharePress }]
        permission && activeTab === TabName.SUMMARY ? list : actionList

        setActionList(actionList);

    }
    const initialMenu = () => {
        let list = [{ label: "EDIT", onPress: onEditPress }]
        setList(list)
        permission && activeTab === TabName.SUMMARY ? list : list


    }


    const getActionItem = async () => {
        const roleId = await asyncStorageService.getRoleId()

        let statusLists = new Array();

        if (statusList && statusList.length > 0) {

            statusList.forEach((data) => {
                if (data.allowed_role_id && data.allowed_role_id.split(",").includes(roleId)) {

                    statusLists.push({ label: data.name, value: data.status_id, onPress: updateInventory }

                    )
                }
            })
        }

        if (statusLists && statusLists.length > 0) {
            let updatedMenu = [...actionList, ...statusLists];
            setActionList(updatedMenu);

        }
    }

    const onActionMenuPress = () => {
        setActionDrawerOpen(!openActionDrawer);
    }

    const getPrintActionItem = () => {
        let actionItem = new Array();
        if (params?.currentStatusId == statusId) {
            actionItem.push(
                <MenuItem>
                    <Print toLocationName={params.toLocationName} fromLocationName={params.fromLocationName} date={params.date} id={params.transferId} inventoryTransferProducts={inventoryTransferProducts} />
                </MenuItem>);

            let updatedMenu = [...actionItem, ...actionList];

            setActionList(updatedMenu);
        }
    }


    if (isLoading && !refreshing) {
        return <Spinner />;
    }
    let title = [

        {
            title: TabName.SUMMARY,
            tabName: TabName.SUMMARY
        },
        {
            title: `${TabName.PRODUCTS} (${totalCount})`,
            tabName: TabName.PRODUCTS
        },
    ];
   

    if (draftStatus === params?.currentStatusId) {
        title.push(
            {
                title: `${TabName.REPLENISH} (${replenishProductCount})`,
                tabName: TabName.REPLENISH,
            },
        );
    }
    if(transferHistoryViewPermission){
        title.push({
        title: TabName.HISTORY,
        tabName: TabName.HISTORY
    })
}

    /* Render flat list funciton end */
    return (
        <>
            <Layout
                title={`Transfer#: ${props.route.params.transferNumber}`}
                showBackIcon={true}
                params={{ filter: params?.filter }}
                FooterContent={activeTab === TabName.PRODUCTS && showScan.includes(params?.currentStatusId) && <FooterContent
                    storeId={params.storeId}
                    onScanClickAction={onScanClick}
                    products={inventoryTransferProducts}
                    updateStatus={updateInventory}
                    totalQuantity={totalQuantity}
                />}
                backButtonNavigationUrl={params.isDistribution ? "distributionTransfer" :  "inventoryTransfer"}
                inventoryTransferProducts={inventoryTransferProducts}
                fromLocationName={props.route.params.fromLocationName}
                toLocationName={props.route.params.toLocationName}
                type={transferType}
                id={props.route.params.transferId}
                onPressSearch={() => onSearchClick()}
                closeModal={visible}
                onActionMenuPress={onActionMenuPress}
                showActionDrawer={activeTab === TabName.SUMMARY && permission ? true : activeTab === TabName.PRODUCTS ? true : false}
            >
                 
                    <View >
                        <Tab
                            title={title}
                            setActiveTab={setActiveTab}
                            defaultTab={activeTab}
                        />
                    </View>
                {activeTab === TabName.PRODUCTS  && (
                       <SearchBar
                           searchPhrase={searchPhrase}
                           setSearchPhrase={setSearchPhrase}
                           setClicked={setClicked}
                           clicked={clicked}
                           onPress = {getInventoryTransferProducts}
                           handleChange={handleChange}
                           noScanner
                    />
                )}
                <ScrollView
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    keyboardShouldPersistTaps="handled"
                >
                    <ActionMenuDrawer
                        onClose={onActionMenuPress}
                        isOpen={openActionDrawer}
                        actionMenus={permission && activeTab === TabName.SUMMARY ? list : actionList}
                    />

                    {activeTab === TabName.SUMMARY && (
                         <View style={{ flex: 1 }}>
                         <GeneralTab
                             fromLocationName={params?.fromLocationName}
                             toLocationName={params?.toLocationName}
                             transferId={params?.transferId}
                             transferNumber = {params.transferNumber}
                             date={params?.date}
                             type={params?.type}
                             allowEdit={allowEdit}
                             typeName={transferType}
                             toLocationId={params?.toLocationId}
                             fromLocationId={params?.fromLocationId}
                             notes={params?.notes}
                             offlineMode={params?.offlineMode}
                             currentStatusId={params?.currentStatusId}
                             onStoreUpdate={onStoreUpdate}
                         />
                     </View>
                     )}
                   
                    {activeTab === TabName.PRODUCTS && (
                        <>
                            <View style={inventoryTransferProducts && inventoryTransferProducts.length > 0 ? { flex: 0.8 } : { flex: 0.8, justifyContent: "center", alignItems: "center" }}>
                                {inventoryTransferProducts && inventoryTransferProducts.length > 0 ? (
                                    <SwipeListView
                                        data={inventoryTransferProducts}
                                        renderItem={renderItem}
                                        renderHiddenItem={renderHiddenItem}
                                        rightOpenValue={-150}
                                        previewOpenValue={-40}
                                        previewOpenDelay={3000}
                                        disableRightSwipe={true}
                                        closeOnRowOpen={true}
                                        keyExtractor={item => String(item.inventoryTransferProductId?item.inventoryTransferProductId:item.id)}
                                    />
                                ) : inventoryTransferProducts && inventoryTransferProducts.length == 0 ? (
                                    <View style={{ paddingTop: 250 }}>
                                        <NoRecordFound styles={{ alignItems: "center" }} iconName="box-open" />
                                    </View>
                                ) : (
                                    <Spinner />
                                )}
                            </View>
                            <Products />

                            {openCopySelectModal && (
                                <CountSelectModal
                                    toggle={toggleModal}
                                    modalVisible={openCopySelectModal}
                                    onChange={OnSelectNumberOfCopy}
                                    ConfirmationAction={onPrintClickHandler}
                                />
                            )}
                            {reasonSelectModalOpen && (
                                <TransferTypeReasonModal modalVisible={reasonSelectModalOpen} transferTypeReasonList={transferTypeReasonList} onPress={handleReasonOnclick} />
                            )}
                            {productReceiveModalOpen && (
                                <StatusUpdateModal
                                    toggle={productReceiveModalToggle}
                                    selectedProduct={selectedItem}
                                    description={`Product Quantity Is ${selectedItem.quantity}`}
                                    modalVisible={productReceiveModalOpen}
                                    title={"Product Recieve"}
                                    confirmLabel={productStatus && productStatus.length > 0 && productStatus[0].name}
                                    ConfirmationAction={() => updateProductStatus(productStatus[0].id, selectedItem.inventoryTransferProductId)}
                                    quantityOnChange={quantityOnChange}
                                />
                            )}

                        </>
                    )}
                    {activeTab === TabName.REPLENISH && (
                        <Replenish />
                    )}
                     {activeTab === TabName.HISTORY && (
                    <HistoryList
                        objectName={ObjectName.TRANSFER}
                        objectId={params?.transferId}
                    />

            )}
                </ScrollView>

            </Layout>
        </>
    );
};

export default ProductList;

