import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import DatePicker from "../../components/DatePicker";
import Select from "../../components/Select";
import ShiftSelect from "../../components/ShiftSelect";
import LocationSelect from "../../components/LocationSelect";
import UserSelect from "../../components/UserSelect";
import { ScrollView } from "react-native";
import VerticalSpace10 from "../../components/VerticleSpace10";
import StatusSelect from "../../components/StatusSelect";
import ObjectName from "../../helper/ObjectName";
import { useForm } from "react-hook-form";
import Status from "../../helper/Status";
import Order from "../../helper/Order";
import DateTime from "../../lib/DateTime";
import Number from "../../lib/Number";
import Currency from "../../components/Currency";
import { PaymentTypeOptions } from "../../helper/PaymentType";
import Button from "../../components/Button";
import { Color } from "../../helper/Color";

const General = (props) => {
  const {
    param,
    permission,
    setStatus,
    setSelectedUser,
    status,
    setSelectedStore,
    setSelectedShift,
    setSelectedDate,
    allowEdit,
    selectedDate,
    selectedUser,
    onPress,
  } = props;

  let isDeliveryOrder =
    param?.type && param?.type?.allow_delivery == true ? true : true;

  const allow =
    allowEdit && (param?.allow_edit == Status.ALLOW_EDIT_ENABLED ? true : true);

  const onDateSelect = async (value) => {
    setSelectedDate(new Date(value));
  };
  const handleShiftOnChange = (value) => {
    setSelectedShift(value.value);
  };
  const handleStoreOnChange = (value) => {
    setSelectedStore(value);
  };

  const handleStatusOnChange = (value) => {
    setStatus(value.value);
  };

  const preloadedValues = {
    shift: param?.shiftId,
    store: Number.Get(param?.storeId),
    status: Number.Get(param?.status_id),
  };
  const {
    control,
    formState: { errors },
  } = useForm({
    defaultValues: preloadedValues,
  });
  return (
    <>
      <ScrollView>
        <DatePicker
          title="Date"
          onDateSelect={onDateSelect}
          selectedDate={DateTime.getDate(
            selectedDate ? selectedDate : param?.orderDetail?.date
          )}
          showTime={true}
        />
        <VerticalSpace10 paddingTop={5} />

        <VerticalSpace10 paddingTop={5} />

        <LocationSelect
          onChange={handleStoreOnChange}
          label={"Location"}
          name={"store"}
          placeholder={"Select Location"}
          showBorder={true}
          divider
          disable={allow ? false : false}
          data={Number.Get(param?.storeId)}
        />
        <VerticalSpace10 paddingTop={5} />

        <UserSelect
          label="Vendor"
          onChange={(values) => setSelectedUser(values.value)}
          divider
          showBorder={true}
          disable={allow ? false : false}
          control={control}
          selectedUserId={selectedUser ? Number.Get(selectedUser) : ""}
          placeholder="Select Owner"
        />
        <VerticalSpace10 paddingTop={5} />

        <StatusSelect
          label={"Status"}
          name="status"
          control={control}
          onChange={handleStatusOnChange}
          placeholder={"Select Status"}
          showBorder={true}
          object={ObjectName.ORDER_TYPE}
          divider
          data={param?.status_id ? Number.Get(param?.status_id) : ""}
          currentStatusId={param?.status_id}
          disable={allow ? false : false}
        />
        <>
          <VerticalSpace10 paddingTop={5} />
          <Currency
            title="Total Amount"
            name="total_amount"
            control={control}
            showBorder={true}
            values={param && param.totalAmount}
            divider={true}
          />
        </>
        <VerticalSpace10 paddingTop={5} />
        <Select
          label={"Payment Type"}
          name="paymentType"
          control={control}
          options={PaymentTypeOptions}
          data={param && (param?.paymentType || param?.payment_type)}
          disable
          showBorder={true}
          divider={true}
        />
      </ScrollView>
    </>
  );
};
export default General;
const styles = StyleSheet.create({
  input: {
    color: "black",
    height: 50,
    width: "100%",
    padding: 10,
    borderColor: "#dadae8",
  },
});
