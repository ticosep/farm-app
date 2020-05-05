import PlagueStore from "../PlagueStore";
import { useObserver } from "mobx-react";

export const usePlagueStore = () => PlagueStore;

export const useIsInitialized = () => {
  const store = usePlagueStore();

  return useObserver(() => store.initialized);
};

export const useIsLoading = () => {
  const store = usePlagueStore();

  return useObserver(() => store.loading);
};

export const useCachedReports = () => {
  const store = usePlagueStore();

  return useObserver(() => store.cachedReports);
};
