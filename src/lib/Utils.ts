import { Components, convertToComponentIfNot, CurrentPopups, Popup } from "./ProviderController";
import { Animation, BuildProps, GetStyleProps, PopupComponentArgs, PopupComponentType, PopupOptions, PopupPlacement, PopupProps, SteupProps } from "./types";

let childDim = {
  height: 0,
  width: 0,
};
export const steup = ({ container, id, placement, target, offset, onRemoved, animation, hasTarget }: SteupProps) => {
  container.style.cssText = getStyle({ container, placement, target, offset, hasTarget });

  CurrentPopups[id].clear = async () => {
    const parent = container.parentElement;
    delete CurrentPopups[id];
    delete Components[container.id!];

    container.classList.add("opacity-out");
    parent?.querySelector("#provider-popup-overlay")?.classList.add("opacity-out");

    (container.firstChild as any)?.setAttribute("fade-type", `${animation}-out`);
    const time = getComputedStyle(document.documentElement).getPropertyValue("--popup-animation-time");
    await sleep(parseInt(time) ?? 300);
    onRemoved?.();
    Popup.render(Math.random());
    await sleep(1);
    parent?.removeAttribute("has-popup");
  };
};

export function setpChild(animation: string) {
  return (child: any) => {
    if (!child) return;
    let { clientHeight, clientWidth, clientLeft, clientTop } = child;
    const { paddingTop, paddingBottom, paddingLeft, paddingRight } = getChildPadding(child);

    const padding = [paddingTop, paddingRight, paddingBottom, paddingLeft].join("px ") + "px";
    const { backgroundColor } = window.getComputedStyle(child);
    child.parentElement.style.setProperty("--provider-child-background", `${backgroundColor}`);
    childDim = {
      height: clientHeight + paddingTop + paddingBottom,
      width: clientWidth + paddingLeft + paddingRight,
    };

    child.style.setProperty("--provider-child-height", `${clientHeight}px`);
    child.style.setProperty("--provider-child-width", `${clientWidth}px`);
    child.style.setProperty("--provider-child-padding", `${padding}`);
    // new
    child.style.setProperty("--provider-child-left", `${clientLeft}px`);
    child.style.setProperty("--provider-child-top", `${clientTop}px`);
    //

    child.setAttribute("fade-type", `${animation}-in`);
    child.style.position = "";
  };
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const isMobile = () => {
  if (typeof navigator === "undefined") return false;
  return navigator.userAgent.toLowerCase().match(/mobile/i) != null;
};

export const getUniqueKey = (target: any, Component: React.ReactNode) => JSON.stringify(target?.getBoundingClientRect() || Component);

const getStyle = ({ container, placement, target, offset, hasTarget }: GetStyleProps) => {
  // let sty = "pointer-events:none;z-index:1001;" + (container.style.cssText || "");
  let sty = "z-index:1001;" + (container.style.cssText || "");
  if (!hasTarget) {
    return getStyleWithoutTarget({ sty, container, placement, offset });
  }

  let targetDim: any = target.getBoundingClientRect();
  targetDim.offsetWidth = target.offsetWidth;
  targetDim.offsetHeight = target.offsetHeight;

  let containerDim: any = container.getBoundingClientRect();
  containerDim.offsetHeight = childDim.height;
  containerDim.offsetWidth = childDim.width;

  const fixFucntion = fixPostion[placement];
  if (fixFucntion) placement = fixFucntion(targetDim);

  container.setAttribute("placement", placement);

  placement.split("-").forEach((pos) => {
    sty += getPosForTarget[pos]?.({ targetDim, containerDim });
  });
  sty += `transform:translate(${offset.x}px,${offset.y}px);`;
  return sty;
};

const getStyleWithoutTarget = ({ sty, container, placement, offset }: any) => {
  container.setAttribute("placement", placement);
  (container.firstChild as any)?.setAttribute("child-placement", placement);
  sty += getPos[placement.split("-")[0]];
  sty += `transform:translate(${offset.x}px,${offset.y}px);`;
  return sty;
};

const getPos: any = {
  center: "inset:0;padding:100px 10px;",
  top: "top:0;left:0;right:0;padding-bottom:100px;",
  bottom: "bottom:0;left:0;right:0;padding-top:100px;",
  left: "left:0;bottom:0;top:0;padding-right:100px;",
  right: "right:0;bottom:0;top:0;padding-left:100px;",
};

const fixPostion: any = {
  top: (targetDim: any) => `top-${getXPOS(targetDim)}`,
  bottom: (targetDim: any) => `bottom-${getXPOS(targetDim)}`,
  left: (targetDim: any) => `${getYPOS(targetDim)}-left`,
  right: (targetDim: any) => `${getYPOS(targetDim)}-right`,
  auto: (targetDim: any) => `${getYPOS(targetDim)}-${getXPOS(targetDim)}`,
  center: () => "center",
};

const getPosForTarget: any = {
  center: () => `inset:0`,
  top: ({ targetDim, containerDim }: any) => {
    let emptySpace = targetDim.y + targetDim.offsetHeight - containerDim.offsetHeight;
    if (emptySpace > 0) emptySpace = targetDim.offsetHeight;
    return `bottom:${emptySpace}px;`;
  },
  bottom: ({ targetDim, containerDim }: any) => {
    let emptySpace = targetDim.y + targetDim.offsetHeight;
    const y = targetDim.y + containerDim.offsetHeight - window.innerHeight;
    if (y > 0) emptySpace = y > emptySpace ? emptySpace : y;
    else emptySpace = -targetDim.offsetHeight;
    return `top:${-emptySpace}px;`;
  },
  left: ({ targetDim, containerDim }: any) => {
    let emptySpace = targetDim.x + targetDim.offsetWidth - containerDim.offsetWidth;
    if (emptySpace > 0) emptySpace = 0;
    document.body.style.setProperty("--popup-mark-postion-x", `${targetDim.width / 2 - emptySpace}px`);
    return `right:${emptySpace}px;`;
  },
  right: ({ targetDim, containerDim }: any) => {
    let emptySpace = targetDim.x;
    const x = targetDim.x + containerDim.offsetWidth - window.innerWidth;
    if (x > 0) emptySpace = x > emptySpace ? emptySpace : x;
    else emptySpace = 0;
    document.body.style.setProperty("--popup-mark-postion-x", `${emptySpace + targetDim.width / 2}px`);
    return `left:${-emptySpace}px;`;
  },
};

const getXPOS = (targetDim: any) => (targetDim.x < window.innerWidth / 2 ? "right" : "left");
const getYPOS = (targetDim: any) => (targetDim.y < window.innerHeight / 2 ? "bottom" : "top");

function getChildPadding(child: any) {
  const { paddingTop, paddingBottom, paddingLeft, paddingRight } = window.getComputedStyle(child);
  return {
    paddingTop: parseFloat(paddingTop),
    paddingBottom: parseFloat(paddingBottom),
    paddingLeft: parseFloat(paddingLeft),
    paddingRight: parseFloat(paddingRight),
  };
}

export function handleOutClick(props: PopupProps) {
  // if (props.removeOnOutClick && !props.overlay) {
  if (props.removeOnOutClick) {
    setTimeout(() => {
      const popup = document.getElementById(props.id);
      if (popup) {
        const remove = props.target
          ? async ({ target }: any) => {
              if (popup.contains(target) || props.target?.contains(target)) return;
              await sleep(10);
              Popup.remove(props.id);
            }
          : async ({ target }: any) => {
              if (popup.firstChild?.contains(target)) return;
              await sleep(10);
              Popup.remove(props.id);
            };
        const clear = CurrentPopups[props.id]?.clear;
        CurrentPopups[props.id].clear = () => {
          document.removeEventListener("pointerup", remove);
          clear?.();
        };
        document.addEventListener("pointerup", remove);
      }
    }, 5);
  }
}
