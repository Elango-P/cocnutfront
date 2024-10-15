import React, { useEffect, useState, } from "react";
import {
  View,
  Text,
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import ShowMore from "../../components/ShowMore";
import Layout from "../../components/Layout";
import Refresh from "../../components/Refresh";
import AccountService from "../../services/AccountService";
import AlternativeColor from "../../components/AlternativeBackground";
import styles from "../../helper/Styles";
import AccountCard from "../Accounts/Components/AccountCard";
import Status from "../../helper/Status";
import SearchBar from "../../components/SearchBar";
import { Account } from "../../helper/Account";
import { Color } from "../../helper/Color";
import { FontAwesome5 } from "@expo/vector-icons";

const Customers = ()=>{
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const isFocused = useIsFocused();
  const [page, setPage] = useState(2);
  const [HasMore, setHasMore] = useState(true);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [clicked, setClicked] = useState(false);
  const [search, setSearch] = useState(false);
  const [searchParam, setSearchParam] = useState("")
  const [accountList, setAccountList] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {

    let mount = true;

    mount && getCustomerList({search : searchPhrase })

    //cleanup function
    return () => {
      mount = false;
    };

  }, [isFocused])
  useEffect(()=>{
    if(refreshing){
      getCustomerList({search : searchPhrase})
    }
  },[refreshing])

  const getCustomerList = (values) => {
    setPage(2);
    accountList && accountList.length == 0 && setIsLoading(true);
    AccountService.search({page: 1,status: Status.ACTIVE,search : values ? values?.search : "" , accountCategory : Account.TYPE_CUSTOMER},(error,response)=>{
      setAccountList(response && response.data && response.data.data)
      setIsLoading(false)
      setRefreshing(false)
    })
  }
  const handleChange = async (search) => {
    setSearchParam(search)
    getCustomerList({search : search});
  };
  const LoadMoreList = async () => {
    try {
      setIsFetching(true);

      let params = { page: page, search: searchParam ? searchParam : "", status: Status.ACTIVE ,accountCategory : Account.TYPE_CUSTOMER}


      AccountService.search(params, (err,response) => {

        let accounts = response && response?.data && response?.data?.data

        // Set response in state
        setAccountList((prevTitles) => {
          return [...new Set([...prevTitles, ...accounts])];
        });
        setPage((prevPageNumber) => prevPageNumber + 1);
        setHasMore(accounts?.length > 0);
        setIsFetching(false);
      });
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  return(
    <Layout
      title='Customers'
      isLoading={isLoading}
      refreshing={refreshing}
      showBackIcon={false}

    >
      <Refresh refreshing={refreshing} setRefreshing={setRefreshing} >
        <View style={styles.container}>

          <View style={styles.searchBar}>
            <SearchBar
              searchPhrase={searchPhrase}
              setSearchPhrase={setSearchPhrase}
              setClicked={setClicked}
              clicked={clicked}
              setSearch={setSearch}
              onPress={getCustomerList}
              handleChange={handleChange}
              noScanner
            />
          </View>

          {accountList && accountList.length > 0 ? (
            accountList.map((item, index) => {
              const containerStyle = AlternativeColor.getBackgroundColor(index);

              return (
                <AccountCard
                  key={index}
                  accountName={item.vendorName}
                  mobileNumber={item.mobile_number}
                  alternative={containerStyle}
                  onPress={() =>
                    navigation.navigate("AccountForm", {
                      item,
                      redirectionUrl: "Customers",
                    })
                  }
                />
              );
            })
          ) : (
            <View style={{ paddingVertical: 250, alignItems: "center" }}>
              <FontAwesome5 name="receipt" size={20} color={Color.PRIMARY} />
              <Text style={{ fontWeight: "bold" }}>No Records Found</Text>
            </View>
          )}
          
          <ShowMore List={accountList} isFetching={isFetching} HasMore={HasMore} onPress={LoadMoreList} />

        </View>
      </Refresh>
    </Layout>
  )

}
export default Customers;
