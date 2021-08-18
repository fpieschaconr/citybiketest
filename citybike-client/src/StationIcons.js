import L from "leaflet";

export function iconStation(zoom) {
  console.log(zoom);
  return new L.Icon({
    iconUrl: require("./assets/blue-dot-icon.png"),
    iconSize: [zoom, zoom],
  });
}
