// Import React and Component
import React, { useState, useEffect, useCallback } from "react";
import {
    StyleSheet,
    View,
    Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Layout from "../../components/Layout";
import { useIsFocused } from "@react-navigation/native";
import Refresh from "../../components/Refresh";
import ShowMore from "../../components/ShowMore";
import orderService from "../../services/OrderService";
import AlternativeColor from "../../components/AlternativeBackground";
import styles from "../../helper/Styles";
import ProductCard from "../../components/ProductCard";
import NoRecordFound from "../../components/NoRecordFound";


const OrderProducts = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchPhrase, setSearchPhrase] = useState("");
    const [clicked, setClicked] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [orderProduct, setOrderProduct] = useState([]);

    const [page, setPage] = useState(2);
    const [HasMore, setHasMore] = useState(true);
    const isFocused = useIsFocused();

    const navigation = useNavigation();

    useEffect(() => {
        let mount = true;
    
        mount && getProductList()
        //cleanup function
        return () => {
            mount = false;
        };
    }, [isFocused, refreshing]);

    const getProductList = async () => {
        try {
            setSearchPhrase("");
            setClicked(false);
            Keyboard.dismiss();
            setPage(2);
            setHasMore("0");
            searchPhrase == "" && !refreshing && setIsLoading(true);

            await orderService.getOrderProducts({sort : "id" , sortDir : "DESC"}, (error, orderProduct,totalAmount,quantity) => {
                setOrderProduct(orderProduct);
                setIsLoading(false)
                
            })
        } catch (err) {
            console.log(err);
            setIsLoading(false);
        }
    };


   


  

    const orderProductList = async () =>{
        try{
          setIsFetching(true);
          let param = {page:page,sort : "id" , sortDir : "DESC"}
          await orderService.getOrderProducts(param, (error, orderProduct,totalAmount,quantity) => {
            let orders = orderProduct;
        
            // Set response in state
            setOrderProduct((prevTitles) => {
              return [...new Set([...prevTitles, ...orders])];
            });
            setPage((prevPageNumber) => prevPageNumber + 1);
            setHasMore(orders.length > 0);
            setIsFetching(false);
          });
        } catch (err) {
          console.log(err);
          setIsLoading(false);
        }
        };


    return (
        <Layout
            title={"Order Products"}
            isLoading={isLoading}
            refreshing={refreshing}
            showBackIcon={false}

        >
            <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
               
            <View style={styles.container}>
          {orderProduct && orderProduct.length > 0 ? (
            orderProduct.map((item, index) => {
              const containerStyle = AlternativeColor.getBackgroundColor(index);
              return (
                <ProductCard
                 item={item}
                image={item.image ? item.image : item.featured_media_url}
                name={item.name}
                sale_price={item.sale_price}
                mrp={item.mrp}
                size={item.size}
                unit={item.unit}
                createdAt={item.createdAt}
                quantity={item.quantity}
                status={item.status}
                amount = {item.amount}
                brand={item.brand ? item.brand : item.brand_name}
                orderDate =  {item.orderDate}
                orderNumber ={item.order_number}
                locationName = {item.locationName}
                QuantityField
                amountField
                noIcon
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
           <ShowMore List={orderProduct} isFetching={isFetching} HasMore={HasMore} onPress={orderProductList} />

        </View>





            </Refresh>
        </Layout>
    );
};

export default OrderProducts;


