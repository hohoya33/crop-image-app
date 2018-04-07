import React, { Component } from 'react';
import './App.css';

class App extends Component {
  state = {
    iu: 'http://img.ssgcdn.com/trans.ssg?src=/cmpt/banner/201711/2017110309474776094297604529_866.jpg&edit=c&w=476&h=560',
    iw: 476,
    ih: 560,
    rx1: 0,
    ry1: 0,
    rx2: 0,
    ry2: 0,
    rw: 0,
    rh: 0,
    ow: 65,
    oh: 65
  }
  componentDidMount() {

  }
  calcMag(iw, ih, ow, oh, fill) {
    let ia = iw / ih;
    let oa = ow / oh;
    let wm = ow / iw;
    let hm = oh / ih;

    let mag = fill ? Math.max(wm, hm) : Math.min(wm, hm);
    if (!fill)
      if (mag > 1.0)
        mag = 1.0;

    mag *= 100;
    mag = Math.ceil(mag);
    mag /= 100;

    return mag;
  }
  calcRegion (iw, ih, ow, oh, rx1, ry1, rx2, ry2, fill) {
    let rw = rx2 - rx1;
    let rh = ry2 - ry1;

    let oa = ow / oh;

    // fix region aspect
    if (ow > oh) {
      rh = rw / oa;
    } else if (ow < oh) {
      rw = rh * oa;
    }

    // re center region
    let rx = (rx1 + rx2) / 2;
    let ry = (ry1 + ry2) / 2;
    rx1 = rx - rw / 2;
    ry1 = ry - rh / 2;
    rx2 = rx + rw / 2;
    ry2 = ry + rh / 2;

    let mag = this.calcMag(iw, ih, ow, oh, fill);

    let rmag = this.calcMag(rw, rh, ow, oh, fill);
    if (mag < rmag)
      mag = rmag;

    let how = ow * mag;
    let hoh = oh * mag;
    let how2 = how / 2;
    let hoh2 = hoh / 2;

    // output span (screenspace)

    // input span (texturespace)
    let rxsi = (iw * mag) - (ow);
    let rysi = (ih * mag) - (oh); // ryso / mag;

    let rxso = rxsi; // / mag;
    let ryso = rysi; // / mag;

    // offset (percent)
    let rxp = (rxsi > 0) ? rx1 * mag / rxsi : 0;
    let ryp = (rysi > 0) ? ry1 * mag / rysi : 0;

    // clip and round
    rxp = Math.max(0, Math.min(1, rxp));
    ryp = Math.max(0, Math.min(1, ryp));
    rxp = Math.round(rxp * 1000) / 1000;
    ryp = Math.round(ryp * 1000) / 1000;

    // return structure
    let r = {
      rw: rw,
      rh: rh,
      mag: mag,
      rmag: rmag,
      how: how,
      hoh: hoh,
      rxp: rxp,
      ryp: ryp,
      rxso: rxso,
      ryso: ryso,
      rxsi: rxsi,
      rysi: rysi
    };

    // offset in screenspace
    let cx = rxso * rxp;
    let cy = ryso * ryp;

    // limit region to image
    if (fill) {
      cx = Math.max(cx, 0);
      cy = Math.max(cy, 0);
      cx = Math.min(cx, rxso);
      cy = Math.min(cy, ryso);
    }

    // borders
    r.cx = cx;
    r.cy = cy;
    r.l = Math.floor(-cx);
    r.t = Math.floor(-cy);
    r.r = Math.ceil(-cx + how);
    r.b = Math.ceil(-cy + hoh);

    // profit
    return r;
  }
  updateOutput() {


  }
  handleChange = event => {
    const img = {
      url: this.imgRef.value,
      width: this.imgWidthRef.value,
      height: this.imgHeightRef.value
    };

    const region = {
      x: this.xPosRef.value,
      y: this.yPosRef.value,
      w: this.wPosRef.value,
      h: this.hPosRef.value
    };

    const output = {
      w: this.wOutRef.value,
      h: this.hOutRef.value
    }


    let iu = img.url;
    let iw = parseInt(img.width, 10);
    let ih = parseInt(img.height, 10);

    // let rx2 = parseInt(region.w, 10);
    // let ry2 = parseInt(region.h, 10);
    // let rw = rx2 - rx1;
    // let rh = ry2 - ry1;
    let rw = parseInt(region.w, 10);
    let rh = parseInt(region.h, 10);
    let rx1 = parseInt(region.x, 10);
    let ry1 = parseInt(region.y, 10);
    let rx2 = rx1 + rw;
    let ry2 = ry1 + rh;

    let ow = parseInt(output.w, 10);
    let oh = parseInt(output.h, 10);

    let r = this.calcRegion(iw, ih, ow, oh, rx1, ry1, rx2, ry2, true);
    let niw = Math.round(iw * r.mag);
    let nih = Math.round(ih * r.mag);
    let px = Math.round(r.l);
    let py = Math.round(r.t);
    let pw = Math.round(r.r - r.l);
    let ph = Math.round(r.b - r.t);

    this.setState({
      iu,
      iw,
      ih,
      rx1,
      ry1,
      rx2,
      ry2,
      rw,
      rh,
      ow,
      oh,
      niw,
      nih,
      px,
      py,
      pw,
      ph
    });


    //this.updateOutput();
  }

  render() {
    const { iu, rx1, ry1, rw, rh, ow, oh, px, py, pw, ph, niw, nih} = this.state;
    const style = {
      region: {
        postion: 'absolute',
        top: `${ry1}px`,
        left: `${rx1}px`,
        width: `${rw}px`,
        height: `${rh}px`
      },
      outerwrapper: {
        width: `${ow}px`,
        height: `${oh}px`
      },
      innerwrapper: {
        postion: 'absolute',
        top: `${py}px`,
        left: `${px}px`
      },
      outputimg: {
        width: `${niw}px`,
        height: `${nih}px`
      },
      cropOuter: {
        height: `${oh + 200}px`
      },
      cropInner: {
        margin: '100px',
        width: `${niw}px`,
        height: `${nih}px`
      },
      cropIndicator: {
        left: `${100 + px}px`,
        top: `${100 + py}px`,
        width: `${pw}px`,
        height: `${ph}px`
      },
      cropArea: {
        left: '100px',
        top: '100px',
        width: `${ow}px`,
        height: `${oh}px`
      },
      cropImg: {
        width: `${niw}px`,
        height: `${nih}px`
      }
    };


    return (
      <div className="container">
        <div className="row">
          <div className="col-md-9">

            <h3>Preview Output</h3>
            <div className="docs-preview clearfix">
              <div id="output" className="img-preview">
                <div className="outerwrapper" style={style.outerwrapper}>
                  <div className="innerwrapper" style={style.innerwrapper}>
                    <img src={iu} style={style.outputimg} alt="" />
                  </div>
                </div>
              </div>
            </div>

            <h3>Crop region</h3>
            <div className="docs-preview clearfix">
              <div id="crop" className="img-preview">
                <div className="outerwrapper" style={style.cropOuter}>
                  <div style={style.cropInner}></div>
                  <div className="indicator" style={style.cropIndicator}>
                    <img src={iu} style={style.cropImg} alt="" />
                  </div>
                  <div className="area" style={style.cropArea}></div>
                  
                </div>
              </div>
            </div>


            
            <h3>Original image + region of interest</h3>
            <div className="docs-preview clearfix">
              <div id="input" className="img-preview">
                <img src={iu} alt="" />
                <div className="region" style={style.region}></div>
              </div>
            </div>
          </div>



          <div className="col-md-3">

            <div className="card">
              <div className="card-body">
                <h3 className="card-title">Interactive demo</h3>



<div className="docs-data">

  <h5 className="card-title">Original image</h5>
  <div className="input-group">
    <div className="input-group-prepend">
      <label className="input-group-text" htmlFor="dataImgUrl">Image</label>
    </div>

    <input
      type="text" 
      id="dataImgUrl"
      className="form-control"
      placeholder="image url"
      ref={(input) => this.imgRef = input}
      value={this.state.iu}
      onChange={this.handleChange}
      />
  </div>

  <div className="input-group">
    <span className="input-group-prepend">
      <label className="input-group-text" htmlFor="dataImgWidth">Width</label>
    </span>
    
    <input 
      type="text"
      id="dataImgWidth" 
      className="form-control" 
      placeholder="width"
      ref={(input) => this.imgWidthRef = input}
      value={this.state.iw}
      onChange={this.handleChange}
    />

    <span className="input-group-append">
      <span className="input-group-text">px</span>
    </span>
  </div>
  <div className="input-group">
    <span className="input-group-prepend">
      <label className="input-group-text" htmlFor="dataImgHeight">Height</label>
    </span>

    <input
      type="text"
      id="dataImgHeight"
      className="form-control"
      placeholder="height"
      ref={(input) => this.imgHeightRef = input}
      value={this.state.ih}
      onChange={this.handleChange}
    />

    <span className="input-group-append">
      <span className="input-group-text">px</span>
    </span>
  </div>

  




  <h5 className="card-title">Region of interest</h5>

  <div className="input-group">
    <span className="input-group-prepend">
      <label className="input-group-text" htmlFor="dataWidth">Width</label>
    </span>
    <input
      type="text"
      id="dataWidth"
      className="form-control"
      placeholder="width"
      ref={(input) => this.wPosRef = input}
      onChange={this.handleChange}
    />
    <span className="input-group-append">
      <span className="input-group-text">px</span>
    </span>
  </div>
  <div className="input-group">
    <span className="input-group-prepend">
      <label className="input-group-text" htmlFor="dataHeight">Height</label>
    </span>
    <input
      type="text"
      id="dataHeight"
      className="form-control"
      placeholder="height"
      ref={(input) => this.hPosRef = input}
      onChange={this.handleChange}
    />
    <span className="input-group-append">
      <span className="input-group-text">px</span>
    </span>
  </div>



  <div className="input-group">
      <span className="input-group-prepend">
          <label className="input-group-text" htmlFor="dataX">Left</label>
      </span>
      <input
        type="text"
        id="dataX"
        className="form-control"
        placeholder="x"
        ref={(input) => this.xPosRef = input}
        onChange={this.handleChange}
      />
      <span className="input-group-append">
          <span className="input-group-text">px</span>
      </span>
  </div>

  <div className="input-group">
      <span className="input-group-prepend">
          <label className="input-group-text" htmlFor="dataY">Top</label>
      </span>
      <input
        type="text"
        id="dataY"
        className="form-control"
        placeholder="y"
        ref={(input) => this.yPosRef = input}
        onChange={this.handleChange}
      />
      <span className="input-group-append">
          <span className="input-group-text">px</span>
      </span>
  </div>




  <h5 className="card-title">Output size</h5>
  <div className="input-group">
    <span className="input-group-prepend">
      <label className="input-group-text" htmlFor="dataOutputWidth">Width</label>
    </span>
    <input
      type="text"
      id="dataOutputWidth"
      className="form-control"
      placeholder="width"
      ref={(input) => this.wOutRef = input}
      value={this.state.ow}
      onChange={this.handleChange}
    />
    <span className="input-group-append">
      <span className="input-group-text">px</span>
    </span>
  </div>
  <div className="input-group">
    <span className="input-group-prepend">
      <label className="input-group-text" htmlFor="dataOutputHeight">Height</label>
    </span>
    <input
      type="text"
      id="dataOutputHeight"
      className="form-control"
      placeholder="height"
      ref={(input) => this.hOutRef = input}
      value={this.state.oh}
      onChange={this.handleChange}
    />
    <span className="input-group-append">
      <span className="input-group-text">px</span>
    </span>
  </div>


  <div className="input-group mb-2">
    <div className="input-group-prepend">
      <label className="input-group-text" htmlFor="dataAspect">Aspect</label>
    </div>
    <input type="text" className="form-control" id="dataAspect" placeholder="aspect" />
  </div>

  <div className="input-group">
    <div className="input-group-prepend">
      <span className="input-group-text">Code</span>
    </div>
    <textarea className="form-control"></textarea>
  </div>


  
</div>










              </div>
            </div>

          </div>
        </div>






      </div>
    );
  }
}

export default App;
