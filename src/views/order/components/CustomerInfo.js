import React from "react";
import { Text, View, Linking, StyleSheet } from "react-native";
import PhoneNumberText from "../../../components/PhoneNumberText";
import Button from "../../../components/Button";
import VerticalSpace10 from "../../../components/VerticleSpace10";
import { useForm } from "react-hook-form";
import { Card } from "react-native-paper";
import { Color } from "../../../helper/Color";
import { ScrollView } from "react-native";

const CustomerInfo = (props) => {
  const { accountList, param } = props;
  const openGoogleMaps = (item) => {
    Linking.canOpenURL("https://maps.google.com").then((supported) => {
      if (supported) {
        const url = `https://maps.google.com/maps?q=${item.latitude},${item.longitude}`;
        Linking.openURL(url);
      } else {
        console.error("Google Maps is not installed.");
      }
    });
  };
  const {
    control,
    formState: { errors },
  } = useForm({});

  return (
    <ScrollView>
    <View style={styles.container}>
      {accountList &&
        accountList.length > 0 &&
        accountList.map((item, index) => (
          <Card key={index} style={styles.card}>
            {item?.name && (
              <View style={styles.header}>
                <Text style={styles.headerText}>Customer Information</Text>
              </View>
            )}
            <View style={styles.cardContent}>
              {item?.name && (
                <>
                  <Text style={styles.text}>Name: {item?.name}</Text>
                  <VerticalSpace10 />
                </>
              )}
              {item?.phone_number && (
                <>
                  <View style={styles.direction}>
                    <Text style={styles.text}>Mobile Number:</Text>
                    <PhoneNumberText
                      phoneNumber={item.phone_number}
                      onPress={() => {
                        Linking.openURL(`tel:${item.phone_number}`);
                      }}
                    />
                  </View>
                  <VerticalSpace10 />
                </>
              )}
              {item?.address1 && (
                <>
                  <Text style={styles.text}>Address: {item?.address1}</Text>
                  <VerticalSpace10 />
                </>
              )}
              {item?.longitude && item.latitude && (
                <>
                  <VerticalSpace10 />
                  <Button
                    title="Get Direction"
                    onPress={() => openGoogleMaps(item)}
                  />
                </>
              )}
            </View>
          </Card>
        ))}
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 2,
    backgroundColor: "#f5f5f5",
  },
  card: {
    marginBottom: 15,
    borderWidth: 0.5,
    borderColor: Color.ACTIVE,
    borderRadius: 10,
    padding: 15,
    backgroundColor: Color.WHITE,
    elevation: 3,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: Color.ACTIVE,
    paddingBottom: 10,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: Color.PRIMARY,
  },
  cardContent: {
    padding: 5,
  },
  text: {
    fontSize: 16,
    color: "#333",
  },
  direction: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default CustomerInfo;
