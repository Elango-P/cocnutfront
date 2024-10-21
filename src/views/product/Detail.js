// Import React and Component
import React, { useState, useEffect } from "react";

import {
  Text,
  TouchableOpacity,
  NativeModules,
  View,
  SafeAreaView
} from "react-native";

import { useForm } from "react-hook-form";

import { useIsFocused, useNavigation } from "@react-navigation/native";

// Storage

import AsyncStorage from "@react-native-async-storage/async-storage";

//Helpers

import AsyncStorageConstants from "../../helper/AsyncStorage";

import { weightUnitOptions } from "../../helper/product";

import { statusOptions } from "../../helper/product";

import { Color } from "../../helper/Color";

import { StatusText } from "../../helper/product";

//Services

import categoryService from "../../services/CategoryService";

import brandService from "../../services/BrandService";

import ProductService from "../../services/ProductService";

import MediaService from "../../services/MediaService";

//COMPONENTS

import ProductForm from "./components/ProductForm";

import Layout from "../../components/Layout";

import SpinnerOverlay from "react-native-loading-spinner-overlay";

import { MenuItem } from "react-native-material-menu";

import CountSelectModal from "../../components/Modal/CountSelectModal";

import OnePortalDB from "../../lib/SQLLiteDB";

import Toast from "react-native-simple-toast";

import Setting from "../../lib/Setting";

import storeProductService from "../../services/StoreProductService";

import Tab from "../../components/Tab";

import TabName from "../../helper/Tab";

import InventoryTransferService from "../../services/InventoryTransferService";

import NoRecordFound from "../../components/NoRecordFound";

import PermissionService from "../../services/PermissionService";
import Permission from "../../helper/Permission";
import ProductPriceService from "../../services/ProductPriceService";
import PriceListCard from "./components/PriceListCard";
import AlternativeColor from "../../components/AlternativeBackground";
import Refresh from "../../components/Refresh";
import ShowMore from "../../components/ShowMore";
import productService from "../../services/ProductService";
import HistoryList from "../../components/HistoryList";
import ObjectName from "../../helper/ObjectName";
import { ScrollView } from "react-native";
import styles from "../../helper/Styles";
import Table, { Column } from "../../components/Table";
import { endpoints } from "../../helper/ApiEndPoint";
import DateTime from "../../lib/DateTime";
import Currency, { Percentage } from "../../lib/Currency";

const { BluetoothManager } = NativeModules;

let BlueTooth;

if (BluetoothManager) {
  BlueTooth = require("../../services/BluetoothService");
}

const ProductDetails = (props) => {
  let details = props.route.params;
  let id = props.route.params.productId;
  const ActionMenu = {
    ALL_QUANTITY: "All",
    NO_STOCK_QUANTITY: "NoStock",
    EXCESS_QUANTITY: "Excess",
    SHORTAGE_QUANTITY: "Shortage"
  };
  const [detail, setDetail] = useState("");

  const [brandValue, setBrandValue] = useState();
  const [categoryValue, setCategoryValue] = useState();
  const [brandList, setBrandList] = useState();
  const [categoryList, setCategoryList] = useState();
  const [unit, setUnit] = useState();
  const [status, setStatus] = useState();
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [overlayLoader, setOverlayLoader] = useState(null);
  const [openCopySelectModal, setShowNumberOfCopySelectModal] = useState(false);
  const [numberofCopies, setNumberofCopies] = useState("");
  const [activeTab, setActiveTab] = useState(TabName.DETAIL);
  const [openQuantitySelectModal, setQuantitySelectModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState("");
  const [storeID, setSelectedLocationId] = useState("");
  const [defaultStoreId, setStoreId] = useState();
  const [visible, setVisible] = useState(false);
  const [updatedStoreproductList, setUpdatedStoreProductList] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(
    ActionMenu.SHORTAGE_QUANTITY
  );
  const [isLoading, setIsLoading] = useState(false);
  const [allowEdit, setEdit] = useState(true);
  const [permission, setPermission] = useState("");
  const [priceList, setPriceList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [HasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(2);
  const [priceTabView, setPriceTabView] = useState("");
  const [previousBarCode, setPreviousBarCode] = useState(null);
  const [priceAddPermission, setPriceAddPermission] = useState(false)
  const [statusUpdatePermission, setStatusUpdatePermission] = useState('')
  const [productHistoryViewPermission, setProductHistoryViewPermission] = useState()
  const [isSubmit, setIsSubmit] = useState(false)
  const isFocused = useIsFocused();
  const [purchaseTabView, setPurchaseTabView] = useState(false);

  // render the inventory list function
  const navigation = useNavigation();

  let DB = OnePortalDB.open("oneportal.db");

  useEffect(() => {
    let mount = true;
    mount && brandService.getBrandList(setBrandList);
    mount && categoryService.getCategoryList(setCategoryList);
    mount && editPermission();
    getStoreProductList(true, selectedMenu);
    getProductDetail()
    getStoreID();
    //cleanup function
    return () => {
      mount = false;
    };
  }, []);
  useEffect(() => {
    getPriceList();
  }, [isFocused, activeTab === TabName.PRICE]);


  const getProductDetail = async () => {
    let id = props.route.params.productId;
    setIsLoading(true);
    await productService.get(id, (response) => {
      if (response) {
        setDetail(response.priceData);
        setIsLoading(false);
      }
    });

  }
  const getStoreProductList = (pageLoad, selectedMenu) => {
    let storeProductList = new Array();

    pageLoad && setIsLoading(true);
    storeProductService.search(
      { productId: details.productId, stockType: selectedMenu },
      (err, response) => {
        //validate response exist or not
        if (response && response.data && response.data.data) {
          let storeProduct = response.data.data;

          if (storeProduct && storeProduct.length > 0) {
            for (let i = 0; i < storeProduct.length; i++) {
              const {
                location,
                store_id,
                quantity,
                min_quantity,
                max_quantity,
                requiredQuantity,
                replenishQuantity,
                last_order_date,
                last_stock_entry_date,
                order_quantity,
                updatedQuantity,
                replenishedQuantity
              } = storeProduct[i];

              let storeProductObject = {
                locationName: location,
                store_id: store_id,
                quantity: quantity,
                min_quantity: min_quantity,
                max_quantity: max_quantity,
                requiredQuantity: requiredQuantity,
                replenishQuantity: replenishQuantity,
                lastOrderDate: last_order_date,
                lastStockEntryDate: last_stock_entry_date,
                updatedQuantity: updatedQuantity,
                orderQuantity: order_quantity,
                updatedQuantity: updatedQuantity,
                replenishedQuantity: replenishedQuantity
              };

              storeProductList.push(storeProductObject);
            }
          }
        }

        setUpdatedStoreProductList(storeProductList);

        pageLoad && setIsLoading(false);
      }
    );
  };

  const getStoreID = async () => {
    await AsyncStorage.getItem(AsyncStorageConstants.SELECTED_LOCATION_ID).then(
      (res) => setStoreId(res)
    );
  };

  const getPriceList = async () => {
    setIsLoading(true);
    let params = {
      page: 1,
      product_id: details.productId ? details?.productId : id
    };
    await ProductPriceService.search(params, (response) => {
      if (response) {
        setPriceList(response);
        if (response && response.length > 0) {
          response.map((response) => {
            if (response?.type === "Default")
              setPreviousBarCode(response?.barCode);
            return;
          });
        }
        setIsLoading(false);
      }
    });
  };
  

  const preloadedValues = {
    name: details && details?.name,
    sale_price: details && details.sale_price && details.sale_price.toString(),
    barcode: detail && detail.barcode,
    size: details && details.size,
    mrp: details && details.mrp && details.mrp.toString(),
    status:
      details && status ? status.value : StatusText(details && details.status),
    brand_id: brandValue ? brandValue.value : details && details.brand_id,
    category_id: categoryValue
      ? categoryValue.value
      : details && details.category_id,
    Unit: unit ? unit.value : details && details?.unit,
    rack_number : details && details.rack_number,
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: preloadedValues
  });

  const UpdateProducts = async (values) => {
    try {      
      setIsSubmit(true)
      if (values.name) {
        let bodyData = {
          name: values.name,
          brand_id: brandValue ? brandValue.value : details.brand_id,
          category_id: categoryValue
            ? categoryValue.value
            : details.category_id,
          sale_price: values.sale_price,
          mrp: values.mrp,
          barcode: values.barcode,
          rack_number: values.rack_number,
          Size: values.size,
          Unit: values.unit && values.unit?.value,
          status: values ? values.status && values.status : status ? status.value : StatusText(details.status)
        };

        ProductService.updateProduct(
          navigation,
          bodyData,
          details.productId,
          (error, response) => {
            if (response && response.data) {
              if (file && image) {
                setOverlayLoader(true);
                uploadImage(() => {
                  setOverlayLoader(false);
                  ProductService.reindex(details.productId, (err, res) => {
                    if (res) {
                      setIsSubmit(false)
                      navigation.navigate("BrandAndCategoryList", { activeTab: TabName.PRODUCTS });
                      reset({})

                    }
                  });
                });
              }
              navigation.navigate("BrandAndCategoryList", { activeTab: TabName.PRODUCTS });
              reset({})

            } else {
              setIsSubmit(false)

            }
          }
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const uploadImage = (callback) => {
    if (props.route.params.productId && file) {
      const data = new FormData();

      let mediaFile = {
        type: file?._data?.type,
        size: file?._data.size,
        uri: image,
        name: file?._data.name
      };

      data.append("media_file", mediaFile);

      data.append("image_name", file?._data.name);

      data.append("name", file?._data.name);

      data.append("media_name", file?._data.name);

      data.append("object", "PRODUCT");

      data.append("object_id", props.route.params.productId);

      data.append("media_url", image);

      data.append("media_visibility", 1);

      data.append("feature", 1);

      MediaService.uploadMedia(navigation, data, (error, response) => {
        //reset the state
        setFile("");
        return callback();
      });
    } else {
      return callback();
    }
  };

  const onPrintClickHandler = async () => {
    let bluetoothDevices = await OnePortalDB.runQuery(
      DB,
      `SELECT * FROM setting WHERE name='${Setting.BLUETOOTH_PRINTER_SETTING}'`
    );

    if (bluetoothDevices && bluetoothDevices.length > 0) {
      let deviceDetail = bluetoothDevices[0];

      if (deviceDetail) {
        let address = deviceDetail.value;

        await BlueTooth.Connect(address);

        if (numberofCopies && numberofCopies > 0) {
          for (let i = 0; i < numberofCopies; i++) {
            await printPriceLabel(i);
          }
          setShowNumberOfCopySelectModal(false);
        }
      }
    } else {
      Toast.show("Printer Not Connected");
    }
  };

  const toggleModal = () => {
    setShowNumberOfCopySelectModal(!openCopySelectModal);
  };

  const OnSelectNumberOfCopy = (selectedValue) => {
    if (selectedValue) {
      setNumberofCopies(parseInt(selectedValue.value));
    }
  };

  const printPriceLabel = async (i) => {
    try {
      let productName = details.printName ? details.printName : details.name;

      let barCode = detail?.barcode ? detail?.barcode : details.productId;

      let mrp = details?.mrp ? details?.mrp : null;

      await BlueTooth.PrintPriceLabel(
        barCode,
        productName,
        details.sale_price,
        mrp,
        i + 1
      );
    } catch (err) {
      console.log(err);
    }
  };

  const onHandleLablePrintClick = async () => {
    let bluetoothDevices = await OnePortalDB.runQuery(
      DB,
      `SELECT * FROM setting WHERE name='${Setting.BLUETOOTH_PRINTER_SETTING}'`
    );

    if (bluetoothDevices && bluetoothDevices.length > 0) {
      setShowNumberOfCopySelectModal(true);
    } else {
      navigation.navigate("Bluetooth/Setting");
    }
  };

  const handleReplenish = (item) => {
    let updatedQuantity = selectedQuantity
      ? selectedQuantity
      : item && item.replenishQuantity;

    let updatedStoreId = storeID ? storeID : item && item.store_id;

    if (updatedStoreId && updatedQuantity) {
      let bodyData = {
        toLocationId: updatedStoreId,
        fromLocationId: defaultStoreId,
        quantity: updatedQuantity,
        productId: details?.productId
      };

      InventoryTransferService.replenish(bodyData, (error, response) => {
        if (response) {
          closeQuantityModal();
          getStoreProductList(false, selectedMenu);
        }
      });
    } else {
      Toast.show("Missing Required Fields", Toast.LONG);
    }
  };

  const quantityOnChange = (value, item) => {
    if (item) {
      setSelectedLocationId(item?.store_id);
      setSelectedQuantity(value);
    } else if (value) {
      setSelectedQuantity(value.value);
    }
  };

  const quantitySelectModal = (item) => {
    if (item) {
      setSelectedLocationId(item?.store_id);
      setSelectedQuantity(item?.replenishedQuantity);
    }
    setQuantitySelectModal(true);
  };

  const closeQuantityModal = () => {
    setQuantitySelectModal(false);
    setSelectedLocationId("");
    setSelectedQuantity("");
  };

  const editPermission = async () => {
    const editPermission = await PermissionService.hasPermission(
      Permission.PRODUCT_EDIT
    );
    setPermission(editPermission);
    const showPriceTab = await PermissionService.hasPermission(
      Permission.PRODUCT_PRICE_VIEW
    );
    setPriceTabView(showPriceTab);

    const addPricePermission = await PermissionService.hasPermission(
      Permission.PRODUCT_PRICE_ADD
    );
    setPriceAddPermission(addPricePermission)

    const statusUpdatePermission = await PermissionService.hasPermission(Permission.PRODUCT_UPDATE_STATUS)
    setStatusUpdatePermission(statusUpdatePermission)

    const productHistoryViewPermission = await PermissionService.hasPermission(
      Permission.PRODUCT_HISTORY_VIEW
    );
    setProductHistoryViewPermission(productHistoryViewPermission);

    const showPurchaseTab = await PermissionService.hasPermission(
      Permission.PRODUCT_PURCHASE_VIEW
    );
    setPurchaseTabView(showPurchaseTab);
  };

  const onChangeActionMenu = async (selectedMenu) => {
    setSelectedMenu(selectedMenu);
    await getStoreProductList(false, selectedMenu);
    setVisible(false);
  };

  let actionItems;

  if (activeTab === TabName.DETAIL) {
    if (permission && !allowEdit) {
      actionItems = [
        <MenuItem
          onPress={() => {
            setEdit(true), setVisible(true);
          }}>
          Edit
        </MenuItem>,
        <MenuItem>
          <TouchableOpacity
            onPress={() => {
              onHandleLablePrintClick(), setVisible(true);
            }}>
            <Text>Print Price Tag</Text>
          </TouchableOpacity>
        </MenuItem>
      ];
    } else {
      actionItems = [
        <MenuItem>
          <TouchableOpacity
            onPress={() => {
              onHandleLablePrintClick(), setVisible(true);
            }}>
            <Text>Print Price Tag</Text>
          </TouchableOpacity>
        </MenuItem>
      ];
    }
  }

  const LoadMoreList = async () => {
    try {
      setIsFetching(true);

      let params = { page: page, product_id: details.productId };

      ProductPriceService.search(params, (response) => {
        let price = response;

        // Set response in state
        setPriceList((prevTitles) => {
          return [...new Set([...prevTitles, ...price])];
        });
        setPage((prevPageNumber) => prevPageNumber + 1);
        setHasMore(price.length > 0);
        setIsFetching(false);
      });
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  if (activeTab == TabName.LOCATION) {
    actionItems = [
      <MenuItem
        style={{
          backgroundColor:
            selectedMenu == ActionMenu.ALL_QUANTITY ? Color.ACTIVE : ""
        }}
        onPress={() => {
          setVisible(true);
          onChangeActionMenu(ActionMenu.ALL_QUANTITY);
        }}>
        {" "}
        All
      </MenuItem>,
      <MenuItem
        style={{
          backgroundColor:
            selectedMenu == ActionMenu.NO_STOCK_QUANTITY ? Color.ACTIVE : ""
        }}
        onPress={() => {
          setVisible(true);
          onChangeActionMenu(ActionMenu.NO_STOCK_QUANTITY);
        }}>
        {" "}
        No Stock
      </MenuItem>,
      <MenuItem
        style={{
          backgroundColor:
            selectedMenu == ActionMenu.SHORTAGE_QUANTITY ? Color.ACTIVE : ""
        }}
        onPress={() => {
          setVisible(true);
          onChangeActionMenu(ActionMenu.SHORTAGE_QUANTITY);
        }}>
        {" "}
        Shortage
      </MenuItem>,
      <MenuItem
        style={{
          backgroundColor:
            selectedMenu == ActionMenu.EXCESS_QUANTITY ? Color.ACTIVE : ""
        }}
        onPress={() => {
          setVisible(true);
          onChangeActionMenu(ActionMenu.EXCESS_QUANTITY);
        }}>
        {" "}
        Excess
      </MenuItem>
    ];
  }

  const addPrice = () => {
    navigation.navigate("PriceForm", {
      productId: details?.productId,
      details,
      previousBarCode: previousBarCode
    });
  };

  let title = [
    {
      title: TabName.DETAIL,
      tabName: TabName.DETAIL
    },
    {
      title: TabName.LOCATION,
      tabName: TabName.LOCATION
    }
  ];

  if (purchaseTabView) {
    title.push({
      title: TabName.PURCHASES,
      tabName: TabName.PURCHASES
    });
  }

  if (priceTabView) {
    title.push({
      title: TabName.PRICE,
      tabName: TabName.PRICE
    });
  }

  if (productHistoryViewPermission) {
    title.push({
      title: TabName.HISTORY,
      tabName: TabName.HISTORY
    });
  }


  return (
    <Layout
      title="Product Detail"
      showActionMenu={
        activeTab !== TabName.PRICE && (BluetoothManager || permission)
          ? true
          : false
      }
      showBackIcon
      closeModal={visible}
      isLoading={isLoading}
      actionItems={actionItems}
      addButton={
        activeTab === TabName.PRICE && priceAddPermission ? true : false
      }
      buttonOnPress={addPrice}
    >
      <View style={styles.tabBar}>
        <Tab title={title} setActiveTab={setActiveTab} defaultTab={activeTab} />
      </View>

      {activeTab === TabName.DETAIL && (
        <>
          <SpinnerOverlay
            visible={overlayLoader}
            textContent={"Image Uploading ..."}
            textStyle={{ color: "#fff" }}
            color={Color.PRIMARY}
          />

          <ProductForm
            control={control}
            statusOptions={statusOptions}
            brandList={brandList}
            handleBrand={(value) => setBrandValue(value)}
            unitData={details.unit ? details.unit : ""}
            StatusData={StatusText(details.status)}
            categoryList={categoryList}
            handleStatus={(value) => setStatus(value)}
            details={details}
            image={image}
            setImage={setImage}
            setFile={setFile}
            allowEdit={allowEdit}
            statusUpdatePermission={statusUpdatePermission}
            weightUnitOptions={weightUnitOptions}
            categoryData={details.category_id}
            handleCategory={(value) => setCategoryValue(value)}
            brandData={details.brand_id}
            handleUnit={(value) => setUnit(value)}
            onPress={handleSubmit((values) => UpdateProducts(values))}
            isSubmit={isSubmit}
          />

          <CountSelectModal
            toggle={toggleModal}
            modalVisible={openCopySelectModal}
            onChange={OnSelectNumberOfCopy}
            ConfirmationAction={onPrintClickHandler}
          />
        </>
      )}

      {activeTab === TabName.LOCATION && (
        <>
          {updatedStoreproductList && updatedStoreproductList.length > 0 ? (
            <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
              <SafeAreaView style={styles.container}>
                <Table arrayList={updatedStoreproductList}>
                  <Column
                    fieldName="locationName"
                    style={{ textAlign: "center" }}
                  >
                    Location Name
                  </Column>
                  <Column fieldName="quantity" style={{ textAlign: "center" }}>
                    Quantity
                  </Column>
                </Table>
              </SafeAreaView>
            </Refresh>
          ) : (
            <NoRecordFound
              iconName={"receipt"}
              styles={{ paddingVertical: 250, alignItems: "center" }}
            />
          )}
        </>
      )}

      <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
        <View>
          {activeTab === TabName.PRICE && priceList && priceList.length > 0
            ? priceList.map((item, index) => {
              const containerStyle =
                AlternativeColor.getBackgroundColor(index);
              return (
                <PriceListCard
                  date={item.date}
                  status={item.statusText}
                  mrp={item.mrp}
                  salePrice={item.salePrice}
                  barCode={item.barCode}
                  type={item.type}
                  alternative={containerStyle}
                  key={index}
                  onPress={() => {
                    navigation.navigate("PriceForm", {
                      item,
                      productId: details?.productId,
                      details,
                    });
                  }}
                />
              );
            })
            : activeTab === TabName.PRICE && (
              <>
                <NoRecordFound iconName={"receipt"} />
              </>
            )}

          {activeTab === TabName.PRICE && (
            <ShowMore
              List={priceList}
              isFetching={isFetching}
              HasMore={HasMore}
              onPress={LoadMoreList}
            />
          )}

          {activeTab === TabName.HISTORY && (
            <ScrollView>
              <HistoryList objectName={ObjectName.PRODUCT} objectId={id} />
            </ScrollView>
          )}
        </View>
      </Refresh>

      {activeTab === TabName.PURCHASES && (
        <>
          <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
            <SafeAreaView style={styles.container}>
              <Table
                apiURL={`${endpoints().PurchaseProductAPI}/search`}
                params={{ product_id: id }}
              >
                <Column
                  fieldName="purchase_number"
                  style={{ textAlign: "center" }}
                >
                  Purchase#
                </Column>
                <Column
                  fieldName="purchase_date"
                  style={{ textAlign: "center" }}
                  renderField={(row) => {
                    return <>{DateTime.formatDate(row?.purchase_date)}</>;
                  }}
                >
                  Date
                </Column>
                <Column fieldName="vendor_name" style={{ textAlign: "center" }}>
                  Vendor Name
                </Column>
                <Column fieldName="quantity" style={{ textAlign: "center" }}>
                  Quantity
                </Column>
                <Column
                  fieldName="mrp"
                  style={{ textAlign: "center" }}
                  renderField={(row) => {
                    return <>{Currency.IndianFormat(row?.mrp)}</>;
                  }}
                >
                  MRP
                </Column>
                <Column
                  fieldName="unit_price"
                  style={{ textAlign: "center" }}
                  renderField={(row) => {
                    return <>{Currency.IndianFormat(row?.unit_price)}</>;
                  }}
                >
                  Unit Price
                </Column>
                <Column
                  fieldName="amount"
                  style={{ textAlign: "center" }}
                  renderField={(row) => {
                    return <>{Currency.IndianFormat(row?.netAmount)}</>;
                  }}
                >
                  Amount
                </Column>
                <Column
                  fieldName="margin_percentage"
                  style={{ textAlign: "center" }}
                  renderField={(row) => {
                    return <>{Percentage(row?.margin_percentage)}</>;
                  }}
                >
                  Margin Percentage
                </Column>
                <Column
                  fieldName="unit_margin_amount"
                  style={{ textAlign: "center" }}
                  renderField={(row) => {
                    return <>{Percentage(row?.unit_margin_amount)}</>;
                  }}
                >
                  Unit Margin Amount
                </Column>
              </Table>
            </SafeAreaView>
          </Refresh>
        </>
      )}
    </Layout>
  );
};

export default ProductDetails;


