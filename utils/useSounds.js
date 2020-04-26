import { Audio } from "expo-av";

export const useClickSound = async () => {
  const soundObject = new Audio.Sound();
  try {
    await soundObject.loadAsync(require("../assets/sounds/click.wav"));
    await soundObject.playAsync();
  } catch (error) {
    // An error occurred!
    console.log(error);
  }
};

export const useSendSound = async () => {
  const soundObject = new Audio.Sound();
  try {
    await soundObject.loadAsync(require("../assets/sounds/send.wav"));
    await soundObject.playAsync();
  } catch (error) {
    // An error occurred!
    console.log(error);
  }
};
