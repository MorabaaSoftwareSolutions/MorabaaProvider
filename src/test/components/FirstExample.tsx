import React from "react";
import { PopupMe } from "../../lib";

const PopupExample = () => {
  return (
    <div className="col" style={{ margin: "auto" }}>
      <p className="button" onClick={() => PopupMe(<PopupChild />)}>
        Open Popup
      </p>
    </div>
  );
};

export default PopupExample;

const PopupChild = () => {
  return (
    <div className="col" style={{ padding: 30 }}>
      <p className="text-red"> Hello World </p>
    </div>
  );
};
