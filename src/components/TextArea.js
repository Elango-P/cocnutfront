import React, { useState, useRef, useEffect } from 'react';
import { TextInput, View, StyleSheet, PanResponder, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import Label from './Label';
import CustomDivider from './Divider';
import styles from '../helper/Styles';
import { Color } from '../helper/Color';

const TextArea = ({
    control,
    name,
    placeholder,
    keyboardType,
    secureTextEntry,
    currency,
    required,
    divider,
    title,
    editable = true,
    values,
    showBorder,
    style,
    onInputChange }) => {
    const [text, setText] = useState('');
    const [containerHeight, setContainerHeight] = useState(100);
    const [inputHeight, setInputHeight] = useState(100);
    const [isResizing, setIsResizing] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        if (isResizing) {
            containerRef.current.setNativeProps({ style: { opacity: 0.5 } });
        } else {
            containerRef.current.setNativeProps({ style: { opacity: 1 } });
        }
    }, [isResizing]);

    const handleContentSizeChange = (event) => {
        setInputHeight(event.nativeEvent.contentSize.height);
    };

    const handleLayout = (event) => {
        setContainerHeight(event.nativeEvent.layout.height);
    };

    const handlePanResponderMove = (evt, gestureState) => {
        const newHeight = containerHeight + gestureState.dy;
        if (newHeight > 0) {
            setInputHeight(newHeight);
        }
    };

    const handlePanResponderRelease = () => {
        setIsResizing(false);
    };

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (evt, gestureState) => {
            // Only respond to touch events that are not directly on the TextInput component
            return gestureState.dx !== 0 || gestureState.dy !== 0;
        },
        onPanResponderMove: handlePanResponderMove,
        onPanResponderRelease: handlePanResponderRelease,
    });

    const borderShow = showBorder === undefined ? true : showBorder


    return (
        <Controller
            control={control}
            name={name}
            rules={required ? { required: `Enter ${placeholder}` } : ""}
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
                <>
                    <View style={{ flexDirection: 'row', marginBottom: 3 }}>
                        {title && <Label text={title} bold={true} />}
                        {title && required && <Text style={{ color: 'red' }}>*</Text>}
                    </View>
                    <View
                        style={[
                            styles.textContainer,
                            { borderColor: error && 'red', borderWidth: currency ? 0 : !editable ? 0 : borderShow ? 1 : 0 },
                        ]}>
                        <TextInput
                            value={value || values}
                            onBlur={onBlur}
                            editable={editable && true}
                            placeholder={placeholder || title}
                            style={[styles.textInputStyle,{color: Color.BLACK}]}
                            placeholderTextColor={Color.PLACEHOLDER_TEXT}
                            secureTextEntry={secureTextEntry}
                            keyboardType={keyboardType}
                            onChangeText={(e) => {
                                onChange(e);
                                onInputChange && onInputChange(e);
                            }}
                            multiline={true}
                            textAlignVertical={'top'}
                            onContentSizeChange={handleContentSizeChange}
                            maxLength={1000}
                            underlineColorAndroid={'transparent'}
                            returnKeyType='done'
                        />
                        {divider && (
                            <CustomDivider />
                        )}
                        <View
                            ref={containerRef}
                            onLayout={handleLayout}
                            style={[styles.container, { height: inputHeight }]}
                            {...panResponder.panHandlers}
                        >

                        </View>
                    </View>
                    {error && (
                        <Text style={{ color: 'red', alignSelf: 'stretch' }}>{`Enter ${placeholder ? placeholder : title}`}</Text>
                    )}
                </>
            )}
        />

    );
};


export default TextArea;