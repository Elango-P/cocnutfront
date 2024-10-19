import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import AccountService from "../../services/AccountService";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import purchaseService from "../../services/PurchaseService";
import { MaterialIcons } from "@expo/vector-icons";
import AlternativeColor from "../../components/AlternativeBackground";
import SearchBar from "../../components/SearchBar";
import { Account } from "../../helper/Account";
import { StyleSheet } from "react-native";


const PurchaseAdd = (props) => {
  let locationId = props && props?.route && props?.route?.params && props?.route?.params?.locationId
  const [accountList, setAccountList] = useState();
  const [searchPhrase, setSearchPhrase] = useState("");
  const [clicked, setClicked] = useState(false);
  const [search, setSearch] = useState(false);

  const isFocused = useIsFocused();

  const navigation = useNavigation();

  useEffect(() => {

    let mount = true;

    mount && getAccountList()

    //cleanup function
    return () => {
      mount = false;
    };

  }, [isFocused])

  const getAccountList = () => {
    AccountService.GetList({show_purchase:true},(callback) => { setAccountList(callback) })
  }


  const createPurchase = (storeId, params) => {
    if (storeId) {
      const createData = {
        date: new Date(),
        vendor_name: params.label,
        location: storeId
      };
      purchaseService.createPurchase(createData, (err, res) => {
        if(res && res?.data){
        let purchaseNumber = res?.data?.purchase?.purchase_number
        let location = res?.data?.purchase?.store_id
        let id = res?.data?.purchase?.id;
        navigation.navigate("PurchaseForm", { item:res?.data?.purchase, purchaseNumber: purchaseNumber, isNewPurchase: true })
        }
      })
    }
  }

  const onStoreSelect = (selectedStore, params) => {
    if (selectedStore) {
      createPurchase(selectedStore.id, params);
    }
  }
  const AddPurchase = (values) => {  
      createPurchase(locationId, values);
  }



  const handleSearchChange = async (search) => {
    const params = {
      search: search,
      show_purchase:true
    }
    AccountService.GetList(params, response => {
      setAccountList(response);
    });

  }


  return (
    <Layout
      title={'Select Account'}
      showBackIcon>

      <ScrollView
        keyboardShouldPersistTaps="handled"
      >

        <SearchBar
          searchPhrase={searchPhrase}
          setSearchPhrase={setSearchPhrase}
          setClicked={setClicked}
          clicked={clicked}
          setSearch={setSearch}
          onPress={getAccountList}
          handleChange={handleSearchChange}
          noScanner
        />
        {(
          accountList && accountList.length > 0 &&
          accountList.map((item, index) => {
            const containerStyle = AlternativeColor.getBackgroundColor(index)


            return (
              <TouchableOpacity onPress={(e) => {
                AddPurchase(item)
              }
              } style={[styles.vendorContainer, containerStyle]} >
                <View style={styles.row}>
                  <Text style={styles.vendorText}>{item.label}</Text>
                  <View style={styles.iconContainer}>

                    <MaterialIcons name="chevron-right" size={30} color="gray" />
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>
    </Layout>


  )

}
const styles = StyleSheet.create({
  vendorContainer: {
    height: 60,
    backgroundColor: "#fff",
    borderColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "lightgrey",
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flex: 2,
    alignItems: "center",
  },
  vendorText: {
    fontSize: 16,
    flex: 0.9,
    marginTop: 5,
  },
  iconContainer: {
    flex: 0.1,
    alignItems: "flex-end",
  },
});
export default PurchaseAdd;