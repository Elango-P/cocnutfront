import Layout from "../../components/Layout";
import Refresh from "../../components/Refresh";
import ShowMore from "../../components/ShowMore";
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";

import DateTime from "../../lib/DateTime";
import { ProductModel } from "../../components/ProductModel";
import NoRecordFound from "../../components/NoRecordFound";
import styles from "../../helper/Styles";
import purchaseRecommendedProductService from "../../services/purchaseRecommendedProductService";
import Table from "./table";
import { StoreProductModel } from "./StoreProductModel";
import FilterDrawer from "../../components/Filter";
import brandService from "../../services/BrandService";
import accountService from "../../services/AccountService"

const PurchaseRecommendationReport = (props) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openFilter, setOpenFilter] = useState(false);
  const [values, setValues] = useState("");
  const [selectedValues, setSelectedValues] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [brandList, setBrandList] = useState([]);
  const [accountList, setAccountList] = useState();


  useEffect(() => {
    getOrderReport(values);
    getBrandList();
    getAccountList()

  }, []);
  useEffect(()=>{
    if(refreshing){
      getOrderReport(values);
    }
  },[refreshing])
  const closeDrawer = () => {
    setOpenFilter(!openFilter);
  };
  const brandOnSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        brand: value
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        brand: ""
      }));
    }
  };
  const accountOnSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        account: value
      }));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        account: ""
      }));
    }
  };
  const onDateSelect = (value) => {
    if (value) {
      setValues((prevValues) => ({
        ...prevValues,
        date: new Date(value)
      }));
      setSelectedDate(new Date(value));
    } else {
      setValues((prevValues) => ({
        ...prevValues,
        date: ""
      }));
      setSelectedDate("");
    }
  }

  const getOrderReport = async (values) => {
    setSelectedValues(values)

    try {
    if(values?.brand || values?.account ||values?.date ){
      data && data.length == 0 && setIsLoading(true);

      let params = {};

      if (values?.brand) {
        params.brand = values?.brand;
      }
      if (values?.account) {
        params.account = values?.account;
      }
      if (values?.date) {
        params.date = values?.date;
      }

      await purchaseRecommendedProductService.search(params, (response) => {
        let data = response?.data?.data;
        setData(data);
        setIsLoading(false);
        setRefreshing(false);
      });
    }
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };
  const getBrandList = ()=>{
            brandService.getBrandList(setBrandList);

        }
        const getAccountList = ()=>{
                  accountService.GetList((callback) => { setAccountList(callback) });
      
              }

  const handleSubmit = () => {
    getOrderReport(values);
    closeDrawer();
  };

  const openModal = (product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  return (
    <Layout
      title="Purchase Recommended Product Report"
      isLoading={isLoading}
      refreshing={refreshing}
      showBackIcon={true}
      showFilter={true}
      onFilterPress={closeDrawer}>
      <FilterDrawer
        values={values}
        isOpen={openFilter}
        closeDrawer={closeDrawer}
        brandOnSelect={brandOnSelect}
        accountOnSelect={accountOnSelect}
        handleSubmit={handleSubmit}
        setValues={setValues}
        onDateSelect={onDateSelect}
        selectedDate={selectedDate}
        accountList={accountList}
        brandList={brandList}
        showAccount
        showBrand
        showOnDate
      />
      <View>
      {selectedValues?.account > 0 || selectedValues?.brand > 0 || selectedValues?.date ?(
      <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
        <View style={styles.container}>
          {data && data.length > 0 ? (
            <Table data={data} openModal={openModal} />
          ) : (
            <NoRecordFound
              styles={{ paddingVertical: 250, alignItems: "center" }}
              iconName="box-open"
            />
          )}
        </View>

      </Refresh>
  ):(<NoRecordFound
    styles={{ paddingVertical: 250, alignItems: "center" }}
    iconName="box-open"
    message ="Please select Account"
  />
  )}
          </View>
          <StoreProductModel
        selectedProduct={selectedProduct}
        closeModal={closeModal}
        data={data}
      />
    </Layout>
  );
};

export default PurchaseRecommendationReport;
