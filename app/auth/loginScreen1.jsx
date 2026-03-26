import {View,  Text,  Image,  StyleSheet, Pressable,  ScrollView,  TextInput,  KeyboardAvoidingView,  Platform,  Alert,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import Button from "../components/button";
import Line from "../components/line";

const LoginScreen1 = () => {

  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [lawFirmName, setLawFirmName] = useState("");

  
  const handleContinue = () => {
   
    if (!fullName || !workEmail || !lawFirmName) {
      Alert.alert("Error", "Please fill in all fields before continuing.");
      return;
    }

   
    if (!workEmail.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }

   
    router.push({
      pathname: "/auth/loginScreen2",
      params: {
        fullName: fullName,
        workEmail: workEmail,
        lawFirmName: lawFirmName,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeView}>
    
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.logoRow}>
            <Image
              style={styles.image}
              source={require("../../assets/images/docketLogo.png")}
            />
            <View>
              <Text style={styles.appTitle}>Docket</Text>
              <Text style={styles.appSubtitle}>
                Legal Case Management - Mex-Trial
              </Text>
            </View>
          </View>

       <View style={styles.stepHeader}>
            <Text style={styles.createTitle}>Create account</Text>
            <Text style={styles.stepText}>Step 1 of 3 - Your Information</Text>
          </View>

          <Line
            style={{ marginBottom: 30 }}
            style1={{ backgroundColor: "#C9A84C" }} 
            style2={{ backgroundColor: "#99C6FF" }} 
            style3={{ backgroundColor: "#99C6FF" }}  
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Tunde Bakare"
              placeholderTextColor="white"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>WORK EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. amaka@yourfirm.ng"
              placeholderTextColor="white"
              keyboardType="email-address"
              autoCapitalize="none"
              value={workEmail}
              onChangeText={setWorkEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>LAW FIRM NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Mex-Trial & Associates"
              placeholderTextColor="white"
              value={lawFirmName}
              onChangeText={setLawFirmName}
            />
          </View>

          <View style={styles.btnContainer}>
            <Button onPress={handleContinue} text="Continue" />
          </View>

          <View style={styles.signInRow}>
            <Text style={styles.haveAccountText}>Already have an account? </Text>
            <Pressable onPress={() => router.replace('/auth')}>
            <Text style={styles.signInText}>Sign In</Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeView: {
    flex: 1,
    backgroundColor: "#0D1B2A",
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginTop: 40,
    marginBottom: 40,
  },
  image: {
    width: 70,
    height: 60,
    resizeMode: "cover",
  },
  appTitle: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
  },
  appSubtitle: {
    fontSize: 14,
    color: "white",
  },
  stepHeader: {
    marginBottom: 20,
    gap: 8,
  },
  createTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
  },
  stepText: {
    color: "white",
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "white",
    fontSize: 15,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#FFFFFF66",
    borderRadius: 15,
    height: 50,
    paddingHorizontal: 10,
    color: "white",
  },
  btnContainer: {
    width: 200,
    marginVertical: 30,
    alignSelf: "center",
  },
  signInRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  haveAccountText: {
    color: "#99C6FF",
    fontSize: 14,
  },
  signInText: {
    color: "#C9A84C",
    fontSize: 14,
  },
});

export default LoginScreen1;