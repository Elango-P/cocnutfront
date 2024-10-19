import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import AlternativeColor from "../../components/AlternativeBackground";
import Card from "../../components/Card";
import dashboardService from "../../services/DashboardService";
import FineCard from "../../views/fine/components/FineCard";


const FineList = ({ focused,user }) => {
  const [fine, setFine] = useState([]);
  const navigator = useNavigation();

  useEffect(() => {
    getFine();
  }, [focused,user])

  const getFine = async () => {
    let params = {
      isFineType: true,
       user : user
    }
    
    
    await dashboardService.getFine(callback => setFine(callback), params)
  }

  return (
    <>
      <View>
        {fine && (
          <Card
            title={"Fines"}
            viewAllHander={() => navigator.navigate("Fine",{user : user})}
            showViewAll
          >


            {fine && fine.length > 0 && fine.map((item, index) => {
              const containerStyle = AlternativeColor.getBackgroundColor(index)

              return (
                <>
                  <FineCard
                    type={item.type}
                    user={item.user}
                    amount={item.amount}
                    date={item.date}
                    alternative={containerStyle}

                    onPress={() => {
                      navigator.navigate("FineForm", { item });
                    }} />
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
export default FineList;