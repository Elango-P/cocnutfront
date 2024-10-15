import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Layout from "../../components/Layout";
import Refresh from "../../components/Refresh";
import Tab from "../../components/Tab";
import Permission from "../../helper/Permission";
import styles from "../../helper/Styles";
import TabName from "../../helper/Tab";
import asyncStorageService from "../../services/AsyncStorageService";
import BrandList from "./components/BrandList";
import CategoryList from "./components/CategoryList";
import ProductList from "./components/ProductList";
import PermissionService from "../../services/PermissionService";

const BrandAndCategoryList = (props) => {
  let { route } = props;

  const [activeTab, setActiveTab] = useState(
    (route && route.params && route.params.activeTab) || TabName.BRAND
  );
  const [refreshing, setRefreshing] = useState(false);
  const isFocused = useIsFocused();
  const [addPermission, setAddPermission] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    if (isFocused) {
      let mount = true;
      mount && getPermission();
      return () => {
        mount = false;
      };
    }
  }, [isFocused, refreshing, props]);

  const getPermission = async () => {
    let manageOther = await PermissionService.hasPermission(Permission.PRODUCT_ADD);
    setAddPermission(manageOther);
  };

  const AddNew = () => {
    navigation.navigate("Products/Add");
  };

  const closeDrawer = () => {
    setOpenFilter(!openFilter);
  };

  return (
    <>
      <Layout
        title={"Products"}
        refreshing={refreshing}
        showBackIcon={false}
        showFilter={activeTab === TabName.PRODUCTS ? true : false}
        addButton={activeTab === TabName.PRODUCTS && addPermission ?  true : false}
        buttonOnPress={AddNew}
        onFilterPress={closeDrawer}>
        <View style={styles.tabBar}>
          <Tab
            title={[
              {
                title: TabName.BRAND,
                tabName: TabName.BRAND
              },
              {
                title: TabName.CATEGORY,
                tabName: TabName.CATEGORY
              },
              {
                title: TabName.PRODUCTS,
                tabName: TabName.PRODUCTS
              }
            ]}
            setActiveTab={setActiveTab}
            defaultTab={activeTab}
          />
        </View>
        {activeTab === TabName.BRAND && <BrandList activeTab={activeTab} setRefreshing= {setRefreshing} refreshing={refreshing}/>}
        {activeTab === TabName.CATEGORY && (
          <CategoryList activeTab={activeTab} setRefreshing= {setRefreshing} refreshing={refreshing}/>
        )}
        {activeTab === TabName.PRODUCTS && (
          <ProductList
            closeDrawer={closeDrawer}
            openFilter={openFilter}
            activeTab={activeTab}
          />
        )}
      </Layout>
    </>
  );
};
export default BrandAndCategoryList;
