import { View, Text, Image,  StyleSheet,  Pressable,  ScrollView,  TextInput,  KeyboardAvoidingView,  Platform,  Alert,  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button2 from "../components/button";
import Line from "../components/line";


const API_URL = "https://docket-backend-tcg1cp-production.up.railway.app/api";

const LoginScreen3 = () => {

  const { fullName, workEmail, lawFirmName, role } = useLocalSearchParams();


  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
  
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill in both password fields.");
      return;
    }


    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match. Please try again.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long.");
      return;
    }

    setLoading(true); 

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,      
          email: workEmail,       
          password: password,       
          role: role,                
          specialty: '',
        }),
      });

      const data = await response.json();

      if (data.success) {
       
        await AsyncStorage.setItem("token", data.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.data.user));
        await AsyncStorage.setItem("lawFirmName", lawFirmName);

        router.replace("./accountCreated");
      } else {
       
        const errorMessage =
          data.errors && data.errors.length > 0
            ? data.errors.map((e) => e.message).join("\n")
            : data.message || "Registration failed. Please try again.";

        Alert.alert("Registration Failed", errorMessage);
      }
    } catch (error) {

      Alert.alert(
        "Error",
        "Could not connect to the server. Check your internet connection."
      );
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.stepText}>Step 3 of 3 - Create Password</Text>
          </View>

          <Line
            style={{ marginBottom: 30 }}
            style1={{ backgroundColor: "#C9A84C" }} 
            style2={{ backgroundColor: "#C9A84C" }} 
            style3={{ backgroundColor: "#C9A84C" }} 
          />

          <Text style={styles.instruction}>
            Create a strong password to secure your Docket account.
          </Text>

          <Text style={styles.passwordRules}>
            Must be 8+ characters with uppercase, lowercase, a number and a
            special character (e.g. Password123!)
          </Text>

         
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Min. 8 characters"
              placeholderTextColor="white"
              secureTextEntry={true} 
              value={password}
              onChangeText={setPassword}
            />
          </View>

       
          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONFIRM PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor="white"
              secureTextEntry={false} 
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <View style={styles.buttonRow}>
            <View style={styles.btnContainer}>
              <Button2 onPress={() => router.back()} text="Back" />
            </View>
            <View style={styles.btnContainer}>
              <Button2
                onPress={handleRegister}
                text={loading ? "" : "Create Account"}
                disabled={loading}
              />

              {loading && (
                <ActivityIndicator
                  color="white"
                  style={styles.spinner}
                />
              )}
            </View>
          </View>

          <View style={styles.signInRow}>
            <Text style={styles.haveAccountText}>
              Already have an account?{" "}
            </Text>
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
  instruction: {
    color: "white",
    fontSize: 17,
    marginBottom: 10,
    lineHeight: 26,
  },
  passwordRules: {
    color: "#99C6FF",
    fontSize: 12,
    marginBottom: 30,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#99C6FF",
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    borderColor: "#99C6FF",
    borderWidth: 1,
    borderRadius: 15,
    height: 50,
    paddingHorizontal: 10,
    color: "white",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginVertical: 30,
  },
  btnContainer: {
    flex: 1,
    position: "relative",
  },
  spinner: {
    position: "absolute",
    alignSelf: "center",
    top: 12,
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

export default LoginScreen3;