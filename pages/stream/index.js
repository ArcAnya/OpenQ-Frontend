import React, { useState, useContext, useEffect } from "react";
import Toggle from "../../components/Utils/Toggle";
import CreateStream from "./CreateStream";
import ViewStreams from "./ViewStreams";

const stream = () => {
  const [internalMenu, setInternalMenu] = useState("Streams");

  const handleToggle = (e) => {
    setInternalMenu(e);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <Toggle
        toggleFunc={handleToggle}
        toggleVal={internalMenu}
        names={["Streams", "Pay"]}
      />
      {internalMenu == "Streams" ? <ViewStreams /> : null}
      {internalMenu == "Pay" ? <CreateStream /> : null}
    </div>
  );
};

export default stream;
