import { types, flow } from "mobx-state-tree";
import { database } from "../firebase/firebase";
import { checkInternetConnection } from "react-native-offline";
import { promiseTimeout } from "../utils/promiseTimeout";

const INTERNET_GET_TIMEOUT = 1000;

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
    const checkInternet = () => {
      const promise = checkInternetConnection(
        "https://farm-app-87f99.firebaseio.com",
        0,
        true,
        "GET"
      );

      return promiseTimeout(INTERNET_GET_TIMEOUT, promise);
    };

    return { checkInternet };
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
        console.log(e);
      }
    });

    const sendPlagueReport = flow(function* (report) {
      try {
        yield self.checkInternet();

        yield database.ref("reports").push(report);

        self.loading = false;
      } catch (e) {
        // Not possible to send the data to the server, so we cache it to send in a better conection
        self.cachedReports.push(report);
        self.loading = false;
        console.log(e);
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
    },
  }));

export default PlagueStore.create();
