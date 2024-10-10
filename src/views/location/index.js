// Import React and Component
import React, { useEffect } from "react";

import Layout from "../../components/Layout";

import StoreSelector from "../../components/LocationSelector";

import { useNavigation } from "@react-navigation/native";
import PermissionService from "../../services/PermissionService";
import Permission from "../../helper/Permission";
import { useState } from "react";

const Index = () => {

    const navigation = useNavigation();
    const [permission, setPermission] = useState("")

    useEffect(() => {
        getPermission()
      }, []);

    const onStorePress = (item) => {

        navigation.navigate("StoreDetail",{
            storeId: item.id
        });
    }
    const getPermission = async () => {
        const locationAdd = await PermissionService.hasPermission(Permission.LOCATION_ADD);
        setPermission(locationAdd)
      }

    return (
        <Layout title={"Locations"}   addButton={ permission ? true : false} buttonOnPress = {()=> navigation.navigate("LocationAdd")}
         >
            <StoreSelector onPress={onStorePress}/>
        </Layout>
    );
};

export default Index;
