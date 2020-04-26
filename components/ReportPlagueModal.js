import React from "react";
import Button from "./Button";
import { Modal } from "react-native";

import styled from "styled-components/native";
import { usePlagueStore } from "../stores/hooks/usePlagueStore";
import * as Location from "expo-location";
import { useSound, useSendSound, useClickSound } from "../utils/useSounds";

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

    const location = await Location.getCurrentPositionAsync({});
    const report = Object.assign({}, location, {
      visited: false,
      fixed: false,
      plague: id,
      date: Date.now(),
    });

    store.sendPlagueReport(report).then(() => {
      // Return the app default after the report after the send sound
      useSendSound().then(() => {
        setModalVisible(false);
      });
    });
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
