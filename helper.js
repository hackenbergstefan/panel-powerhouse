export function setInnerNumeric(renderRoot, element, value, decimal = 1) {
  if (typeof element === "string") {
    element = renderRoot.querySelector(element);
  }
  if (!element) {
    // console.log("setInnerNumeric: element undefined.");
    return;
  }
  element.innerHTML = parseFloat(value).toFixed(decimal);
}

export function currentDay(offset = 0) {
  let now = new Date();
  now.setDate(now.getDate() + offset);
  const yyyymmdd = now.toISOString().split("T")[0];
  const startOfDay = `${yyyymmdd} 00:00:00`;
  const endOfDay = `${yyyymmdd} 23:59:59`;
  return [startOfDay, endOfDay];
}
