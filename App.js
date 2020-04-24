import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  usePlagueStore,
  useIsInitialized,
} from "./stores/hooks/usePlagueStore";
import { getSnapshot } from "mobx-state-tree";
import styled from "styled-components/native";

const StyledButton = styled.Button`
  margin: 1rem;
  color: #fff;
  background-color: #fff;
`;

const Container = styled.View`
  flex: 1;
  background-color: #000;
  align-items: center;
  justify-content: center;
`;

export default function App() {
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
      {plagues.map(({ name, id }) => {
        return <StyledButton title={name} onPress={() => console.log(id)} />;
      })}
    </Container>
  );
}
