import logo from "./logo.svg";
import "./App.css";
// import GoogleMapReact from "google-map-react";
import "antd/dist/antd.css";
import "./index.css";
import { Layout, Menu, Breadcrumb, Table } from "antd";
import {
  UserOutlined,
  LaptopOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Button, Radio } from "antd";
import { Input, Space } from "antd";
import { Tag, Divider } from "antd";
import PropTypes from "prop-types";
import styled from "styled-components";
import isEmpty from "lodash.isempty";
import GoogleMap from "./components/GoogleMap";
import { Pagination } from "antd";
const { Search } = Input;
const { SubMenu } = Menu;
const { Header, Content, Footer, Sider } = Layout;
const AnyReactComponent = ({ text }) => <div>{text}</div>;

const Wrapper = styled.div`
  position: relative;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 20px;
`;

class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.clearSearchBox = this.clearSearchBox.bind(this);
  }

  componentDidMount({ map, mapApi } = this.props) {
    this.searchBox = new mapApi.places.SearchBox(this.searchInput);
    this.searchBox.addListener("places_changed", this.onPlacesChanged);
    this.searchBox.bindTo("bounds", map);
  }

  componentWillUnmount({ mapApi } = this.props) {
    mapApi.event.clearInstanceListeners(this.searchInput);
  }

  onPlacesChanged = ({ map, addplace } = this.props) => {
    const selected = this.searchBox.getPlaces();
    const { 0: place } = selected;
    if (!place.geometry) return;
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
    addplace(place);
    this.searchInput.blur();
  };

  clearSearchBox() {
    this.searchInput.value = "";
  }

  render() {
    return (
      <Wrapper>
        <input
          ref={(ref) => {
            this.searchInput = ref;
          }}
          type="text"
          onFocus={this.clearSearchBox}
          placeholder="Enter a location"
        />
      </Wrapper>
    );
  }
}

class GMap extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapApiLoaded: false,
      mapInstance: null,
      mapApi: null,
      places: [],
    };
  }

  apiHasLoaded = (map, maps) => {
    this.setState({
      mapApiLoaded: true,
      mapInstance: map,
      mapApi: maps,
    });
  };

  addPlace = (place) => {
    this.setState({ places: [...this.state.places, place] });
    this.props.updateParent(place);
  };

  render() {
    const { places, mapApiLoaded, mapInstance, mapApi } = this.state;
    return (
      <>
        {mapApiLoaded && (
          <Space size={64} style={{ margin: "16px 16px" }}>
            <Button type="primary" size="large" onClick={this.position}>
              Current Location
            </Button>
            <SearchBox
              map={mapInstance}
              mapApi={mapApi}
              addplace={this.addPlace}
            />
          </Space>
        )}
        <GoogleMap
          defaultZoom={10}
          defaultCenter={this.props.centor}
          bootstrapURLKeys={{
            key: "AIzaSyC-m6vcvEkHKJBT4MVi_dt3d2aIuemNS9o",
            libraries: ["places", "geometry"],
          }}
          yesIWantToUseGoogleMapApiInternals={true}
          onGoogleApiLoaded={({ map, maps }) => this.apiHasLoaded(map, maps)}
        >
          {!isEmpty(places) &&
            places.map((place) => (
              <Tag
                color="red"
                lat={place.geometry.location.lat()}
                lng={place.geometry.location.lng()}
              >
                {place.name}
              </Tag>
            ))}
        </GoogleMap>
      </>
    );
  }
}

const columns = [
  {
    title: "Name",
    dataIndex: "name",
  },
  {
    title: "Lat",
    dataIndex: "lat",
  },
  {
    title: "Lng",
    dataIndex: "lng",
  },
];

const data = [];
for (let i = 0; i < 46; i++) {
  data.push({
    key: i,
    name: `Edward King ${i}`,
    age: 32,
    address: `London, Park Lane no. ${i}`,
  });
}

class DisplayHistory extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [], // Check here to configure the default column
      loading: false,
    };
  }

  start(keys) {
    this.setState({ loading: true });
    // ajax request after empty completing

    console.log(keys);
    this.props.selectedAction(keys);
    setTimeout(() => {
      this.setState({
        selectedRowKeys: [],
        loading: false,
      });
    }, 20);
  }

  onSelectChange = (selectedRowKeys) => {
    console.log("selectedRowKeys changed: ", selectedRowKeys);
    this.setState({ selectedRowKeys });
  };

  render() {
    const { loading, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;
    return (
      <div>
        <div style={{ margin: 16 }}>
          <Button
            type="primary"
            onClick={() => this.start(this.state.selectedRowKeys)}
            disabled={!hasSelected}
            loading={loading}
          >
            Delete
          </Button>
          <span style={{ marginLeft: 8 }}>
            {hasSelected ? `Selected ${selectedRowKeys.length} items` : ""}
          </span>
        </div>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={this.props.data}
        />
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      centor: {
        lat: 51.509865,
        lng: -0.118092,
      },
      zoom: 11,
      places: [],
      showMap: true,
    };
  }

  addPlace = (place) => {
    this.setState((prevState) => {
      return {
        centor: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        },
        zoom: 17,
        places: [
          ...prevState.places,
          {
            name: place.name,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            obj: place,
          },
        ],
      };
    });
    console.log(place);
  };

  remove = () => (places) => {
    console.log(places);
    this.setState((prevState) => {
      let newPlaces = [];
      for (let i = 0; i < prevState.places.length; i++) {
        let g = prevState.places[i];
        console.log(g);
        if (!places.includes(g.name)) {
          newPlaces.push(g);
        } else {
          console.log(g.key);
        }
      }
      return {
        ...prevState,
        places: newPlaces,
      };
    });
  };

  selectMenual = (item) => {
    this.setState((prevState) => {
      return {
        ...prevState,
        showMap: item.key == "1" ? true : false,
      };
    });
  };

  position = () => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        this.setState(
          {
            centor: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            zoom: 11,
          },
          (newState) => console.log(newState)
        ),
      (err) => console.log(err)
    );
  };

  generateData() {
    let data = [];
    for (let i = 0; i < this.state.places.length; i++) {
      let p = this.state.places[i];
      data.push({
        key: p.name,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
      });
    }
    console.log(data);
    return data;
  }

  render() {
    let content;
    if (this.state.showMap) {
      content = (
        <Layout className="site-layout-background" style={{ padding: "0 0" }}>
          <Sider className="site-layout-background" width={200}>
            <Menu
              mode="inline"
              defaultSelectedKeys={["sub"]}
              defaultOpenKeys={["sub"]}
              style={{ height: "100%" }}
            >
              <SubMenu
                key="sub"
                icon={<UserOutlined />}
                title="Searched places"
              >
                {this.state.places.map((place) => (
                  <Menu.Item>{place.name}</Menu.Item>
                ))}
              </SubMenu>
            </Menu>
          </Sider>
          <Content style={{ padding: "0 24px", minHeight: 800 }}>
            <GMap
              centor={this.state.centor}
              zoom={this.state.zoom}
              updateParent={this.addPlace}
            />
          </Content>
        </Layout>
      );
    } else {
      content = (
        <DisplayHistory
          data={this.generateData()}
          selectedAction={this.remove()}
        />
      );
    }
    return (
      <Layout style={{ height: "100vh" }}>
        <Header className="header">
          <div className="logo" />
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={["1"]}
            onClick={this.selectMenual}
          >
            <Menu.Item key="1">Map</Menu.Item>
            <Menu.Item key="2">History</Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: "0 50px" }}>{content}</Content>
        <Footer style={{ textAlign: "center" }}></Footer>
      </Layout>
    );
  }
}

export default App;
