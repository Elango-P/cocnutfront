// Import React and Component
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import ListUI from "./ListUI";
import Layout from "./Layout";
import ticketTypeService from "../services/TicketTypeService";
import Status from "../helper/Status";

const TicketTypeSelector = (props) => {
  const { projectId, allow_for_assignee_change_permission } = props && props.route && props.route.params && props.route.params

  const [ticketTypeList, setTicketTypeList] = useState([]);

  const isFocused = useIsFocused();
  const navigation = useNavigation()

  useEffect(() => {
    getTicketTypeList();
  }, [isFocused, projectId]);

  const getTicketTypeList = () => {
    ticketTypeService.search({ projectId: projectId ? projectId : "", status: Status.ACTIVE }, (err, response) => {

      let data = response && response?.data && response?.data?.data;
      let list = [];
      if (data) {
        for (let i = 0; i < data.length; i++) {
          const { id, name, default_story_point, default_assignee, fields } = data[i];
          list.push({
            label: name,
            value: id,
            default_story_point: default_story_point,
            default_assignee: default_assignee,
            fields: fields
          });
        }
      }

      setTicketTypeList(list);
    });
  }

  const onPress = (value) => {
    navigation.navigate("Ticket/Add", { projectId: projectId && projectId, ticketTypeValue: value, allow_for_assignee_change_permission: allow_for_assignee_change_permission  });
  }



  return (
    <>
      <Layout title={"Create Ticket - Select Type"}>
        <ScrollView>
          <ListUI
            List={ticketTypeList}
            selectProperty={"label"}
            onPress={onPress}
          />
        </ScrollView>
      </Layout>
    </>
  );
};

export default TicketTypeSelector;
