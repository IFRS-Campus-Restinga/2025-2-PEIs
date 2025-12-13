import { useContext } from "react";
import { AlertContext } from "../../context/AlertContext";

export const useAlert = () => {
  const { addAlert } = useContext(AlertContext);
  return addAlert;
};