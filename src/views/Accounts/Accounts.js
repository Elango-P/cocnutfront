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
import AccountCard from "./Components/AccountCard";
import Status from "../../helper/Status";
import SearchBar from "../../components/SearchBar";
import Permission from "../../helper/Permission";
import PermissionService from "../../services/PermissionService";
import { Color } from "../../helper/Color";
import { FontAwesome5 } from "@expo/vector-icons";

const Accounts = () => {
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
  const [permission, setPermission] = useState({});

  const navigation = useNavigation();

  useEffect(() => {

    let mount = true;

    mount && getVendorList({search : searchPhrase});

    getPermission();

    //cleanup function
    return () => {
      mount = false;
    };

  }, [isFocused])

  useEffect(() => {
    if (refreshing) {
      getVendorList({search : searchPhrase});
    }
  }, [refreshing]);

  const getVendorList = (values) => {
    setPage(2);
    accountList && accountList.length == 0 && setIsLoading(true);
    AccountService.search({page: 1, search : values ? values?.search : "" ,status: Status.ACTIVE},(error,response)=>{
      setAccountList(response && response.data && response.data.data)
      setIsLoading(false)
      setRefreshing(false)
    })
  }

  const getPermission = async () => {
    const accountAdd = await PermissionService.hasPermission(Permission.ACCOUNT_ADD);
    setPermission({ accountAdd: accountAdd })
  }

  const handleChange = async (search) => {
    setSearchParam(search)
    getVendorList({ search: search });
  };
  const LoadMoreList = async () => {
    try {
      setIsFetching(true);

      let params = { page: page, search: searchParam ? searchParam : "", status: Status.ACTIVE }

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

  const AddNew = () => {
    navigation.navigate("AccountAdd");
  };

  return(
    <Layout
      title='Accounts'
      isLoading={isLoading}
      refreshing={refreshing}
      addButton={permission && permission.accountAdd ? true : false}
      buttonOnPress={permission && permission.accountAdd ? AddNew : ""}
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
              onPress={getVendorList}
              handleChange={handleChange}
              noScanner
            />
          </View>

          {accountList && accountList.length > 0 ? (
            accountList.map((item, index) => {
              const containerStyle = AlternativeColor.getBackgroundColor(index);
              return (
                <AccountCard
                  key={item.id}
                  accountName={item.vendorName}
                  alternative={containerStyle}
                  onPress={() => {
                    navigation.navigate("AccountForm", { item });
                  }}
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
export default Accounts;
