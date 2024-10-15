import React, { useEffect, useRef } from "react"
import styles from "../../helper/Styles"
import Layout from "../../components/Layout"
import Refresh from "../../components/Refresh"
import { TouchableOpacity, View } from "react-native"
import { useState } from "react"
import ContactService from "../../services/ContactService";
import NoRecordFound from "../../components/NoRecordFound";
import { SwipeListView } from "react-native-swipe-list-view"
import ContactCard from "./components/ContactCard"
import { useIsFocused, useNavigation } from "@react-navigation/native"
import Spinner from "../../components/Spinner"
import DeleteConfirmationModal from "../../components/Modal/DeleteConfirmationModal"
import { Text } from "react-native"
import ShowMore from "../../components/ShowMore"

const ContactList = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [contactList, setContactList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [HasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);


  const stateRef = useRef();
  let navigation = useNavigation()
  let isFocused = useIsFocused()
  useEffect(() => {
    getContacts()
  }, [isFocused])
  useEffect(() => {
    if(refreshing){
      getContacts()
    }
  }, [refreshing])

  let getContacts = async () => {
    contactList && contactList.length == 0 && setIsLoading(true)
    await ContactService.search({page: page}, (res) => {
      if(res){
        setContactList(res)
        setIsLoading(false)
        setRefreshing(false)
      }
     
    })
  }

  const LoadMoreList = async (values) => {
    try {
      setIsLoading(true);

      let params = { page: page + 1 }
  
      await ContactService.search(params, (res) => {
        setContactList((prevTitles) => {
          return [...new Set([...prevTitles, ...res])];
        });
        setPage((prevPageNumber) => prevPageNumber + 1);
        setHasMore(res.length > 0);
        setIsLoading(false);
        setRefreshing(false)
      });
    } catch (err) {
      console.log(err);
    }
  };


  const closeRow = (rowMap, rowKey) => {
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  };

  const clearRowDetail = () => {
    if (stateRef) {
      const selectedItem = stateRef.selectedItem;
      const selectedRowMap = stateRef.selecredRowMap;
      if (selectedItem && selectedRowMap) {
        closeRow(selectedRowMap, selectedItem.id);
        setSelectedItem("");
        stateRef.selectedItem = "";
        stateRef.selecredRowMap = "";
      }
    }
  };


  const renderItem = (data) => {
    let item = data?.item;
    let index = data?.index;

    return (

      <View style={styles.container}>
        <ContactCard
          key={item.email}
          name={item.name}
          phone_number={item.work_phone}
          email={item.email}
          designation={item.designation}
          index={index}
          onRowClick={() => {
            navigation.navigate("ContactForm", { item });
          }} />

      </View>
    );
  };

  const renderHiddenItem = (data, rowMap) => {
    return (
      <>
        <View style={styles.swipeStyle}>
          <TouchableOpacity
            style={styles.actionDeleteButton}
            onPress={() => {
              deleteModalToggle();
              setSelectedItem(data?.item);
              stateRef.selectedItem = data?.item;
              stateRef.selecredRowMap = rowMap;
              closeRow(rowMap, data?.item.id);
            }}
          >
            <Text style={styles.btnText}>DELETE</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const AddNew = () => {
    navigation.navigate("ContactForm", { isAddPage: true });
  }

  const deleteModalToggle = () => {
    setDeleteModalOpen(!deleteModalOpen)
    clearRowDetail()
  }

  const contactDelete = async () => {
    if (selectedItem) {
      await ContactService.delete(selectedItem?.id, (response) => {
        setRefreshing(true)
        setTimeout(() => {
          setRefreshing(false)
        }, 2000)
      });
    }
  };


  return (
    <Layout
      title="Contacts"
      addButton
      buttonOnPress={AddNew}
      isLoading={isLoading}
      refreshing = {refreshing}
      showBackIcon={false}
    >
      <DeleteConfirmationModal
        modalVisible={deleteModalOpen}
        toggle={deleteModalToggle}
        name={selectedItem?.name}
        updateAction={contactDelete}
      />
      <Refresh refreshing={refreshing} setRefreshing={setRefreshing}>
        <View style={styles.container}>

          {contactList && contactList.length > 0 ?
            <SwipeListView
              data={contactList}
              renderItem={renderItem}
              rightOpenValue={-70}
              previewOpenValue={-40}
              previewOpenDelay={3000}
              disableRightSwipe={true}
              closeOnRowOpen={true}
              disableLeftSwipe={false}
              keyExtractor={item => String(item.id)}
              renderHiddenItem={renderHiddenItem}
            />
            :
            <NoRecordFound iconName={"receipt"} />
          }
          <ShowMore List={contactList} isFetching={isLoading} HasMore={HasMore} onPress={LoadMoreList} />

        </View>
      </Refresh>
    </Layout>
  )
}

export default ContactList
