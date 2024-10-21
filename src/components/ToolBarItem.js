import React from 'react';
import { Color } from '../helper/Color';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from "@expo/vector-icons";
import { View } from 'react-native';
import styles from '../helper/Styles';

const ToolBarItem =(props)=>{
    const {icon,selected,label,onPress,toolBarIconColor,margin} = props       
    return(
           <TouchableOpacity onPress={onPress} style={{marginRight : margin}}>
                    <View style={styles.marginAlign}>
                        <FontAwesome5
                            name={icon}
                             size={35}
                             style={{paddingVertical:8} }
                            color={selected ? Color.RED :  Color.GREEN}
                        />
                        <Text style={styles.iconName}>{label}</Text>
                    </View>
                </TouchableOpacity>
    )
}
export default ToolBarItem;

