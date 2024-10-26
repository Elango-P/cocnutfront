import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Image, View } from 'react-native';
import { FontAwesome5 } from "@expo/vector-icons";
import { Color } from '../helper/Color';
import styles from '../helper/Styles';

const ToolBarItem = (props) => {
    const { icon, selected, label, onPress, toolBarIconColor, margin } = props;

    return (
        <TouchableOpacity onPress={onPress} style={{ marginRight: margin }}>
            <View style={styles.marginAlign}>
                {typeof icon === 'string' ? (
                    <FontAwesome5
                        name={icon}
                        size={35}
                        style={{ paddingVertical: 8 }}
                        color={selected ? Color.RED : Color.GREEN}
                    />
                ) : (
                    
                    <Image
                        source={icon} // Use the icon from assets
                        style={{ width: 40, height: 40,backgroundColor:Color.WHITE}} // Adjust size as needed
                    />
                )}
                <Text style={styles.iconName}>{label}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default ToolBarItem;
