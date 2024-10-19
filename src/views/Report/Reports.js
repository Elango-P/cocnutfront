import React, { useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import Layout from "../../components/Layout";
import SideMenuCard from "../../components/SideMenuCard";
import { useNavigation } from "@react-navigation/native";
import styles from "../../helper/Styles";
import { Divider } from "react-native-paper";
import { ScrollView } from "react-native";
import VerticalSpace10 from "../../components/VerticleSpace10";

const CollapsibleSection = ({ title, children }) => {


  return (
    <View>
      <TouchableOpacity >
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.headerText,
            ]}
          >
            {title}
          </Text>
          
        </View>
      </TouchableOpacity>
      {children}
    </View>
  );
};

const Report = () => {
  const navigation = useNavigation();

  
  return (
    <Layout title={"Reports"}   showBackIcon={false}
    >
      <ScrollView>
      <CollapsibleSection title="Attendance Report">
        <Divider />

        <SideMenuCard
       onPress={() => {
        navigation.navigate("AttendanceReport")
    }}
          name={"Attendance Report"}
        />
      </CollapsibleSection>
      <Divider />
     
      <CollapsibleSection title="Order Reports">
        <Divider />
        <SideMenuCard
        onPress={() => {
          navigation.navigate("Reports")
      }}
          name={"Order Report"}
        />
                <Divider />

        <SideMenuCard
        onPress={() => {
          navigation.navigate("OrderProductReport")
      }}
          name={"Order Product Report"}
        />
         <Divider />
        
         <SideMenuCard
        onPress={() => {
          navigation.navigate("OrderSalesSettlementDiscrepancyReport")
      }}
          name={"Order SalesSettlement Discrepancy Report"}
        />
         <Divider />
        <SideMenuCard
        onPress={() => {
          navigation.navigate("OrderSummaryReport")
      }}
          name={"Order Summary Report "}
        />
      </CollapsibleSection>
      <Divider />
      <CollapsibleSection title="Purchase Report">
        <Divider />
        <SideMenuCard
       onPress={() => {
        navigation.navigate("PurchaseRecommendationReport")
    }}
          name={"Purchase Recommendation Report"}
        />
      </CollapsibleSection>
      <CollapsibleSection title="Replenish Report">
        
            <SideMenuCard
       onPress={() => {
        navigation.navigate("ReplenishmentReport")
    }}
          name={" Replenishment Report"}
        />
        <Divider />
      </CollapsibleSection>
      <CollapsibleSection title="Transfer Product Report">
        <Divider />
        <SideMenuCard
       onPress={() => {
        navigation.navigate("TransferProductReportUserWise")
    }}
          name={"Transfer Product Report(User Wise)"}
        />
        <Divider />
      </CollapsibleSection>

      <CollapsibleSection title="Stock Entry Report">
        <Divider />
        <SideMenuCard
       onPress={() => {
        navigation.navigate("StockEntryReport")
    }}
          name={"Stock Entry Report"}
        />
      </CollapsibleSection>
      <VerticalSpace10 />
      </ScrollView>
    </Layout>
  );
};

export default Report;
