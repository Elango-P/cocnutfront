import React, { useEffect, useState } from 'react';

import BottomDrawer from "../components/BottomDrawer";

import Select from "../components/Select";

import { useForm } from "react-hook-form";



import DatePicker from '../components/DatePicker';
import VerticalSpace10 from '../components/VerticleSpace10';

import { PaymentTypeOptions } from '../helper/PaymentType';
import OrderProduct from '../helper/OrderProduct';
import UserSelect from './UserSelect';
import SearchBar from './SearchBar';


const FilterDrawer = (
    { isOpen,
        handleSubmit,
        onClose,
        ObjectName,
        closeDrawer,
        paymentOnSelect,
        onEndDateSelect,
        selectedEndDate,
        selectedDate, onDateSelect,
        shiftOnSelect,
        userOnSelect,
        reporterOnselect,
        sprintOnSelect,
        groupOnSelect,
        categoryOnSelect,
        brandOnSelect,
        locationOnSelect,
        accountOnSelect,
        paymentAccountOnSelect,
        showPaymentAccount,
        typeOnSelect,
        sortTypeOnSelect,
        clearFilter,
        statusOnSelect,
        projectOnSelect,
        statusOptions,
        groupOption,
        roleOnSelect,
        showLocation,
        values,
        showStatus,
        showAccount,
        showSprint,
        showUser,
        showReporter,
        showProject,
        showPayment,
        showShift,
        showDate,
        showCategory,
        showStatusOption,
        toLocationOnSelect,
        fromLocationOnSelect,
        showBrand,
        showRole,
        showType,
        label,
        placeholder,
        statusList,
        reporterList,
        sprintList,
        userList,
        locationList,
        projectList,
        shiftList,
        accountList,
        paymentAccountList,
        accountLabel,
        categoryList,
        brandList,
        role,
        typeList,
        locationLabel,
        showGroup,
        showToLocation,
        showFromLocation,
        showOnDate,
        showTypeOption,
        activityTypeSelect,
        activityTypeOption,
        showActivityType,
        onInputStatusChange,
        searchParam,
        handleClearSearch,
        handleSearchChange,
        showSearch

    }) => {


    const sortTypeOptions = [
        {
            label: OrderProduct.REPORT_TYPE_QUANTITY_WISE,
            value: OrderProduct.REPORT_TYPE_QUANTITY_WISE
        },
        {
            label: OrderProduct.REPORT_TYPE_AMOUNT_WISE,
            value: OrderProduct.REPORT_TYPE_AMOUNT_WISE
        }
    ];


    const {
        control,
        reset,
        formState: { errors },
    } = useForm({ defaultValues: {} });




    const CloseDrawer = () => {
        closeDrawer();
        reset({})
    }

    return (
        <>
            <BottomDrawer
                isOpen={isOpen}
                onClose={onClose}
                clearFilter={clearFilter}
                title={"Bill Filter"}
                closeDrawer={CloseDrawer}
                applyFilter={handleSubmit}>

                {showSearch && (
                    <>
                        <SearchBar
                            label={"Search"}
                            searchPhrase={searchParam}
                            handleChange={handleSearchChange}
                            noScanner
                            onPress={handleClearSearch}
                            customStyle
                        />
                        <Select
                            label={locationLabel ? locationLabel : "Location"}
                            name="location"
                            options={locationList}
                            showBorder={true}
                            control={control}
                            data={values && values?.location ? values?.location : values?.fromLocation}
                            OnSelect={locationOnSelect}
                            placeholder="Select Location"
                        />
                        <VerticalSpace10 />
                    </>
                )}
                {showFromLocation && (
                    <>
                        <Select
                            label={"From Location"}
                            name="fromLocation"
                            options={locationList}
                            showBorder={true}
                            control={control}
                            data={values && values?.fromLocation}
                            OnSelect={fromLocationOnSelect}
                            placeholder="Select Location"
                        />
                        <VerticalSpace10 />
                    </>
                )}
                {showToLocation && (
                    <>
                        <Select
                            label={"To Location"}
                            name="toLocation"
                            options={locationList}
                            showBorder={true}
                            control={control}
                            data={values && values?.toLocation}
                            OnSelect={toLocationOnSelect}
                            placeholder="Select Location"
                        />
                        <VerticalSpace10 />
                    </>
                )}
                {showProject && (

                    <>
                        <Select
                            label={"Project"}
                            name="project"
                            control={control}
                            options={projectList}
                            showBorder={true}
                            data={values && values?.project}
                            placeholder={"Select Project"}
                            OnSelect={projectOnSelect}
                        />

                        <VerticalSpace10 />
                    </>

                )}
                {showUser && (
                    <>
                        <Select
                            label={label ? label : "User"}
                            name="userName"
                            options={userList}
                            showBorder={true}
                            control={control}
                            data={values && values?.user}
                            getDetails={(values) => userOnSelect && userOnSelect(values)}
                            placeholder={placeholder ? placeholder : "Select User"}
                            userCard
                        />
                        <VerticalSpace10 />
                    </>
                )}
                {showReporter && (
                    <>
                        <UserSelect
                            label="Reporter"
                            selectedUserId={values && values?.reporter}
                            name={"reporter"}
                            showBorder={true}
                            onChange={(values) => reporterOnselect && reporterOnselect(values)}
                            control={control}
                            placeholder="Select Reporter"
                        />
                        <VerticalSpace10 />
                    </>

                )}

                {showCategory && (
                    <>
                        <Select
                            label="Category"
                            options={categoryList}
                            control={control}
                            placeholder="Select Category"
                            OnSelect={categoryOnSelect}
                            data={values && values.category}
                        />
                        <VerticalSpace10 />
                    </>
                )}

                {showBrand && (
                    <>
                        <Select
                            label="Brand"
                            options={brandList}
                            control={control}
                            placeholder="Select Brand"
                            OnSelect={brandOnSelect}
                            data={values && values.brand}
                        />

                        <VerticalSpace10 />

                    </>
                )}
                {showRole && (
                    <>
                        <Select
                            label="Role"
                            name="role"
                            options={role}
                            showBorder={true}
                            control={control}
                            data={values && values.role}
                            OnSelect={roleOnSelect}
                            placeholder="Select Role"
                        />
                        <VerticalSpace10 />
                    </>
                )}
                {showAccount && (
                    <>
                        <Select
                            label="Account"
                            name="accountName"
                            options={accountList}
                            showBorder={true}
                            control={control}
                            data={values && values.account}
                            OnSelect={accountOnSelect}
                            placeholder={accountLabel ? accountLabel : "Select Account"}
                        />
                        <VerticalSpace10 />
                    </>
                )}
                {showStatusOption && (
                    <Select
                        label="Status"
                        options={statusOptions}
                        control={control}
                        placeholder="Select Status"
                        disableSearch={true}
                        OnSelect={statusOnSelect}
                        data={values && values.status}
                    />
                )}


                {showStatus && (
                    <>
                        <Select
                            label={"Status"}
                            name="status"
                            control={control}
                            options={statusList}
                            showBorder={true}
                            data={values && values?.status}
                            placeholder={"Select Status"}
                            OnSelect={statusOnSelect}
                            getDetails={onInputStatusChange}
                        />

                        <VerticalSpace10 />
                    </>
                )}
                {showSprint && (
                    <>
                        <Select
                            label={"Sprint"}
                            name="sprint"
                            options={sprintList}
                            showBorder={true}
                            control={control}
                            data={values && values?.sprint}
                            OnSelect={sprintOnSelect}
                            placeholder={"Select Sprint"}
                        />
                        <VerticalSpace10 />
                    </>

                )}
                {showGroup && (
                    <>
                        <Select
                            label={"Group"}
                            name="group"
                            options={groupOption}
                            showBorder={true}
                            control={control}
                            data={values && values?.group}
                            OnSelect={groupOnSelect}
                            placeholder={"Select Group"}
                        />
                        <VerticalSpace10 />
                    </>

                )}


                {showPaymentAccount && (
                    <>
                        <Select
                            label="Payment Account"
                            name="paymentAccount"
                            options={paymentAccountList}
                            showBorder={true}
                            control={control}
                            data={values && values.paymentAccount}
                            OnSelect={paymentAccountOnSelect}
                            placeholder={"Select Payment Account"}
                        />
                        <VerticalSpace10 />

                    </>
                )}

                {showType && (
                    <>
                        <Select
                            label="Type"
                            name="type"
                            options={typeList}
                            showBorder={true}
                            control={control}
                            data={values && values?.typeId ? values && values?.typeId : values && values?.type}
                            getDetails={(values) => typeOnSelect && typeOnSelect(values)}
                            placeholder="Select Type"
                        />
                        <VerticalSpace10 />
                    </>
                )}
                {showTypeOption && (
                    <>

                        <Select
                            label="Sort Type"
                            name="sortType"
                            options={sortTypeOptions}
                            showBorder={true}
                            control={control}
                            data={values && values.sortType}
                            OnSelect={sortTypeOnSelect}
                            placeholder="Select Sort Type"
                            position="top"
                        />
                        <VerticalSpace10 />
                    </>
                )}


                {showPayment && (
                    <>
                        <Select
                            label={"Payment Type"}
                            name="paymentType"
                            control={control}
                            options={PaymentTypeOptions}
                            showBorder={true}
                            data={values && values?.paymentType}
                            placeholder={"Select Payment Type"}
                            OnSelect={paymentOnSelect}
                        />


                        <VerticalSpace10 />
                    </>

                )}
                {showShift && (
                    <>
                        <Select
                            label="Shift"
                            name="shift"
                            options={shiftList}
                            showBorder={true}
                            control={control}
                            data={values && values?.shift}
                            OnSelect={shiftOnSelect}
                            placeholder="Select Shift"
                        />

                        <VerticalSpace10 />
                    </>
                )}

                {showDate && (
                    <>
                        <DatePicker
                            onClear={() => onDateSelect("")}
                            name={"startDate"}
                            title={"Start Date"}
                            onDateSelect={onDateSelect}
                            selectedDate={selectedDate} />
                        <VerticalSpace10 />
                        <DatePicker
                            onClear={() => onEndDateSelect("")}
                            name={"endDate"}
                            title={"End Date"}
                            onDateSelect={onEndDateSelect}
                            selectedDate={selectedEndDate}
                        />
                        <VerticalSpace10 />
                    </>
                )}
                {showOnDate && (
                    <>
                        <DatePicker
                            onClear={() => onDateSelect("")}
                            name={"startDate"}
                            title={"Date"}
                            onDateSelect={onDateSelect}
                            selectedDate={selectedDate} />
                        <VerticalSpace10 />

                    </>
                )}

                {showActivityType && (
                    <>
                        <Select
                            label={"Activity Type"}
                            name="activityType"
                            control={control}
                            options={activityTypeOption}
                            showBorder={true}
                            data={values && values?.activityType}
                            placeholder={"Select Activity Type"}
                            OnSelect={activityTypeSelect}
                        />


                        <VerticalSpace10 />
                    </>

                )}




            </BottomDrawer>


        </>
    )
};

export default FilterDrawer;