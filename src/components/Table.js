import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiClient from '../apiClient';
import ArrayList from '../lib/ArrayList';
import Url from '../lib/Url';
import NoRecordFound from './NoRecordFound';
import Spinner from './Spinner';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export const Column = () => <View />;

const Table = ({ arrayList = [], children, params = {}, apiURL, tableWidth = null }) => {
    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(25);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRowCount, setTotalRowCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        fetchData(currentPage);
    }, [ArrayList.isArray(arrayList)]);

    useEffect(() => {
        fetchData(currentPage);
    }, []);

    const fetchData = async (currentPage) => {
        if (apiURL) {
            setIsLoading(true);
            let apiUrl = await Url.get(apiURL, { ...params, page: currentPage, pageSize: rowsPerPage });
            apiClient.get(apiUrl, (error, response) => {
                const data = response?.data?.data;
                setTableData(data);
                const totalItems = response?.data?.totalCount || 0;
                setTotalRowCount(totalItems);
                setTotalPages(Math.ceil(totalItems / rowsPerPage));
                setIsLoading(false);
            });
        } else if (arrayList?.length > 0) {
            const totalItems = arrayList.length;
            setTotalRowCount(totalItems);
            setTotalPages(Math.ceil(totalItems / rowsPerPage));
            const paginatedData = arrayList.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
            setTableData(paginatedData);
            setIsLoading(false);
        }
    };

    const columns = React.Children.map(children, (child) => child?.props);

    const renderHeader = () => (
        <View style={styles.row}>
            {React.Children.map(children, (child) => (
                <View key={child.props.fieldName} style={[styles.headerCell, { width: child?.props?.width || "100%", height: 40 }]}>
                    <Text style={styles.headerText}>{child?.props?.children}</Text>
                </View>
            ))}
        </View>
    );

    const renderRows = () => (
        tableData.map((rowData, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
                {columns.map((fieldProps, colIndex) => (
                    <View key={colIndex} style={[styles.cell, { width: fieldProps.width || "100%", height: fieldProps.height || 40 }]}>
                        <Text style={[styles.cellText, fieldProps?.style]}>
                            {fieldProps?.renderField ? fieldProps?.renderField(rowData) : rowData[fieldProps?.fieldName]}
                        </Text>
                    </View>
                ))}
            </View>
        ))
    );

    const noRecordFound = () => (
        <NoRecordFound
            iconName={"receipt"}
            styles={{ paddingVertical: 250, alignItems: "center" }}
        />
    );

    const handleNextPage = () => {
        if (currentPage < totalPages){
            setCurrentPage(currentPage + 1);
            fetchData(currentPage + 1)
        } 
    };
    
    const handlePreviousPage = () => {
        if (currentPage > 1){
            setCurrentPage(currentPage - 1);
            fetchData(currentPage - 1)
        }
    };

    const pagination = () => (
        <View style={styles.paginationControls}>
            <Text style={styles.pageText}>{`Page ${currentPage} of ${totalPages}`}</Text>
            <View style={styles.chevronContainer}>
                <TouchableOpacity onPress={() => handlePreviousPage()} disabled={currentPage === 1}>
                    <View style={styles.chevronIconContainer}>
                        <Icon name="chevron-back-outline" size={24} color={currentPage === 1 ? '#ccc' : '#000'} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() =>handleNextPage()} disabled={currentPage === totalPages}>
                    <View style={styles.chevronIconContainer}>
                        <Icon name="chevron-forward-outline" size={24} color={currentPage === totalPages ? '#ccc' : '#000'} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );

    let isLoader = () => {
        return <Spinner />;
    };

    return (
        <ScrollView horizontal style={{ marginBottom: 5 }}>
            <View style={[styles.table, { width: tableWidth ? tableWidth : columns?.length <= 3 ? screenWidth : isLoading ? screenWidth : "100%", height: isLoading ? screenHeight : totalRowCount > 23 ? "100%" : screenHeight }]}>
                {isLoading && isLoader()}
                {!isLoading && renderHeader()}
                {!isLoading && ArrayList.isArray(tableData) && renderRows()}
                {!isLoading && !ArrayList.isArray(tableData) && noRecordFound()}
                {pagination()}
            </View>
        </ScrollView>
    );
};


const styles = StyleSheet.create({
    table: {
        borderWidth: 1,
        borderColor: '#ddd',
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    cell: {
        padding: 8,
        borderRightWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
    },
    headerCell: {
        backgroundColor: '#292934',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderColor: '#ddd',
    },
    headerText: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: "center",
        color: "white",
    },
    cellText: {
        fontSize: 12,
        textAlign: "center",
    },
    paginationControls: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 10,
        alignItems: 'center',
    },
    pageText: {
        marginRight: 10,
        fontSize: 14,
        color: '#000',
    },
    chevronContainer: {
        flexDirection: 'row',
    },
    chevronIconContainer: {
        backgroundColor: '#e0e0e0',
        padding: 5,
        borderRadius: 4,
        marginHorizontal: 5,
    },
});

export default Table;
