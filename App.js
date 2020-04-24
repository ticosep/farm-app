import React from "react";
import { StyleSheet, Text, View, Button } from "react-native";

export default function App() {
  const [state, setState] = React.useState(false);

  return (
    <View style={styles.container}>
      {state ? (
        <Text>Voce clicou</Text>
      ) : (
        <Button title={"Click Me!"} onPress={() => setState(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
