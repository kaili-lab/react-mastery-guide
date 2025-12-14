import { useEffect, useRef, type MouseEventHandler } from "react";

function PageOne() {
  const ref = useRef<HTMLDivElement>(null);

  const clickHandler: MouseEventHandler<HTMLDivElement> = (e) => {
    console.log("box pageY", e.pageY);
    console.log("box clientY", e.clientY);
    // 因为React的时间模型，它没有 offsetY 这个属性
    console.log("box offsetY", e.offsetY);
    // 通过React事件的nativeEvent对象来访问原声事件
    console.log("box offsetY", e.nativeEvent.offsetY);
    console.log("box screenY", e.screenY);
  };

  useEffect(() => {
    document.getElementById("box")!.addEventListener("click", (e) => {
      console.log("box2 pageY", e.pageY);
      console.log("box2 clientY", e.clientY);
      console.log("box2 offsetY", e.offsetY);
      console.log("box2 screenY", e.screenY);
    });
  }, []);

  return (
    <div>
      <div
        id="box"
        ref={ref}
        style={{
          marginTop: "800px",
          width: "100px",
          height: "100px",
          background: "blue",
        }}
        onClick={clickHandler}
      ></div>
    </div>
  );
}

export default PageOne;
