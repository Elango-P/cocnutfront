// Import React and Component
import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import Permission from "../../helper/Permission";
import AsyncStorageService from "../../services/AsyncStorageService";
import ProductList from "./components/ProductList";
import PermissionService from "../../services/PermissionService";

const Products = (props) => {
  let brandId =
    props && props.route && props.route.params && props.route.params.brandId;
  let categoryId =
    props && props.route && props.route.params && props.route.params.categoryId;

  const [refreshing, setRefreshing] = useState(false);
  //search
  const [isLoading, setIsLoading] = useState(false);
  const isFocused = useIsFocused();
  const [addPermission, setAddPermission] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);

  //render first time
  useEffect(() => {
    if (isFocused) {
      let mount = true;
      mount && getPermission();
      return () => {
        mount = false;
      };
    }
  }, [isFocused, refreshing, props]);

  const navigation = useNavigation();

  const AddNew = () => {
    navigation.navigate("Products/Add");
  };

  const getPermission = async () => {
    let manageOther = await PermissionService.hasPermission(Permission.PRODUCT_ADD);
    setAddPermission(manageOther);
  };

  const closeDrawer = () => {
    setOpenFilter(!openFilter);
  };

  return (
    <Layout
      title={"Products"}
      addButton ={!addPermission ? true : false}
      buttonOnPress={AddNew}
      isLoading={isLoading}
      refreshing={refreshing}
      showFilter={true}
      showBackIcon={true}
      onFilterPress={closeDrawer}>
        
      <ProductList
        brandId={brandId}
        categoryId={categoryId}
        setIsLoading={setIsLoading}
        closeDrawer={closeDrawer}
        openFilter={openFilter}
      />
    </Layout>
  );
};

export default Products;
