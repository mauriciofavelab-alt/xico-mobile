import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

export default function TuCodiceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tu Códice · stub · Phase 3 fills this in</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.background },
  text: { color: Colors.textPrimary, fontFamily: "Inter_400Regular" },
});
