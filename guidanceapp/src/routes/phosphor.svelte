<script lang='ts'>

</script>

<style>
* {
    pointer-events: none;
}

.scanlines {
    z-index: 3;
   opacity: .5;
    position: absolute;
    top: 0;
    right: 0;
    width: 110%;
    height: 110%;
    background-attachment: fixed;
}

/* Do not enable RGB-bloom and  R,G and B at the same time  */


/* RGB Bloom allows for a brighter image with blending between phosphors*/
/* disabled until functional */
.RGB-bloom {
  z-index: 4;
  background: url("./img/RGBG.png");
  filter: contrast(100) brightness(10)  blur(1px);
  mix-blend-mode: darken;
  }

/* individual phosphors. Enable these for the best phosphor seperation but with darker image */
.R {
  z-index: 4;
  background: url("./img/R.png");
  image-rendering: pixelated;
  mix-blend-mode: darken;
  
}

.G {
  z-index: 4;
  background: url("./img/G.png");
  image-rendering: pixelated;
  mix-blend-mode:darken;

}

.B {
  z-index: 4;
  background: url("./img/B.png");
  image-rendering: pixelated;
  mix-blend-mode:darken;

}

.mask {
  image-rendering: pixelated;
    z-index: 1;
    opacity: .3;
    position: absolute;
    top: 0;
    right: 0;
    width: 110%;
    height: 110%;
  background: url("./img/mask.png");

}

.flicker {
  z-index: 99;
  position: absolute;
  top: 0;
  right: 0;
  width: 110%;
  height: 110%;
  opacity: 0;
  mix-blend-mode:lighten;
  background-color: rgb(255, 255, 255);
  animation: flickerEffect 1ms;
  animation-iteration-count: infinite;
}

@keyframes flickerEffect {
  from {
    opacity: .015;
    filter: blur(100px);
  }
}


.test-image{
  width: 100vw;
  height: 100vh;
  position: absolute;
  background: url("./img/image0.png") no-repeat center/cover;
}

.crt {
    filter:  brightness(1.1) saturate(140%) ;
}

/* this must come after the mask and the phosphors to render new bk size */
.scanlines, .mask{
  background-size: 4px 4px;
}
</style>

<div class="phosphorsContainer">
    <div class="flicker" style="display: block;"></div>
    <div class="rgb" >
        <div class="scanlines RGB-bloom" style="display: block"> </div>
    </div>

    <div class="red">
        <div class="scanlines R "> </div>
    </div>

    <div class="green">
        <div class="scanlines G "> </div>
    </div>

    <div class="blue">
        <div class="scanlines B"> </div>
    </div>

    <div class="mask"></div>
</div>