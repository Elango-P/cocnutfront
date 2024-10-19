import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { SwipeListView } from "react-native-swipe-list-view";
import NoRecordFound from "../../../components/NoRecordFound";
import styles from "../../../helper/Styles";
import AlternativeColor from "../../../components/AlternativeBackground";
import Refresh from "../../../components/Refresh";
import ShowMore from "../../../components/ShowMore";
import AccountProductService from "../../../services/AccountProductService";
import ProductCard from "../../../components/ProductCard";
import { View } from "react-native";

const AccountProductList = (props) => {
  const { AccountId } = props;

  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accountProductList, setAccountProductList] = useState([]);
  const [HasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getAccountProductDetails();
  }, [isFocused]);

  const getAccountProductDetails = async () => {
    accountProductList && accountProductList.length == 0 && setIsLoading(true);
    await AccountProductService.search(
      { page: page, accountId: AccountId },
      (res) => {
        if (res) {
          setAccountProductList(res);
          setIsLoading(false);
          setRefreshing(false);
        }
      }
    );
  };

  const LoadMoreList = async (values) => {
    try {
      setIsLoading(true);

      let params = { page: page + 1 };

      await AccountProductService.search(params, (res) => {
        setAccountProductList((prevTitles) => {
          return [...new Set([...prevTitles, ...res])];
        });
        setPage((prevPageNumber) => prevPageNumber + 1);
        setHasMore(res.length > 0);
        setIsLoading(false);
        setRefreshing(false);
      });
    } catch (err) {
      console.log(err);
    }
  };

  const renderItem = (data) => {
    let item = data.item;
    let index = data?.index;
    const containerStyle = AlternativeColor.getBackgroundColor(index);

    return (
      <View style={styles.container}>
        <View>
          <ProductCard
            alternative={containerStyle}
            size={item.size}
            unit={item.unit}
            name={item.name}
            image={item.image}
            brand={item.brand_name ? item.brand_name : item?.brand}
            sale_price={item.sale_price}
            mrp={item.mrp}
            id={item.id}
            item={item}
            date={item.createdAt}
            quantity={item.quantity}
            QuantityField
            editable
          />
        </View>
      </View>
    );
  };

  return (
    <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
      <View style={styles.container}>
        {accountProductList && accountProductList.length > 0 ? (
          <>
            <SwipeListView
              data={accountProductList}
              renderItem={renderItem}
              rightOpenValue={-150}
              previewOpenValue={-40}
              previewOpenDelay={3000}
              disableRightSwipe={true}
              closeOnRowOpen={true}
              keyExtractor={(item) => String(item.id)}
            />
          </>
        ) : (
          <NoRecordFound iconName={"receipt"} />
        )}
        <ShowMore
          List={accountProductList}
          isFetching={isLoading}
          HasMore={HasMore}
          onPress={LoadMoreList}
        />
      </View>
    </Refresh>
  );
};

export default AccountProductList;
