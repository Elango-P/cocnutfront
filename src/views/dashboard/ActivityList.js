import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import AlternativeColor from "../../components/AlternativeBackground";
import Card from "../../components/Card";
import dashboardService from "../../services/DashboardService";
import ActivityCard from "../activity/Components/ActivityCard";


const ActivityList = ({ focused,user }) => {
  const [activity, setActivity] = useState([]);

  const navigator = useNavigation();

  useEffect(() => {
    getActivity();
  }, [focused,user])
  
  const getActivity = async () => {
    let params = {
       user : user
    } 
    
    
    await dashboardService.getActivity(callback => setActivity(callback),params)
  }
     
  return (
    <>
      <View> 
        {activity && activity.length > 0 && (
          <Card
            title={"Activities"}
            viewAllHander={() => navigator.navigate("ActivityList",{user : user})}
            showViewAll
          >


            {activity && activity.length > 0 && activity.map((item, index) => {
              const containerStyle = AlternativeColor.getBackgroundColor(index)

              return (
                <>
                          <ActivityCard
                                date={item.date}
                                type={item.activityTypeName}
                                alternative={containerStyle}
                                onPress={() => {
                                    navigator.navigate("/ActivityTypeScreen", { item, isDetailPage: true });
                                }}
                            />
                </>
              )
            }
            )}
          </Card>
        )}
      </View>
    </>
  )
}
export default ActivityList;