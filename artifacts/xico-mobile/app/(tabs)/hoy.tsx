import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

export default function HoyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hoy · stub · Phase 2 Tasks 2.2-2.4 fill this in</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.background },
  text: { color: Colors.textPrimary, fontFamily: "Inter_400Regular" },
});
