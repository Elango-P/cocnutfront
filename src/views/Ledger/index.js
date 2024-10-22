import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Layout from "../../components/Layout";

const LedgerEntries = () => {
  const [entries, setEntries] = useState([
    {
      id: 1,
      account_id: "ACC123",
      description: "Initial deposit",
      debit: 0,
      credit: 1000,
      balance: 1000,
      transaction_date: "2024-01-01",
    },
    {
      id: 2,
      account_id: "ACC124",
      description: "Purchase of office supplies",
      debit: 200,
      credit: 0,
      balance: 800,
      transaction_date: "2024-01-02",
    },
    {
      id: 3,
      account_id: "ACC125",
      description: "Payment received",
      debit: 0,
      credit: 500,
      balance: 1300,
      transaction_date: "2024-01-03",
    },
    {
      id: 4,
      account_id: "ACC126",
      description: "Monthly subscription fee",
      debit: 50,
      credit: 0,
      balance: 1250,
      transaction_date: "2024-01-04",
    },
    {
      id: 5,
      account_id: "ACC127",
      description: "Refund issued",
      debit: 100,
      credit: 0,
      balance: 1150,
      transaction_date: "2024-01-05",
    },
  ]);

  return (
    <Layout title="Ledger" showBackIcon={true} backButtonNavigationUrl= "Dashboard">
      <ScrollView horizontal>
        <View style={styles.container}>
          <Text style={styles.title}>Ledger Entries</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderCell}>ID</Text>
              <Text style={styles.tableHeaderCell}>Vendor</Text>
              <Text style={styles.tableHeaderCell}>Description</Text>
              <Text style={styles.tableHeaderCell}>Debit</Text>
              <Text style={styles.tableHeaderCell}>Credit</Text>
              <Text style={styles.tableHeaderCell}>Balance</Text>
              <Text style={styles.tableHeaderCell}>Transaction Date</Text>
            </View>
            {entries.map((entry) => (
              <View
                key={entry.id}
                style={[
                  styles.tableRow,
                  entry.balance < 1000 && styles.lowBalance,
                ]}
              >
                <Text style={styles.tableCell}>{entry.id}</Text>
                <Text style={styles.tableCell}>{entry.account_id}</Text>
                <Text style={styles.tableCell}>{entry.description}</Text>
                <Text style={styles.tableCell}>{entry.debit}</Text>
                <Text style={styles.tableCell}>{entry.credit}</Text>
                <Text style={styles.tableCell}>{entry.balance}</Text>
                <Text style={styles.tableCell}>{entry.transaction_date}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "start",
    color: "green",
    
  },
  table: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
    width: 800, // Set a width greater than the screen for scrolling
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#007bff",
    padding: 10,
  },
  tableHeaderCell: {
    flex: 1,
    padding: 8,
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tableCell: {
    flex: 1,
    padding: 8,
    textAlign: "center",
  },
  lowBalance: {
    backgroundColor: "#ffe6e6", // Light red background for low balance
  },
});

export default LedgerEntries;
