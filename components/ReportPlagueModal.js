import React from "react";
import Button from "./Button";
import { Modal, Alert } from "react-native";
import styled from "styled-components/native";
import { usePlagueStore } from "../stores/hooks/usePlagueStore";
import * as Location from "expo-location";

const ReportText = styled.Text`
  font-weight: bold;
  font-size: 36px;
`;

const ModalContentWrapper = styled.View`
  display: flex;
  height: 80%;
  justify-content: center;
  align-items: center;
`;

const ReportPlagueModal = ({ plague }) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [reporting, setReporting] = React.useState(false);

  const { name } = plague;
  const store = usePlagueStore();

  const handleReportSubmit = async () => {
    // Set the state to reporting for user wait
    setReporting(true);

    const location = await Location.getCurrentPositionAsync({});
    const report = Object.assign({}, location, {
      visited: false,
      fixed: false,
      date: Date.now(),
    });

    store.sendPlagueReport(report).then(() => {
      // Return the app default after the report
      Alert.alert("Praga reportada com sucesso!");
      setReporting(false);
      setModalVisible(false);
    });
  };

  const modalContent = reporting ? (
    <ReportText>Reportando...</ReportText>
  ) : (
    <React.Fragment>
      <ReportText>{name}</ReportText>
      <Button title="Reportar" onPress={handleReportSubmit} />
      <Button title="Cancelar" onPress={() => setModalVisible(false)} />
    </React.Fragment>
  );
  return (
    <React.Fragment>
      <Modal animationType="slide" transparent={false} visible={modalVisible}>
        <ReportText>Voce deseja reportar a praga?</ReportText>
        <ModalContentWrapper>{modalContent}</ModalContentWrapper>
      </Modal>

      <Button title={name} onPress={() => setModalVisible(true)} />
    </React.Fragment>
  );
};

export default ReportPlagueModal;
