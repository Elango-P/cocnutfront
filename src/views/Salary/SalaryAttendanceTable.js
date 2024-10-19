import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import Currency from "../../lib/Currency";
import { Color } from "../../helper/Color";

// Table Component
const SalaryAttendanceTable = ({ data }) => {
  // Group data by type
  const groupedData = data.reduce((acc, item) => {
    const { type } = item;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {});

  const renderTableForType = (type, items) => {
    const totalSalary = items.reduce((sum, item) => sum + (item?.amount || 0), 0);

    return items.length > 0 ? (
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={styles.cellHeader}>Type</Text>
          <Text style={styles.cellHeader}>Amount</Text>
        </View>
        {items.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.cell}>
              {item?.typeName}
              {"\n"}
              <Text>
                ({item?.count}{" "}
                {item?.count > 1 ? "days" : item?.count === 1 ? "day" : ""})
              </Text>
            </Text>
            <View style={styles.amountContainer}>
              <Text style={styles.cell}>
                {Currency.roundOff(item?.amount)}
              </Text>
            </View>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.cellTotal}>Total</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.cellTotal}>
              {Currency.roundOff(totalSalary)}
            </Text>
          </View>
        </View>
      </View>
    ) : (
      <View style={styles.noRecordsContainer}>
        <Text style={styles.noRecordsText}>No records found</Text>
      </View>
    );
  };

  return (
    <ScrollView>
      {/* Working Day Section */}
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Working Day Details</Text>
        </View>
        {renderTableForType("Working Day", groupedData["Working Day"] || [])}
      </View>

      {/* Leave Section */}
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Leave Details</Text>
        </View>
        {renderTableForType("Leave", groupedData["Leave"] || [])}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 5,
    overflow: "hidden",
    top: 5,
  },
  header: {
    backgroundColor: "#6c757d",
    padding: 10,
  },
  headerText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  table: {
    padding: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ced4da",
  },
  cellHeader: {
    flex: 1,
    fontWeight: "bold",
    left: 10,
  },
  cell: {
    flex: 1,
  },
  amountContainer: {
    justifyContent: "center", // Center the amount vertically
    flex: 1,
    left: 10,
  },
  cellTotal: {
    flex: 1,
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ced4da",
    backgroundColor: Color.LIGHT_GREY,
  },
  noRecordsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noRecordsText: {
    color: "red",
    fontWeight: "bold",
  },
});

export default SalaryAttendanceTable;
