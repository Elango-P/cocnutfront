import React, { useState, useEffect } from 'react';
import { Menu } from 'react-native-material-menu';
import { Ionicons } from '@expo/vector-icons';
import { Color } from '../helper/Color';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import styles from '../helper/Styles';

const DropDownMenu = ({ MenuItems, onPress, icon, label, color, menuStyle, iconSize }) => {
  const [visible, setVisible] = useState(false);

  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);

  useEffect(() => {
    if (onPress) {
      hideMenu();
    }
  }, [onPress]);

  const handleMenuItemSelect = (item) => {
    if (onPress) {
      onPress(item);
      hideMenu(); 


    }

  };

  return (
    <>
      <Menu
        visible={visible}
        animationDuration={30}
        anchor={
          <TouchableOpacity onPress={showMenu}>
            <Ionicons
              name={icon ? icon : "ellipsis-vertical"}
              size={iconSize ? iconSize : 24}
              color={color ? color :Color.WHITE}
              style={{paddingTop: 3 }}
            />
            {label && (
              <Text style={{ color: Color.WHITE, fontSize:12 ,paddingBottom : 5}}>{label}</Text>)}
          </TouchableOpacity>
        }
        onRequestClose={hideMenu}
        style={menuStyle ? menuStyle: styles.menuStyle }
      >
        <ScrollView style={{ maxHeight: 300 }}>
          {MenuItems &&
            MenuItems.length > 0 &&
            MenuItems.map((Item, index) => (
              <TouchableOpacity
              key={index}
              onPress={() => handleMenuItemSelect(Item)}
            >
              <React.Fragment key={index}>{Item}</React.Fragment>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </Menu>
    </>
  );
};

export default DropDownMenu;
