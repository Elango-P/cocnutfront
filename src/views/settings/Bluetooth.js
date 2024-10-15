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

import { useIsFocused } from "@react-navigation/native";

import { Button } from "react-native";

import Layout from "../../components/Layout";

import { Color } from '../../helper/Color';

import BlueTooth from "../../services/BluetoothService"

import OnePortalDB from "../../lib/SQLLiteDB";

import ObjectLib from "../../lib/Object";

import Setting from "../../lib/Setting";

import { PermissionsAndroid } from 'react-native';
import styles from "../../helper/Styles";

const Bluetooth = (props) => {

    const [pairedDevices, setPairedDevices] = useState([]);

    const [deviceList, setDeviceList] = useState([]);

    const [refreshing, setRefreshing] = useState(false);

    const [isDeviceScanning, setIsDeviceScanning] = useState(false);

    const isFocused = useIsFocused();

    let DB = OnePortalDB.open('oneportal.db')


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

    const scanDevices = async () => {
        try {

            let bluetoothDeviceList = await OnePortalDB.runQuery(DB, `SELECT * FROM setting WHERE name='${Setting.BLUETOOTH_PRINTER_SETTING}'`)

            
            if (!isDeviceScanning) {
                setIsDeviceScanning(true);
                BlueTooth.ScanDevices(
                    (error, pairedDevices, foundDevices) => {

                        if (pairedDevices && pairedDevices.length > 0) {

                            let pairedUpdatedList = new Array();

                            for (let i = 0; i < pairedDevices.length; i++) {

                                if (bluetoothDeviceList && bluetoothDeviceList.length > 0) {
                                    let isdeviceConnected = bluetoothDeviceList.find((data) => data.value == pairedDevices[i].address);
                                    if (isdeviceConnected) {
                                        pairedDevices[i].isConnected = true;
                                        pairedUpdatedList.push(pairedDevices[i]);
                                    }
                                }
                            }

                            let updatedDevice = [...pairedUpdatedList, ...foundDevices];

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
            setIsDeviceScanning(false);
        }
    }

    const getDeviceList = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "Location Permission",
                    message: "App needs access to your location to scan for Bluetooth devices.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
    
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                BlueTooth.isBlueToothEnabled((error, enabled) => {
                    if (enabled) {
                        scanDevices();
                    } else {
                        EnableBlueTooth();
                    }
                });
            } else {
                console.log("Location permission denied");
            }
        } catch (err) {
            console.log(err);
        }
    };
    
    const EnableBlueTooth = () => {
        try {
            BlueTooth.EnableBlueTooth((error) => {
                scanDevices()
            })
        } catch (err) {
            console.log(err);
        }
    }

    const insertQuery = async (item) => {
        try {
            let bodyData = {
                name: Setting.BLUETOOTH_PRINTER_SETTING,
                value: item.address,
            }
            let bluetoothSetting = ObjectLib.getKeyValue(bodyData);

            await OnePortalDB.runQuery(DB, `INSERT INTO setting (${bluetoothSetting.keyString}) VALUES (${bluetoothSetting.createPlaceHolderString})`, bluetoothSetting.valuesArrray);

            setDeviceList([]);

            scanDevices();
        } catch (err) {
            console.log(err);
        }
    }

    const connectToDevice = async (item) => {
        try {
            if (item) {
                BlueTooth.ConnectToDevice(item.address, async (error, isConnected) => {
                    if (isConnected) {

                        let isDeviceExist = await OnePortalDB.runQuery(DB, `SELECT * FROM setting WHERE name='${Setting.BLUETOOTH_PRINTER_SETTING}'`)

                        if (isDeviceExist && isDeviceExist.length > 0) {
                            for (let i = 0; i < isDeviceExist.length; i++) {
                                await OnePortalDB.runQuery(DB, `DELETE FROM setting WHERE id=${isDeviceExist[i].id}`);
                            }

                            insertQuery(item);

                        } else {
                            insertQuery(item);
                        }
                    }
                });
            }
        } catch (err) {
            console.log(err);
        }
    }

    const disconnectDevice = (item) => {
        try {
            if (item) {
                BlueTooth.disconnectDevice(item.address, async (error, isConnected) => {

                    let isDeviceExist = await OnePortalDB.runQuery(DB, `SELECT * FROM setting WHERE name='${Setting.BLUETOOTH_PRINTER_SETTING}'`)

                    if (isDeviceExist && isDeviceExist.length > 0) {
                        for (let i = 0; i < isDeviceExist.length; i++) {
                            await OnePortalDB.runQuery(DB, `DELETE FROM setting WHERE id=${isDeviceExist[i].id}`);
                        }
                    }

                    setDeviceList([]);

                    scanDevices()
                });
            }
        } catch (err) {
            console.log(err);
        }
    }


    return (
        <Layout
            title="Bluetooth"
            showBackIcon={true}
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
                                                    <Button title={item.isConnected ? "Disconnect" : "Connect"} color={Color.ACTION_BAR_BACKGROUND} onPress={(e) => {
                                                        if (item.isConnected) {
                                                            disconnectDevice(item);
                                                        } else if (!item.isConnected) {
                                                            connectToDevice(item)
                                                        }
                                                    }} />
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                }) : (
                                    <View style={styles.noRecordfound}>
                                        <Text> Scanning devices ....</Text>
                                    </View>
                                )
                        )}
                    </View>
                </View>
            </ScrollView>
        </Layout>
    );
};

module.exports = Bluetooth;

