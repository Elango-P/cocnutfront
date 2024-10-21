import { useIsFocused, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Keyboard, View } from "react-native";
import NoRecordFound from "../../../components/NoRecordFound";
import Refresh from "../../../components/Refresh";
import SearchBar from "../../../components/SearchBar";
import ShowMore from "../../../components/ShowMore";
import Spinner from "../../../components/Spinner";
import Status from "../../../helper/Status";
import categoryService from "../../../services/CategoryService";
import ListCard from "../components/ListCard";

const CategoryList = (props) => {
  let { activeTab,refreshing,setRefreshing } = props;
  const [categoryList, setCatgoryList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(2);
  const [isFetching, setIsFetching] = useState(false);
  const [HasMore, setHasMore] = useState(true);
  const [searchPhrase, setSearchPhrase] = useState("");
  const [clicked, setClicked] = useState(false);
  const isFocused = useIsFocused();

  const navigation = useNavigation();
     
  useEffect(() => {
    getCategoryList({search : searchPhrase});
  }, [isFocused]);
  useEffect(() => {
    if(refreshing){      
      getCategoryList({search : searchPhrase});
    }
  }, [refreshing]);

  const getCategoryList = async (values) => {
    categoryList && categoryList.length == 0 && setIsLoading(true);
    await categoryService.search({ status: Status.ACTIVE_TEXT,search : values ? values?.search : "" }, (response) => {
      setCatgoryList(response);
      setIsLoading(false);
    });
  };

  const handleChange = async (search) => {
    getCategoryList({search : search})
  };

  const LoadMoreList = async () => {
    try {
      setIsFetching(true);

      let params = { page: page, status: Status.ACTIVE_TEXT };

      await categoryService.search(params, (response) => {
        let category = response;

        // Set response in state
        setCatgoryList((prevTitles) => {
          return [...new Set([...prevTitles, ...category])];
        });
        setPage((prevPageNumber) => prevPageNumber + 1);
        setHasMore(category.length > 0);
        setIsFetching(false);
      });
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
     <SearchBar
          searchPhrase={searchPhrase}
          setSearchPhrase={setSearchPhrase}
          setClicked={setClicked}
          clicked={clicked}
          onPress={getCategoryList}
          handleChange={handleChange}
          noScanner
        />
      <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
       

        <View>
          <>
            {categoryList && categoryList.length > 0 ? (
              categoryList.map((category, index) => {
                return (
                  <ListCard
                    name={category.name}
                    index={index}
                    onPress={() => {
                      navigation.navigate("Products", {
                        categoryId: category?.id,
                      });
                    }}
                  />
                );
              })
            ) : (
              <NoRecordFound iconName={"receipt"} />
            )}
            <ShowMore
              List={categoryList}
              isFetching={isFetching}
              HasMore={HasMore}
              onPress={LoadMoreList}
            />
          </>
        </View>
      </Refresh>
    </>
  );
};
export default CategoryList;
