define(function(require, exports, module) {

  var Womb                = require( 'Womb/Womb'                  );
  
  var m                   = require( 'Utils/Math'                 );
  var recursiveFunctions  = require( 'Utils/RecursiveFunctions'   );
  
  var fragmentShaders     = require( 'Shaders/fragmentShaders'    );
  var vertexShaders       = require( 'Shaders/vertexShaders'      );
  var physicsShaders      = require( 'Shaders/physicsShaders'     );
  var shaderChunks        = require( 'Shaders/shaderChunks'       );

  var physicsShaders      = require( 'Shaders/physicsShaders'     );
  var physicsParticles    = require( 'Shaders/physicsParticles'   );
  
  var PhysicsSimulator    = require( 'Species/PhysicsSimulator'   );

  var FBOParticles        = require( 'Species/FBOParticles'       );
 
  var FractalBeing       = require( 'Species/Beings/FractalBeing');
 
  var ShaderCreator       = require( 'Shaders/ShaderCreator'  );
  
  /*
   
     Create our womb

  */
  var link = 'http://soundcloud.com/holyother';
  var info =  "Drag to spin, scroll to zoom,<br/> press 'x' to hide interface";



  
  womb = new Womb({
    cameraController: 'TrackballControls',
    title:            'Holy Other - We Over',
    link:             link, 
    summary:          info,
    color:            '#000000',
    failureVideo:     84019684,
    size:             400
  });


  womb.stream = womb.audioController.createStream( '/lib/audio/Holly.mp3' );

  womb.ps = new PhysicsSimulator( womb , {

    textureWidth: 300,
    debug: false,
    velocityShader: physicsShaders.velocity.curl,
    velocityStartingRange:.0000,
    startingPositionRange:[1 , .000002, 0 ],
    positionShader: physicsShaders.positionAudio_4,
    particlesUniforms:        physicsParticles.uniforms.audio,
    particlesVertexShader:    physicsParticles.vertex.audio,
    particlesFragmentShader:  physicsParticles.fragment.audio,

    bounds: 100,
    speed: .1,
    particleParams:   {
        size: 10,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        fog: true, 
        map: THREE.ImageUtils.loadTexture( '/lib/img/particles/lensFlare.png' ),
        opacity:    1,
      }, 
    audio: womb.stream

  });

  console.log('WOMB');
  console.log( womb.ps );
  womb.ps.particleSystem.scale.multiplyScalar( 1 );
  womb.ps.particleSystem.rotation.x = Math.PI;
  womb.u = {

    texture:    { type: "t", value: womb.stream.texture.texture },
    image:      { type: "t", value: womb.stream.texture.texture },
    color:      { type: "v3", value: new THREE.Vector3( .3 , .01 , .1 ) },
    time:       womb.time,
    pow_noise:  { type: "f" , value: 0.2 },
    pow_audio:  { type: "f" , value: .3 },

  };

  womb.modelLoader.loadFile( 
    'OBJ' , 
    '/lib/demoModels/leeperrysmith/LeePerrySmith.obj' , 

    function( object ){

      if( object[0] instanceof THREE.Mesh ){
      }

      if( object[0] instanceof THREE.Geometry ){
        var geo = object[0];
        geo.computeFaceNormals();
        geo.computeVertexNormals();
        
        geo.verticesNeedUpdate = true;

       
        console.log( 'HEALLSS');
        womb.modelLoader.assignUVs( geo );
        var m = new THREE.Mesh( geo , new THREE.MeshBasicMaterial({
            color:0x000000,
          })
        );
        m.scale.multiplyScalar( 1000 );

        var newGeo = new THREE.Geometry();
       
        THREE.GeometryUtils.merge( newGeo , m );

        womb.fboParticles = new FBOParticles({
          audioTexture: womb.stream.texture,
          numberOfParticles:1000000,
          particleSize: 100,
          geometry: newGeo
        });

        womb.fboParticles.particles.scale.multiplyScalar( .05 );
        m.scale.multiplyScalar( .05 );

        womb.fboParticles.body.add( m );
              
      }
    }
  
  );



  womb.modelLoader.loadFile( 'OBJ' , '/lib/demoModels/mug_11530_10.obj' , function( object ){

    if( object[0] instanceof THREE.Mesh ){
    }

    if( object[0] instanceof THREE.Geometry ){
      var geo = object[0];
      geo.computeFaceNormals();
      geo.computeVertexNormals();
      geo.computeBoundingSphere();
      geo.computeBoundingBox();
      
      womb.modelLoader.assignUVs( geo );
     
      womb.onMugLoad( geo);
    }

  });

  womb.onMugLoad = function( geo ){


      womb.loader.loadBarAdd();

      console.log( geo );
      womb.fractal1 = new FractalBeing( womb, {

        geometry: geo,
        texture:    womb.stream.texture,
        opacity: .01,
        texturePower:5,
        noisePower:3,
      
        displacementPower: 0.3,
        displacementOffset: 15.0,

        placementSize: womb.size/20,

        numOf: 10,
        color: new THREE.Vector3( 0.5 , 0.0 , 1.5 ),
        influence: 1,

      });

      console.log( womb.fractal1 );
      womb.fractal1.fractal.material.updateSeed();
      
      womb.looper = womb.audioController.createLooper( womb.stream , {
        beatsPerMinute: 150.1 
      });

      

      console.log('HELLO');
      // Flute:
      womb.looper.addSequence( 
      
      function( hitInfo ){
        console.log('HELLO');
        womb.fractal1.body.rotation.z += .5;
        var x = Math.random();
        var y = Math.random();
        var z = Math.random();
        womb.fractal1.fractal.material.uniforms.color.value.set( x * 2 , y / 2 , z ); 
        womb.fractal1.fractal.material.uniforms.opacity.value = Math.random() * .3;
      } , 
      16 , 
      [

        [ 0 , [.4] ],
        [ 1 , [.4] ],
        [ 2 , [.4] ],
        [ 3 , [.4] ],
        
        [ 4 , [.4] ],
        [ 5 , [.4] ],
        [ 6 , [0.0, .25 , .35 , .55 , .85] ],
      

        [ 8 , [.4] ],
        [ 9 , [.4] ],
        [ 11 , [0.0 , .4] ],
        
        [ 12 , [0.0, .25 , .35 , .55 , .85] ],
      ]);


      console.log( womb.looper );

  }


   vertexChunk = [
    
    "nPos = normalize(pos);",
    
    "vec3 offset;",
    
    "offset.x = nPos.x + Time * .3;",
    "offset.y = nPos.y + Time * .2;",
    "offset.z = nPos.z + Time * .24;",
    
    "vec2 a = vec2( abs( nPos.y ) , 0.0 );",
    
    "float audio = texture2D( AudioTexture , a).r;",
    "vDisplacement = NoisePower * snoise3( offset );",
    "vDisplacement += AudioPower * audio * audio;",
   
    "pos *= 1. + .05 * abs( vDisplacement + 3.0 );",

  ];

  fragmentChunk = [

    "color = abs( Color +.3 * abs(normalize(vPos_MV ))  + abs(nPos) + vDisplacement);",
    "vec3 normalColor = normalize( color );",
    "color += .1 * kali3( nPos , -1. * normalColor );",
    "vec3 norm = color + .1 * vNorm;",
    "color =  color * normalize( norm * vDisplacement );",

  ];

  womb.loader.addToLoadBar();

  womb.helixShader = new ShaderCreator({
    vertexChunk:   vertexChunk,
    fragmentChunk: fragmentChunk,
    uniforms:{ 
     
      Time:         womb.time,
      Color:        { type:"v3" , value: new THREE.Vector3( -.7 , -.8 , -.3 ) },
      AudioTexture: { type:"t"  , value: womb.stream.texture },
      NoisePower:   { type:"f"  , value: .9 },
      AudioPower:   { type:"f"  , value: 1.4 }
    
    },

  });

  womb.helixShader.material.side = THREE.BackSide;


   womb.modelLoader.loadFile( 'OBJ' , '/lib/demoModels/Lord_Helix.obj' , function( object ){

    if( object[0] instanceof THREE.Mesh ){
    }

    if( object[0] instanceof THREE.Geometry ){
      var geo = object[0];
      geo.computeFaceNormals();
      geo.computeVertexNormals();
      geo.computeBoundingSphere();
      geo.computeBoundingBox();
      
      womb.modelLoader.assignUVs( geo );
     
      womb.onMugLoad( geo);

      var mesh = new THREE.Mesh(
        //geo,
        new THREE.CubeGeometry( 1000 , 1000 , 1000 , 100 , 100 , 100 ),
        womb.helixShader.material
      );

      womb.helixBeing = womb.creator.createBeing();

      womb.helixBeing.body.add( mesh );

    // womb.loader.loadBarAdd();


    }

  });




   womb.tween1 = womb.tweener.createTween({

      time: 3,
      target: new THREE.Vector3( 0 , 0 , 100 ),
      object: womb.camera

   });

   var event1 = function(){
  
     var tween = womb.tweener.createTween({

      time: 3,
      target: new THREE.Vector3( 0 , 0 , 100 ),
      object: womb.camera

    });


     tween.start();
     womb.fboParticles.enter();

   }

  var event2 = function(){

    var tween = womb.tweener.createTween({

      time: 1,
      target: new THREE.Vector3( 100 , 0 , 0 ),
      object: womb.camera

    });


    tween.start();

   }

   var event3 = function(){

     var tween = womb.tweener.createTween({

      time: 1,
      target: new THREE.Vector3( 0 , 0 , -50 ),
      object: womb.camera,
      

    });

     tween.start();

   }

  var event4 = function(){

     var tween = womb.tweener.createTween({

      time: 1,
      target: new THREE.Vector3(-50, 0 , 0 ),
      object: womb.camera,
     

    });

     tween.start();


   }

  var event5 = function(){


     var tween = womb.tweener.createTween({

      time: 1,
      target: new THREE.Vector3( 0 , 0 , 30 ),
      object: womb.camera,
      callback: function(){
        womb.fractal1.enter();
      }

    });

     tween.start();

   }


  var event6 = function(){


     var tween = womb.tweener.createTween({

      time: 4,
      target: new THREE.Vector3( 0 , 0 , 400 ),
      object: womb.camera,
      callback: function(){
        womb.fboParticles.exit();
      }

    });

     tween.start();

   }


  var event7 = function(){


     var tween = womb.tweener.createTween({

      time: 3,
      target: new THREE.Vector3( 600 , 600 , 600 ),
      object: womb.camera,
      

    });

     tween.start();

   }

  var event8 = function(){


     var tween = womb.tweener.createTween({

      time: 3,
      target: new THREE.Vector3( 600 , -800 , -1000 ),
      object: womb.camera,
      

    });

     womb.helixBeing.enter();
     tween.start();

   }

  var event9 = function(){


     var tween = womb.tweener.createTween({

      time: 3,
      target: new THREE.Vector3( -1000 , -800 , 1000 ),
      object: womb.camera,
      

    });

     womb.ps.enter();
     tween.start();

   }


  var event10 = function(){
    var tween = womb.tweener.createTween({
      time: 5,
      target: new THREE.Vector3( -1000 , 2000 , 1000 ),
      object: womb.camera,
    });

    womb.fractal1.exit();
    tween.start();
  }

  var event11 = function(){
    var tween = womb.tweener.createTween({
      time: 5,
      target: new THREE.Vector3( -760, 3130, -1443 ),
      object: womb.camera,
    });
    womb.helixBeing.exit();
    tween.start();
  }


  var event12 = function(){
    var tween = womb.tweener.createTween({
      time: 5,
      target: new THREE.Vector3( 2407, 7500,  -9337 ),
      object: womb.camera,
    });
    tween.start();
  }










  


   womb.events = [

     event1,
     event2,
     event3,
     event4,
     event5,
     event6,
     event7,
     event8,
     event9,
     event10,
     event11,
     event12,

  ]

  womb.EVENTS = {}
  womb.EVENTS.currentEvent = 0;
  womb.EVENTS.nextEvent = function(){

    console.log( this );
    womb.events[this.currentEvent]();
    this.currentEvent++;

  }


  womb.update = function(){

    womb.camera.lookAt( new THREE.Vector3() );

  }

  womb.addToMouseClickEvents( function(){

    console.log( womb.camera.position );

  });
  
  womb.start = function(){

    womb.stream.play();
  
  }


});
