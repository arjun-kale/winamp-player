import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Electroview } from "electrobun/view";
import type { WinampRPCSchema } from "../shared/rpc-types";
import "./index.css";
import App from "./App";

const rpc = Electroview.defineRPC<WinampRPCSchema>({
	handlers: { requests: {}, messages: {} },
});
const electrobun = new Electroview({ rpc });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App electrobun={electrobun} />
  </StrictMode>,
);
