// Import React and Component
import React, { useState, useEffect, useCallback } from "react";
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text,
    ScrollView,
    RefreshControl,
} from "react-native";

import { useNavigation } from "@react-navigation/native";

import { useIsFocused } from "@react-navigation/native";

import { Button } from "react-native";

import Layout from "../../../components/Layout";

import { Color } from '../../../helper/Color';

import BlueTooth from "../../../services/BluetoothService"

import CountSelectModal from "../../../components/Modal/CountSelectModal";

const PriceLabelPrint = (props) => {

    let params = props.route.params;

    const [pairedDevices, setPairedDevices] = useState([]);

    const [deviceList, setDeviceList] = useState([]);

    const [refreshing, setRefreshing] = useState(false);

    const [isDeviceScanning, setIsDeviceScanning] = useState(false);

    const [openCopySelectModal, setShowNumberOfCopySelectModal] = useState(false);

    const [numberofCopies, setNumberofCopies] = useState("");

    const [selectedDevice, setSelectedDevice] = useState("");

    const isFocused = useIsFocused();

    const navigation = useNavigation();

    // Pull down to refresh the page
    const wait = (timeout) => {
        return new Promise((resolve) => setTimeout(resolve, timeout));
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        wait(500).then(() => setRefreshing(false));
    }, []);


    useEffect(() => {
        getDeviceList();
    }, [isFocused, props]);

    const scanDevices = () => {
        try {
            setIsDeviceScanning(true);
            if (!isDeviceScanning) {
                BlueTooth.ScanDevices(
                    (error, pairedDevices, foundDevices) => {

                        if (pairedDevices && pairedDevices.length > 0) {

                            for (let i = 0; i < pairedDevices.length; i++) {
                                pairedDevices[i].isConnected = true;
                            }

                            let updatedDevice = [...foundDevices, ...pairedDevices];

                            if (updatedDevice && updatedDevice.length > 0) {
                                setDeviceList(updatedDevice || []);
                            }

                        } else {
                            setDeviceList(foundDevices || []);
                        }

                        setPairedDevices(pairedDevices || []);

                        setIsDeviceScanning(false);

                    },
                    (error) => {
                        setIsDeviceScanning(false);
                        console.log(error)
                    }
                );
            }

        } catch (err) {
            console.log(err);
        }
    }

    const getDeviceList = () => {
        try {
            // BlueTooth.isBlueToothEnabled((error, enabled) => {
            //     if (enabled) {
            //         scanDevices();
            //     } else {
            //         EnableBlueTooth();
            //     }
            // })
        } catch (err) {
            console.log(err);
        }
    }

    const EnableBlueTooth = () => {
        try {
            BlueTooth.EnableBlueTooth((error) => {
                scanDevices()
            })
        } catch (err) {
            console.log(err);
        }
    }

    const printPriceLabel = async (item, index) => {
        try {
            if (item) {
                let address = item.address;
                await BlueTooth.Connect(address)
                await BlueTooth.PrintPriceLabel(params.barcode, params.productId, params.name, params.sale_price, index)
            }
        } catch (err) {
            console.log(err);
        }
    }

    const onPrintClickHandler = async () => {
        if (numberofCopies && numberofCopies > 0 && selectedDevice) {
            for (let i = 0; i < numberofCopies; i++) {
                await printPriceLabel(selectedDevice, i);
            }
            setSelectedDevice("");
            setNumberofCopies("");
            setShowNumberOfCopySelectModal(false);
        }
    }

    const toggleModal = () => {
        setShowNumberOfCopySelectModal(!openCopySelectModal);
    }

    const OnSelectNumberOfCopy = (selectedValue) => {
        if (selectedValue) {
            setNumberofCopies(parseInt(selectedValue.value));
        }
    }


    return (
        <Layout
            title="Print Price Tag"
            showBackIcon={false}

        >
            <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <View style={styles.container}>
                    <View style={{ marginTop: 10, padding: 10 }}>
                        {(
                            deviceList && deviceList.length > 0 ?
                                deviceList.map((item, index) => {
                                    return (
                                        <TouchableOpacity style={styles.containers}>
                                            <View style={{ flexDirection: "row", justifyContent: "flex-start", flex: 2, alignItems: "center" }}>
                                                <Text style={{ fontSize: 16, flex: 0.7, marginTop: 5 }}>{item.name ? item.name : item.address}</Text>
                                                <View style={{ flex: 0.3, alignItems: "flex-end" }}>
                                                    <Button title={item.isConnected ? "Print" : "Connect"} color={Color.ACTION_BAR_BACKGROUND} onPress={(e) => {
                                                        setSelectedDevice(item);
                                                        setShowNumberOfCopySelectModal(true);
                                                    }} />
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                }) : (
                                    <View style={{ flex: 1, paddingVertical: 250, justifyContent: "center", alignItems: "center" }}>
                                        <Text> Scanning devices ....</Text>
                                    </View>
                                )
                        )}
                    </View>

                </View>
            </ScrollView>

            <CountSelectModal
                toggle={toggleModal}
                modalVisible={openCopySelectModal}
                onChange={OnSelectNumberOfCopy}
                ConfirmationAction={onPrintClickHandler}
            />
        </Layout>
    );
};

module.exports = PriceLabelPrint;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: "scroll",
        backgroundColor: "#fff",
    },
    containers: {
        height: 60,
        backgroundColor: "#fff",
        borderColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "lightgrey",
    },
});
