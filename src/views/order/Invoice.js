import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Image, ScrollView } from "react-native";
import CompanyService from "../../services/CompanyService";
import Layout from "../../components/Layout";
import OrderProductService from "../../services/OrderProductService";
import DateTime from "../../lib/DateTime";
import VerticalSpace10 from "../../components/VerticleSpace10";
import Currency from "../../lib/Currency";
import Divider from "../../components/Divider";
import InvoicePrint from "./printInvoice";
import { MenuItem } from "react-native-material-menu";
import CustomerMobileNumberModal from "./customerMobileNumberModal";
import { useForm } from "react-hook-form";
import orderService from "../../services/OrderService";
import WhatsappService from "../../services/WhatsappService";
import Number from "../../lib/Number";


const Invoice = (props) => {
    const params = props?.route?.params?.item;
    const [company, setCompany] = useState([]);
    const [orderProduct, setOrderProduct] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalSgstAmount, setTotalSgStAmount] = useState(0)
    const [totalCgstAmount, setTotalCgStAmount] = useState(0);
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [visible, setVisible] = useState(false)


    useEffect(() => {
        getCompanySettings();
        getOrderProducts();
        getOrderProductTotalAmount()
    }, []);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({});

    const getCompanySettings = async () => {
        let companyDetail = new Array()
        await CompanyService.search(null, (response) => {
            if (response && response.data) {
                companyDetail.push(response.data)
                setCompany(companyDetail);

            }

        });
    };

    const shareToggle = () => {
        setShareModalVisible(!shareModalVisible)
    }
    const actionItems = [
        <>
            <MenuItem onPress = {()=>setVisible(true)}>
                <InvoicePrint company={company} orderProduct={orderProduct} totalAmount={params?.total_amount}
                    totalCgstAmount={totalCgstAmount} totalSgstAmount={totalSgstAmount} params={params}
                />
            </MenuItem>
            <MenuItem style={{ textAlign: 'center', paddingLeft: 10 }} onPress={() => {shareToggle(),setVisible(true)}}>
                SHARE
            </MenuItem>
        </>

    ]

    const getOrderProducts = async () => {
        await OrderProductService.search({ orderId: params?.id }, (error, response) => {
            if (response && response?.data && response?.data?.data) {

                let sgstAmount = response?.data?.data.reduce((sum, product) => {
                    if (product.cancelledAt === null) {
                      return sum + (Number.GetFloat(product.sgst_amount) || 0);
                    }
                    return sum;
                  }, 0);
                  
                  let cgstAmount = response?.data?.data.reduce((sum, product) => {
                    if (product.cancelledAt === null) {
                      return sum + (Number.GetFloat(product.cgst_amount) || 0);
                    }
                    return sum;
                  }, 0);

                setTotalSgStAmount(sgstAmount == undefined ? 0 : sgstAmount)
                setTotalCgStAmount(cgstAmount == undefined ? 0 : cgstAmount)
                setOrderProduct(response.data.data);
            }
        });
    };


    const getOrderProductTotalAmount =async ()=>{
        let params={
            orderId: params?.id
        }
        await OrderProductService.getTotalAmount(params,(res)=>{
          const totalAmount = res && res?.data && res?.data?.totalAmount;
         setTotalAmount(parseFloat(totalAmount));
        })
      }

    const shareOnClick = async (values) => {

        let bodyData = {
            mobile_number: values?.mobile_number,
            orderId: params?.id
        }

        await WhatsappService.orderInvoice(bodyData, (error, response) => {
            if (response) {
                shareToggle()
                reset({})
            }
        })

    }

    const calculateProductAmount = (item) => {
        let Amount = item?.amount * item?.quantity;
        return Currency.IndianFormat(Amount)
    };
    
    return (
        <Layout title={"Order Invoice"} showBackIcon
            showActionMenu
            closeModal={visible}

            actionItems={
                actionItems
            }
        >
            <ScrollView style={{ flex: 1 }}>

                <View style={styles.container}>
                    {company.map((item) => (
                        <>
                            <View style={{ flexDirection: 'row', paddingTop: 10 }}>
                                <Text style={styles.title1}>{item.company_name}</Text>

                                <Text style={styles.title}>Invoice</Text>
                            </View>

                            <View style={styles.line} />

                            <View key={item.id} style={styles.companyInfo}>
                                {item.address1 && item.address2 && (
                                    <Text style={styles.label}>{`${item.address1}, ${item.address2} (${item.pin_code})`}</Text>
                                )}
                                {item?.gst_number && (
                                    <Text style={styles.label1}>GST No: {item?.gst_number}</Text>
                                )}
                            </View>
                        </>
                    ))}
                </View>
                <View style={styles.container2}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={styles.label}>Invoice: #{params?.order_number}</Text>
                        <Text style={styles.label}>Date: {params?.date} </Text>
                    </View>
                    <VerticalSpace10 paddingTop={20} />
                    <Divider />
                    <View style={styles.productRow}>
                        <View style={styles.column}>
                            <Text style={styles.columnHeader}>Product</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.columnHeader}>Quantity</Text>
                        </View>
                        <View style={[styles.column]}>
                            <Text style={styles.columnHeader}>Price</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.columnHeader}>CGST</Text>
                        </View>
                        <View style={[styles.column, { paddingLeft: 1 }]}>
                            <Text style={styles.columnHeader}>SGST</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.columnHeader1}>Amount</Text>
                        </View>
                    </View>

                    {orderProduct.map((item) => (
                        <>
                        {item && item.cancelledAt == null &&
                        <>
                            <View style={styles.column}>
                                <Image source={{ uri: item.image }} style={styles.productImage} />
                                <Text style={styles.productName}>{item.productDetails.product_display_name}</Text>
                            </View>
                            <View key={item.id} style={styles.productRow}>
                                <View style={[styles.column]}>
                                </View>
                                <View style={styles.columns}>
                                    <Text style={styles.quantity}>{item.quantity}</Text>
                                </View>
                                <View style={styles.columns}>
                                    <Text style={styles.price}>{Currency.IndianFormat(item?.amount)}</Text>
                                </View>
                                <View style={styles.columns}>
                                    <Text style={styles.quantity}>{Currency.IndianFormat(item.cgst_amount)}</Text>
                                </View>
                                <View style={styles.columns}>
                                    <Text style={styles.quantity}>{Currency.IndianFormat(item.sgst_amount)}</Text>
                                </View>
                                <View style={styles.columns}>
                                    <Text style={styles.amount}>{calculateProductAmount(item)}</Text>
                                </View>
                            </View>
                            </>
}
                        </>
                    ))}

                </View>
                <Text style={styles.totalAmountText1}>Total Amount: {Currency.IndianFormat(params?.total_amount)}</Text>
                <Text style={styles.totalAmountText}>Total CGST Amount: {Currency.IndianFormat(totalCgstAmount)}</Text>
                <Text style={styles.totalAmountText}>Total SGST Amount: {Currency.IndianFormat(totalSgstAmount)}</Text>
                <Text style={styles.thankYouText}>Thank you for shopping!</Text>

            </ScrollView>

            <CustomerMobileNumberModal
                toggle={shareToggle}
                modalVisible={shareModalVisible}
                title={"Share Invoice"}
                confirmLabel={"Share"}
                cancelLabel={"Cancel"}
                control={control}
                ConfirmationAction={handleSubmit(shareOnClick)}
            />

        </Layout >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 0.3,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    container2: {
        flex: 0.6,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        marginLeft: 75
    },
    title1: {
        fontSize: 24,
        fontWeight: "bold",
        marginRight: 75,
    },
    companyInfo: {
        marginBottom: 20,
    },
    column: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    columns: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        paddingLeft: 13
    },
    productName: {
        fontWeight: "bold",
        marginLeft: 7,
        maxWidth: "90%"

    },
    productImage: {
        width: 30,
        height: 30,
    },

    thankYouText: {
        marginTop: 40,
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    label: {
        fontWeight: "bold",
        textAlign: "center",
    },
    label1: {
        fontWeight: "bold",
        marginRight: 180,
    },
    productRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        alignItems: "center",
        borderBottomColor: "#000",
        borderBottomWidth: 0.5,
        paddingBottom: 2,
    },
    columnHeader: {
        fontWeight: "bold",
        fontSize: 12,
        paddingVertical: 8,
        textAlign: "center",
        borderRightWidth: 0.5,
        borderRightColor: "#000",
        flex: 1,
    },
    columnHeader1: {
        fontWeight: "bold",
        fontSize: 12,
        paddingVertical: 8,
        textAlign: "center",
        flex: 1,
    },

    quantity: {
        fontWeight: "bold",
        fontSize: 10,
        alignItems: 'center',
        alignContent: 'center',
        textAlign: 'center',
        maxWidth: "100%",
        minWidth: "50%"
    },
    price: {
        fontWeight: "bold",
        fontSize: 10,
        maxWidth: "100%",
        minWidth: "50%"
    },
    amount: {
        fontWeight: "bold",
        fontSize: 10,
        maxWidth: "100%",
        minWidth: "50%"
    },

    line: {
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        width: "100%",
        marginBottom: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        alignItems: "center",
    },
    value: {
        fontWeight: "bold",
        fontSize: 12,
    },
    totalAmountText: {
        fontWeight: "bold",
        fontSize: 18,
        marginLeft: 80,
        marginTop: 10,
        flexDirection: "row",
    },
    totalAmountText1: {
        fontWeight: "bold",
        fontSize: 18,
        marginLeft: 130,
        marginTop: 10,
        flexDirection: "row",
    },

});

export default Invoice;
