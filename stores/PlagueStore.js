import { types, flow, getSnapshot } from "mobx-state-tree";
import { database } from "../firebase/firebase";
import { AsyncStorage } from "react-native";
import { autorun } from "mobx";
import NetInfo from "@react-native-community/netinfo";
import * as Location from "expo-location";

const ASYNC_STORAGE_KEY = "MISSING_SEND_REPORT";
const ASYNC_STORAGE_KEY_PLAGUES = "STORE_PLAGUES";

const ALERT_MESSAGES = {
  ERROR_SENDING: {
    title: "Conexao com a internet inexistente ou de baixa qualidade!",
    message:
      "Relatórios não serão enviados, tentar novamente com uma conexão melhor",
    send: false,
  },
  SUCESS_SENDING: {
    title: "Sucesso!",
    message: "Todos relatórios enviados",
    send: true,
  },
};

const Plague = types.model({
  id: types.maybe(types.string),
  name: types.maybe(types.string),
  characteristics: types.maybe(types.string),
});

const Coord = types.model({
  accuracy: types.maybe(types.number),
  altitude: types.maybe(types.number),
  heading: types.maybe(types.number),
  latitude: types.maybe(types.number),
  longitude: types.maybe(types.number),
  speed: types.maybe(types.number),
});

const Position = types.model({
  coords: types.optional(Coord, {}),
  timestamp: types.maybe(types.number),
  mocked: types.maybe(types.boolean),
});

const Report = types.model({
  coords: types.optional(Coord, {}),
  timestamp: types.maybe(types.number),
  mocked: types.maybe(types.boolean),
  fixed: types.maybe(types.boolean),
  visited: types.maybe(types.boolean),
  plague: types.maybe(types.string),
});

export const PlagueStore = types
  .model({
    initialized: false,
    loading: false,
    currentPosition: types.optional(Position, {}),
    plagues: types.array(Plague),
    cachedReports: types.array(Report),
  })
  .actions((self) => {
    const sendCachedReports = flow(function* () {
      self.loading = true;

      // Run in all the chached reports and send to the api
      try {
        const { isConnected } = yield NetInfo.fetch();

        if (!isConnected) {
          self.loading = false;

          return ALERT_MESSAGES.ERROR_SENDING;
        }

        const reports = [...self.cachedReports];

        for (const report of reports) {
          yield database.ref("reports").push(report);

          self.cachedReports.remove(report);
        }

        self.loading = false;
        return ALERT_MESSAGES.SUCESS_SENDING;
      } catch (e) {
        self.loading = false;
        return ALERT_MESSAGES.ERROR_SENDING;
      }
    });

    const setCurrentPosition = (position) => {
      self.currentPosition = position;
    };

    return { sendCachedReports, setCurrentPosition };
  })
  .actions((self) => {
    const fecthPlagues = flow(function* () {
      self.loading = true;

      try {
        const { isConnected } = yield NetInfo.fetch();

        // If the app has no connection we need to get the last plagues stored in the memory
        if (!isConnected) {
          const storedPlagues = yield AsyncStorage.getItem(
            ASYNC_STORAGE_KEY_PLAGUES
          );
          if (storedPlagues) {
            const storedPlaguesObj = JSON.parse(storedPlagues);
            const storedPlaguesArray = Object.values(storedPlaguesObj);

            self.plagues = storedPlaguesArray;
          }
        } else {
          // Here we get the current plagues from the API and store it in the app memory
          const data = yield database.ref("plagues").once("value");
          const dataValues = data.val();

          if (dataValues !== null) {
            const values = Object.values(dataValues);

            self.plagues = values;

            yield AsyncStorage.setItem(
              ASYNC_STORAGE_KEY_PLAGUES,
              JSON.stringify(dataValues)
            );
          }
        }

        self.loading = false;
        self.initialized = true;
      } catch (e) {
        self.loading = false;
      }
    });

    const storePlagueReport = (report) => {
      try {
        const currentPosition = getSnapshot(self.currentPosition);
        const storedReport = Object.assign({}, report, currentPosition);
        self.cachedReports.push(storedReport);

        self.loading = false;
      } catch (e) {
        self.loading = false;
      }
    };

    const initializeCachedReports = (reports) => {
      self.cachedReports = reports || [];
    };

    const startLocationTask = flow(function* () {
      yield Location.watchPositionAsync(
        {
          enableHighAccuracy: true,
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 1,
        },
        self.setCurrentPosition
      );
    });
    return {
      fecthPlagues,
      storePlagueReport,
      initializeCachedReports,
      startLocationTask,
    };
  })
  .actions((self) => ({
    afterCreate: () => {
      self.fecthPlagues();

      self.startLocationTask();

      // Get the sorted reporta that need to be sended
      AsyncStorage.getItem(ASYNC_STORAGE_KEY)
        .then((reports) => {
          if (reports) {
            let cachedReportsFromStorage = JSON.parse(reports);
            cachedReportsFromStorage = Object.values(cachedReportsFromStorage);

            self.initializeCachedReports(cachedReportsFromStorage);
          }

          autorun(() => {
            if (self.cachedReports.length) {
              const cachedReportsStorage = { ...self.cachedReports };

              // Store the cached report to the mobile store, to persist the data
              AsyncStorage.setItem(
                ASYNC_STORAGE_KEY,
                JSON.stringify(cachedReportsStorage)
              );
            } else {
              AsyncStorage.removeItem(ASYNC_STORAGE_KEY);
            }
          });
        })
        .catch((e) => {
          self.initializeCachedReports([]);
        });
    },
  }));

export default PlagueStore.create();
