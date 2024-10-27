import React, { useState} from "react";
import SearchBar from "../../components/SearchBar";
import ProductSearch from "../../components/ProductSearch";
import productService from "../../services/ProductService";
import { View } from "react-native";

const Search=({productOnClick,clicked,setClicked,searchPhrase,setSearchPhrase})=>{
    const [storeProductList, setStoreProductList] = useState("");

    const handleSearchOnChange = async (e) => {
        const products = await productService.SearchFromLocalDB(e);
        setStoreProductList(products);
    };
    return(

        <>
        <View style={{ width: '100%' }}>
        <SearchBar
            searchPhrase={searchPhrase}
            setSearchPhrase={setSearchPhrase}
            setClicked={setClicked}
            clicked={clicked}
            handleChange={handleSearchOnChange}
            noScanner
        />
    </View>
    {searchPhrase && (
    <View>
        <ProductSearch
            searchResult={storeProductList}
            productOnClick={productOnClick}
        />
    </View>
    )}
    </>
    )

}
export default Search;