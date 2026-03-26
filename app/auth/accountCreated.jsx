import {View, Text,  Image,  StyleSheet,  ScrollView,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "../components/button";

const formatRole = (role) => {
  if (!role) return "";
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const AccountCreated = () => {

  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        const firm = await AsyncStorage.getItem("lawFirmName");
        if (userString) {
          const user = JSON.parse(userString);
          const firstName = user.full_name
            ? user.full_name.split(" ")[0]
            : "Lawyer";
          setUserName(firstName);
          setUserRole(user.role || "");
        }
        if (firm) setLawFirm(firm);
      } catch (error) {
        setUserName("Lawyer");
        setUserRole("");
      }
    };

    loadUser();
  }, []);

  return (
    <SafeAreaView style={styles.safeView}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
  
        <View style={styles.iconContainer}>
          <Image
            style={styles.checkIcon}
            source={require("../../assets/images/checkIcon.png")}
          />
        </View>

        <Text style={styles.title}>Account Created!</Text>

        <View style={styles.welcomeRow}>
          <Text style={styles.welcomeText}>Welcome to Docket, </Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>

        <Text style={styles.subtitle}>
          Your account is pending activation by a Senior{"\n"}
          Partner. You'll receive confirmation shortly.
        </Text>

        <View style={styles.infoCard}>
         
          <View style={styles.infoLabels}>
            <Text style={styles.infoLabel}>ROLE</Text>
            <Text style={styles.infoLabel}>FIRM</Text>
          </View>

          <View style={styles.infoValues}>
           
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {formatRole(userRole)}
              </Text>
            </View>

           <Text style={styles.firmName}>{lawFirm || 'Mex-Trial & Associates'}</Text>
          </View>
        </View>

        <View style={styles.btnContainer}>
          <Button
            onPress={() => router.replace("/auth/index2")} 
            text="Go to Login"
          />
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
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 20,
  },
  iconContainer: {
    height: 100,
    width: 96,
    backgroundColor: "#173F03",
    borderRadius: 20,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  checkIcon: {
    height: 50,
    width: 50,
  },
  title: {
    fontSize: 30,
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  welcomeRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  welcomeText: {
    fontSize: 14,
    color: "white",
    textAlign: "center",
  },
  userName: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "white",
    lineHeight: 22,
  },
  // ── Info card ──
  infoCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#99C6FF1A",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    gap: 40,
    marginVertical: 10,
  },
  infoLabels: {
    gap: 20,
  },
  infoLabel: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  infoValues: {
    gap: 16,
    alignItems: "flex-start",
  },
  roleBadge: {
    borderWidth: 2,
    borderColor: "#99C6FF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: "#0D1B2A",
  },
  roleBadgeText: {
    fontSize: 12,
    color: "#99C6FF",
  },
  firmName: {
    color: "white",
    fontSize: 14,
  },
  btnContainer: {
    marginTop: 20,
    width: "100%",
  },
});

export default AccountCreated;