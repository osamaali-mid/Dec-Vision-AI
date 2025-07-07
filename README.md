![Logo](admin/reolink-810a.png)
# ioBroker.reolink-810a

[![NPM version](https://img.shields.io/npm/v/iobroker.reolink-810a.svg)](https://www.npmjs.com/package/iobroker.reolink-810a)
[![Downloads](https://img.shields.io/npm/dm/iobroker.reolink-810a.svg)](https://www.npmjs.com/package/iobroker.reolink-810a)
![Number of Installations](https://iobroker.live/badges/reolink-810a-installed.svg)
![Current version in stable repository](https://iobroker.live/badges/reolink-810a-stable.svg)


[![NPM](https://nodei.co/npm/iobroker.reolink-810a.png?downloads=true)](https://nodei.co/npm/iobroker.reolink-810a/)

**Tests:** ![Test and Release](https://github.com/sebtig/ioBroker.reolink-810a/workflows/Test%20and%20Release/badge.svg)

## reolink-810a adapter for ioBroker

Based on (https://github.com/aendue/ioBroker.reolink)

Using extended capabilities of Motion and People Detection that Reolink-RLC810A offers via API, with additional support for image, video, and webcam detection.

## Features

### Camera Integration
- Connect to Reolink 810A cameras via HTTPS API
- Real-time motion detection
- AI-powered detection (People, Vehicles, Faces, Pets)
- Network status monitoring
- Device information retrieval

### Enhanced Detection Capabilities
- **Image Detection**: Upload and analyze images for object detection
- **Video Detection**: Process video files frame by frame
- **Webcam Detection**: Real-time detection from connected webcams
- **Multi-format Support**: JPG, PNG, MP4, AVI, MOV files
- **Confidence Thresholds**: Configurable detection sensitivity

### File Management
- Drag & drop file uploads
- Automatic file cleanup
- File size validation
- Support for multiple file formats

### Web Interface
- Modern Material Design interface
- Real-time detection results
- Webcam stream management
- File upload progress tracking
- Detection statistics and history

## Installation

1. Install the adapter from the ioBroker admin interface
2. Configure your Reolink camera settings:
   - Hostname/IP address
   - Username and password
   - Detection preferences
3. Access the detection interface through the admin panel

## Configuration

### Camera Settings
- **Hostname**: IP address or hostname of your Reolink camera
- **Username/Password**: Camera login credentials
- **Motion Detection**: Enable/disable motion sensor polling
- **AI Detection**: Enable/disable AI-powered detection
- **Poll Intervals**: Configure detection frequency

### Detection Settings
- **Image Detection**: Enable processing of uploaded images
- **Video Detection**: Enable processing of uploaded videos
- **Webcam Detection**: Enable real-time webcam analysis
- **Confidence Threshold**: Minimum confidence level for detections (0.1-1.0)
- **File Size Limit**: Maximum upload size in MB
- **Auto Cleanup**: Automatically delete old files after specified days

## Usage

### Image Detection
1. Navigate to the detection interface
2. Drag & drop images or click to select files
3. Click "Process Images" to analyze uploaded files
4. View detection results with confidence scores

### Video Detection
1. Upload video files through the interface
2. Click "Process Videos" to analyze frame by frame
3. Monitor processing progress
4. Review detected objects across all frames

### Webcam Detection
1. Select an available camera from the dropdown
2. Click "Start Detection" to begin real-time analysis
3. View live detection results
4. Stop detection when finished

## API Commands

The adapter supports the following message commands:

- `uploadFile`: Upload a file for processing
- `processImage`: Analyze an uploaded image
- `processVideo`: Process a video file
- `startWebcamDetection`: Start real-time webcam detection
- `stopWebcamDetection`: Stop webcam detection
- `getWebcamDevices`: List available cameras
- `getUploadedFiles`: Get list of uploaded files

## States

### Device Information
- `Device.Model`: Camera model
- `Device.FirmVer`: Firmware version
- `Device.Serial`: Serial number
- `Device.Name`: Device name

### Network Information
- `Network.Connected`: Connection status
- `Network.IP`: Camera IP address
- `Network.MAC`: MAC address
- `Network.Type`: Connection type

### Detection Results
- `Sensors.MotionDetected`: Motion detection status
- `Sensors.People.Detected`: Person detection status
- `Sensors.Vehicle.Detected`: Vehicle detection status
- `Sensors.Face.Detected`: Face detection status
- `Sensors.DogCat.Detected`: Pet detection status

### Detection Services
- `Detection.ImageDetection`: Image detection enabled
- `Detection.VideoDetection`: Video detection enabled
- `Detection.WebcamDetection`: Webcam detection enabled
- `Detection.LastDetectionTime`: Timestamp of last detection
- `Detection.DetectionCount`: Total number of detections

### File Management
- `FileUpload.LastUploadedFile`: Name of last uploaded file
- `FileUpload.UploadCount`: Total number of uploaded files

### Webcam Management
- `Webcam.ActiveStreams`: Number of active webcam streams
- `Webcam.AvailableDevices`: JSON list of available cameras

## Changelog
<!--
	Placeholder for the next version (at the beginning of the line):
	### **WORK IN PROGRESS**
-->

### 0.0.4 (2022-09-16)
* First official release

### 0.0.3 (2022-09-10)
Changed behavior if webcam is offline

### 0.0.2 (2022-09-09)

## License
MIT License

Copyright (c) 2022 sebtig

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.