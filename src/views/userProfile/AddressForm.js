import { useIsFocused, useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Card } from 'react-native-paper';
import Select from '../../components/CustomSelectInput';
import TextInput from '../../components/CustomTextInput';
import Form from '../../components/Form';
import Layout from '../../components/Layout';
import device from '../../lib/Device';
import String from '../../lib/String';
import addressServices from '../../services/AddressService';
import countryService from '../../services/CountryService';
import userService from '../../services/UserService';
import NetworkStatus from '../../lib/NetworkStatus';
import SaveButton from "../../components/SaveButton";
import { View } from 'react-native';

const AddressForm = (props) => {

    const [detail, setDetail] = useState(null);
    const [data, setData] = useState(null);
    const [countryList, setCountryList] = useState([])
    const [stateList, setStateList] = useState([]);
    const [country, setCountry] = useState(null);
    const [stateValue, setStateValue] = useState(null)
    const [isSubmit, setIsSubmit] = useState(false)

    const isFocused = useIsFocused();

    const formRef = useRef(null);

    let navigation = useNavigation();

    useEffect(() => {
        getDetail();
    }, [isFocused])

    useEffect(() => {
        getAddressData();
        getCountryList()
    }, [detail?.id])

    useEffect(() => {
        if (data?.country || country) {
            getStateList()
        }
    }, [data?.country, country])


    let getDetail = async () => {
        await userService.getProfileData((err, res) => {
            setDetail(res && res?.data)

        })
    }

    let getAddressData = async () => {
        if (detail?.id) {
            await userService.get(detail?.id && parseInt(detail?.id), (err, response) => {
                if (response && response.data) {
                    setData(response.data)
                }
            })
        }

    }

    const getCountryList = () => {
        countryService.list(null, (response) => {
            setCountryList(response);
        })
    }
    const getCountryId = (countryName) => {
        const country = countryList.find(c => c.value === countryName);
        return country ? country.id : null;
    }

    const getStateList = async () => {
        let params = "";
        if (country || getCountryId(data?.country)) {
            params += "?stateList=true";
        }

        await countryService.getStateList(country ? country?.id : getCountryId(data?.country), params, (response) => {
            setStateList(response);
        })
    }


    const handleFormSubmit = async (values) => {
        setIsSubmit(true)
        const formData = new Object();
        formData.address1 = values.address1;
        formData.user_id = data?.id;
        formData.address2 = values.address2;
        formData.city = values.city;
        formData.state = stateValue ? stateValue : values?.state;
        formData.country = values?.country;
        formData.pin_code = values.pin_code;
        formData.latitude = values.latitude;
        formData.longitude = values.longitude;
        formData.id = data?.addressId;

        if (data?.addressId) {
            await addressServices.update(data?.addressId, formData, (err, res) => {
                if (res && res?.data) {
                    setIsSubmit(false)
                    navigation.navigate("editProfile")

                } else if (res && res?.status == NetworkStatus.STATUS_BAD_REQUEST) {
                    setIsSubmit(false)
                } else {
                    setIsSubmit(false)
                }
            })
        } else {
            await addressServices.create(formData, async (err, response) => {
                if (response) {
                    setIsSubmit(false)
                    navigation.navigate("editProfile")

                } else {
                    setIsSubmit(false)
                }
            })
        }

    };


    const getCurrentLocation = async () => {
        await device.getDeviceLocation(async (response) => {
            if (response) {
                if (formRef.current) {
                    formRef.current.setFieldValue('latitude', String.ParseString(response?.latitude));
                    formRef.current.setFieldValue('longitude', String.ParseString(response?.longitude));
                }
            }
        });
    };

    let initialValues = {
        first_name: data?.name ? detail?.name : "",
        last_name: detail?.lastName ? detail?.lastName : "",
        mobile: detail?.mobile ? detail?.mobile : "",
        address1: data?.address1 ? data?.address1 : "",
        country: data?.country ? data?.country : "",
        address2: data?.address2 ? data?.address2 : "",
        city: data?.city ? data?.city : "",
        pin_code: data?.pin_code ? data?.pin_code : "",
        latitude: data?.latitude ? data?.latitude : "",
        longitude: data?.longitude ? data?.longitude : "",
        state: data?.state ? data?.state : ""
    }



    const handleSumbmit = () => {
        if (formRef.current) {
            formRef.current.submitForm();
        }
    };



    const onChangeCountry = (value) => {
        setCountry(value)
    }
    const onChangeSate = (value) => {
        setStateValue(value.name)
    }

    return (
        <Layout
            title={`Edit Address`}
            showBackIcon={true}
            isSubmit={isSubmit}
        >

            <Form
                initialValues={initialValues}
                enableReinitialize={true}
                onSubmit={handleFormSubmit}
                ref={formRef}
            >


                <Card>
                    <Card.Content>
                        <TextInput name="address1" label="Address 1" />
                        <TextInput name="address2" label="Address 2" />
                        <TextInput name="city" label="City" />
                        <Select name="country" label="Country" options={countryList} onChange={onChangeCountry} />
                        <Select name="state" label="State" options={stateList} onChange={onChangeSate} />
                        <TextInput name="pin_code" label="Pin Code" />
                        <TextInput name="latitude" label="Latitude" />
                        <TextInput name="longitude" label="Longitude" />
                        <Button
                            mode="contained"
                            onPress={getCurrentLocation}
                            style={{ marginTop: 10 }}
                        >
                            Get Current Location
                        </Button>
                        <View style={{ width: "100%", marginTop: 10 }}>
                            <SaveButton
                                title={"Save"}
                                onPress={() => {
                                    handleSumbmit();
                                }}
                            />
                        </View>
                    </Card.Content>
                </Card>
            </Form>
        </Layout>
    );
};



export default AddressForm;
