import React from "react";
import Button from "./Button";
import { Modal, Alert } from "react-native";

import styled from "styled-components/native";
import { usePlagueStore } from "../stores/hooks/usePlagueStore";
import * as Location from "expo-location";
import { useSendSound, useClickSound, useErrorSound } from "../utils/useSounds";

const DELAY_TIME = 1000;

const ReportText = styled.Text`
  font-weight: bold;
  font-size: 36px;
`;

const ReportPlagueModal = ({ plague }) => {
  const [modalVisible, setModalVisible] = React.useState(false);

  const { name, id } = plague;
  const store = usePlagueStore();

  const handleReportSubmit = async () => {
    // Emit the click sound
    useClickSound();

    // Show the modal with the reporting message
    setModalVisible(true);

    const location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true,
      accuracy: Location.Accuracy.BestForNavigation,
    }).catch((e) => {
      setModalVisible(false);
      Alert.alert("Sem sinal de gps!", "Relatorios não serão enviados");

      useErrorSound();

      return;
    });

    if (!location.coords.latitude || !location.coords.longitude) {
      useErrorSound().then(() => {
        Alert.alert("Problema de localização", "Tentar novamente");
      });
    } else {
      const report = Object.assign({}, location, {
        visited: false,
        fixed: false,
        plague: id,
      });

      store.storePlagueReport(report);

      // Add some delay for the employee see the reporting screen
      setTimeout(() => {
        // Return the app default after the report after the send sound
        useSendSound().then(() => {
          setModalVisible(false);
        });
      }, DELAY_TIME);
    }
  };

  return (
    <React.Fragment>
      <Modal animationType="slide" transparent={false} visible={modalVisible}>
        <ReportText>Reportando...</ReportText>
      </Modal>

      <Button title={name} onPress={handleReportSubmit} />
    </React.Fragment>
  );
};

export default ReportPlagueModal;
