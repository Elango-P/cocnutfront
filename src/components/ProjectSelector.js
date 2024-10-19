// Import React and Component
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import SearchBar from "./SearchBar";
import Fuse from "fuse.js";
import ArrayList from "../lib/ArrayList";
import ListUI from "./ListUI";
import ProjectService from "../services/ProjectService";
import Layout from "./Layout";
import ticketTypeService from "../services/TicketTypeService";
import Status from "../helper/Status";

const ProjectSelector = () => {

  const [searchPhrase, setSearchPhrase] = useState("");
  const [clicked, setClicked] = useState(false);

  const [projectList, setProjectList] = useState([]);

  const isFocused = useIsFocused();
  const navigation = useNavigation()


  useEffect(() => {
    getProjectList(true);
  }, [isFocused]);

  const getProjectList = () => {
    ProjectService.list(null,(response) => {
        setProjectList(response);

    })
}

const onPress = (value) => {    
  
  ticketTypeService.search({projectId :  value && value.value ,status : Status.ACTIVE}, (err, response) => {
    let data = response && response?.data && response?.data?.data;    
    let list = [];
    if (data) {
        for (let i = 0; i < data.length; i++) {
            const { id, name, default_story_point, default_assignee,fields } = data[i];
            list.push({
                label: name,
                value: id,
                default_story_point: default_story_point,
                default_assignee: default_assignee,
                fields: fields
            });
        }
    }
    if(list && list.length == 1){
      navigation.navigate("Ticket/Add",{projectId : value && value.value , ticketTypeValue : list[0], allow_for_assignee_change_permission: value?.allow_for_assignee_change_permission });
    }else{
       navigation.navigate("ticketTypeSelector",{projectId : value && value.value, allow_for_assignee_change_permission: value?.allow_for_assignee_change_permission });
    
    }

});



}

  const handleChange = async (search) => {
    if (search) {
      let typeData = new Array();

      const fuseOptions = {
        keys: ["label"],
      };

      const searchType = new Fuse(projectList, fuseOptions);

      let results = searchType.search(search);

      if (ArrayList.isNotEmpty(results)) {
        for (let i = 0; i < results.length; i++) {
          typeData.push({
            value: results[i].item.value,
            label: results[i].item.label,
            type: results[i].item.type,
          });
        }
      }
      setProjectList(typeData);
    }
  };

  return (
    <>
    <Layout title = {"Create Ticket - Select Project"} >
      <SearchBar
        searchPhrase={searchPhrase}
        setSearchPhrase={setSearchPhrase}
        setClicked={setClicked}
        clicked={clicked}
        onPress={getProjectList}
        handleChange={handleChange}
        noScanner
      />
      <ScrollView>
        <ListUI
          List={projectList}
          selectProperty={"label"}
          onPress={onPress}
        />
      </ScrollView>
      </Layout>
    </>
  );
};

export default ProjectSelector;
