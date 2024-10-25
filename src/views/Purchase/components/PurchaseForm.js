import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Layout from "../../../components/Layout";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Currency from "../../../components/Currency";
import AccountService from "../../../services/AccountService";
import DatePicker from "../../../components/DatePicker";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import purchaseService from "../../../services/PurchaseService";
import ObjectName from "../../../helper/ObjectName";
import Tab from "../../../components/Tab";
import TabName from "../../../helper/Tab";
import ProductCard from "../../../components/ProductCard";
import { SwipeListView } from "react-native-swipe-list-view";
import DeleteModal from "../../../components/Modal/DeleteModal";
import ConfirmationModal from "../../../components/Modal/ConfirmationModal";
import ProductSelectModal from "../../../components/Modal/ProductSelectModal";
import AlertMessage from "../../../helper/AlertMessage";
import purchaseProductService from "../../../services/PurchaseProductService";
import productService from "../../../services/ProductService";
import NoRecordFound from "../../../components/NoRecordFound";
import Search from "./Search";
import { Color } from "../../../helper/Color";
import SaveButton from "../../../components/SaveButton";
import mediaService from "../../../services/MediaService";
import VerticalSpace10 from "../../../components/VerticleSpace10";
import LocationSelect from "../../../components/LocationSelect";
import AccountSelect from "../../../components/AccountSelect";
import TextArea from "../../../components/TextArea";
import TextInput from "../../../components/TextInput";
import { MenuItem } from "react-native-material-menu";
import PermissionService from "../../../services/PermissionService";
import Permission from "../../../helper/Permission";
import HistoryList from "../../../components/HistoryList";
import UserSelect from "../../../components/UserSelect";
import PurchaseProductModel from "./PurchaseProductModel";
import Number from "../../../lib/Number";

const PurchaseForm = (props) => {
  const params = props?.route?.params?.item;
  const param = props?.route?.params;
  const [vendorList, setVendorList] = useState();
  const [storeId, setStoreId] = useState();
  const [vendorName, setVendorName] = useState();
  const [netAmount, setNetAmount] = useState(params?.net_amount);
  const [selectedDate, setSelectedDate] = useState();
  const [manufactureDate, setManufactureDate] = useState();
  const [status, setStatus] = useState();
  const [activeTab, setActiveTab] = useState(TabName.SUMMARY);
  const [purchaseProductList, setPurchaseProductList] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [productDeleteModalOpen, setProductDeleteModalOpen] = useState(false);
  const [productEditModalOpen, setProductEditModalOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const [scannedProductList, setScannedProductList] = useState("");
  const [productExistModalOpen, setProductExistModalOpen] = useState(false);
  const [quantityUpdateObject, setQuantityUpdateObject] = useState({});
  const [productNotFoundModalOpen, setProductNotFoundModalOpen] =
    useState(false);
  const [productSelectModalOpen, setProductSelectModalOpen] = useState(false);
  const [clicked, setClicked] = useState("");
  const [mrp, setMrp] = useState("");
  const [newPurchase, setNewPurchase] = useState(param?.isNewPurchase);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [storeList, setStoreList] = useState([]);
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [disableEdit, setDisableEdit] = useState(!param?.isNewPurchase && true);
  const [editPermission, setEditPermission] = useState(false);
  const [visible, setIsVisible] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(
    params?.vendorInvoiceDate || ""
  );
  const [dueDate, setDueDate] = useState(params?.due_date || "");
  const [owner, setSelectedOwner] = useState(params?.owner_id);
  const [invoiceAmount, setInvoiceAmount] = useState(params?.invoice_amount);

  const [reviewer, setSelectedReviewer] = useState(params?.reviewer_id);
  const [purchaseHistoryViewPermission, setPurchaseHistoryViewPermission] =
    useState();
  const [isSubmit, setIsSubmit] = useState(false);
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const stateRef = useRef(null);
  const purchaseRef = useRef({
    netAmount: params?.net_amount || "",
    invoiceAmount: params?.invoice_amount | "",
  });

  useEffect(() => {
    let mount = true;

    mount &&
      AccountService.GetList(null, (callback) => {
        setVendorList(callback);
      });

    getPermission();

    //cleanup function
    return () => {
      mount = false;
    };
  }, [isFocused]);

  useEffect(() => {
    if (isFocused) {
      getProducts();
    }
  }, [isFocused]);

  const calculatedData = () => {
    let value =
      purchaseRef && purchaseRef.current && purchaseRef.current.invoiceAmount;
    setNetAmount(value);
  };

  const preloadedValues = {
    vendor_invoice_number: params?.vendorInvoiceNumber || "",
    Purchase_number: params?.purchaseNumber || "",
    description: params?.description || "",
    net_amount: params?.net_amount || "",
    purchaseDate: params?.purchaseDate,
    mrp: selectedItem?.mrp,
    vendor: param?.vendor_id ? param?.vendor_id : params?.vendor_id,
    invoice_amount: invoiceAmount,
    reviewer: reviewer,
    due_date: dueDate,
    owner: owner,
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: preloadedValues,
  });

  useEffect(() => {
    updateDateValues();
  }, [selectedItem]);

  const getPermission = async () => {
    let editPermission = await PermissionService.hasPermission(
      Permission.PURCHASE_EDIT
    );
    setEditPermission(editPermission);
    let purchaseHistoryViewPermission = await PermissionService.hasPermission(
      Permission.PURCHASE_HISTORY_VIEW
    );
    setPurchaseHistoryViewPermission(purchaseHistoryViewPermission);
  };

  const closeRow = (rowMap, rowKey) => {
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  };

  const uploadImage = (productDetails, callback) => {
    if (productDetails && file) {
      const data = new FormData();

      let mediaFile = {
        type: file?._data?.type,
        size: file?._data.size,
        uri: image,
        name: file?._data.name,
      };

      data.append("media_file", mediaFile);

      data.append("image_name", file?._data.name);

      data.append("name", file?._data.name);

      data.append("media_name", file?._data.name);

      data.append("object", ObjectName.PRODUCT);

      data.append("object_id", productDetails?.id);

      data.append("media_url", image);

      data.append("media_visibility", 1);

      data.append("feature", 1);

      mediaService.uploadMedia(navigation, data, (error, response) => {
        //reset the state
        setFile("");
        setImage("");
        return callback();
      });
    } else {
      return callback();
    }
  };

  const clearRowDetail = () => {
    if (stateRef) {
      const selectedItem = stateRef.selectedItem;
      const selectedRowMap = stateRef.selecredRowMap;
      if (selectedItem && selectedRowMap) {
        closeRow(selectedRowMap, selectedItem.id);
        setSelectedItem("");
        stateRef.selectedItem = "";
        stateRef.selecredRowMap = "";
      }
    }
  };

  const productEditModalToggle = () => {
    setProductEditModalOpen(!productEditModalOpen);
    clearRowDetail();
    setManufactureDate("");
    setMrp("");
  };

  const productDeleteModalToggle = () => {
    setProductDeleteModalOpen(!productDeleteModalOpen);
  };

  const addPurchaseProduct = async (values, scannedProduct, productDetails) => {
    try {
      let dataObject = {};

      dataObject.purchase_id = params?.id;
      dataObject.product_id = values?.product_id;
      dataObject.cgst_percentage = values && values.cgst_percentage;
      dataObject.sgst_percentage = values && values.sgst_percentage;
      dataObject.cess_percentage = values && values.cess_percentage;
      dataObject.cess_amount = values && values.cess_amount;
      dataObject.sgst_amount = values && values.sgst_amount;
      dataObject.cgst_amount = values && values.cgst_amount;
      dataObject.igst_amount = values && values.igst_amount;
      dataObject.igst_percentage = values && values.igst_percentage;
      dataObject.discount_percentage = values && values.discount_percentage;
      (dataObject.storeId = params?.location
        ? params?.location
        : param.location),
        (dataObject.company_id = scannedProduct.company_id),
        (dataObject.taxable_amount =
          values && values.taxable_amount ? values.taxable_amount : null);
      (dataObject.barcode = scannedProduct?.barcode),
        (dataObject.mrp = values && values.mrp);
      dataObject.discount_amount =
        values && Number.GetFloat(values.discount_amount);

      dataObject.tax_amount = values && Number.GetFloat(values.tax_amount);

      dataObject.net_amount = values && values.net_amount;

      dataObject.tax_percentage = values && Number.GetFloat(values.tax);

      dataObject.quantity = values && values.quantity;

      dataObject.unit_price = values && values.unit_price;
      dataObject.margin_percentage = values && values.margin_percentage;
      dataObject.unit_margin_amount = values && values.unit_margin_amount;
      dataObject.status = values && values.status && values.status;
      dataObject.manufactured_date =
        values && values.manufactured_date && values.manufactured_date;

      dataObject.purchaseId = params?.id;
      dataObject.productId = values?.product_id;
      await purchaseProductService.create(dataObject, async (error, res) => {
        if (res && res.data) {
          getProducts();

          setClicked("");
          setManufactureDate("");
          productEditModalToggle();
          reset();
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  const onScanAction = async (selectedProduct) => {
    try {
      const purchaseProductList = stateRef?.purchaseProductList;

      let AddProduct = {
        image: selectedProduct?.featured_media_url,
        brand: selectedProduct?.brand_name,
        product_name: selectedProduct?.product_name,
        size: selectedProduct?.size,
        unit_price: selectedProduct?.unit,
        sale_price: selectedProduct?.sale_price,
        mrp: selectedProduct?.mrp,
        product_id: selectedProduct?.product_id,
        barcode: selectedProduct?.barcode,
        isAdding: true,
      };

      //validate already added product list
      if (purchaseProductList && purchaseProductList.length > 0) {
        //find the product already exist or not
        let productExist = purchaseProductList.find(
          (data) => data.product_id == selectedProduct.product_id
        );

        //validate product exist or not
        if (productExist) {
          //get the updated quantity
          let updatedQuantity = productExist?.quantity
            ? productExist?.quantity + 1
            : 1;

          //create return object
          let returnObject = {
            updatedQuantity: updatedQuantity,
            product: productExist,
            product_id: selectedProduct?.product_id,
          };

          //set moda visiblity
          setProductExistModalOpen(true);

          setSelectedItem(returnObject.product);

          //update quantity update object
          setQuantityUpdateObject(returnObject);
          setSearchPhrase("");
          setManufactureDate("");
        } else {
          productEditModalToggle();
          reset();
          setSelectedItem(AddProduct);
          stateRef.selectedItem = selectedProduct;
          setSearchPhrase("");
        }
      } else {
        //add invenotry product
        productEditModalToggle();
        reset();
        setSelectedItem(AddProduct);
        stateRef.selectedItem = selectedProduct;
        setSearchPhrase("");
      }
    } catch (err) {
      setSearchPhrase("");
    }
  };

  const productOnClick = async (selectedProduct) => {
    setScannedProductList(selectedProduct);
    onScanAction(selectedProduct);
  };

  const onDateSelect = (value) => {
    setSelectedDate(value);
  };
  const onManufactureDateSelect = (value) => {
    setManufactureDate(value);
  };

  const onInvoiceDateSelect = (value) => {
    setInvoiceDate(value);
  };

  const onDueDateSelect = (value) => {
    setDueDate(value);
  };

  const getProducts = async () => {
    let props = {
      sort: "createdAt",
      sortDir: "DESC",
      purchaseId: params?.id ? params?.id : param.id,
      storeId: params?.location ? params?.location : param?.location,
      pagination: false,
    };
    await purchaseProductService.search(
      props,
      (error, purchaseProductList, totalCount) => {
        setTotalCount(totalCount);
        stateRef.purchaseProductList = purchaseProductList;

        setPurchaseProductList(purchaseProductList);
      }
    );
  };

  const renderItem = (data) => {
    let item = data?.item;
    return (
      <View style={styles.container}>
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
              QuantityField
              editable
            />
          )}
        </View>
      </View>
    );
  };

  const renderHiddenItem = (data, rowMap) => {
    return (
      <View style={styles.swipeStyle}>
        <TouchableOpacity
          style={[styles.productDelete]}
          onPress={() => {
            setSelectedItem(data?.item);
            stateRef.selectedItem = data?.item;
            stateRef.selecredRowMap = rowMap;
            setProductDeleteModalOpen(true);
          }}
        >
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.productEdit]}
          onPress={() => {
            setProductEditModalOpen(!productEditModalOpen);
            setSelectedItem(data?.item);
            setMrp(null);
            stateRef.selectedItem = data?.item;
            stateRef.selecredRowMap = rowMap;
          }}
        >
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const updatedQuantity = async (values) => {
    if (selectedItem.isAdding) {
      await addPurchaseProduct(values, selectedItem);
    } else {
      await updatePurchaseProduct(values, selectedItem?.id);
    }
  };

  const updateProduct = async () => {
    if (quantityUpdateObject) {
      // update the quantity
      await updatePurchaseProduct(
        quantityUpdateObject.updatedQuantity,
        quantityUpdateObject.id,
        quantityUpdateObject.unit_price
      );
    }
  };

  const updatePurchaseProduct = async (values) => {
    try {
      //validate quantity exist or not
      //create update quantity object

      let dataObject = {};

      dataObject.purchase_id = params?.id;
      dataObject.product_id = values?.product_id;
      dataObject.cgst_percentage = values && values.cgst_percentage;
      dataObject.sgst_percentage = values && values.sgst_percentage;
      dataObject.cess_percentage = values && values.cess_percentage;
      dataObject.cess_amount = values && values.cess_amount;
      dataObject.sgst_amount = values && values.sgst_amount;
      dataObject.cgst_amount = values && values.cgst_amount;
      dataObject.igst_amount = values && values.igst_amount;
      dataObject.igst_percentage = values && values.igst_percentage;
      dataObject.discount_percentage = values && values.discount_percentage;
      dataObject.taxable_amount =
        values && values.taxable_amount ? values.taxable_amount : null;

      dataObject.mrp = values && values.mrp;
      dataObject.discount_amount =
        values && Number.GetFloat(values.discount_amount);

      dataObject.tax_amount = values && Number.GetFloat(values.tax_amount);

      dataObject.net_amount = values && values.net_amount;

      dataObject.tax_percentage = values && Number.GetFloat(values.tax);

      dataObject.quantity = values && values.quantity;

      dataObject.unit_price = values && values.unit_price;
      dataObject.margin_percentage = values && values.margin_percentage;
      dataObject.unit_margin_amount = values && values.unit_margin_amount;
      dataObject.status = values && values.status && values.status;
      dataObject.manufactured_date =
        values && values.manufactured_date && values.manufactured_date;

      dataObject.purchaseId = params?.id;
      dataObject.productId = values?.product_id;

      purchaseProductService.update(
        dataObject,
        values?.id,
        (error, response) => {
          setProductExistModalOpen(false);

          if (purchaseProductList != undefined) {
            let purchaseProducts = [...purchaseProductList];

            let purchaseProductIndex = purchaseProducts.findIndex(
              (data) => data.id == selectedItem?.id
            );

            if (purchaseProductIndex > -1) {
              purchaseProducts[purchaseProductIndex].quantity = values
                ? values?.quantity
                : selectedItem.quantity;

              purchaseProducts[purchaseProductIndex].manufactured_date =
                manufactureDate;

              setPurchaseProductList(purchaseProducts);
            }
          }
          productEditModalToggle();
          reset();
          getProducts();
          setClicked("");
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  const deletePurchaseProduct = async (item) => {
    if (item && item.id) {
      purchaseProductService.delete(item.id, async () => {
        await getProducts();
        clearRowDetail();
      });
    }
  };

  const updateDateValues = () => {
    let date = params?.purchaseDate;
    if (date) {
      setSelectedDate(date);
    }
    let manufactured_date = selectedItem.manufactured_date;
    if (manufactured_date) {
      setManufactureDate(manufactured_date);
    }
  };

  const updatePurchase = async (values) => {
    setIsSubmit(true);
    const updateData = {
      date: selectedDate,
      vendor_invoice_number: values?.vendor_invoice_number,
      description: values.description,
      location: storeId
        ? storeId
        : params?.location
        ? params?.location
        : param.location,
      vendor_id: vendorName
        ? vendorName.value
        : params?.vendor_id
        ? params?.vendor_id
        : param?.vendor_id,
      status: status,
      net_amount: netAmount ? netAmount : params?.net_amount,
      due_date: dueDate ? dueDate : params?.due_date,
      invoice_amount: invoiceAmount,
      invoice_amount: invoiceAmount,
      returnedItemAmount: returnAmount,
      reviewer: reviewer,
      due_date: dueDate,
      owner: owner,
      vendor_invoice_date: invoiceDate,
    };

    await purchaseService.updatePurchase(
      params?.id ? params?.id : param.id,
      updateData,
      (response) => {
        if (response) {
          if (params) {
            setActiveTab(TabName.SUMMARY);
            setDisableEdit(true);
            setIsSubmit(false);
          } else {
            setIsSubmit(false);
            navigation.navigate("Purchase");
          }
        } else {
          setIsSubmit(false);
        }
      }
    );
  };

  const productExistModalToggle = () => {
    setProductExistModalOpen(!productExistModalOpen);
    setClicked("");
  };

  const productNotFoundToggle = () => {
    setProductNotFoundModalOpen(!productNotFoundModalOpen);
    setClicked("");
  };

  const productSelectModalToggle = () => {
    setProductSelectModalOpen(!productSelectModalOpen);
    setClicked("");
  };

  const onInvoiceAmountChange = (value) => {
    setInvoiceAmount(value);
    purchaseRef.current.invoiceAmount = value;

    calculatedData();
  };

  const Products = () => (
    <>
      <DeleteModal
        modalVisible={productDeleteModalOpen}
        toggle={productDeleteModalToggle}
        item={selectedItem}
        updateAction={deletePurchaseProduct}
      />
      <ConfirmationModal
        toggle={productExistModalToggle}
        modalVisible={productExistModalOpen}
        title={AlertMessage.PRODUCT_ALREADY_EXIST}
        description={AlertMessage.QUANTITY_INCREASE_MESSSAGE}
        confirmLabel={"Confirm"}
        cancelLabel={"Cancel"}
        scanProduct={selectedItem}
        ConfirmationAction={updateProduct}
        CancelAction={productExistModalToggle}
      />
      <ConfirmationModal
        toggle={productNotFoundToggle}
        modalVisible={productNotFoundModalOpen}
        title={AlertMessage.PRODUCT_NOT_FOUND}
        description={`BarCode ID ${scannedCode} not found please scan different code or add the product`}
        confirmLabel={"Cancel"}
        ConfirmationAction={productNotFoundToggle}
      />
      <ProductSelectModal
        modalVisible={productSelectModalOpen}
        toggle={productSelectModalToggle}
        items={scannedProductList}
      />

      {!searchPhrase &&
        purchaseProductList &&
        purchaseProductList.length == 0 && (
          <NoRecordFound
            iconName={"receipt"}
            styles={{ paddingVertical: 250, alignItems: "center" }}
          />
        )}
    </>
  );
  const FooterContent = (
    <SaveButton
      onPress={handleSubmit((values) => {
        updatePurchase(values);
      })}
      isSubmit={isSubmit}
    />
  );

  const updateValue = () => {
    activeTab === TabName.ATTACHMENTS
      ? setActiveTab(TabName.PRODUCTS)
      : navigation.navigate("Purchase");
  };

  let title = [];

  if (newPurchase) {
    title.push(
      {
        title: TabName.SUMMARY,
        tabName: TabName.SUMMARY,
      },
      {
        title: `${TabName.PRODUCTS} (${totalCount || 0})`,
        tabName: TabName.PRODUCTS,
      }
    );
  }

  if (!newPurchase) {
    title.push(
      {
        title: TabName.SUMMARY,
        tabName: TabName.SUMMARY,
      },
      {
        title: `${TabName.PRODUCTS} (${totalCount || 0})`,
        tabName: TabName.PRODUCTS,
      }
    );
  }
  if (!newPurchase && purchaseHistoryViewPermission) {
    title.push({
      title: TabName.HISTORY,
      tabName: TabName.HISTORY,
    });
  }

  return (
    <Layout
      title={
        params || param
          ? `Purchase# ${
              params?.purchaseNumber
                ? params?.purchaseNumber
                : param?.purchaseNumber
            }`
          : "Add Purchase"
      }
      FooterContent={
        activeTab === TabName.SUMMARY && FooterContent
          ? activeTab === TabName.SUMMARY && FooterContent
          : newPurchase
      }
      showBackIcon
      backButtonNavigationUrl="Purchase"
      buttonLabel={
        activeTab === TabName.ATTACHMENTS && editPermission ? "Upload" : ""
      }
      buttonLabel2={activeTab === TabName.SUMMARY ? "Save" : ""}
      button2OnPress={handleSubmit((values) => {
        updatePurchase(values);
      })}
      onPressCancel={() => {
        !newPurchase && navigation.navigate("Purchase");
      }}
      updateValue={newPurchase ? updateValue : false}
      showActionMenu={
        !newPurchase && editPermission && activeTab === TabName.SUMMARY
          ? true
          : false
      }
      actionItems={[
        <MenuItem
          onPress={() => {
            setDisableEdit(false);
            setIsVisible(true);
          }}
        >
          Edit
        </MenuItem>,
      ]}
      closeModal={visible}
      isSubmit={isSubmit}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.tabBar}>
          <Tab
            title={title}
            setActiveTab={setActiveTab}
            defaultTab={activeTab}
          />
        </View>
        {activeTab === TabName.SUMMARY && (
          <View>
            <VerticalSpace10 paddingTop={5} />

            <DatePicker
              title="Purchase Date"
              onDateSelect={onDateSelect}
              selectedDate={selectedDate ? selectedDate : params?.purchase_date}
              style={styles.input}
              divider
            />
            <VerticalSpace10 paddingTop={5} />
            <AccountSelect
              label="Vendor"
              name="vendor"
              options={vendorList}
              control={control}
              showBorder={false}
              divider
              getDetails={(value) => setVendorName(value)}
              placeholder="Select Account"
            />

            <VerticalSpace10 paddingTop={5} />

            <TextInput
              title="Vendor Invoice Number# "
              name="vendor_invoice_number"
              control={control}
              showBorder={true}
              divider
            />
            <VerticalSpace10 paddingTop={5} />
            <DatePicker
              title="Vendor Invoice Date"
              name="vendor_invoice_date"
              onDateSelect={onInvoiceDateSelect}
              selectedDate={
                invoiceDate ? invoiceDate : params?.vendor_invoice_date
              }
              style={styles.input}
              divider
            />

            <VerticalSpace10 paddingTop={5} />
            <LocationSelect
              label="Location"
              name="location"
              onChange={(value) => {
                setStoreId(value);
              }}
              options={storeList}
              showBorder={true}
              divider
              data={params?.location ? params?.location : param?.location}
              control={control}
              placeholder="Select Location"
            />
            <VerticalSpace10 paddingTop={5} />

            <Currency
              title="Invoice Amount"
              name="invoice_amount"
              control={control}
              showBorder={true}
              edit
              divider
              onInputChange={onInvoiceAmountChange}
              values={invoiceAmount ? invoiceAmount.toString() : ""}
            />
            <VerticalSpace10 paddingTop={5} />

            <View>
              <View>
                <UserSelect
                  label="Owner"
                  selectedUserId={params?.owner_id}
                  name={"owner_id"}
                  onChange={(value) => setSelectedOwner(value.value)}
                  control={control}
                  placeholder="Select Owner"
                />
              </View>
              <VerticalSpace10 />

              <UserSelect
                label="Reviewer"
                selectedUserId={params?.reviewer_id}
                name={"reviewer_id"}
                onChange={(value) => setSelectedReviewer(value.value)}
                control={control}
                placeholder="Select Reviewer"
              />
            </View>
            <VerticalSpace10 />
            <DatePicker
              title="Due Date"
              onDateSelect={onDueDateSelect}
              selectedDate={dueDate ? dueDate : params?.due_date}
              style={styles.input}
              divider
            />
          </View>
        )}

        {activeTab === TabName.PRODUCTS && (
          <>
            <Search
              productOnClick={productOnClick}
              setClicked={setClicked}
              clicked={clicked}
              searchPhrase={searchPhrase}
              setSearchPhrase={setSearchPhrase}
            />
            {!searchPhrase && (
              <SwipeListView
                data={purchaseProductList}
                renderItem={renderItem}
                renderHiddenItem={renderHiddenItem}
                rightOpenValue={-150}
                previewOpenValue={-40}
                previewOpenDelay={3000}
                disableRightSwipe={true}
                disableLeftSwipe={editPermission ? false : true}
                closeOnRowOpen={true}
                keyExtractor={(item) => String(item.id)}
              />
            )}
            <Products />
            {productEditModalOpen && (
              <PurchaseProductModel
                modalVisible={productEditModalOpen}
                toggle={() => {
                  productEditModalToggle();
                  reset();
                }}
                item={selectedItem}
                title={selectedItem?.isAdding ? "Add Product" : "Edit Product"}
                BottonLabel1={selectedItem?.isAdding ? "Add" : "Save"}
                updateAction={updatedQuantity}
                control={control}
                mrpField
                TextBoxQuantityField
                setSelectedItem={setSelectedItem}
                quantityOnChange={updatedQuantity}
              />
            )}
          </>
        )}
      </ScrollView>
      {activeTab === TabName.HISTORY && (
        <ScrollView>
          <HistoryList objectName={ObjectName.PURCHASE} objectId={params?.id} />
        </ScrollView>
      )}
    </Layout>
  );
};
export default PurchaseForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "scroll",
    backgroundColor: "#fff",
  },
  productImage: {
    width: 30,
    height: 30,
    borderRadius: 5,
    borderWidth: 2,
  },
  productImage: {
    width: 30,
    height: 30,
    borderRadius: 5,
    borderWidth: 2,
  },
  swipeStyle: {
    flex: 1,
  },
  actionDeleteButton: {
    alignItems: "center",
    bottom: 10,
    justifyContent: "center",
    position: "absolute",
    top: 16,
    width: 70,
    backgroundColor: "#D11A2A",
    right: 7,
  },
  btnText: {
    color: Color.WHITE,
  },
  productEdit: {
    alignItems: "center",
    bottom: 10,
    justifyContent: "center",
    position: "absolute",
    top: 10,
    width: 70,
    backgroundColor: "grey",
    right: 0,
  },
  tabBar: {
    flexDirection: "row",
    height: 50,
    backgroundColor: Color.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Color.LIGHT_GRAY,
  },
  productDelete: {
    alignItems: "center",
    bottom: 10,
    justifyContent: "center",
    position: "absolute",
    top: 10,
    width: 70,
    backgroundColor: "#D11A2A",
    right: 70,
  },
  input: {
    color: "black",
    height: 50,
    width: "100%",
    padding: 10,
    borderColor: "#dadae8",
  },
});
