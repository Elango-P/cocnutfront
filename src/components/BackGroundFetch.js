// import BackgroundFetch from 'react-native-background-fetch';

import { NativeModules } from "react-native"

const BackGroundFetch = (fetchData, Interval) => {

    const { RNBackgroundFetch } = NativeModules;

    if (RNBackgroundFetch) {

        // BackgroundFetch.configure(
        //     {
        //         minimumFetchInterval: Interval,
        //         forceAlarmManager: true,
        //         stopOnTerminate: false,
        //         startOnBoot: true,
        //         requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY
        //     },
        //     async (taskId) => {
        //         try {
        //             await fetchData()
        //             BackgroundFetch.finish(taskId);
        //         } catch (error) {
        //             console.log('Background fetch error:', error);
        //             BackgroundFetch.finish(taskId);
        //         }
        //     },
        //     (error) => {
        //         console.log('Background fetch error:', error);
        //     }
        // );
    }
}
export default BackGroundFetch;