
import AsyncStorage from "./AsyncStorage";
import { SUPER_ADMIN_ROLE } from "../common/constants";
import AsyncStorageConstants from "../helper/AsyncStorage";
import AppID from "./AppID";

export async function getSessionToken() {
    const Token = await AsyncStorage.getItem(AsyncStorageConstants.SESSION_TOKEN);
    return Token
}

export async function isLoggedIn(navigation) {
    const Token = await AsyncStorage.getItem(AsyncStorageConstants.SESSION_TOKEN);
    if (!Token) {
        navigation.navigate("Login");
    }
}
