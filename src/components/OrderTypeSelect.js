import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AlternativeColor from "./AlternativeBackground";
import Spinner from "./Spinner";
import styles from "../helper/Styles";
import ArrayList from "../lib/ArrayList";
import OrderTypeService from "../services/orderTypeService";
import { Color } from "../helper/Color";

const OrderTypeSelectComponent = ({
  onPress,
  params = {},
  customTypeList,
  showMultiCheckBox,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [typeList, setTypeList] = useState([]);

  const isFocused = useIsFocused();

  useEffect(() => {
    getAttendanceTypeList(true);
  }, [isFocused]);

  useEffect(() => {
    if(customTypeList && customTypeList.length>0){
      setIsLoading(false);
    }
  }, [customTypeList]);

  const getAttendanceTypeList = async (initalLoad) => {
    if (initalLoad) {
      setIsLoading(true);
    }
    let data = await OrderTypeService.list(params);
    setTypeList(data);
  };

  if (isLoading) {
    return <Spinner />;
  }
  return (
    <ScrollView>
      <ListUI
        List={ArrayList.isArray(customTypeList) ? customTypeList : typeList}
        selectProperty={"name"}
        onPress={onPress}
        showMultiCheckBox={showMultiCheckBox}
      />
    </ScrollView>
  );
};

export default OrderTypeSelectComponent;

const ListUI = ({ List, onPress }) => {
  return (
    <>
      <View style={styles.container}>
        <View>
          {List &&
            List.length > 0 &&
            List.map((item, index) => {
              const containerStyle = AlternativeColor.getBackgroundColor(index);

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    onPress(item);
                  }}
                  style={[styles.containers, { height: "auto" }]}
                >
                  <View style={containerStyle}>
                    <View style={style.rowContainer}>
                      {/* Main content area */}
                      <View style={style.textContainer}>
                        <Text style={style.title}>{item.label} </Text>
                      </View>

                      {/* Right side icons (chevron and checkboxes) */}
                      <View style={style.iconContainer}>
                        <MaterialIcons
                          name="chevron-right"
                          size={30}
                          color="gray"
                        />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
        </View>
      </View>
    </>
  );
};

const style = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Color.LIGHT_GRAY,
  },
  itemContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Color.LIGHT_GRAY,
  },
  textContainer: {
    flex: 1, // Allow the text container to take up most space
    paddingRight: 10, // Space between text and icons
  },
  iconContainer: {
    flexDirection: "row", // Align icons in a row if necessary
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: Color.PRIMARY,
  },
  subtext: {
    fontSize: 14,
    color: Color.RED,
  },
  iconTextContainer: {
    flexDirection: "row", // Align icon and text in a row
    alignItems: "center",
    marginTop: 5, // Space between description rows
  },
  icon: {
    marginRight: 8, // Space between icon and text
  },
  itemText: {
    fontSize: 14,
    color: Color.PRIMARY,
  },
  disabledText: {
    fontSize: 14,
    color: Color.LIGHT_GREY1,
  },
});
