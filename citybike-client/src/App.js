import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import { iconStation } from "./StationIcons";

class App extends Component {
  constructor() {
    super();

    this.state = {
      response: false,
      endpoint: "http://127.0.0.1:4001",
      lat: 25.808681,
      lng: -80.191788,
      zoom: 12,
    };
  }
  componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.emit("ready");
    socket.on("getMiamiAvailability", (data) => {
      this.setState({ response: data });
      console.log(data.network.stations);
    });
  }
  render() {
    const { response } = this.state;
    const stations = response ? response.network.stations : [];
    const position = [this.state.lat, this.state.lng];
    return (
      <div className="map">
        <h1> City Bikes in Miami </h1>
        <Map
          center={position}
          zoom={this.state.zoom}
          maxZoom={19}
          onZoomEnd={(map) => this.setState({ zoom: map.target._zoom })}
        >
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {stations.map(
            ({
              id,
              empty_slots,
              free_bikes,
              latitude,
              longitude,
              name,
              extra,
            }) => (
              <Marker
                position={[latitude, longitude]}
                key={id}
                icon={iconStation(this.state.zoom)}
              >
                <Popup>
                  {name} <br />
                  Free Bikes: {free_bikes} <br />
                  Empty Slots: {empty_slots}
                </Popup>
              </Marker>
            )
          )}
        </Map>
      </div>
    );
  }
}
export default App;
