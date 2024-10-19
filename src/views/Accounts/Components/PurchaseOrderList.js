import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { SwipeListView } from "react-native-swipe-list-view";
import NoRecordFound from "../../../components/NoRecordFound";
import styles from "../../../helper/Styles";
import AlternativeColor from "../../../components/AlternativeBackground";
import Refresh from "../../../components/Refresh";
import ShowMore from "../../../components/ShowMore";
import { TouchableOpacity, View } from "react-native";
import purchaseOrderService from "../../../services/PurchaseOrderService";
import IdText from "../../../components/IdText";
import DateText from "../../../components/DateText";
import Label from "../../../components/Label";
import CurrencyText from "../../../components/CurrencyText";
import UserCard from "../../../components/UserCard";
import Status from "../../../components/Status";
import { Text } from "react-native";

const PurchaseOrderList = (props) => {
  const { AccountId } = props;

  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [purchaseOrderList, setPurchaseOrderList] = useState([]);
  const [HasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    getPurchaseOrderDetails();
  }, [isFocused]);

  const getPurchaseOrderDetails = async () => {
    purchaseOrderList && purchaseOrderList.length == 0 && setIsLoading(true);
    await purchaseOrderService.search(
      { page: page, account: AccountId },
      (res) => {
        if (res) {
          setPurchaseOrderList(res);
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

      await purchaseOrderService.search(params, (res) => {
        setPurchaseOrderList((prevTitles) => {
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
        <TouchableOpacity activeOpacity={1.2} style={[styles.leadContainer, containerStyle]} >
            <View style={{ flex: 1 }}>
                <Text>
                    <IdText id={item?.purchase_order_number} />
                    <DateText date={item?.date} dateFormat/>
                </Text>

                <Label text={item.vendor_name} bold={true} />

                <CurrencyText amount={item?.amount} />
                <UserCard firstName={item.owner_name} image={item?.image} />

            </View>
            {item?.status && (
                <Status
                    status={item?.status} backgroundColor={item?.statusColor}
                />
            )}
        </TouchableOpacity>
    );
  };

  return (
    <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
      <View style={styles.container}>
        {purchaseOrderList && purchaseOrderList.length > 0 ? (
          <>
            <SwipeListView
              data={purchaseOrderList}
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
          List={purchaseOrderList}
          isFetching={isLoading}
          HasMore={HasMore}
          onPress={LoadMoreList}
        />
      </View>
    </Refresh>
  );
};

export default PurchaseOrderList;
