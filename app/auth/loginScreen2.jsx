import { View,Text, Image, StyleSheet,Pressable,  ScrollView,  KeyboardAvoidingView,  Platform,  Alert,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import Button2 from "../components/button";
import Line from "../components/line";

const LoginScreen2 = () => {

  const { fullName, workEmail, lawFirmName } = useLocalSearchParams();

  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      key: "senior_partner",        
      title: "Senior Partner",
      description: "Full access — manage cases, team & reports",
    },
    {
      key: "secretary",           
      title: "Legal Secretary",
      description: "Create & organize cases, clients and hearings firm-wide",
    },
    {
      key: "associate",               
      title: "Associate",
      description: "View your assigned cases and manage hearings",
    },
  ];

  const handleContinue = () => {
    if (!selectedRole) {
      Alert.alert("Error", "Please select a role before continuing.");
      return;
    }

    router.push({
      pathname: "/auth/loginScreen3",
      params: {
        fullName: fullName,
        workEmail: workEmail,
        lawFirmName: lawFirmName,
        role: selectedRole,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeView}>
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
          <Text style={styles.stepText}>Step 2 of 3 - Your Role</Text>
        </View>

        <Line
          style={{ marginBottom: 30 }}
          style1={{ backgroundColor: "#C9A84C" }} 
          style2={{ backgroundColor: "#C9A84C" }} 
          style3={{ backgroundColor: "#99C6FF" }} 
        />

        <Text style={styles.instruction}>
          Select your role at{" "}
          <Text style={styles.firmName}>Mex-Trial & Associates</Text>. This
          determines what you can access in Docket.
        </Text>

        {roles.map((role) => (
          <Pressable
            key={role.key}
            onPress={() => setSelectedRole(role.key)} 
            style={[
              styles.roleCard,
        
              selectedRole === role.key && styles.roleCardSelected,
            ]}
          >
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleDescription}>{role.description}</Text>
            </View>

            <View
              style={[
                styles.radioCircle,
                selectedRole === role.key && styles.radioCircleSelected,
              ]}
            />
          </Pressable>
        ))}

        <View style={styles.buttonRow}>
          <View style={styles.btnContainer}>
            <Button2 onPress={() => router.back()} text="Back" />
          </View>
          <View style={styles.btnContainer}>
            <Button2 onPress={handleContinue} text="Continue" />
          </View>
        </View>

        <View style={styles.signInRow}>
          <Text style={styles.haveAccountText}>Already have an account? </Text>
          <Pressable onPress={() => router.replace('/auth')}>
          <Text style={styles.signInText}>Sign In</Text>
          </Pressable>
        </View>

      </ScrollView>
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
    fontSize: 15,
    marginBottom: 30,
    lineHeight: 24,
  },
  firmName: {
    color: "#C9A84C",
  },

  roleCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#99C6FF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },

  roleCardSelected: {
    borderColor: "#C9A84C",
    borderWidth: 1.5,
    backgroundColor: "#FFFFFF11",
  },
  roleTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  roleTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  roleDescription: {
    color: "#99C6FF",
    fontSize: 12,
  },

  radioCircle: {
    borderWidth: 1,
    borderColor: "#99C6FF",
    borderRadius: 100,
    height: 40,
    width: 40,
  },

  radioCircleSelected: {
    backgroundColor: "#C9A84C",
    borderColor: "#C9A84C",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginVertical: 30,
  },
  btnContainer: {
    flex: 1,
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

export default LoginScreen2;