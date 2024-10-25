import React, { useRef, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Modal from "react-native-modal";
import { AntDesign } from "@expo/vector-icons";
import { Color } from "../../../helper/Color";
import CurrencyInput from "../../../components/Currency";
import VerticalSpace10 from "../../../components/VerticleSpace10";
import SaveButton from "../../../components/SaveButton";
import ImageCard from "../../../components/ImageCard";
import Currency from "../../../lib/Currency";
import Number from "../../../lib/Number";
import { Card } from "react-native-paper";
import { useForm } from "react-hook-form";
import platform from "../../../lib/Platform";
import TextInput from "../../../components/TextInput";

const BottomModal = (props) => {
  const { title, modalVisible, toggle, item, BottonLabel1, updateAction } =
    props;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {},
  });

  const [purchaseData, setPurchaseData] = useState({});

  const [taxableAmount, setTaxableAmount] = useState(null);

  const dataRef = useRef({
    productDetail: null,
    net_amount: null,
    quantity: null,
    mrp: null,
    taxableAmount: null,
  });

  const handleQuantityChange = async (value) => {
    dataRef.current.quantity = value;
    getPurchaseData();
  };

  const handleMrpChange = async (value) => {
    dataRef.current.mrp = value;
    getPurchaseData();
  };

  const handleTaxableAmountChange = (value) => {
    setTaxableAmount(value);
    dataRef.current.taxableAmount = value;
    getPurchaseData();
  };

  const calculateAmountAndTax = (params) => {
    const {
      totalAmount,
      cgstPercentage,
      sgstPercentage,
      igstPercentage,
      cessPercentage,
      quantity,
      taxableAmount,
    } = params;

    //  combined GST percentage
    const combinedGstPercentage =
      Number.GetFloat(cgstPercentage) +
      Number.GetFloat(sgstPercentage) +
      Number.GetFloat(igstPercentage) +
      Number.GetFloat(cessPercentage);

    //  net_amount before tax
    const taxable_amount = taxableAmount
      ? taxableAmount
      : totalAmount
      ? Number.GetFloat(totalAmount / (1 + combinedGstPercentage / 100))
      : "";

    //  tax amounts
    const cgstAmount = taxable_amount * (cgstPercentage / 100);
    const sgstAmount = taxable_amount * (sgstPercentage / 100);
    const igstAmount = taxable_amount * (igstPercentage / 100);
    const cessAmount = taxable_amount * (cessPercentage / 100);

    // gst net_amount
    let cgstTotalAmount = cgstAmount >= 0 ? cgstAmount : item.cgst_amount;

    let igstTotalAmount = igstAmount >= 0 ? igstAmount : item.igst_amount;

    let sgstTotalAmount = sgstAmount >= 0 ? sgstAmount : item.sgst_amount;

    let cessTotalAmount = cessAmount >= 0 ? cessAmount : item.cess_amount;

    // totalTax
    let totalTaxAmount =
      Number.GetFloat(cgstTotalAmount) +
        Number.GetFloat(igstTotalAmount) +
        Number.GetFloat(sgstTotalAmount) +
        Number.GetFloat(cessTotalAmount) || null;

    // final total Amount
    let finalTotalAmount = totalAmount
      ? totalAmount
      : taxable_amount && totalTaxAmount
      ? Number.GetFloat(taxable_amount) + Number.GetFloat(totalTaxAmount)
      : Number.GetFloat(item.netAmount);

    let finalTaxbleAmount = taxable_amount
      ? taxable_amount
      : finalTotalAmount - totalTaxAmount;

    return {
      taxableAmount: finalTaxbleAmount,
      cgstAmount: cgstTotalAmount,
      sgstAmount: sgstTotalAmount,
      igstAmount: igstTotalAmount,
      cessAmount: cessTotalAmount,
      totalTaxAmount: totalTaxAmount,
      totalAmount: finalTotalAmount,
    };
  };

  let getPurchaseData = () => {
    let productDetail =
      dataRef && dataRef.current && dataRef.current.productDetail;

    let cgst_percentage =
      productDetail &&
      productDetail?.product_id &&
      productDetail?.cgst_percentage &&
      (productDetail?.cgst_percentage !== null ||
        productDetail?.cgst_percentage == null)
        ? productDetail?.cgst_percentage
        : Number.GetFloat(item.cgst_percentage);

    let sgst_percentage =
      productDetail &&
      productDetail?.product_id &&
      productDetail?.sgst_percentage &&
      (productDetail?.sgst_percentage !== null ||
        productDetail?.sgst_percentage == null)
        ? productDetail?.sgst_percentage
        : Number.GetFloat(item.sgst_percentage);

    let cess_percentage =
      productDetail &&
      productDetail?.product_id &&
      ((productDetail?.tax_percentage &&
        productDetail?.tax_percentage !== null) ||
        productDetail?.tax_percentage == null)
        ? productDetail?.tax_percentage
        : Number.GetFloat(item.cess_percentage);

    let igst_percentage =
      productDetail &&
      productDetail?.product_id &&
      productDetail?.igst_percentage &&
      (productDetail?.igst_percentage !== null ||
        productDetail?.igst_percentage == null)
        ? productDetail?.igst_percentage
        : Number.GetFloat(item.igst_percentage);

    // sum of tax percentage
    let totalTax =
      Number.GetFloat(cgst_percentage) +
      Number.GetFloat(sgst_percentage) +
      Number.GetFloat(cess_percentage) +
      Number.GetFloat(igst_percentage);

    // quantity
    let quantityValue =
      dataRef && dataRef.current.quantity
        ? dataRef.current.quantity
        : item?.quantity;

    // mrp
    let mrpValue = dataRef && dataRef.current.mrp ? dataRef.current.mrp : "";

    let param = {
      totalAmount:
        dataRef && dataRef.current.net_amount
          ? dataRef.current.net_amount
          : item?.netAmount,
      cgstPercentage: cgst_percentage,
      sgstPercentage: sgst_percentage,
      igstPercentage: igst_percentage,
      cessPercentage: cess_percentage,
      quantity: quantityValue,
      taxableAmount:
        dataRef &&
        dataRef.current.taxableAmount &&
        dataRef.current.taxableAmount,
    };

    // caluclated result
    const result = calculateAmountAndTax(param);

    // unitPrice
    let unit_price = mrpValue;

    // marginamount
    let marginValue = mrpValue;

    // margin percentage

    // return data
    let data = {
      quantity: Number.GetFloat(quantityValue),
      mrp: mrpValue,
      unit_price: Number.GetFloat(unit_price),
      cgst_percentage: Number.getEmpty(cgst_percentage),
      sgst_percentage: Number.getEmpty(sgst_percentage),
      igst_percentage: Number.getEmpty(igst_percentage),
      cess_percentage: Number.getEmpty(cess_percentage),
      totalTaxAmount: Number.getEmpty(result.totalTaxAmount),
      taxable_amount: Number.getEmpty(result.taxableAmount),
      cgst_amount: Number.getEmpty(result.cgstAmount),
      sgst_amount: Number.getEmpty(result.sgstAmount),
      cess_amount: Number.getEmpty(result.cessAmount),
      igst_amount: Number.getEmpty(result.igstAmount),
      totalTax: Number.getEmpty(totalTax),
      net_amount:
        mrpValue && quantityValue
          ? mrpValue * quantityValue
          : Number.GetFloat(result.taxableAmount) +
            Number.GetFloat(result.totalTaxAmount),
    };

    // assign  data to state
    setPurchaseData(data);
  };

  const initialValues = {
    cgst_percentage:
      purchaseData?.cgst_percentage ?? item?.cgst_percentage ?? null,
    cgst_amount:
      Number.GetFloat(purchaseData?.cgst_amount) ??
      Number.GetFloat(item?.cgst_amount) ??
      null,
    sgst_percentage:
      purchaseData?.sgst_percentage ?? item?.sgst_percentage ?? null,
    sgst_amount:
      Number.GetFloat(purchaseData?.sgst_amount) ??
      Number.GetFloat(item?.sgst_amount) ??
      null,
    cess_amount:
      Number.GetFloat(purchaseData?.cess_amount) ??
      Number.GetFloat(item?.cess_amount) ??
      null,
    cess_percentage:
      purchaseData?.cess_percentage ?? item?.cess_percentage ?? null,
    igst_percentage:
      purchaseData?.igst_percentage ?? item?.igst_percentage ?? null,
    igst_amount:
      Number.GetFloat(purchaseData?.igst_amount) ??
      Number.GetFloat(item?.igst_amount) ??
      null,
    mrp: purchaseData?.mrp ?? item?.mrp ?? null,
    quantity: purchaseData?.quantity ?? item?.quantity ?? null,
    net_amount: purchaseData?.net_amount
      ? Number.GetFloat(purchaseData?.net_amount)
      : Number.GetFloat(item?.netAmount) ?? null,
    unit_price:
      Number.GetFloat(purchaseData?.unit_price) ??
      Number.GetFloat(item?.unit_price) ??
      null,

    taxable_amount:
      taxableAmount === ""
        ? ""
        : taxableAmount
        ? Number.GetFloat(taxableAmount)
        : purchaseData?.taxable_amount
        ? Number.GetFloat(purchaseData?.taxable_amount)
        : Number.GetFloat(item?.taxable_amount) ?? null,
    tax_amount:
      Number.GetFloat(purchaseData?.totalTaxAmount) ??
      Number.GetFloat(item?.tax_amount) ??
      null,

    id: item?.id,
    product_id: item?.product_id,
  };

  const handleUpdate = () => {
    updateAction(initialValues);
  };
  return (
    <View>
      <Modal
        isVisible={modalVisible}
        style={styles.modal}
        onSwipeComplete={toggle}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={800} // Control the speed of the opening animation (in milliseconds)
      >
        <View style={styles.modalContent}>
          {/* Header with title and close button */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {title ? title : "Edit Quantity"}
            </Text>
            <TouchableOpacity onPress={toggle} style={styles.closeButton}>
              <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <View style={styles.ProductEditDivider} />
          <VerticalSpace10 />

          {/* Scrollable Content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Card style={{ marginBottom: 10 }}>
              <Card.Content>
                {item && (
                  <View style={styles.productEditImageStyle}>
                    <View>
                      <ImageCard
                        ImageUrl={
                          item?.image ? item?.image : item.featured_media_url
                        }
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      {(item.brand || item.brand_name) && (
                        <Text style={{ fontWeight: "700" }}>
                          {item.brand ? item.brand : item?.brand_name}
                        </Text>
                      )}

                      <View style={styles.direction}>
                        <Text
                          style={{
                            fontSize: 16,
                            textTransform: "capitalize",
                          }}
                        >
                          {item.name ? item.name : item.product_name}
                          {item.size ? "," + item.size : ""}
                          {item.unit}
                        </Text>
                      </View>

                      <View style={styles.direction}>
                        {item.sale_price ? (
                          item.mrp != item.sale_price && item.mrp > 0 ? (
                            <View style={styles.direction}>
                              <Text
                                style={{ textDecorationLine: "line-through" }}
                              >
                                {Currency.IndianFormat(item.mrp)}
                              </Text>
                              {item.mrp > 0 && item.mrp != item.sale_price ? (
                                <Text style={{ paddingLeft: 10 }}>
                                  {Currency.IndianFormat(item.sale_price)}
                                </Text>
                              ) : (
                                ""
                              )}
                            </View>
                          ) : (
                            <Text>
                              {Currency.IndianFormat(item.sale_price)}
                            </Text>
                          )
                        ) : (
                          <Text>{Currency.IndianFormat(item.mrp)}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                )}
                <VerticalSpace10 />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ width: "100%" }}>
                    <TextInput
                      title={"Quantity"}
                      name="quantity"
                      placeholder="Enter Quantity"
                      control={control}
                      required={true}
                      onInputChange={handleQuantityChange}
                      values={initialValues?.quantity?.toString()}
                    />
                  </View>
                </View>
              </Card.Content>
            </Card>
            <Card style={{ marginBottom: 10 }}>
              <Card.Content>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={styles.infoHalf}>
                    <CurrencyInput
                      title="Unit Price"
                      name="unit_price"
                      control={control}
                      values={initialValues?.unit_price?.toString()}
                      onInputChange={handleMrpChange}
                      edit
                    />
                  </View>
                  <View style={styles.infoHalf}>
                    <CurrencyInput
                      title="Net Amount"
                      name="net_amount"
                      control={control}
                      values={initialValues?.net_amount?.toString()}
                      noEditable={true}
                    />
                  </View>
                </View>
              </Card.Content>
            </Card>

            <VerticalSpace10 />

            <Card style={{ marginBottom: 10 }}>
              <Card.Content>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={styles.infoHalf}>
                    <CurrencyInput
                      title="CGST%"
                      placeholder="CGST"
                      name="cgst_percentage"
                      noEditable={true}
                      control={control}
                      values={initialValues?.cgst_percentage?.toString()}
                      edit
                      percentage
                    />
                  </View>

                  <View style={styles.infoHalf}>
                    <CurrencyInput
                      title="CGST Amount"
                      name="cgst_amount"
                      control={control}
                      placeholder="CGST"
                      noEditable={true}
                      values={initialValues?.cgst_amount?.toString()}
                      edit
                    />
                  </View>
                </View>
                <VerticalSpace10 />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={styles.infoHalf}>
                    <CurrencyInput
                      title="SGST%"
                      name="sgst_percentage"
                      placeholder="SGST"
                      control={control}
                      noEditable={true}
                      percentage
                      values={initialValues?.sgst_percentage?.toString()}
                      edit
                    />
                  </View>

                  <View style={styles.infoHalf}>
                    <CurrencyInput
                      title="SGST Amount"
                      name="sgst_amount"
                      control={control}
                      placeholder="SGST"
                      noEditable={true}
                      values={initialValues?.sgst_amount?.toString()}
                      edit
                    />
                  </View>
                </View>
                <VerticalSpace10 />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={styles.infoHalf}>
                    <CurrencyInput
                      title="IGST%"
                      name="igst_percentage"
                      percentage
                      placeholder="IGST"
                      control={control}
                      noEditable={true}
                      values={initialValues?.igst_percentage?.toString()}
                      edit
                    />
                  </View>

                  <View style={styles.infoHalf}>
                    <CurrencyInput
                      title="IGST Amount"
                      name="igst_amount"
                      placeholder="IGST"
                      control={control}
                      noEditable={true}
                      values={initialValues?.igst_amount?.toString()}
                      edit
                    />
                  </View>
                </View>
                <VerticalSpace10 />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={styles.infoHalf}>
                    <CurrencyInput
                      title="CESS%"
                      name="cess_percentage"
                      noEditable={true}
                      placeholder="CESS"
                      percentage
                      control={control}
                      values={initialValues?.cess_percentage?.toString()}
                      edit
                    />
                  </View>

                  <View style={styles.infoHalf}>
                    <CurrencyInput
                      title="CESS Amount"
                      name="cess_amount"
                      noEditable={true}
                      placeholder="CESS"
                      control={control}
                      values={initialValues?.cess_amount?.toString()}
                      edit
                    />
                  </View>
                </View>
                <VerticalSpace10 />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={styles.infoHalf}>
                    <CurrencyInput
                      title="Tax Amount"
                      name="tax_amount"
                      control={control}
                      values={initialValues?.tax_amount?.toString() ?? null}
                      noEditable={true}
                      edit
                    />
                  </View>
                  <View style={styles.infoHalf}>
                    <CurrencyInput
                      title="Taxable Amount"
                      name="taxable_amount"
                      control={control}
                      placeholder="Taxable.."
                      onInputChange={handleTaxableAmountChange}
                      values={initialValues?.taxable_amount?.toString() ?? null}
                      edit
                    />
                  </View>
                </View>
              </Card.Content>
            </Card>
          </ScrollView>
          <View style={styles.ProductEditDivider} />
          <SaveButton
            title={BottonLabel1}
            onPress={() => {
              handleUpdate();
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: platform.isIOS()
      ? Dimensions.get("window").height * 0.94
      : Dimensions.get("window").height,
  },
  ProductEditDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "lightgray",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Color.BLACK,
    textAlign: "center",
    flex: 1,
  },
  closeButton: {
    paddingHorizontal: 10,
  },
  scrollContent: {
    paddingBottom: 20, // Add some bottom padding for better spacing
  },
  productEditImageStyle: {
    width: "100%",
    flexDirection: "row",
  },
  infoHalf: {
    width: "47%",
  },
});

export default BottomModal;
