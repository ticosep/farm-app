import React from "react";
import Button from "./Button";
import { Modal, Alert } from "react-native";

import styled from "styled-components/native";
import {
  usePlagueStore,
  useCachedReports,
} from "../stores/hooks/usePlagueStore";
import { useSendSound, useClickSound, useErrorSound } from "../utils/useSounds";
import { observer } from "mobx-react";

const ReportText = styled.Text`
  font-weight: bold;
  font-size: 36px;
`;

const ReportCachedModal = () => {
  const [modalVisible, setModalVisible] = React.useState(false);

  const store = usePlagueStore();
  const cachedreports = useCachedReports();

  const handleReportSubmit = async () => {
    // Emit the click sound
    useClickSound();

    // Show the modal with the reporting message
    setModalVisible(true);

    if (!cachedreports.length) {
      setModalVisible(false);
      Alert.alert("Nenhum relatorio pendente");

      return;
    }

    store.sendCachedReports().then(({ message, send }) => {
      if (send) {
        useSendSound().then(() => {
          setModalVisible(false);
        });
      } else {
        useErrorSound().then(() => {
          setModalVisible(false);
        });
      }

      Alert.alert(message);
    });
  };

  return (
    <React.Fragment>
      <Modal animationType="slide" transparent={false} visible={modalVisible}>
        <ReportText>{`Enviando relatorio, restam: ${cachedreports.length}`}</ReportText>
      </Modal>

      <Button
        title="Enviar"
        onPress={handleReportSubmit}
        backgroundColor="#ff0000"
      />
    </React.Fragment>
  );
};

export default observer(ReportCachedModal);