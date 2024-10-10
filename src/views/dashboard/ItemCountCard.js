import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Label from '../../components/Label';
import VerticalSpace10 from '../../components/VerticleSpace10';
import styles from '../../helper/Styles';
import dashboardService from '../../services/DashboardService';
import PermissionService from '../../services/PermissionService';
import Permission from '../../helper/Permission';
import Currency from '../../lib/Currency';
import StatisticsCountCard from '../../components/StatisticsCountCard';
import { Color } from "../../helper/Color";

const ItemCountCard = (props) => {
  const { refreshing } = props;

  const [stockEntryProductsCount, setStockEntryProductsCount] = useState(null);
  const [replenishedProductsCount, setReplenishedProductsCount] =
    useState(null);
  const [todayAmount, setTodayAmount] = useState(0);
  const [orderViewPermission, setOrderViewPermission] = useState();
  const [rewardCount, setRewardCount] = useState(null);
  const isFocused = useIsFocused();
  useEffect(() => {
    getProductCount();
    permission();

    if (orderViewPermission) {
      getOrderDetail();
    }
  }, [refreshing, isFocused]);

  const getProductCount = async () => {
    dashboardService.getCount(null, (error, response) => {
      let replenish =
        response && response?.data && response.data.replenishedProductsCount;
      let stockEntry =
        response && response?.data && response.data.stockEntryProductsCount;
      let reward =
        response && response?.data && response.data.todayRewardCount;
      setReplenishedProductsCount(replenish);
      setStockEntryProductsCount(stockEntry);
      setRewardCount(reward);
    });
  };

  const getOrderDetail = async () => {
    await dashboardService.getOrder(setTodayAmount);
  };

  const permission = async () => {
    const orderViewPermission = await PermissionService.hasPermission(
      Permission.MOBILEAPP_DASHBOARD_MENU_ORDER_SUMMARY_VIEW
    );
    setOrderViewPermission(orderViewPermission);
  };

  const renderItemCountCard = () => {
    const conditionCheckArray = [
      {
        replenishedProducts:
          replenishedProductsCount !== null &&
          replenishedProductsCount !== undefined,
      },
      {
        stockEntryProducts:
          stockEntryProductsCount !== null &&
          stockEntryProductsCount !== undefined,
      },
      {
        reward: rewardCount !== null && rewardCount !== undefined,
      },
      {
        todaySales:
          orderViewPermission !== false && orderViewPermission !== undefined,
      },
    ];

    let cardValue = [];
    for (let i = 0; i < conditionCheckArray.length; i++) {
      const { replenishedProducts, stockEntryProducts, reward, todaySales } =
        conditionCheckArray[i];
      if (todaySales) {
        cardValue.push({
          count: Currency.getFormatted(Currency.GetWithNoDecimal(todayAmount)),
          countLabel: "Today's Sale",
          backgroundColor: Color.INDIGO,
          order: 1
        });
      }
      if (replenishedProducts) {
        cardValue.push({
          count: replenishedProductsCount,
          countLabel: 'Replenished',
          backgroundColor: Color.RED,
          order: 2
        });
      }
      if (stockEntryProducts) {
        cardValue.push({
          count: stockEntryProductsCount,
          countLabel: 'Total Stock',
          backgroundColor: Color.BLUE,
          order: 3
        });
      }
      if (reward) {
        cardValue.push({
          count: rewardCount,
          countLabel: 'Rewards Earned',
          backgroundColor: Color.GREEN,
          order: 4
        });
      }
    }
    return (
      <>
        {(replenishedProductsCount ||
          stockEntryProductsCount ||
          rewardCount ||
          orderViewPermission) && (
            <View>
              <Label text={" Today's"} bold={true} size={20} />
              <VerticalSpace10 />
            </View>
          )}

        {cardValue && cardValue.length < 4 ? (
          <>
            <View style={styles.direction}>
              {cardValue &&
                cardValue.length > 0 &&
                cardValue.sort((a, b) => a.order - b.order).map((data, index) => (
                  <StatisticsCountCard
                    count={data.count}
                    countLabel={data.countLabel}
                    backgroundColor={data.backgroundColor}
                  />
                ))}
            </View>
          </>
        ) : (
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {cardValue &&
              cardValue.length > 0 &&
              cardValue.sort((a, b) => a.order - b.order).map((data, index) => (
                <View style={styles.direction}>
                  <StatisticsCountCard
                    count={data.count}
                    countLabel={data.countLabel}
                    backgroundColor={data.backgroundColor}
                  />
                </View>
              ))}
          </ScrollView>
        )}
      </>
    );
  };

  return <>{renderItemCountCard()}</>;
};

export default ItemCountCard;
