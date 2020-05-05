import React from "react";
import styled from "styled-components/native";

const StyledTouchableHighlight = styled.TouchableHighlight`
  display: flex;
  align-items: center;
  justify-content: center;

  min-width: 250px;
  min-height: 75px;
  margin: 15px 0;

  border-radius: 10px;
  background-color: ${(props) => props.backgroundColor};
`;

const ButtonText = styled.Text`
  color: #fff;
  font-weight: bold;
  font-size: 36px;
`;

const Button = ({ title, onPress, backgroundColor = "#000" }) => {
  return (
    <StyledTouchableHighlight
      onPress={onPress}
      backgroundColor={backgroundColor}
    >
      <ButtonText>{title}</ButtonText>
    </StyledTouchableHighlight>
  );
};

export default Button;
