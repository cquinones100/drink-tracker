import React from "react";

function InputContainer({ label, input }: { label: React.ReactNode, input: React.ReactNode }) {
  return (
    <div className="flex justify-between w-full">
      <div className="flex-1/4">{label}</div>
      <div className="flex-3/4 *:w-full *:px-2">{input}</div>
    </div>
  );
}

export default InputContainer;
