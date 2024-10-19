import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import addressServices from "../../../services/AddressService";
import ObjectName from "../../../helper/ObjectName";
import { SwipeListView } from "react-native-swipe-list-view";
import NoRecordFound from "../../../components/NoRecordFound";
import styles from "../../../helper/Styles";
import AlternativeColor from "../../../components/AlternativeBackground";

const AddressList = (props) => {
  const { AccountId } = props;

  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [address, setAddress] = useState("");

  useEffect(() => {
    getUserAddress();
  }, [isFocused]);

  const getUserAddress = async () => {
    addressServices.searchAddress(
      { object_name: ObjectName.VENDOR, object_id: AccountId },
      (err, response) => {
        if (
          response &&
          response.data &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          setAddress(response.data.data);
        } else {
          setAddress([]);
        }
        setIsLoading(false);
      }
    );
  };

  const renderItem = (data) => {
    let item = data.item;
    let index = data?.index;
    const containerStyle = AlternativeColor.getBackgroundColor(index)

    return (
        <TouchableOpacity style={[styles.listContainer, containerStyle]} >
            <View style={{ flex: 1, marginLeft: 0, padding: 0 }}>
                <View style={{ marginLeft: 3 }}>
                    {item.title && <Text style={styles.font}>{item.title}</Text>}
                    {item.name && <Text><Text style={[styles.font,{fontSize:12}]}>Name:</Text> {item.name}</Text>}
                    {item.address1 && <Text><Text style={[styles.font,{fontSize:12}]}>Address:</Text> {item.address1}</Text>}
                    {item.city && <Text><Text style={[styles.font,{fontSize:12}]}>City:</Text> {item.city}</Text>}
                    {item.country && <Text><Text style={[styles.font,{fontSize:12}]}>Country:</Text> {item.country}</Text>}
                    {item.pin_code && <Text><Text style={[styles.font,{fontSize:12}]}>Pin Code:</Text> {item.pin_code}</Text>}
                    {item.gst_number && <Text><Text style={[styles.font,{fontSize:12}]}>Gst Number:</Text> {item.gst_number}</Text>}
                    {item.latitude && <Text><Text style={[styles.font,{fontSize:12}]}>Latitude:</Text> {item.latitude}</Text>}
                    {item.longitude && <Text><Text style={[styles.font,{fontSize:12}]}>Longitude:</Text> {item.longitude}</Text>}
                </View>
            </View>
        </TouchableOpacity>
    );
  };

  return (
    <>
      {address && address.length > 0 ? (
        <SwipeListView
          data={address}
          renderItem={renderItem}
          rightOpenValue={-70}
          previewOpenValue={-50}
          previewOpenDelay={3000}
          disableRightSwipe={false}
          closeOnRowOpen={false}
          keyExtractor={(item) => String(item.id)}
        />
      ) : (
        <NoRecordFound iconName={"box-open"} message={"No Address Found"} />
      )}
    </>
  );
};

export default AddressList;
