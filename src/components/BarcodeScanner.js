import { FontAwesome5 } from "@expo/vector-icons";
import React, { useEffect, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Scanner from "../components/barcodeScanner/index";
import { Color } from '../helper/Color';
import { verticalScale } from './Metrics';
import PhoneNumber from "./PhoneNumber";
import VerticalSpace10 from "./VerticleSpace10";
import AddButton from "./AddButton";
import Link from "./Link";
import platform from "../lib/Platform";


function QrCodeScanner({ toggle, modalVisible, CancelAction,onPressSkip, handleScannedData,handleMobileNumberChange,handleMobileNumberUpdate, title,showCustomerMobileNumberOption,control }) {
    const [scanAnimation] = useState(new Animated.Value(0));    


    useEffect(() => {
        startAnimation();
    }, []);

    const startAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanAnimation, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(scanAnimation, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const translateY = scanAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [verticalScale(-100), verticalScale(100)], 
    });

    return (
        <Modal
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                toggle && toggle();
            }}>
            <View style={[styles.container,{marginTop : platform.isIOS() ? "12%" : 0}]}>
                <View style={styles.cameraOverlay}>
                    <Scanner height="100%" onScan={handleScannedData} />

                    <View style={styles.overlay}>
                        <View style={styles.scannerBox}>
                            <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
                        </View>
                        <Text style={styles.scanText}>{title ? title : "Scan BarCode"}</Text>
                    </View>

                    {!showCustomerMobileNumberOption && <TouchableOpacity style={styles.closeButton} onPress={() => {
                            toggle();
                            CancelAction && CancelAction();
                        }}>
        
                        <View style={styles.iconWrapper}>
                        <FontAwesome5 name={"times"} size={17} color={"black"} />
                        </View>
                    </TouchableOpacity>
}
                </View>
            </View>
     {showCustomerMobileNumberOption && (
              <View style={styles.modalBody}>
              <Text style={{ color: Color.WHITE }}>{"Enter Customer Number : "}</Text>
             <VerticalSpace10 />
             <PhoneNumber
              name="customer_phone_number"
              placeholder="Enter Customer Number"
              control={control}
              maxLength={14}
              onInputChange={handleMobileNumberChange}
              />
              <VerticalSpace10 />
      
             <View style={{ alignItems: 'center' }}> 
              <AddButton
              color={Color.BLUE}
              label="Next"
              style={{ width: "50%",borderRadius : 10 }}
              onPress = {handleMobileNumberUpdate}
             />
             <Link title = {"Skip"} color = {Color.WHITE} size = {10} paddingRight = {1} onPress = {onPressSkip}/>
            </View>
          </View>
     )} 
      
         
        </Modal>
    );
}

export default QrCodeScanner;

const styles = StyleSheet.create({
    modalBody: {
        backgroundColor: Color.BLACK,
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    iconWrapper: {
        backgroundColor: '#d3d3d3',
        width:26,
        height:26,
        width:26,
        borderRadius: 50, 
        justifyContent: 'center',
        alignItems: 'center',
      },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    cameraOverlay: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerBox: {
        width: '80%',
        height: '40%',
        borderColor: Color.BLUE, 
        borderWidth: 2,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanLine: {
        position: 'absolute',
        width: '100%',
        height: 2,
        elevation: 10,
        backgroundColor: Color.BLUE,
    },
    scanText: {
        position: 'absolute',
        top: '6%', 
        color: Color.WHITE,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
        borderRadius: 15,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
});
