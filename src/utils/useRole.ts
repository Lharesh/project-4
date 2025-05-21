import { useSelector } from "react-redux";

export function useRole() {
  return useSelector((state: any) => state.auth?.role || "guest");
}
