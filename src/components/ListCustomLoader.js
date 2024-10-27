import React from "react";
import { View, Dimensions } from "react-native";
import ContentLoader, { Rect } from 'react-content-loader/native';
import { Color } from "../helper/Color";

const ListCustomLoader = ({count,height}) => {
  const screenHeight = Dimensions.get('window').height;
  const itemHeight = height?height:110;
  const itemCount = count?count:Math.floor(screenHeight / itemHeight); 
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={{ paddingTop: height?0:50 }}>
      {Array.from({ length: itemCount }).map((_, index) => {
        return (
          <View key={index}>
            <ContentLoader
              viewBox={`0 0 ${screenWidth} ${itemHeight}`}
              height={itemHeight}
              width={screenWidth}
              animate={true}
              rtl={false}
              speed={1}
              interval={0.01}
              foregroundColor={'#999'}
              backgroundColor={Color.LIGHT_GRAY}
            >
              <Rect
                width={screenWidth}
                height={itemHeight} 
              />
            </ContentLoader>
          </View>
        );
      })}
    </View>
  );
};

export default ListCustomLoader;
