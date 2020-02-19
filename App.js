import React from "react";
import { ActivityIndicator, Dimensions, TouchableOpacity } from "react-native";
import * as Permissions from "expo-permissions";
import * as FaceDetector from "expo-face-detector";
import * as MediaLibrary from "expo-media-library";
import { Camera } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import PropTypes from "prop-types";
import styled from "styled-components";

const { width, height } = Dimensions.get("window");

const ALBUM_NAME = "Expo App"

const CenterView = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: cornflowerblue;
`;

const CameraBox = styled.View`
  border-radius: 40px;
  overflow: hidden;
  /* display: none; */
`;

const Text = styled.Text`
  color: white;
  font-size: 22px;
`;

const IconBar = styled.View`
  margin-top: 25px;
`;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasPermission: null,
      cameraType: Camera.Constants.Type.front,
      smileDetected: false
    };
    this.cameraRef = React.createRef();
  }

  state = {
    hasPermission: null,
    cameraType: Camera.Constants.Type.front,
    smileDetected: false
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
    const { hasPermission, cameraType, smileDetected } = this.state;

    const ratioArr = [16, 9];
    const camWidth = width - 40;
    const camHeight = (ratioArr[0] * camWidth) / ratioArr[1];

    if (hasPermission === true) {
      return (
        <CenterView>
          <CameraBox>
            <Camera
              ref={this.cameraRef}
              type={cameraType}
              ratio={`${ratioArr[0]}:${ratioArr[1]}`}
              style={{
                width: camWidth,
                height: camHeight
              }}
              onFacesDetected={smileDetected ? null : this._onFaceDetacted}
              faceDetectorSettings={{
                detectLandmarks: FaceDetector.Constants.Landmarks.all,
                runClassifications: FaceDetector.Constants.Classifications.all
              }}
            />
          </CameraBox>
          <IconBar>
            <TouchableOpacity onPress={this._switchCameraType}>
              <MaterialIcons
                name={
                  cameraType === Camera.Constants.Type.front
                    ? "camera-rear"
                    : "camera-front"
                }
                size={50}
                color="white"
              />
            </TouchableOpacity>
          </IconBar>
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

  _switchCameraType = () => {
    const { cameraType } = this.state;
    this.setState({
      cameraType:
        cameraType === Camera.Constants.Type.front
          ? Camera.Constants.Type.back
          : Camera.Constants.Type.front
    });
  };

  _onFaceDetacted = ({ faces }) => {
    const face = faces[0];
    if (face) {
      if (face.smilingProbability > 0.7) {
        this.setState({
          smileDetected: true
        });
        console.log("take Photo");
        this._takePhoto();
      }
    }
  };

  _takePhoto = async () => {
    try {
      if (this.cameraRef.current) {
        let { uri } = await this.cameraRef.current.takePictureAsync({
          quality: 1,
          exif: true
        });
        this._savePhoto(uri);
      }
    } catch (error) {
      alert(error);
      this.setState({
        smileDetected: false
      });
    }
  };

  _savePhoto = async uri => {
    try {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status === "granted") {
        const asset = await MediaLibrary.createAssetAsync(uri);
        let album = await MediaLibrary.getAlbumAsync(ALBUM_NAME);
        if (album === null) {
          album = await MediaLibrary.createAlbumAsync(ALBUM_NAME, asset);
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album.id);
        }
        await MediaLibrary.deleteAssetsAsync([asset]);
        setTimeout(
          () =>
            this.setState({
              smileDetected: false
            }),
          2000
        );
      } else {
        this.setState({ hasPermission: false });
      }
    } catch (error) {
      console.log(error);
    }
  };
}
