import React from "react";
import { View, Text,TouchableOpacity, StyleSheet } from "react-native";
import DateTime from "../../../lib/DateTime";
import Status from "../../../components/Status";
import IdText from "../../../components/IdText";
import DateText from "../../../components/DateText";
import CurrencyText from "../../../components/CurrencyText";
import AlternativeColor from "../../../components/AlternativeBackground";
import StoreText from "../../../components/StoreText";
import UserCard from "../../../components/UserCard"
import styles from "../../../helper/Styles";
import CustomerCard from "../../../components/CustomerCard";
import { PaymentType } from "../../../helper/PaymentType";
import Currency from "../../../lib/Currency";
import Number from "../../../lib/Number";
import { ActivityIndicator } from "react-native";

const OrderCard = (props) => {
  const { order_number, shift,status,customerName,firstName,lastName,mediaUrl, locationName,statusColor, total_amount,payment_type, date, onPress, index,text,data ,statusLoading} = props;

  const containerStyle = AlternativeColor.getBackgroundColor(index)
  return (
    <TouchableOpacity style={[styles.listContainer, containerStyle]} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text>
        <IdText id={order_number} />
        <DateText date={date}/>
        </Text>
        {locationName && (
             <Text>
             <StoreText locationName={locationName} />
              , {shift}
           </Text>
        )}
         {customerName && (
          <CustomerCard 
          text = {payment_type} 
          amount = {total_amount} 
          customerName = {customerName}/>
        )} 
     {!customerName && (
          <Text>
            <CurrencyText amount={total_amount} />
            {payment_type &&
            <Text>
              (
              { payment_type == PaymentType.MIXED ? (
                <>
                
                  Cash:
                  {Currency.getFormatted(Number.Get(data?.cash_amount), true)}{" "}
                  Upi:
                  {Currency.getFormatted(Number.Get(data?.upi_amount), true)}
                </>
              ) : (
                payment_type
              )}
              )
            </Text>
}
          </Text>
        )}
        {firstName  && (
        <UserCard firstName={firstName} lastName={lastName} image ={mediaUrl}/>

        )}

        </View>
        {!statusLoading ? (
        <Status
          status={status} backgroundColor={statusColor}
        />):(
          <ActivityIndicator size="small" color="red"/>
        )}
    </TouchableOpacity>
  );
};

export default OrderCard;

