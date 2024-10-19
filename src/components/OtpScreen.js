import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Layout from "./Layout";
import apiClient from "../apiClient";
import { endpoints } from "../helper/ApiEndPoint";
const OTPVerificationScreen = ({ route }) => {
  const navigator = useNavigation();

  const [otp, setOtp] = useState(["", "", "", ""]);

  const inputs = useRef([]);

  const [error, setError] = useState("");

  // Reset OTP state when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setOtp(["", "", "", ""]);
    }, [])
  );

  useEffect(() => {
    otpGenerate();
  }, []);

  const handleInputChange = (text, index) => {
    const newOtp = [...otp];

    // Handle backspace: if input is empty and we're not at the first index, go to previous input
    if (text === "" && index > 0) {
      newOtp[index] = ""; // Clear the current input
      setOtp(newOtp);
      inputs.current[index - 1].focus(); // Move to the previous input
      // Set error message when clearing the input
      setError("Please fill the required fields");
      return;
    }

    newOtp[index] = text;
    setOtp(newOtp);
    const enteredOtp = newOtp.join("");

    if (enteredOtp.length < 4) {
      setError("Please fill the required fields");
    } else {
      setError("");
    }

    // Move to the next input if the current input is filled
    if (text && index < otp.length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleSubmit = () => {
    const enteredOtp = otp.join("");

    // Add logic for OTP verification
    if (enteredOtp.length < 4) {
      setError("Please fill the required fields"); // Set error message
      return;
    } else {
      setError("");
    }

    apiClient.post(
      `${endpoints().salaryAPI}/verifyOtp`,
      { otp: enteredOtp },
      async (error, response) => {
          if (response) {
          navigator.navigate(route?.params?.path);
        }
      }
    );
  };

  const otpGenerate = () => {
    setOtp(["","","",""])
    apiClient.post(
      `${endpoints().salaryAPI}/generateOtp`,
      async (error, response) => {}
    );
  };

  return (
    <Layout title="Otp Verification" showBackIcon={true}>
      <View style={styles.container}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          Please enter the OTP sent to your phone
        </Text>
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={styles.otpInput}
              value={digit}
              keyboardType="numeric"
              maxLength={1}
              onChangeText={(text) => handleInputChange(text, index)}
            />
          ))}
        </View>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={otpGenerate}>
          <Text style={styles.resendText}>Resend OTP</Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    marginVertical: 10,
  },
  errorText: {
    fontSize: 16,
    marginVertical: 5,
    color: "red",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    gap: 5,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    width: 50,
    height: 50,
    textAlign: "center",
    fontSize: 18,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  resendText: {
    marginTop: 10,
    color: "#007bff",
    textDecorationLine: "underline",
  },
});

export default OTPVerificationScreen;
