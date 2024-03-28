"use strict";(self.webpackChunk_mlflow_mlflow=self.webpackChunk_mlflow_mlflow||[]).push([[64],{62349:function(t,e,i){i.r(e),i.d(e,{default:function(){return f}});var r=i(78465),s=i(38093),o=(i(69435),i(83599)),a=i.n(o),p=i(37093),n=i(6431),c=i(68858),l=i(15132);function d(t,e){if(t.properties&&t.properties.popupContent){const{popupContent:i}=t.properties;e.bindPopup(i)}}class h extends r.Component{constructor(t){super(t),this.leafletMap=void 0,this.mapDivId=void 0,this.state={loading:!0,error:void 0,features:void 0},this.fetchArtifacts=this.fetchArtifacts.bind(this),this.leafletMap=void 0,this.mapDivId="map"}componentDidMount(){this.fetchArtifacts()}componentDidUpdate(t){if(this.props.path===t.path&&this.props.runUuid===t.runUuid||this.fetchArtifacts(),void 0!==this.leafletMap&&this.leafletMap.hasOwnProperty("_layers")){this.leafletMap.off(),this.leafletMap.remove();const t="<div id='"+this.mapDivId+"'></div>";document.getElementsByClassName("map-container")[0].innerHTML=t,this.leafletMap=void 0}if(void 0!==this.state.features){const t=a().map(this.mapDivId),e="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",i='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';a().tileLayer(e,{attribution:i}).addTo(t);const r=a().geoJSON(this.state.features,{style(t){return t.properties&&t.properties.style},pointToLayer(t,e){return t.properties&&t.properties.style?a().circleMarker(e,t.properties&&t.properties.style):t.properties&&t.properties.icon?a().marker(e,{icon:a().icon(t.properties&&t.properties.icon)}):a().marker(e,{icon:a().icon({iconRetinaUrl:n,iconUrl:p,shadowUrl:c,iconSize:[24,36],iconAnchor:[12,36]})})},onEachFeature:d}).addTo(t);t.fitBounds(r.getBounds()),this.leafletMap=t}}render(){return this.state.loading?(0,l.tZ)("div",{className:"artifact-map-view-loading",children:"Loading..."}):this.state.error?(0,l.tZ)("div",{className:"artifact-map-view-error",children:"Oops, we couldn't load your file because of an error."}):(0,l.tZ)("div",{className:"map-container",children:(0,l.tZ)("div",{id:this.mapDivId})})}fetchArtifacts(){const t=(0,s.Oz)(this.props.path,this.props.runUuid);this.props.getArtifact(t).then((t=>{const e=JSON.parse(t);this.setState({features:e,loading:!1})})).catch((t=>{this.setState({error:t,loading:!1,features:void 0})}))}}h.defaultProps={getArtifact:s.dh};var f=h}}]);