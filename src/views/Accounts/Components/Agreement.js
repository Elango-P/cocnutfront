import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SwipeListView } from "react-native-swipe-list-view";
import NoRecordFound from "../../../components/NoRecordFound";
import styles from "../../../helper/Styles";
import AlternativeColor from "../../../components/AlternativeBackground";
import AgreementService from "../../../services/AgreementService";
import Refresh from "../../../components/Refresh";
import ShowMore from "../../../components/ShowMore";
import DateText from "../../../components/DateText";

const AgreementList = (props) => {
  const { AccountId } = props;

  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [agreementList, setAgreementList] = useState([]);
  const [HasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);




  useEffect(() => {
    getAgreementDetails();
  }, [isFocused]);

  const getAgreementDetails = async () => {
    agreementList && agreementList.length == 0 && setIsLoading(true);
    await AgreementService.search(
      { page: page, account_id: AccountId },
      (res) => {
        if (res) {
          setAgreementList(res);
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

      await AgreementService.search(params, (res) => {
        setAgreementList((prevTitles) => {
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
    const containerStyle = AlternativeColor.getBackgroundColor(index)

    return (
        <TouchableOpacity style={[styles.listContainer, containerStyle]} >
            <View style={{ flex: 1, marginLeft: 0, padding: 0 }}>
                <View style={{ marginLeft: 3 }}>
                    {item.agreement_number && <Text><Text style={[styles.font,{fontSize:12}]}>Agreement Id:</Text> {item.agreement_number}</Text>}
                    {item.agreement_start_date && <Text><Text style={[styles.font,{fontSize:12}]}>Agreement Start Date:</Text><DateText dateFormat date={(item.agreement_start_date)} /></Text>}
                    {item.agreement_end_date && <Text><Text style={[styles.font,{fontSize:12}]}>Agreement End Date:</Text><DateText dateFormat date={(item.agreement_end_date)} /></Text>}
                    {item.agreement_renewal_date && <Text><Text style={[styles.font,{fontSize:12}]}>Agreement Renewal Date:</Text><DateText dateFormat date={(item.agreement_renewal_date)} /></Text>}
                </View>
            </View>
        </TouchableOpacity>
    );
  };

  return (
    <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
    <View style={styles.container}>
      {agreementList && agreementList.length > 0 ? (
        <SwipeListView
          data={agreementList}
          renderItem={renderItem}
          rightOpenValue={-70}
          previewOpenValue={-40}
          previewOpenDelay={3000}
          disableRightSwipe={false}
          closeOnRowOpen={false}
          disableLeftSwipe={false}
          keyExtractor={(item) => String(item.id)}
        />
      ) : (
        <NoRecordFound iconName={"receipt"} />
      )}
      <ShowMore
        List={agreementList}
        isFetching={isLoading}
        HasMore={HasMore}
        onPress={LoadMoreList}
      />
    </View>
  </Refresh>
  );
};

export default AgreementList;
