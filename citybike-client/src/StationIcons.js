import L from "leaflet";

export function iconStation(zoom, free_bikes) {
  let color = free_bikes === 0 ? "red" : free_bikes > 5 ? "green" : "yellow";
  return new L.Icon({
    iconUrl: require(`./assets/dot-${color}.svg`),
    iconSize: [1.23**zoom, 1.23**zoom], //for slight visual improvement on close ups
    //iconSize: [zoom, zoom],
  });
}
