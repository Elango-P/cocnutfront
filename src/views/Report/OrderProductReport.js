import Layout from "../../components/Layout";
import Refresh from "../../components/Refresh";
import ShowMore from "../../components/ShowMore";
import React, { useEffect, useState } from "react";

import { View } from "react-native";
import OrderProductReportService from "../../services/orderProductReportService";
import DateTime from "../../lib/DateTime";
import ProductCard from "../../components/ProductCard";
import { ProductModel } from "../../components/ProductModel";
import NoRecordFound from "../../components/NoRecordFound";
import styles from "../../helper/Styles";
import FilterDrawer from "../../components/Filter";
import storeService from "../../services/StoreService";
import categoryService from "../../services/CategoryService";
import brandService from "../../services/BrandService";
import accountService from "../../services/AccountService";
import CurrencyFormat from "../../lib/Currency";
import { Text } from "react-native";
import AlternativeColor from "../../components/AlternativeBackground";
import Currency from "../../lib/Currency";
import Status from "../../helper/Status";

const OrderProductReport = (props) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [HasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(2);
  const [isFetching, setIsFetching] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openFilter, setOpenFilter] = useState(false);
  const [values, setValues] = useState({ startDate:new Date(),
    endDate:new Date()});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());
  const [categoryList, setCatgoryList] = useState([]);
  const [brandList, setBrandList] = useState([]);
 const [locationList, setLocationList] = useState([]);
 const [accountList, setAccountList] = useState([]);
 const [totalAmount,setTotalAmount] = useState([]);



  useEffect(() => {
    getOrderReport(values);
    getStoreList();
    getCategoryList();
    getBrandList();
    getAccountList();
  }, []);
  useEffect(()=>{
    if(refreshing){
      getOrderReport(values);

    }

  },[refreshing])

   const getStoreList = ()=>{
        storeService.list({},(error, response) => {
            const storeListOption = new Array();
            let storeList = response?.data?.data;
            if (storeList && storeList.length > 0) {
                for (let i = 0; i < storeList.length; i++) {
                    storeListOption.push({
                        label: storeList[i].name,
                        value: storeList[i].id,
                    });
                }

                setLocationList(storeListOption);
            }

        });
    }
    const getCategoryList = ()=>{
      categoryService.getCategoryList(setCatgoryList);

  }
  const getBrandList = ()=>{
      brandService.getBrandList(setBrandList);

  }
  const getAccountList = ()=>{
    accountService.GetList(null,(callback) => { setAccountList(callback) });

}

  const closeDrawer = () => {
    setOpenFilter(!openFilter);
  };
  const brandOnSelect = (value) => {
    try {
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
    } catch (err) {
      console.log(err);
    }
  };
  const categoryOnSelect = (value) => {
    try {
      if (value) {
        setValues((prevValues) => ({
          ...prevValues,
          category: value
        }));
      } else {
        setValues((prevValues) => ({
          ...prevValues,
          category: ""
        }));
      }
    } catch (err) {
      console.log(err);
    }

  };
  const accountOnSelect = (value) => {
    try {
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
    } catch (err) {
      console.log(err);
    }
  }

  const locationOnSelect = (value) => {
    try {
      if (value) {
        setValues((prevValues) => ({
          ...prevValues,
          location: value
        }));
      } else {
        setValues((prevValues) => ({
          ...prevValues,
          location: ""
        }));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const onDateSelect = (value) => {
    try {
      if (value) {
        setValues((prevValues) => ({
          ...prevValues,
          startDate: new Date(value)
        }));
        setSelectedDate(new Date(value));
      } else {
        setValues((prevValues) => ({
          ...prevValues,
          startDate: ""
        }));
        setSelectedDate("");
      }
    } catch (err) {
      console.log(err);
    }
  }

  const onEndDateSelect = (value) => {
    try {
      if (value) {
        setValues((prevValues) => ({
          ...prevValues,
          endDate: new Date(value)
        }));
        setSelectedEndDate(new Date(value));
      } else {
        setValues((prevValues) => ({
          ...prevValues,
          endDate: ""
        }));
        setSelectedEndDate("");
      }
    } catch (err) {
      console.log(err);
    }
  }

  const getOrderReport = async (values) => {
    try {
      data && data.length == 0 && setIsLoading(true);

      let params = { page: 1 };

      if (values && values.account) {
        params.account = values.account;
      }

      if (values && values.location) {
        params.location = values.location;
      }

      if (values && values.brand) {
        params.brand = values.brand;
      }

      if (values && values.category) {
        params.category = values.category;
      }

      if (values && values.startDate) {
        params.startDate = DateTime.formatDate(values.startDate);
      }

      if (values && values.endDate) {
        params.endDate = DateTime.formatDate(values.endDate);
      }

      await OrderProductReportService.search(params, (response) => {
        let data = response && response.data && response.data.data;
        let totalAmount = response && response.data && response.data.totalAmount;

        setData(data);
        setTotalAmount(totalAmount);
        setIsLoading(false);
        setRefreshing(false)
      });
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };


  const LoadMoreList = async () => {
    try {
      setIsFetching(true);


      let params = { page: page }

      if (values && values.location) {
        params.location = values.location
      }
      if (values && values.account) {
        params.account = values.account
      }

      if (values && values.brand) {
        params.brand = values.brand
      }
      if (values && values.category) {
        params.category = values.category
      }
      if (values && values.startDate) {
        params.startDate = DateTime.formatDate(values.startDate)
      }
      if (values && values.endDate) {
        params.endDate = DateTime.formatDate(values.endDate)
      }
      OrderProductReportService.search(params, (response) => {
        if (response) {
          let products = response;
          setData((prevTitles) => {
            return [...new Set([...prevTitles, ...products?.data?.data])];
          });
          setPage((prevPageNumber) => prevPageNumber + 1);
          setHasMore(data.length > 0);
          setIsFetching(false);
          setRefreshing(false);
          setIsLoading(false);
        }
      });
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    getOrderReport(values)
    closeDrawer()
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setIsModalVisible(false);
  };
  return (
    <Layout
      title="Order Product Report"
      isLoading={isLoading}
      refreshing={refreshing}
      showBackIcon={true}
      showFilter={true}
      onFilterPress={closeDrawer}
      FooterContent={data && data.length > 0 ? <View style={styles.align}>
      <Text
        style={styles.letter}
      >
        Total Amount :
        <Text style={styles.letterColor}>
            {Currency.getFormatted(Currency.GetWithNoDecimal(totalAmount))}
        </Text>
       </Text>
      
    </View> : ""}
    >
      <FilterDrawer
        values={values}
        isOpen={openFilter}
        closeDrawer={closeDrawer}
        locationOnSelect={locationOnSelect}
        brandOnSelect={brandOnSelect}
        categoryOnSelect={categoryOnSelect}
        accountOnSelect={accountOnSelect}
        onDateSelect={onDateSelect}
        onEndDateSelect={onEndDateSelect}
        selectedDate={selectedDate}
        selectedEndDate={selectedEndDate}
        locationList={locationList}
        categoryList={categoryList}
        brandList={brandList}
        accountList={accountList}
        showBrand
        showDate
        showLocation
        showCategory
        showAccount
        handleSubmit={handleSubmit}
        setValues={setValues}
      />
      <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
        <View style={styles.container}>
          {data && data.length > 0 ? (
            data.map((data, index) => {
              const containerStyle = AlternativeColor.getBackgroundColor(index);

              return (
                <ProductCard
                  size={data.size}
                  unit={data.unit}
                  name={data?.product_name}
                  image={data.featured_media_url}
                  brand={data.brand_name}
                  sale_price={data.sale_price}
                  mrp={data.mrp}
                  pack_size={data.pack_size}
                  noIcon
                  orderProduct
                  quantity={data.quantity}
                  status ={data.status == Status.INACTIVE ? Status.INACTIVE_TEXT : ""}
                  QuantityField
                  amount = {data.price}
                  amountField
                  item={data}
                  onPress={openModal}
                  alternative={containerStyle}

                />
              );
            })
          ) : (
            <NoRecordFound
              styles={{ paddingVertical: 250, alignItems: "center" }}
              iconName="box-open"
            />
          )}
        </View>

        <ShowMore
          List={data}
          isFetching={isFetching}
          HasMore={HasMore}
          onPress={LoadMoreList}
        />
      </Refresh>
      <ProductModel image={selectedProduct?.featured_media_url} selectedProduct={selectedProduct} closeModal={closeModal} />
    </Layout>
  );
};

export default OrderProductReport;
