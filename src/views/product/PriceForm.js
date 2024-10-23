import React, { useEffect, useState, useCallback } from "react";
import Layout from "../../components/Layout";
import DatePicker from "../../components/DatePicker";
import { ScrollView } from "react-native";
import { useForm } from "react-hook-form";
import Currency from "../../components/Currency";
import TextInput from "../../components/TextInput";
import VerticalSpace10 from "../../components/VerticleSpace10";
import ProductPriceService from "../../services/ProductPriceService";
import { useNavigation } from "@react-navigation/native";
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal";
import { MenuItem } from "react-native-material-menu";
import ProductCard from "../../components/ProductCard";
import ToggleSwitch from "../../components/ToggleSwitch";
import Permission from "../../helper/Permission";
import PermissionService from "../../services/PermissionService";
import StatusSelect from "../../components/StatusSelect";
import ObjectName from "../../helper/ObjectName";
import Number from "../../lib/Number";

const PriceForm = (props) => {
  const params = props?.route?.params?.item;
  const id = props?.route?.params?.productId;
  const details = props?.route?.params?.details;
  const barcode = props?.route?.params?.previousBarCode;

  const [selectedDate, setSelectedDate] = useState(
    params?.date ? params?.date : new Date()
  );
  const [isChecked, setIsChecked] = useState(params?.isDefault || false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(params?.id || "");
  const [visible, setVisible] = useState(false);
  const [actionList, setActionList] = useState([]);
  const navigation = useNavigation();
  const [priceEditPermission, setPriceEditPermission] = useState(false);
  const [priceDeletePermission, setPriceDeletePermission] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  useEffect(() => {
    getActionItems();
    editPermission();
  }, []);
  const preloadedValues = {
    sale_price: params && params.salePrice && params.salePrice.toString(),
    barcode: params && params.barCode,
    mrp: params && params.mrp && params.mrp.toString(),
    cost_price: params && params.costPrice && params.costPrice.toString(),
    date: params?.date ? params?.date : selectedDate,
  };

  const editPermission = async () => {
    const editPermission = await PermissionService.hasPermission(
      Permission.PRODUCT_PRICE_EDIT
    );
    setPriceEditPermission(editPermission);
    const deletePermission = await PermissionService.hasPermission(
      Permission.PRODUCT_PRICE_DELETE
    );
    setPriceDeletePermission(deletePermission);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: preloadedValues,
  });

  const addPrice = async (values) => {
    setIsSubmit(true);
    const createData = {
      barCode: values?.barcode
        ? values?.barcode
        : barcode
        ? barcode
        : params.barCode,
      mrp: values?.mrp ? values?.mrp : params?.mrp,
      salePrice: values?.sale_price ? values?.sale_price : params?.sale_price,
      costPrice: values?.cost_price ? values?.cost_price : params?.cost_price,
      date: selectedDate ? selectedDate : params?.date,
      productId: id,
      isDefault: isChecked ? isChecked : params?.isDefault,
      status: values && values?.status,
    };
    if (params?.id) {
      await ProductPriceService.update(
        params?.id,
        createData,
        (err, response) => {
          if (response) {
            setIsSubmit(false);
            navigation.navigate("Products/Details", {
              productId: id,
              barcode: details?.barcode,
              brand: details?.brand,
              image: details?.image,
              size: details.size,
              unit: details?.unit,
              sale_price: details?.sale_price,
              mrp: details?.mrp,
              name: details?.name,
            });
          } else {
            setIsSubmit(false);
          }
        }
      );
    } else {
      await ProductPriceService.create(createData, (err, response) => {
        if (response) {
          setIsSubmit(false);
          navigation.navigate("Products/Details", {
            productId: id,
            barcode: details?.barcode,
            brand: details?.brand,
            image: details?.image,
            size: details.size,
            unit: details?.unit,
            sale_price: details?.sale_price,
            mrp: details?.mrp,
            name: details?.name,
          });
        } else {
          setIsSubmit(false);
        }
      });
    }
  };
  const deleteModalToggle = () => {
    setDeleteModalOpen(!deleteModalOpen);
  };
  const getActionItems = async () => {
    let actionItems = new Array();

    if (priceDeletePermission) {
      actionItems.push(
        <MenuItem
          onPress={() => {
            setDeleteModalOpen(true), setVisible(true);
          }}
        >
          Delete
        </MenuItem>
      );
    }
    setActionList(actionItems);
  };

  const onDateSelect = (value) => {
    setSelectedDate(new Date(value));
  };
  const priceTagDelete = async () => {
    if (selectedItem) {
      ProductPriceService.delete(selectedItem, (error, response) => {
        navigation.navigate("Products/Details", { productId: id });
      });
    }
  };

  return (
    <Layout
      title={params ? `Price#: ${params?.id}` : "Add Price"}
      buttonLabel={priceEditPermission ? "Save" : ""}
      buttonOnPress={handleSubmit((values) => {
        addPrice(values);
      })}
      closeModal={visible}
      actionItems={actionList}
      showActionMenu={
        params && actionList && actionList.length > 0 ? true : false
      }
      isSubmit={isSubmit}
    >
      <DeleteConfirmationModal
        modalVisible={deleteModalOpen}
        toggle={deleteModalToggle}
        item={selectedItem}
        updateAction={priceTagDelete}
        id={selectedItem}
      />
      <ScrollView>
        <ProductCard
          size={details.size}
          unit={details.unit}
          name={details.name}
          image={details.image}
          brand={details.brand}
          sale_price={details.sale_price}
          mrp={details.mrp}
          id={details.id}
          noIcon
        />

        <DatePicker
          title="Date"
          onDateSelect={onDateSelect}
          selectedDate={selectedDate ? selectedDate : new Date(params.date)}
        />
        <VerticalSpace10 />

        <Currency
          title="Sale Price"
          name="sale_price"
          control={control}
          required
          edit
        />
        <VerticalSpace10 />

        <Currency
          title="Purchase Price"
          name="cost_price"
          control={control}
          edit
        />
        <VerticalSpace10 />

        <VerticalSpace10 />
        {params && (
          <>
            <StatusSelect
              label={"Status"}
              name="status"
              control={control}
              placeholder={"Select Status"}
              object={ObjectName.PRODUCT_PRICE}
              data={params?.status ? Number.GetFloat(params?.status) : ""}
              currentStatusId={params?.status}
            />
            <VerticalSpace10 />
          </>
        )}

        <ToggleSwitch
          text={"Is Default"}
          value={isChecked}
          onValueChange={() => setIsChecked(!isChecked)}
        />
      </ScrollView>
    </Layout>
  );
};
export default PriceForm;
