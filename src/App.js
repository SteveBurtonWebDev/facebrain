import React, { Component } from 'react';
import './App.css';
import Clarifai from 'clarifai';
import Particles from 'react-particles-js';
import Navigation from './components/navigation/navigation.js';
import Logo from './components/logo/logo.js';
import ImageLinkForm from './components/imagelinkform/imagelinkform.js';
import Rank from './components/rank/rank.js';
import FaceRecognition from './components/facerecognition/facerecognition.js';
import SignIn from './components/signin/signin.js';
import Register from './components/register/register.js';


const app = new Clarifai.App({apiKey: '894d144194714a74bc0c1d2db21b9024'});

const particlesOptions = {
  particles: {
   number: {
     value: 60,
     density: {
       enable: true,
       value_area: 800
     }
   }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    password:  '',
    entries: '',
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user:{
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }


  calculateFaceLocation = (faceData) => {
    const clarifaiFace = faceData.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height),
    }
  }

  displayFaceBox = (box) => {
     this.setState({box: box})
  }



  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit =() => {
    this.setState({imageUrl: this.state.input});
    app.models.predict(Clarifai.FACE_DETECT_MODEL,
        this.state.input)
        .then(response => {
          if (response) {
            fetch('http://localhost:3001/image', {
              method: 'put',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries: count }))
           })
          .catch(console.log)
        }    
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
       .catch(err => console.log(err))   
  }
  
  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState); 
      route = 'signin';
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});

  }

  render() {
    return (
      <div className="App">
         <Particles className='particles'
              params={particlesOptions} />
        <Navigation isSignedIn={this.state.isSignedIn}    onRouteChange={this.onRouteChange} />
        {this.state.route === 'home' ?
          <div>
            <Logo />
            <Rank name = {this.state.user.name} entries = {this.state.user.entries} />
            <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
            <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
          </div>
        :
          (
          this.state.route === 'signin'
          ? <SignIn loadUser = {this.loadUser} onRouteChange = {this.onRouteChange} /> 
          : <Register onRouteChange = {this.onRouteChange} loadUser = {this.loadUser} />
          )

        }
      </div>
  );
  }
}

export default App;
