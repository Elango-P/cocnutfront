// Import React and Component
import React, { useEffect, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Image
} from "react-native";
import { Color } from "../../helper/Color";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { Menu, MenuItem } from 'react-native-material-menu';
import DropDownMenu from '../DropDownMenu';
import Message from '../Message';
import Button from '../Button';
import Setting from '../../lib/Setting';
import styles from '../../helper/Styles';
import StatusSelect from '../StatusSelect';
import settingService from '../../services/SettingService';
import { FontAwesome5 } from "@expo/vector-icons";
import UserAvatar from "react-native-user-avatar";



const ActionBar = ({
  title,
  buttonLabel,
  buttonLabel2,
  onPress,
  button2OnPress,
  showBackIcon,
  isKeyboardVisible,
  backButtonNavigationUrl,
  showScanner,
  openScanner,
  Add,
  showActionMenu,
  actionItems,
  updateValue,
  closeModal,
  profileUrl,
  Name,
  setShowModal,
  showFilter,
  onFilterPress,
  showMessage,
  params,
  showActionButton,
  setStatusBar,
  control,
  onSelect,
  currentStatusId,
  name,
  showStatusDropDown,
  onActionMenuPress,
  showActionDrawer,
  backButtonNavigationOnPress,
  showLogo,
  showProfile,
  onProfileHandle,
  addButton,
  isSubmit,
  isAddButtonDisabled
}) => {
   

  const navigation = useNavigation();

  const [addVisible, setAddVisible] = useState(false);
  const [portalName, setPortalName] = useState("");
  const [themeColor, setThemeColor] = useState(Color.WHITE);
  const [textColor, setTextColor] = useState(Color.WHITE)
  const isFocused = useIsFocused();

  const hideAddMenu = () => setAddVisible(false);
  const showAddMenu = () => {
    setAddVisible(true)
  };

  useEffect(() => {
    getThemeColor();
  }, [isFocused])
  const showButton = showActionButton !== undefined ? showActionButton : true;   
 let filterItem = []

   filterItem.push(
    <MenuItem
    onPress={() => {onFilterPress(),setAddVisible(true)}}
  >
    Filter
  </MenuItem>
   )
 
  const getThemeColor = async () => {
    try {
          await settingService.getByName(Setting.PORTAL_HEADER_COLOR,(err,response)=>{
            setThemeColor(response)
            setStatusBar(response)
          })
          await settingService.getByName(Setting.PORTAL_HEADER_TEXT_COLOR,(err,response)=>{
            setTextColor(response)
          })
          await settingService.getByName(Setting.PORTAL_NAME,(err,response)=>{
            setPortalName(response)
          })
        
    } catch (error) {
        console.error("Error retrieving settings:", error);
        return null;
    }
};


  return (
    <>
      <View style={{
        flex: isKeyboardVisible ? 0.14 : 0.1,
        justifyContent: "center",
        backgroundColor: themeColor,
      }}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: 'space-between',
            marginLeft: 10,
            backgroundColor: themeColor,
            marginHorizontal : 10
          }}
        >
            {showBackIcon !== false && (
              <TouchableOpacity
                onPress={() => {
                  if (updateValue) {
                    updateValue();
                  } else {
                    backButtonNavigationUrl ? navigation.navigate(backButtonNavigationUrl, params) : navigation.goBack();
                    backButtonNavigationOnPress && backButtonNavigationOnPress()
                  }

                }}
                accessibilityLabel="menu"
              >
                <Ionicons
                  name="chevron-back"
                  size={35}
                  color={Color.ACTIONBAR_TEXT}
                />
              </TouchableOpacity>

            )}

            {showLogo && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={()=>setShowModal && setShowModal(true)}>
                {profileUrl ? <Image source={{ uri: profileUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} /> :
                <UserAvatar
                size={30}
                name={Name}
                bgColor={Color.AVATAR_BACKGROUND}
              />
            }
                </TouchableOpacity>

                <Text style={[styles.portalName,{color : textColor}]}>{portalName}</Text>
              </View>
            )}
           

          {title && (
            <View style={{ flex: 1, alignItems: showStatusDropDown && 'center', paddingTop: showStatusDropDown && 12 , marginLeft : showBackIcon == false ? 35 : 0}}>
              <Text style={[styles.layoutTitle, { color: textColor, textTransform: "capitalize" }]} numberOfLines={1}>{title}</Text>
            </View>
          )}

          


            {showScanner && (
              <View style={{ flex: buttonLabel ? 0.15 : 0.30, alignItems: "flex-end", justifyContent: "center",marginRight: 10 }}>

                 <FontAwesome5 name={"barcode"} size={26} color={Color.ACTIONBAR_TEXT} onPress={() => openScanner && openScanner()}/>
               
              </View>
            )}

        {showButton && buttonLabel && (
            <View style={[styles.layoutButton]}>
            <Button title={buttonLabel} onPress={(e) => onPress(e)} isSubmit = {isSubmit} color={Color.ACTIONBAR_TEXT} />
          </View>
          )}
          {buttonLabel2 && (
            <View style={[styles.layoutButton]}>
              <Button title={buttonLabel2} onPress={button2OnPress} isSubmit = {isSubmit} color={Color.ACTIONBAR_TEXT} />
            </View>
          )}
           
         

      
          {showProfile && (
            <View style={styles.layoutFilter}>
              <Feather
                name="user"
                size={30}
                color={Color.INDIGO}
                onPress={() => onProfileHandle()}
              />
            </View>
          )}
          {addButton && (
            <View style={[styles.layoutButton]} >
              <TouchableOpacity onPress={(e) => onPress(e)}  disabled={isAddButtonDisabled} activeOpacity={isAddButtonDisabled ? 1 : 0.7}>
              <MaterialIcons name="add" size={30}  color={isAddButtonDisabled ? 'gray' : 'black'} />
              </TouchableOpacity>
            </View>
          )}
         {showFilter && (
           <DropDownMenu MenuItems={filterItem} onPress={()=>setAddVisible(false)} />
          )}

          {showActionMenu && !showActionDrawer && (

            <DropDownMenu MenuItems={actionItems} onPress={()=>closeModal()} />

          )}
          {!showActionMenu && showActionDrawer && (

            <TouchableOpacity onPress={onActionMenuPress}>
              <Ionicons
                name={"ellipsis-vertical"}
                size={24}
                color={Color.ACTIONBAR_TEXT}
                style={{ paddingTop: 5 }}
              />
            </TouchableOpacity>
          )}
           

          {Add && <Menu
            visible={addVisible}
            anchor={Add &&
              <TouchableOpacity onPress={showAddMenu} style={{ paddingHorizontal: 5 }}>
                <View style={{ flexDirection: 'row', color: '#FFF', backgroundColor: "#FFF", justifyContent: 'center', alignItems: 'center', borderRadius: 10, padding: 7 }}>
                  <Text>
                    Add
                  </Text>
                  <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
                </View>
              </TouchableOpacity>
            }
            onRequestClose={hideAddMenu}
          >
          </Menu>}

          {showMessage && (
            <Message />
          )
          }

          {showStatusDropDown && (
            <View style={{ width: '35%', height: '10%' }}>
              <StatusSelect
                control={control}
                onChange={onSelect}
                name={name}
                placeholder={`Select ${name}`}
                data={currentStatusId}
                disableSearch={true}
                currentStatusId={currentStatusId}

              />
            </View>
          )}

        </View>
      </View>
    </>
  );
};
export default ActionBar;
