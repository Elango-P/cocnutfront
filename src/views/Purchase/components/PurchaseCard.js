import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CurrencyText from "../../../components/CurrencyText";
import DateText from "../../../components/DateText";
import IdText from "../../../components/IdText";
import Status from "../../../components/Status";
import Label from "../../../components/Label";

const PurchaseCard = (props) => {
    const { item, navigation, alternative,statusLoading } = props;

    return (
        <TouchableOpacity activeOpacity={1.2} style={[styles.align, alternative]} onPress={() => {
            navigation.navigate("PurchaseForm", { item })
        }}  >
            <View style={{ flex: 1 }}>
                <Text>
                    <IdText id={item?.purchaseNumber} />
                    <DateText date={item?.purchaseDate} dateFormat />
                </Text>
                <Label text={item.vendorName} bold={true} />
                <CurrencyText amount={item?.net_amount} />
            </View>
            {!statusLoading ? (
        <Status
          status={item?.statusName} backgroundColor={item?.statusColor !== "undefined"?item?.statusColor:"green"}
        />):(
          <ActivityIndicator size="small" color="red"/>
        )}
        </TouchableOpacity>
    );
};

export default PurchaseCard;

const styles = StyleSheet.create({
    align: {
        alignItems: "flex-start",
        paddingBottom: 10,
        paddingTop: 10,
    },
})