import { types, flow } from "mobx-state-tree";
import { database } from "../firebase/firebase";

const Plague = types.model({
  id: types.maybe(types.string),
  name: types.maybe(types.string),
  characteristics: types.maybe(types.string),
});

export const PlagueStore = types
  .model({
    initialized: false,
    loading: false,
    plagues: types.array(Plague),
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
        console.log("login -> e", e);
      }
    });

    const sendPlagueReport = flow(function* (report) {
      try {
        yield database.ref("reports").push(report);
      } catch (e) {
        self.loading = false;
        console.log("login -> e", e);
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
