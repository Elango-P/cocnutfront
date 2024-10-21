// Import React and Component
import React, { useEffect, useState } from "react";
import { Button, ScrollView, View } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Card, Paragraph } from "react-native-paper";
import { useForm } from "react-hook-form";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MenuItem } from "react-native-material-menu";

// Components
import LoadMoreButton from "../../components/LoadMoreButton";
import Spinner from "../../components/Spinner";
import ProductCard from "../../components/ProductCard";
import HistoryList from "../../components/HistoryList";
import Layout from "../../components/Layout";
import NoRecordFound from "../../components/NoRecordFound";
import ConfirmationModal from "../../components/Modal/ConfirmationModal";
import BarcodeScanner from "../../components/BarcodeScanner";
import Tab from "../../components/Tab";
import QuantitySelectModal from "../../components/Modal/QuantitySelectModal";
import LocationForm from "./components/LocationForm";
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";
import SearchBar from "../../components/SearchBar";

// Helpers
import AlertMessage from "../../helper/AlertMessage";
import TabName from "../../helper/Tab";
import { Color } from "../../helper/Color";
import AsyncStorageConstants from "../../helper/AsyncStorage";
import Permission from "../../helper/Permission";
import ObjectName from "../../helper/ObjectName";

// Services
import StoreProductService from "../../services/StoreProductService";
import InventoryTransferService from "../../services/InventoryTransferService";
import PermissionService from "../../services/PermissionService";
import {
  default as StoreService,
  default as storeService,
} from "../../services/StoreService";

// Lib
import device from "../../lib/Device";
import styles from "../../helper/Styles";

const Detail = (props) => {
  const ActionMenu = {
    ALL_QUANTITY: "All",
    NO_STOCK_QUANTITY: "NoStock",
    EXCESS_QUANTITY: "Excess",
    SHORTAGE_QUANTITY: "Shortage",
  };

  //Loading
  const [isLoading, setIsLoading] = useState(false);
  //search
  const [searchPhrase, setSearchPhrase] = useState("");
  const [search, setSearch] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  //setting tha initial page
  const [page, setPage] = useState(1);
  //we need to know if there is more data
  const [HasMore, setHasMore] = useState(true);

  const isFocused = useIsFocused();

  const [modalVisible, setScanModalVisible] = useState(false);

  const [onScanValidation, setOnScanValidation] = useState(false);

  const [scannedCode, setScannedCode] = useState("");

  const [productNotFoundModalOpen, setProductNotFoundModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState(TabName.DETAIL);

  const [openQuantitySelectModal, setQunatitySelectModal] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState("");

  const [defaultStoreId, setStoreId] = useState();

  const [selectedQuantity, setSelectedQuantity] = useState("");

  const [visible, setVisible] = useState(false);

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [actionList, setActionList] = useState([]);

  const [updatedProductList, setUpdatedProductList] = useState([]);

  const [storeDetail, setStoreDetail] = useState(null);

  const [selectedMenu, setSelectedMenu] = useState(
    ActionMenu.SHORTAGE_QUANTITY
  );

  const [permission, setPermission] = useState("");
  const [allowEdit, setEdit] = useState(true);
  const [editPermission, setEditPermission] = useState(false);
  const [locationDeleteModalOpen, setLocationDeleteModalOpen] = useState(false);
  const [isSubmit,setIsSubmit] = useState(false)

  const navigation = useNavigation();

  let params = props?.route?.params;

  const tab = [
    {
      title: TabName.DETAIL,
      tabName: TabName.DETAIL,
    },
  ];

  if (permission && permission.showMapTab) {
    tab.push({
      title: TabName.MAP,
      tabName: TabName.MAP,
    });
  }

  if (permission && permission.showStockTab) {
    tab.push({
      title: TabName.STOCK,
      tabName: TabName.STOCK,
    });
  }

  if (permission && permission.locationPermission) {
    tab.push({
      title: TabName.HISTORY,
      tabName: TabName.HISTORY,
    });
  }

  useEffect(() => {
    getStoreDetail();
  }, []);

  useEffect(() => {
    getPermission();
  }, [activeTab, selectedMenu]);

  //render first time
  useEffect(() => {
    if (isFocused) {
      let mount = true;

      mount && getStoreProductList({ page: page, stockType: selectedMenu });
      getStoreDetail();

      getStoreID();

      getPermission();

      return () => {
        mount = false;
      };
    }
  }, [isFocused, navigation]);

  useEffect(() => {
    getPermission();
  }, [props, allowEdit]);

  useEffect(() => {
    getStoreDetail();
  }, [longitude, latitude]);

  const locationDeleteModalToggle = () => {
    setLocationDeleteModalOpen(!locationDeleteModalOpen);
  };

  const locationDelete = () => {
    StoreService.delete(storeDetail?.id, (error, response) => {
      navigation.navigate("Location");
    });
  };

  const getPermission = async () => {
    const showMapTab = await PermissionService.hasPermission(
      Permission.LOCATION_SHOW_MAP_TAB
    );
    const showStockTab = await PermissionService.hasPermission(
      Permission.LOCATION_SHOW_STOCK_TAB
    );
    const editPermission = await PermissionService.hasPermission(
      Permission.LOCATION_EDIT
    );
    const updateLocationStatusPermission = await PermissionService.hasPermission(
      Permission.LOCATION_STATUS_UPDATE
    );
    const deletePermission = await PermissionService.hasPermission(
      Permission.LOCATION_DELETE
    );
    const locationPermission = await PermissionService.hasPermission(
      Permission.LOCATION_HISTORY_VIEW
    );
    setPermission({
      showMapTab,
      showStockTab,
      editPermission,
      locationPermission,
      updateLocationStatusPermission,
    });

    let actionItems = new Array();
    if (
      editPermission &&
      (activeTab == TabName.DETAIL ||
        activeTab == TabName.MAP)
    ) {
      !allowEdit &&
        actionItems.push(
          <MenuItem
            onPress={() => {
              setVisible(true), setEdit(true), setEditPermission(true);
            }}
          >
            Edit
          </MenuItem>
        );
    }
    if (deletePermission && activeTab == TabName.DETAIL) {
      actionItems.push(
        <MenuItem
          onPress={() => {
            setVisible(true), setLocationDeleteModalOpen(true);
          }}
        >
          Delete
        </MenuItem>
      );
    }

    if (activeTab == TabName.MAP) {
      actionItems.push(
        <MenuItem
          onPress={() => {
            setVisible(true), getCurrentLocation();
          }}
        >
          Get Current Location
        </MenuItem>
      );
    }

    if (activeTab == TabName.STOCK) {
      actionItems.push(
        <MenuItem
          style={{
            backgroundColor:
              selectedMenu == ActionMenu.ALL_QUANTITY ? Color.ACTIVE : "",
          }}
          onPress={() => {
            setVisible(true);
            onChangeActionMenu(ActionMenu.ALL_QUANTITY);
          }}
        >
          {" "}
          All
        </MenuItem>,
        <MenuItem
          style={{
            backgroundColor:
              selectedMenu == ActionMenu.NO_STOCK_QUANTITY ? Color.ACTIVE : "",
          }}
          onPress={() => {
            setVisible(true);
            onChangeActionMenu(ActionMenu.NO_STOCK_QUANTITY);
          }}
        >
          {" "}
          No Stock
        </MenuItem>,
        <MenuItem
          style={{
            backgroundColor:
              selectedMenu == ActionMenu.SHORTAGE_QUANTITY ? Color.ACTIVE : "",
          }}
          onPress={() => {
            setVisible(true);
            onChangeActionMenu(ActionMenu.SHORTAGE_QUANTITY);
          }}
        >
          {" "}
          Shortage
        </MenuItem>,
        <MenuItem
          style={{
            backgroundColor:
              selectedMenu == ActionMenu.EXCESS_QUANTITY ? Color.ACTIVE : "",
          }}
          onPress={() => {
            setVisible(true);
            onChangeActionMenu(ActionMenu.EXCESS_QUANTITY);
          }}
        >
          {" "}
          Excess
        </MenuItem>
      );
    }

    setActionList(actionItems);
  };

  const getStoreID = async () => {
    await AsyncStorage.getItem(AsyncStorageConstants.SELECTED_LOCATION_ID).then(
      (res) => setStoreId(res)
    );
  };

  const getStoreDetail = async () => {
    setIsLoading(true);
    await StoreService.get(params?.storeId, (error, response) => {
      if (response && response.data && response.data.data) {
        setStoreDetail(response.data.data);
      }
      setIsLoading(false);
    });
  };

  const getStoreProductList = (paramsObject, callback) => {
    let allProducts = new Array();

    let params = { store_id: props?.route?.params?.storeId };

    if (!paramsObject) {
      params.page = 1;
      params.stockType = selectedMenu;
    }

    if (paramsObject && paramsObject.searchTerm) {
      params.search = paramsObject.searchTerm;
    }

    if (paramsObject && paramsObject.page) {
      params.page = paramsObject.page;
    }

    if (paramsObject && paramsObject.scannedCode) {
      params.code = paramsObject.scannedCode;
    }

    if (paramsObject && paramsObject.stockType) {
      params.stockType = paramsObject.stockType;
    }

    params.sort = "product_name";
    params.sortDir = "ASC";
    StoreProductService.searchProduct(params, (err, response) => {
      //validate response exist or not
      if (response && response.data && response.data.data) {
        let storeProductList = response.data.data;

        if (storeProductList && storeProductList.length > 0) {
          for (let i = 0; i < storeProductList.length; i++) {
            const {
              productIndex,
              id,
              min_quantity,
              max_quantity,
              requiredQuantity,
              quantity,
            } = storeProductList[i];

            if (productIndex) {
              const {
                product_id,
                brand_name,
                category_name,
                barcode,
                featured_media_url,
                product_name,
                product_display_name,
                sale_price,
                size,
                status,
                mrp,
              } = productIndex;

              let productObject = {
                brand: brand_name,
                category: category_name,
                image: featured_media_url,
                name: product_name,
                product_display_name: product_display_name,
                sale_price: sale_price,
                mrp: mrp,
                product_id: product_id,
                size: size,
                status: status,
                barcode: barcode,
                id: id,
                min_quantity,
                max_quantity,
                requiredQuantity,
                quantity,
              };

              allProducts.push(productObject);
            }
          }
        }

        if (paramsObject && paramsObject.returnList) {
          setVisible(false);
          return callback(allProducts);
        } else {
          setVisible(false);
          setUpdatedProductList(allProducts);
        }
      }
    });
  };

  const onChangeActionMenu = async (selectedMenu) => {
    setSelectedMenu(selectedMenu);
    setVisible(true);
    getStoreProductList({ page: 1, stockType: selectedMenu }, (response) => {});
  };

  //search results
  const handleChange = async (search) => {
    setSearchPhrase(search);
    //Api Call
    getStoreProductList(
      { searchTerm: search, stockType: selectedMenu },
      (response) => {}
    );
  };

  const toggle = () => {
    setScanModalVisible(!modalVisible);
    setOnScanValidation(false);
  };

  const productNotFoundToggle = () => {
    setProductNotFoundModalOpen(!productNotFoundModalOpen);
  };

  //render more list after click the load more button
  const LoadMoreList = async () => {
    try {
      setIsFetching(true);
      getStoreProductList(
        {
          searchTerm: searchPhrase,
          page: page + 1,
          returnList: true,
          stockType: selectedMenu,
        },
        (response) => {
          // Set response in state
          setUpdatedProductList((prevTitles) => {
            return [...new Set([...prevTitles, ...response])];
          });
          setPage((prevPageNumber) => prevPageNumber + 1);
          setHasMore(response.length > 0);
          setIsFetching(false);
        }
      );
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  const handleScannedData = async (data) => {
    try {
      //get bar code
      let barCode = data?.data;

      //validate bar code exist and loading
      if (barCode && !onScanValidation) {
        setScanModalVisible(false);

        //set onscan validation value
        setOnScanValidation(true);

        //set scanned code
        setScannedCode(barCode);

        setSearchPhrase(barCode);

        getStoreProductList(
          { scannedCode: barCode, returnList: true, stockType: selectedMenu },
          (response) => {
            setUpdatedProductList(response);

            setScannedCode("");

            setOnScanValidation(false);
          }
        );
      }
    } catch (err) {
      //set onscan validation
      setOnScanValidation(false);
    }
  };

  const quantitySelectModal = (item) => {
    if (item) {
      setSelectedProductId(item?.id);
      setSelectedQuantity(item?.requiredQuantity);
    }
    setQunatitySelectModal(true);
  };

  const quantitySelectModalToggle = () => {
    setQunatitySelectModal(!openQuantitySelectModal);
    setSelectedProductId("");
    setSelectedQuantity("");
  };

  const quantityOnChange = (value) => {
    if (value) {
      setSelectedQuantity(value.value);
    }
  };

  const handleReplenish = () => {
    if (params?.storeId && selectedQuantity && selectedProductId) {
      let bodyData = {
        toLocationId: params?.storeId,
        fromLocationId: defaultStoreId,
        quantity: selectedQuantity,
        productId: selectedProductId,
      };
      InventoryTransferService.replenish(bodyData, (error, response) => {
        if (response) {
          quantitySelectModalToggle();
        }
      });
    }
  };
  const getCurrentLocation = async () => {
    await device.getDeviceLocation(async (response) => {
      if (response) {
        setVisible(false);

        const data = {
          longitude: response && response?.longitude,
          latitude: response && response?.latitude,
        };
        storeService.update(params?.storeId, data, (err, response) => {
          if (response && response?.data && response?.data?.values) {
            let latitude =
              response &&
              response?.data &&
              response?.values &&
              response.data.values.latitude;
            let longitude =
              response &&
              response?.data &&
              response?.values &&
              response.data.values.longitude;

            setLatitude(latitude);
            setLongitude(longitude);
          }
        });
      }
    });
  };

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      locationName: storeDetail?.name,
      address: storeDetail?.address1,
      mobile: storeDetail?.mobile_number1,
      status: storeDetail?.status,
      ipAddress: storeDetail?.ip_address,
      minimumCashInStore: storeDetail?.minimum_cash_in_store,
      latitude: storeDetail?.latitude,
      longitude: storeDetail?.longitude,
    },
  });

  const handleUpdate = async (values) => {
    setIsSubmit(true)
    let data = {};

    data.name = values?.locationName;
    data.address1 = values?.address;
    data.mobile_number1 = values?.mobile;
    data.status = values?.status?.value;
    data.ip_address = values?.ipAddress;
    data.minimum_cash_in_store =
      values?.minimumCashInStore == "" ? null : values?.minimumCashInStore;
    data.latitude = values?.latitude;
    data.longitude = values?.longitude;

    await StoreService.update(storeDetail?.id, data, (err, response) => {
      if(response){
        setIsSubmit(false)
        getStoreDetail();
        setEditPermission(false);
        navigation.navigate("Location");
      }else{
        setIsSubmit(false)
      }

    });
  };

  return (
    <Layout
      title={storeDetail?.name}
      isLoading={isLoading}
      showActionMenu={actionList && actionList.length > 0 ? true : false}
      actionItems={actionList}
      closeModal={visible}
      buttonLabel={
        editPermission &&
          (activeTab == TabName.DETAIL ||
            activeTab == TabName.MAP)
          ? "Save"
          : ""
      }
      buttonOnPress={handleSubmit((values) => {
        handleUpdate(values);
      })}
      isSubmit={isSubmit}
    >
      <View style={styles.tabBar}>
        <Tab title={tab} setActiveTab={setActiveTab} defaultTab={activeTab} />
      </View>

      <DeleteConfirmationModal
        modalVisible={locationDeleteModalOpen}
        toggle={locationDeleteModalToggle}
        item={storeDetail?.id}
        updateAction={locationDelete}
        name={storeDetail?.name}
      />
      {activeTab == TabName.DETAIL && (
        <LocationForm
          storeDetail={storeDetail}
          editPermission={editPermission}
          control={control}
        />
      )}

      {activeTab === TabName.MAP && permission && permission.showMapTab && (
        <LocationForm
          storeDetail={storeDetail}
          map
          editPermission={editPermission}
          control={control}
        />
      )}


      {activeTab === TabName.STOCK && permission && permission.showStockTab && (
        <ScrollView>
          <View style={styles.searchBar}>
            <SearchBar
              searchPhrase={searchPhrase}
              setSearchPhrase={setSearchPhrase}
              setClicked={setClicked}
              clicked={clicked}
              setSearch={setSearch}
              onPress={getStoreProductList}
              handleChange={handleChange}
              noScanner
            />

            <BarcodeScanner
              toggle={toggle}
              modalVisible={modalVisible}
              handleScannedData={handleScannedData}
              handleChange={handleChange}
            />

            <ConfirmationModal
              toggle={productNotFoundToggle}
              modalVisible={productNotFoundModalOpen}
              title={AlertMessage.PRODUCT_NOT_FOUND}
              description={`BarCode ID ${scannedCode} not found please scan different code or add the product`}
              confirmLabel={"Ok"}
              ConfirmationAction={productNotFoundToggle}
            />

            {openQuantitySelectModal && (
              <QuantitySelectModal
                Numbers={300}
                modalVisible={openQuantitySelectModal}
                toggle={quantitySelectModalToggle}
                value={selectedQuantity}
                ConfirmationAction={handleReplenish}
                onChange={quantityOnChange}
              />
            )}
          </View>
          <View style={styles.container}>
            <View>
              {updatedProductList && updatedProductList.length > 0 ? (
                updatedProductList.map((item) => {
                  return (
                    <View>
                      <Card style={{ marginVertical: 5, borderColor: "#333" }}>
                        <Card.Content>
                          <ProductCard
                            noIcon
                            onPress={() => {
                              navigation.navigate("Products/Details", {
                                productId: item.id,
                                name: item.name,
                                product_name: item.product_name,
                                quantity: item.quantity,
                                brand: item.brand,
                                status: item.status,
                                brand_id: item.brand_id,
                                image: item.image,
                                category_id: item.category_id,
                                category: item.category,
                                size: item.size,
                                unit: item.unit,
                                mrp: item.mrp,
                                sale_price: item.sale_price,
                                barcode: item.barcode,
                                printName: item.print_name,
                                rack_number: item.rack_number,

                              });
                            }}
                            size={item.size}
                            unit={item.unit}
                            name={item.name}
                            image={item.image}
                            brand={item.brand}
                            sale_price={item.sale_price}
                            mrp={item.mrp}
                          />

                          <View
                            style={{
                              flex: 1,
                              flexDirection: "row",
                              justifyContent: "space-between",
                            }}
                          >
                            <Paragraph style={{ fontWeight: "bold" }}>
                              Available Quantity: {item.quantity}
                            </Paragraph>

                            <Paragraph style={{ fontWeight: "bold" }}>
                              Required Quantity: {item.requiredQuantity}
                            </Paragraph>
                          </View>
                          {item?.requiredQuantity > 0 && (
                            <View style={{ marginTop: 10 }}>
                              <Button
                                title={"Replenish"}
                                color={Color.PRIMARY}
                                onPress={() => quantitySelectModal(item)}
                              />
                            </View>
                          )}
                        </Card.Content>
                      </Card>
                    </View>
                  );
                })
              ) : (
                <NoRecordFound
                  styles={{ paddingVertical: 250, alignItems: "center" }}
                  iconName="box-open"
                />
              )}
            </View>
          </View>
          {updatedProductList &&
            updatedProductList.length > 0 &&
            updatedProductList.length % 25 == 0 ? (
            isFetching && HasMore ? (
              <Spinner />
            ) : !HasMore ? (
              ""
            ) : (
              <LoadMoreButton onPress={LoadMoreList} />
            )
          ) : (
            ""
          )}
        </ScrollView>
      )}

      {activeTab === TabName.HISTORY && (
        <ScrollView>
          <HistoryList
            objectName={ObjectName.LOCATION}
            objectId={params?.storeId}
          />
        </ScrollView>
      )}
    </Layout>
  );
};

export default Detail;

