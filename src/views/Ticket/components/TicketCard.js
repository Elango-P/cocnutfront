import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import DateText from "../../../components/DateText";
import UserCard from "../../../components/UserCard";
import DateTime from "../../../lib/DateTime";
import { useNavigation } from "@react-navigation/native";
import Status from "../../../components/Status";
import IdText from "../../../components/IdText"
import style from "../../../helper/Styles";


const TicketCard = (props) => {
  const { due_date, summary, assignee_name,ticket_number, alternative, status, statusColor,avatarUrl, onPress } = props;

  return (
    <TouchableOpacity style={[style.cardContainer, alternative]} onPress={onPress}>
      <View style={style.leadContainer}>
      <View style={style.cardUser}>
          <View style={[style.direction, style.cardAlign]}>
            <IdText id={ticket_number} />
            <DateText date={DateTime.formatDate(due_date)} />
          </View>
          {status && (

          <View style={style.cardStatus}>
            <Status status={status} backgroundColor={statusColor} />
          </View>
                    )}

        </View>
            <UserCard firstName={assignee_name} size={20} image ={avatarUrl} text/>
        <View style={style.summary}>
          <Text numberOfLines={2} style={style.font}>
           {summary}
          </Text>
        </View>
      </View>

    </TouchableOpacity>
  );
};

export default TicketCard;

