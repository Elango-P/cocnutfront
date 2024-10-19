import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { SwipeListView } from "react-native-swipe-list-view";
import NoRecordFound from "../../../components/NoRecordFound";
import styles from "../../../helper/Styles";
import Refresh from "../../../components/Refresh";
import ShowMore from "../../../components/ShowMore";
import { View } from "react-native";
import PaymentService from "../../../services/PaymentService";
import PaymentCard from "../../Payments/PaymentCard";
import AlternativeColor from "../../../components/AlternativeBackground";

const PaymentList = (props) => {
  const { AccountId } = props;

  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentList, setPaymentList] = useState([]);
  const [HasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getAccountPaymentDetails();
  }, [isFocused]);

  const getAccountPaymentDetails = async () => {
    paymentList && paymentList.length == 0 && setIsLoading(true);
    await PaymentService.search({ page: page, account: AccountId }, (res) => {
      if (res) {
        setPaymentList(res?.data?.data);
        setIsLoading(false);
        setRefreshing(false);
      }
    });
  };

  const LoadMoreList = async (values) => {
    try {
      setIsLoading(true);

      let params = { page: page + 1 };

      await PaymentService.search(params, (res) => {
        setPaymentList((prevTitles) => {
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

    return <PaymentCard item={item} alternative={containerStyle} />;
  };

  return (
    <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
      <View style={styles.container}>
        {paymentList && paymentList.length > 0 ? (
          <>
            <SwipeListView
              data={paymentList}
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
          List={paymentList}
          isFetching={isLoading}
          HasMore={HasMore}
          onPress={LoadMoreList}
        />
      </View>
    </Refresh>
  );
};

export default PaymentList;
