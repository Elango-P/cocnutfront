import React, { useEffect, useState } from "react";
import Select from "./Select";
import AttendanceTypeService from "../services/AttendanceTypeService";

const AttendanceTypeSelect = (props) => {
    const { name, data, label, onChange, disable, divider, showBorder,required, control: controlProp, typeList } = props

  const [options, setOptions] = useState([]);

  useEffect(() => {
    getList();
  }, []);


  const getList = async () => {
    try{
      AttendanceTypeService.list({},(response) => {
        const optionList = new Array();
        let list = response;
        if (list && list.length > 0) {
          for (let i = 0; i < list.length; i++) {
            optionList.push({
              label: list[i].name,
              value: list[i].id,
              id: list[i].id,
              is_leave:list[i]?.is_leave,
              is_working_day:list[i]?.is_working_day,
              is_additional_leave:list[i]?.is_additional_leave,
              is_additional_shift:list[i]?.is_additional_shift,
              is_additional_day:list[i]?.is_additional_day,
              is_absent:list[i]?.is_absent,
            });
          }
  
          setOptions(optionList);
          typeList && typeList(optionList)
        }
  
      });
    }catch(err){
      console.log(err);
    }
  };

  return (
    <>
       <Select
      control={controlProp ? controlProp : control}
      options={options}
      OnSelect={onChange}
      label={label}
      name={name}
      divider={divider}
      showBorder={showBorder}
      placeholder={"Select Type"}
      data={data}
      disable={disable}
      required={required}
    />
    </>
  );
};

export default AttendanceTypeSelect;
