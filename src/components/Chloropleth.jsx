import React from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./Chloropleth.css";
import { getColorScale } from "../utils/loadTiles";




const MapUpdater = ({ date, indexed_by_date, dataframe, scale, map_loaded }) => {


  const map = useMap()

  window.map = map
  window.scale = scale

  return (false)
}



class Chloropleth extends React.Component {

  state = {
    map_loaded: false
  }


  shouldComponentUpdate(nextProps, nextState) {



    const { dataframe, date } = nextProps

   
    
    const by_loc = dataframe[date].getSeries('mean')
    window.by_loc = by_loc
    console.log("updating")
    const map = window.map
    if (map == undefined){
      return true
    }
    const scale = window.scale
    for (var i in map._layers) {

      const layer = map._layers[i]
      if (layer.setStyle && layer.feature) {
        let fillColor = null

        const item = by_loc.getRowByIndex(layer.feature.properties.lad19cd);
        //console.log(layer.feature.properties.lad19cd,item)

        fillColor = typeof item !== "undefined" ? scale(item) : "#ffffff";

        layer.setStyle({ 'fillColor': fillColor })

        if(layer.feature.properties.lad19cd == nextProps.lad){
          //layer.setStyle({ 'stroke-width': "5" })
          layer.setStyle({ weight:1})
          layer.setStyle({ color:'black'})
        }
        else{
          layer.setStyle({ weight:0.5})
          layer.setStyle({ color:'#333333'})
        }
      }


    }
    if (nextProps.dataframe!== this.props.dataframe || nextProps.color_scale_type!== this.props.color_scale_type){
      return true;
    }
    // TODO: return false and manually update map for updates
    return false;
  }

  whenReady = () => {
    this.setState({ map_loaded: true });
    console.log("mount")
  }


  render() {
    const {color_scale_type, tiles, dataframe, indexed_by_date, date, handleOnClick, min_val, max_val, lineage } = this.props;

    this.setState({'updateagain': new Date()})


    const scale = getColorScale(min_val, max_val,color_scale_type)

    const mapStyle = {
      fillColor: "white",
      weight: 0.5,
      color: "#333333",
      fillOpacity: 1,
    };

    const createColorBar = (dmin, dmax, scale) => {
      let midpoint
      if (dmax>2){

      midpoint = Math.ceil((dmin + dmax) * 0.5)
      }
      else{
        midpoint = Math.round(10*(dmin + dmax) * 0.5)/10

      }

      const items = [];
      for (let i = 0; i <= 100; i++) {
        items.push(
          <span
            key={`${i}`}
            className="grad-step"
            style={{ backgroundColor: scale(dmin + (i / 100) * (dmax - dmin)) }}
          ></span>
        );
      }
      items.push(
        <span key="domain-min" className="domain-min">
          {Math.ceil(dmin)}
        </span>
      );
      items.push(
        <span key="domain-med" className="domain-med">
          {midpoint}
        </span>
      );
      items.push(
        <span key="domain-max" className="domain-max">
          {Math.ceil(dmax)}
        </span>
      );

      return <div>{items}</div>;
    };



    const onEachLad = async (lad, layer) => {
      console.log('each')
      const name = lad.properties.lad19nm;
      const code = lad.properties.lad19cd;

      // layer.options.fillColor =
      //   typeof item !== "undefined" ? await colorScale(data, item) : "#ffffff";

      layer.bindPopup(`${name}`);
      layer.on({
        click: (e) => handleOnClick(e, code),
      });
    };

    return (
      <div>
        <MapContainer style={{ height: "60vh" }} zoom={5.5} center={[53.5, -3]}>

          <GeoJSON style={mapStyle} data={tiles} onEachFeature={onEachLad} eventHandlers={{
            add: this.whenReady
          }} />
          <MapUpdater date={date} indexed_by_date={indexed_by_date} dataframe={dataframe} scale={scale} map_loaded={this.state.map_loaded} />
        </MapContainer>
        <div className="gradient">
          <center> {createColorBar(min_val, max_val, scale)}</center>
        </div>
      </div>
    );

  }
};

export default Chloropleth;
