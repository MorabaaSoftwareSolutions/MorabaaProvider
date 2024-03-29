import React from "react";
import { Popup, PopupMe, PrintMe } from "../lib";
import Tester from "./components/Tester";
import TestViewOLD from "./TestViewOLD";
import PopupExample from "./components/FirstExample";
import SecondExample from "./components/SecondExample";

const TestView = () => {
  // return (
  //   <div className="col-center gap-2x p-x ">
  //     <div onClick={popupFunction} className="bg-prim round-l p-3x">
  //       show infos
  //     </div>
  //   </div>
  // );
  // return <PopupExample />;
  return <SecondExample />;
  // return <Tester />;
};

const popupFunction = ({ target }: any) => {
  const id = "infos";
  PopupMe({
    id,
    target,
    Component: InfosHandler,
    componentProps: {
      title: "infos",
      remove: () => {
        Popup.remove(id);
      },
    },
    animation: "height",
  });
};

const InfosHandler = ({ title, remove }: any) => {
  return (
    <div className="col gap-l p-l ">
      <div
        className="bg-red"
        onClick={() => {
          remove();
        }}>
        remove
      </div>
      <div className="">{title}</div>
    </div>
  );
};

export default TestView;
