import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { SwipeListView } from "react-native-swipe-list-view";
import NoRecordFound from "../../../components/NoRecordFound";
import styles from "../../../helper/Styles";
import Refresh from "../../../components/Refresh";
import ShowMore from "../../../components/ShowMore";
import { View } from "react-native";
import BillCard from "../../Bills/component/BillCard";
import billService from "../../../services/BillService";

const BillList = (props) => {
  const { AccountId } = props;

  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [billList, setBillList] = useState([]);
  const [HasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getAccountBillDetails();
  }, [isFocused]);

  const getAccountBillDetails = async () => {
    billList && billList.length == 0 && setIsLoading(true);
    await billService.search({ page: page, account: AccountId }, (res) => {
      if (res) {
        setBillList(res.data);
        setIsLoading(false);
        setRefreshing(false);
      }
    });
  };

  const LoadMoreList = async (values) => {
    try {
      setIsLoading(true);

      let params = { page: page + 1 };

      await billService.search(params, (res) => {
        setBillList((prevTitles) => {
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
    return (
      <View style={styles.container}>
        <BillCard
          billNumber={item.bill_number}
          accountName={item.account_name}
          amount={item.netAmount}
          date={item.bill_date}
          status={item.status}
          statusColor={item.colorCode}
          index={index}
        />
      </View>
    );
  };

  return (
    <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
      <View style={styles.container}>
        {billList && billList.length > 0 ? (
          <>
            <SwipeListView
              data={billList}
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
          List={billList}
          isFetching={isLoading}
          HasMore={HasMore}
          onPress={LoadMoreList}
        />
      </View>
    </Refresh>
  );
};

export default BillList;
