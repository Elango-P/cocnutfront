import Modal from "../../../components/Modal";
import React from 'react';
import { Text, TouchableOpacity, View, Alert, StyleSheet } from 'react-native';
import { Color } from "../../../helper/Color";
import { verticalScale } from "../../../components/Metrics";
import QuantityButton from "../../../components/Quantity/index";

const AddTransferModal = ({ toggle,isSubmit, modalVisible, ConfirmationAction, quantity, quantityOnChange, title, confirmButtonLabel }) => {

    const modalHeader = (
        <View style={styles.modalHeader}>
            <Text style={styles.title}>Update Quantity</Text>
            <View style={styles.divider}></View>
        </View>
    )

    const modalBody = (
        <View style={styles.modalBody}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <QuantityButton quantity={quantity} quantityOnChange={quantityOnChange} />
            </View>
        </View>
    )


    return (
        <>
            <Modal
                title={title}
                modalHeader={modalHeader}
                modalBody={modalBody}
                toggle={toggle}
                modalVisible={modalVisible}
                button1Label={confirmButtonLabel}
                button1Press={ConfirmationAction}
                isSubmit = {isSubmit}
            />
        </>
    )
}

export default AddTransferModal;


const styles = StyleSheet.create({
    modalHeader: {
        width: 300
    },
    title: {
        fontWeight: "bold",
        fontSize: 20,
        padding: 15,
        color: Color.BLACK
    },
    divider: {
        width: "100%",
        height: 1,
        backgroundColor: "lightgray"
    },
    modalBody: {
        backgroundColor: "#fff",
        paddingVertical: 20,
        paddingHorizontal: 10
    },
    modalFooter: {
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
        height: verticalScale(40),
        backgroundColor: "#fff"
    },
    actions: {
        borderRadius: 5,
        marginHorizontal: 10,
        paddingVertical: 10,
        paddingHorizontal: 20
    },
    actionText: {
        color: "#fff"

    }
});