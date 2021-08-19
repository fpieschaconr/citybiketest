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
      historical: false,
      timelapse: false,
      timelapseIndex: 0,
      timelapseLimit: 0,
      paused: false,
    };
  }
  componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint);
    socket.emit("ready");
    socket.on("getMiamiAvailability", (data) => {
      this.setState({ response: data });
      //console.log(data.network.stations);
    });
    socket.on("getHistoricalAvailability", (data) => {
      this.setState({ historical: data });
      //console.log(data);
    });
  }

  handleClick() {
    const { timelapse } = this.state;
    this.setState((prevState) => ({
      timelapse: !prevState.timelapse,
      timelapseIndex: 0,
      timelapseLimit: prevState.historical ? prevState.historical.length : 0,
      paused: false,
    }));
    if (!timelapse) {
      this.myInterval = setInterval(() => {
        this.setState((prevState) => ({
          timelapseIndex: !prevState.paused
            ? prevState.timelapseIndex + 1 < prevState.timelapseLimit
              ? prevState.timelapseIndex + 1
              : 0
            : prevState.timelapseIndex,
        }));
      }, 2000);
    } else {
      clearInterval(this.myInterval);
    }
  }

  componentWillUnmount() {
    clearInterval(this.myInterval);
  }

  render() {
    const {
      response,
      historical,
      timelapse,
      timelapseIndex,
      paused,
    } = this.state;
    const stations =
      timelapse && historical
        ? historical[timelapseIndex].data.network.stations
        : response
        ? response.network.stations
        : [];
    const position = [this.state.lat, this.state.lng];
    return (
      <div className="map">
        <h1> City Bikes in Miami </h1>
        <div>
          {timelapse && (
            <>
              <p>
                At Miami (GMT-4) time:{" "}
                {new Date(historical[timelapseIndex].timestamp).toLocaleString(
                  "en-US",
                  { timeZone: "Etc/GMT+4" }
                )}
              </p>
              <button
                onClick={() => {
                  this.setState((prevState) => ({
                    paused: !prevState.paused,
                  }));
                }}
              >
                {paused ? "Unpause timelapse" : "Pause timelapse"}
              </button>
            </>
          )}
          <button
            onClick={() => {
              this.handleClick();
            }}
          >
            {timelapse ? "Back to current time" : "See 24 hour summary"}
          </button>
        </div>
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
                icon={iconStation(this.state.zoom, free_bikes)}
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
