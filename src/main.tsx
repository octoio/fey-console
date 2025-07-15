import React from "react";
import ReactDOM from "react-dom/client";
import "reactflow/dist/style.css";
import "antd/dist/reset.css"; // Import Ant Design styles

import { App } from "@/app";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
