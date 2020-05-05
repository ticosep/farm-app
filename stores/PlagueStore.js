import { types, flow } from "mobx-state-tree";
import { database } from "../firebase/firebase";
import { checkInternetConnection } from "react-native-offline";
import { promiseTimeout } from "../utils/promiseTimeout";
import { AsyncStorage } from "react-native";
import { autorun } from "mobx";

const IMMEDIATE_INTERNET_GET_TIMEOUT = 1000;
const NOT_IMMEDIATE_INTERNET_GET_TIMEOUT = 2000;

const ASYNC_STORAGE_KEY = "MISSING_SEND_REPORT";

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

const Report = types.model({
  coords: types.optional(Coord, {}),
  fixed: types.maybe(types.boolean),
  mocked: types.maybe(types.boolean),
  timestamp: types.maybe(types.number),
  visited: types.maybe(types.boolean),
  plague: types.maybe(types.string),
});

export const PlagueStore = types
  .model({
    initialized: false,
    loading: false,
    plagues: types.array(Plague),
    cachedReports: types.array(Report),
  })
  .actions((self) => {
    const checkInternet = (timeout, url, method) => {
      const promise = checkInternetConnection(url, 0, true, method);

      return promiseTimeout(timeout, promise);
    };

    const sendCachedReports = flow(function* () {
      self.loading = true;

      // Run in all the chached reports and send to the api
      try {
        yield self.checkInternet(
          NOT_IMMEDIATE_INTERNET_GET_TIMEOUT,
          "https://google.com",
          "HEAD"
        );

        const reports = [...self.cachedReports];

        for (const report of reports) {
          yield database.ref("reports").push(report);

          self.cachedReports.remove(report);
        }

        self.loading = false;
        return { message: "Relatorios enviados com sucesso!", send: true };
      } catch (e) {
        self.loading = false;
        return {
          message:
            "Conexao com a internet inexistente ou de baixa qualidade, relatorios nao serão enviados",
          send: false,
        };
      }
    });

    return { checkInternet, sendCachedReports };
  })
  .actions((self) => {
    const fecthPlagues = flow(function* () {
      self.loading = true;

      try {
        const data = yield database.ref("plagues").once("value");
        const dataValues = data.val();

        if (dataValues !== null) {
          const values = Object.values(dataValues);

          self.plagues = values;
        }

        self.loading = false;
        self.initialized = true;
      } catch (e) {
        self.loading = false;
      }
    });

    const sendPlagueReport = flow(function* (report) {
      try {
        yield self.checkInternet(
          IMMEDIATE_INTERNET_GET_TIMEOUT,
          "https://farm-app-87f99.firebaseio.com",
          "GET"
        );

        yield database.ref("reports").push(report);

        self.loading = false;

        return true;
      } catch (e) {
        // Not possible to send the data to the server, so we cache it to send in a better conection
        self.cachedReports.push(report);
        self.loading = false;
        return false;
      }
    });

    return {
      fecthPlagues,
      sendPlagueReport,
    };
  })
  .actions((self) => ({
    afterCreate: () => {
      self.fecthPlagues();

      AsyncStorage.getItem(ASYNC_STORAGE_KEY)
        .then((reports) => {
          console.log(reports);

          autorun(() => {
            if (self.cachedReports.length) {
              console.log(self.cachedReports);
              AsyncStorage.setItem(ASYNC_STORAGE_KEY, [...self.cachedReports]);
            }
          });
        })
        .catch(() => {
          // self.cachedReports = [];
        });
    },
  }));

export default PlagueStore.create();
