import {  View,  Text, Image, StyleSheet,  Pressable,  TextInput,  KeyboardAvoidingView,  ScrollView,  Platform,  Alert,  ActivityIndicator,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";


const API_URL = "https://docket-backend-tcg1cp-production.up.railway.app/api";

const Index = () => {
 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

 
  const handleLogin = async () => {
 
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
       
        await AsyncStorage.setItem("token", data.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.data.user));

        
        router.replace("/dashboard/dashB");
      } else {
        
        Alert.alert("Login Failed", data.message || "Invalid credentials.");
      }
    } catch (error) {
     
      Alert.alert("Error", "Could not connect to the server. Check your internet connection.");
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
        
          <View style={styles.imageContainer}>
            <Image
              style={styles.image}
              source={require("../../assets/images/docketLogo.png")}
            />
            <Text style={styles.appTitle}>Docket</Text>
            <Text style={styles.appSubtitle}>Legal Case Management - Mex-Trial</Text>
          </View>

        
          <View style={styles.welcome}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to your firm account</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="chidi@mex-trial.ng"
              placeholderTextColor="white"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail} 
            />
          </View>

         
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="**********"
              placeholderTextColor="white"
              secureTextEntry={true} 
              value={password}
              onChangeText={setPassword} 
            />
          </View>

       
          <View style={styles.btnContainer}>
            <Pressable
              style={styles.signInButton}
              onPress={handleLogin}
              disabled={loading} 
            >
              {loading ? (
                <ActivityIndicator color="white" /> 
              ) : (
                <Text style={styles.signInText}>Sign In</Text>
              )}
            </Pressable>
          </View>

         
          <View style={styles.createAccountRow}>
            <Text style={styles.newText}>New to Docket? </Text>
            <Pressable onPress={() => router.push("/auth/loginScreen1")}>
              <Text style={styles.createText}>Create an account</Text>
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
  imageContainer: {
    marginTop: 60,
    marginBottom: 40,
    alignItems: "center",
  },
  image: {
    width: 120,
    height: 113,
    resizeMode: "cover",
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 30,
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  appSubtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "white",
  },
  welcome: {
    marginBottom: 30,
    gap: 10,
  },
  welcomeTitle: {
    fontSize: 17,
    color: "white",
    fontWeight: "500",
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#99C6FF",
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
    backgroundColor: "#FFFFFF66",
    borderRadius: 15,
    height: 50,
    paddingHorizontal: 10,
    color: "white",
  },
  btnContainer: {
    marginVertical: 30,
    alignSelf: "center",
    width: 300,
  },
  signInButton: {
    backgroundColor: "#C9A84C",
    borderRadius: 15,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  createAccountRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  newText: {
    color: "#99C6FF",
    fontSize: 14,
  },
  createText: {
    color: "#C9A84C",
    fontSize: 14,
  },
});

export default Index;