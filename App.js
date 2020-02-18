import React from "react";
import { ActivityIndicator, Dimensions } from "react-native";
import * as Permissions from "expo-permissions";
import { Camera } from "expo-camera";
import PropTypes from "prop-types";
import styled from "styled-components";

const { width, height } = Dimensions.get("window");

const CenterView = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: cornflowerblue;
`;

const CameraBox = styled.View`
  border-radius: 40px;
  overflow: hidden;
`;

const Text = styled.Text`
  color: white;
  font-size: 22px;
`;

export default class App extends React.Component {
  state = {
    hasPermission: null
  };

  componentDidMount = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);

    if (status === "granted") {
      this.setState({
        hasPermission: true
      });
    } else {
      this.setState({
        hasPermission: false
      });
    }
    console.log(status);
  };

  render() {
    const { hasPermission } = this.state;

    const ratioArr = [16, 9];
    const camWidth = width - 40;
    const camHeight = (ratioArr[0] * camWidth) / ratioArr[1];

    if (hasPermission === true) {
      return (
        <CenterView>
          <CameraBox>
            <Camera
              type={Camera.Constants.Type.front}
              ratio={`${ratioArr[0]}:${ratioArr[1]}`}
              style={{
                width: camWidth,
                height: camHeight
              }}
            />
          </CameraBox>
        </CenterView>
      );
    } else if (hasPermission === false) {
      return (
        <CenterView>
          <Text>Don't Have PerMission for this</Text>
        </CenterView>
      );
    } else {
      return (
        <CenterView>
          <ActivityIndicator />
        </CenterView>
      );
    }
  }
}
