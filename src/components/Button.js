import React, { useState, useEffect } from 'react';
import { Button, ActivityIndicator } from 'react-native-paper';
import { Color } from '../helper/Color';
import { useIsFocused, useNavigation } from "@react-navigation/native";

const CustomButton = (props) => {
  const { onPress, backgroundColor,borderRadius, textColor, width,title, errors,isSubmit, isDisabled,textAlign,fontSize, style } = props;
  const show = props.show !== undefined ? props.show : true;

  if (!show) {
    return null; // Return null to not render anything if show is false
  }  

  const handlePress = async () => {
      await onPress();

  };

  return (
    <Button
      mode="contained"
      uppercase={false}
      style={{
        backgroundColor: backgroundColor ? backgroundColor : Color.BUTTON_BACKGROUND,
        opacity: isSubmit ? 0.7 : 1,
        borderRadius : borderRadius,
        width : width,
        ...style
      }}
      labelStyle={{
        color: textColor ? textColor : Color.BUTTON_TEXT,
        fontSize: fontSize?fontSize:14,
        textAlign: textAlign?textAlign:"center",
      }}
      onPress={handlePress}
      disabled={isDisabled?isDisabled:isSubmit}
      loading={isSubmit}
    >
      {title}
    </Button>
  );
};

export default CustomButton;
