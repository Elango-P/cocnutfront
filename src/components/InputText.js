
import React from "react";
import { TextInput, View ,StyleSheet} from "react-native";
import styles from "../helper/Styles";
import { Color } from "../helper/Color";
const InputText = (props) => {
    const { error,
        currency,
        value,
        values,
        onBlur,
        editable=true,
        placeholder,
        title,
        secureTextEntry,
        keyboardType,
        onChange,
        onInputChange,
        handleContentSizeChange,
        containerRef,
        handleLayout,
        containerStyle,
        style,
        maxLength,
        showBorder,
        multiline,
        textAlignVertical,
        placeHolderShow

    } = props
    const borderShow = showBorder === undefined ? true : showBorder

    return (
        <View
            style={[
                styles.textContainer,
                { borderColor: error && 'red', borderWidth: currency ? 0 : !editable ? 0: borderShow ? 1 : 0 },
            ]}>
            <TextInput
                value={value || values}
                onBlur={onBlur}
                editable={editable}
                placeholderTextColor = {Color.PLACEHOLDER_TEXT}
                placeholder={placeHolderShow?(placeholder || title):title}
                style = {[styles.textInputStyle,{color: Color.BLACK}]}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                onChangeText={(e) => {
                    onChange(e);
                    onInputChange && onInputChange(e);
                }}
                multiline={multiline}
                textAlignVertical={textAlignVertical}
                onContentSizeChange={handleContentSizeChange}
                maxLength={maxLength}
                underlineColorAndroid={'transparent'}
                returnKeyType={"done"}
            />
            <View
                ref={containerRef}
                onLayout={handleLayout}
                style={style}
            >
            </View>
        </View>
    )
}
export default InputText
