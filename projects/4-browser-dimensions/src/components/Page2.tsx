import { type MouseEventHandler, useRef } from "react";

function PageTwo() {
  const ref = useRef<HTMLDivElement>(null);

  const clickHandler: MouseEventHandler<HTMLDivElement> = () => {
    console.log(ref.current?.scrollTop);
  };

  return (
    <div>
      <div
        id="box"
        ref={ref}
        style={{
          marginTop: "800px",
          width: "100px",
          height: "100px",
          background: "ping",
          overflow: "auto",
        }}
        onClick={clickHandler}
      >
        <p>xxxxx</p>
        <p>xxxxx</p>
        <p>xxxxx</p>
        <p>xxxxx</p>
        <p>xxxxx</p>
        <p>xxxxx</p>
        <p>xxxxx</p>
        <p>xxxxx</p>
        <p>xxxxx</p>
        <p>xxxxx</p>
        <p>xxxxx</p>
        <p>xxxxx</p>
        <p>xxxxx</p>
        <p>xxxxx</p>
        <p>xxxxx</p>
        <p>xxxxx</p>
      </div>
    </div>
  );
}

export default PageTwo;
