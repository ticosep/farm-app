import React from "react";
import { Text } from "react-native";
import {
  usePlagueStore,
  useIsInitialized,
} from "./stores/hooks/usePlagueStore";
import { getSnapshot } from "mobx-state-tree";
import styled from "styled-components/native";
import Container from "./components/Container";
import * as Location from "expo-location";

const StyledButton = styled.Button`
  margin: 1rem;
  color: #fff;
  background-color: #fff;
`;

export default function App() {
  const [location, setLocation] = React.useState(null);

  React.useEffect(() => {
    const getPermission = async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    };

    getPermission();
  }, []);

  const store = usePlagueStore();

  const initialized = useIsInitialized();

  if (!initialized) {
    return (
      <Container>
        <Text>Carregando</Text>
      </Container>
    );
  }

  const plagues = getSnapshot(store.plagues);

  return (
    <Container>
      {plagues.map(({ name, id }, index) => {
        return (
          <StyledButton
            key={index}
            title={name}
            onPress={() => console.log(location)}
          />
        );
      })}
    </Container>
  );
}
