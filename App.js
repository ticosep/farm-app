import React from "react";
import { Text } from "react-native";
import {
  usePlagueStore,
  useIsInitialized,
} from "./stores/hooks/usePlagueStore";
import { getSnapshot } from "mobx-state-tree";
import Container from "./components/Container";
import * as Location from "expo-location";
import ReportPlagueModal from "./components/ReportPlagueModal";

export default function App() {
  React.useEffect(() => {
    // Ask for user permission to use geolocation
    const getPermission = async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
      }
    };

    getPermission();
  }, []);

  // Use the plagues from the api to generate the buttons
  const store = usePlagueStore();

  const initialized = useIsInitialized();

  if (!initialized) {
    return (
      <Container>
        <Text>Carregando</Text>
      </Container>
    );
  }

  // Take a snapshot to avoid using removed objects from MOBX
  const plagues = getSnapshot(store.plagues);

  return (
    <Container>
      {plagues.map((plague, index) => {
        return <ReportPlagueModal key={index} plague={plague} />;
      })}
    </Container>
  );
}
