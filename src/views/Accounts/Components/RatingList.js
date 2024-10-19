import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { SwipeListView } from "react-native-swipe-list-view";
import NoRecordFound from "../../../components/NoRecordFound";
import styles from "../../../helper/Styles";
import Refresh from "../../../components/Refresh";
import ShowMore from "../../../components/ShowMore";
import { TouchableOpacity, View } from "react-native";
import AlternativeColor from "../../../components/AlternativeBackground";
import { Text } from "react-native";
import RatingService from "../../../services/RatingService";

const RatingList = (props) => {
  const { AccountId } = props;

  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ratingList, setRatingList] = useState([]);
  const [HasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getAccountRatingDetails();
  }, [isFocused]);

  const getAccountRatingDetails = async () => {
    ratingList && ratingList.length == 0 && setIsLoading(true);
    await RatingService.search({ page: page, account_id: AccountId }, (res) => {
      if (res) {
        setRatingList(res);
        setIsLoading(false);
        setRefreshing(false);
      }
    });
  };

  const LoadMoreList = async (values) => {
    try {
      setIsLoading(true);

      let params = { page: page + 1 };

      await RatingService.search(params, (res) => {
        setRatingList((prevTitles) => {
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
        <TouchableOpacity style={[styles.listContainer, containerStyle]} >
        <View style={{ flex: 1, marginLeft: 0, padding: 0 }}>
            <View style={{ marginLeft: 3 }}>
                {item.rating_tag_name && <Text><Text style={[styles.font,{fontSize:12}]}>Type:</Text> {item.rating_tag_name}</Text>}
                {item.rating && <Text><Text style={[styles.font,{fontSize:12}]}>Rating:</Text>{item.rating}</Text>}
                {item.comment && <Text><Text style={[styles.font,{fontSize:12}]}>Comment:</Text>{item.comment}</Text>}
            </View>
        </View>
    </TouchableOpacity>
    )
  };

  return (
    <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
      <View style={styles.container}>
        {ratingList && ratingList.length > 0 ? (
          <>
            <SwipeListView
              data={ratingList}
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
          List={ratingList}
          isFetching={isLoading}
          HasMore={HasMore}
          onPress={LoadMoreList}
        />
      </View>
    </Refresh>
  );
};

export default RatingList;
