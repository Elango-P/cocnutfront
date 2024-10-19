// Import React and Component
import React from "react";
import {
    StyleSheet,
    View,
    Text,
    TextInput,
} from "react-native";
import { Controller } from 'react-hook-form';

import Label from "./Label";
import CustomDivider from "./Divider";
import styles from "../helper/Styles";
import { Color } from "../helper/Color";

const Currency = (props) => {
    const { control, placeholder, name, divider,required, onInputChange,showBorder, title, noEditable, edit,showPlaceHolder,
        secureTextEntry, values,percentage
    } = props;

    const borderShow = showBorder === undefined ? true : showBorder

    const placeHolderShow = showPlaceHolder == false ? false : true


    return (

        <Controller
            control={control}
            name={name}
            rules={  { required: !values && required  ?`Enter ${placeholder}`  : false}}
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                <View >
                    <View style={{ flexDirection: 'row' }}>
                        {title && <Label text={title} bold={true} />}
                        {required && <Text style={{ color: 'red', paddingHorizontal: 3 }}>*</Text>}
                    </View>

                    <View
                        style={[
                            styles.textContainer,
                            { borderColor: error && !values ? 'red' : noEditable ? '#D3D3D3' : 'gray', borderWidth: borderShow && !noEditable ? 1 : 0 , paddingHorizontal: 8},
                            !title && { marginVertical: 12 }
                        ]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            {!percentage && (
                                <Text style={styles.prefixSymbol}>₹</Text>
                            )}
                            <View style={{flex:1}}>
                            <TextInput
                                value={values || value}
                                onBlur={onBlur}
                                editable={noEditable ? false : edit ? true : false}
                                placeholder={placeHolderShow ? (placeholder || title) : ""}
                                placeholderTextColor={Color.PLACEHOLDER_TEXT}
                                style={[styles.textInputStyle,{color: Color.BLACK}, percentage && { flex: 1 }]}
                                secureTextEntry={secureTextEntry}
                                keyboardType={'numeric'}
                                returnKeyType={"done"}
                                onChangeText={(e) => {
                                    onChange(e);
                                    onInputChange && onInputChange(e);
                                }} />

                        </View>
                                { percentage && <Text style={styles.prefixPercentage}>%</Text>}
                        </View>
                        
                    </View>
                    {divider && (
                    <CustomDivider />
                    )}

                    {error && !values && (
                        <Text style={{ color: 'red', alignSelf: 'stretch' }}>
                            {`Enter ${placeholder ? placeholder : title}`}
                        </Text>
                    )}
                </View>
            )}
        />


    )
}

export default Currency;

