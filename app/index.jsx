import { Text, View, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/auth/index2");
    }, 3000);

    return () => clearTimeout(timer); // cleanup
  }, []);


  return (
    <SafeAreaView style={styles.safeView}>
      <View style={styles.container}>

        <TouchableOpacity onPress={() => router.replace("/auth/index2")}>
          <View style={styles.logoBox}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>

        <Text style={styles.title}>Docket</Text>
        <Text style={styles.subtitle}>Legal Case Management - Mex-Trial</Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeView: {
    flex: 1,
    backgroundColor: '#0D1B2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBox: {
    backgroundColor: '#D4AF37',
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 5,
  },
});