/* eslint import/no-webpack-loader-syntax: off */
import React, { Component } from 'react';
import './App.css';
import logo from './logo.png';
import flagDescriptions from './flagDescriptions.js';
import EarthBoundRandomizer from 'workerize-loader!./Randomizer/index.js';
import ebutils from './Randomizer/ebutils.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.setFlag = this.setFlag.bind(this);
    this.fileSelect = this.fileSelect.bind(this);
    this.generate = this.generate.bind(this);
    this.downloadROM = this.downloadROM.bind(this);
    this.downloadSpoiler = this.downloadSpoiler.bind(this);
    this.showMoreInfo = this.showMoreInfo.bind(this);
    this.showFlagDetail = this.showFlagDetail.bind(this);
    this.secret = this.secret.bind(this);
    this.setQueryString = this.setQueryString.bind(this);
    this.flagDescriptions = flagDescriptions;

    const versionParts = process.env.REACT_APP_VERSION.split(".",2);
    const version = (versionParts.length === 1 || versionParts[1] === "0") ? versionParts[0] : versionParts.join(".");
    const initialSpecs = {
      title: "EBRND",
      version: version,
      lorom: false,
      seed: Math.floor(Math.random() * Math.floor(99999999)),
      flags: {'a': 1},
    };
    let compatibleVersion = true;
    let directLink = false;
    const params = new URLSearchParams(window.location.search);
    if(params.has("version")) {
      directLink = true;
      compatibleVersion = (params.get("version") === initialSpecs.version) || (params.get("version") === "current");
      initialSpecs.seed = parseInt(params.get("seed"), 10);
      initialSpecs.flags = ebutils.parseFlagString(params.get("flags"));
    }
    
    Object.keys(flagDescriptions).forEach( flag => {
      if(initialSpecs.flags[flag] === undefined) {
        initialSpecs.flags[flag] = directLink ? 0 : flagDescriptions[flag].default;
      }
    });

    this.state = {
      generationStatus: null,
      errorMode: false,
      uploadedROM: null,
      newROM: null,
      debug: false,
      moreInfo: false,
      flagDetail: directLink,
      showDirectLinkInfo: directLink,
      compatibleVersion: compatibleVersion,
      specs: initialSpecs,
    };
  }

  componentDidMount() {
    this.earthBoundRandomizer = EarthBoundRandomizer();
    this.earthBoundRandomizer.addEventListener("message", e => {
      const d = e.data;
      if(d.type === "info") {
        this.setState({generationStatus: d.text});
      }
      if(d.type === "error") {
        this.setState({generationStatus: d.text, errorMode: true});
      }
    });
  }

  setFlag(flag, val) {
    if(this.state.generationStatus) return;
    this.setQueryString(false);
    this.setState(s => {
      s.specs.flags[flag] = val;
      if(flag === 'a' || flag === 'k') s.moreInfo = false;
      return s;
    });
  }

  flagString() {
    return ebutils.flagString(this.state.specs.flags);
  }

  fileSelect(event) {
    if(this.state.generationStatus) return;
    const file = event.target.files[0];
    if(!file) {
      this.setState({uploadedROM: null});
      return;
    }
    const reader = new FileReader();
    reader.onloadend = e => {
      this.setState(s => { s.uploadedROM = new Uint8Array(e.target.result); return s; })
    };
    reader.readAsArrayBuffer(file);
  }

  generate(event) {
    this.setQueryString(true);
    this.setState({generationStatus: 'Beginning randomization...' });
    this.earthBoundRandomizer.execute(this.state.uploadedROM, this.state.specs)
    .then(newROM => {
      this.setState({newROM: newROM});
    });
  }

  downloadROM(event) {
    const blob = new Blob([this.state.newROM.rom], {type: "application/octet-stream"} );
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = "eb." + this.flagString() + "." + this.state.specs.seed + ".smc";
    document.body.appendChild(link); 
    link.click();
    link.remove();
  }

  downloadSpoiler(event) {
    const blob = new Blob([JSON.stringify(this.state.newROM.spoiler)], {type: "application/json"});
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = "eb." + this.flagString() + "." + this.state.specs.seed + ".spoiler.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  showMoreInfo(event) {
    this.setState({moreInfo: true});
  }

  showFlagDetail(event) {
    this.setState({flagDetail: true});
  }

  secret(event) {
    if(event.button === 1) {
      event.stopPropagation();
      event.preventDefault();
      this.setState({debug: true});
    }
  }

  setQueryString(data=false) {
    if(!data) {
      if(window.location.href.split("?").length > 1) {
        window.history.replaceState(null, "", window.location.href.split("?")[0]);
      }
      return;
    }
    var params = new URLSearchParams();
    params.append("version", this.state.specs.version);
    params.append("seed", this.state.specs.seed);
    params.append("flags",this.flagString());
    window.history.replaceState(null, "", `${window.location.href.split("?")[0]}?${params.toString()}`);
  }
  
  get romStatus() {
    if(!this.state.uploadedROM) return 'None';
    let start = 0xFFC0;
    if((this.state.uploadedROM.length & 0x200) === 0x200) start += 0x200;
    const gameID = Array.from(this.state.uploadedROM.slice(start, start + 20)).map(c => String.fromCharCode(c)).join("");
    if(gameID !== "EARTH BOUND         ") return 'WARNING: Not valid EarthBound ROM.';
    if(this.state.uploadedROM.length === 0x300000) return 'Valid EarthBound ROM';
    if(this.state.uploadedROM.length === 0x300200) return 'Valid EarthBound ROM (Headered)';
    if(this.state.uploadedROM.length === 0x400000) return 'Valid EarthBound ROM (Expanded)';
    if(this.state.uploadedROM.length === 0x400200) return 'Valid EarthBound ROM (Headered, Expanded)';
    return 'WARNING: Invalid ROM size.';
  }

  render() {
    const specs = this.state.specs;
    const badVersion = (
      <section className="step-badversion">
        <h3>Incompatible Version</h3>
          <div className="sectionContent">
            <p>The direct link you have followed is for an older version of the EarthBound randomizer, and is no longer compatible.</p>
            <p><a href="?">Click here</a> to create a new ROM.</p>
          </div>
      </section>
    );

    const selectModeNormalContent = (
      <div className="sectionContent">
      <fieldset>
        <legend>Seed:</legend>
        <div className="seedContainer">
          <input value={this.state.specs.seed} onChange={e => { 
              if(this.state.generationStatus) return;
              this.setQueryString(false);
              if(e.target.value === "") this.setState(s => {s.specs.seed = ""; return s})
              const seed = parseInt(e.target.value, 10); 
              if(seed > 0 && seed < Number.MAX_SAFE_INTEGER) this.setState(s => {s.specs.seed = seed; return s});
          }} />
          <p>The seed should be an integer value. ROMs with identical seeds, versions, and flags will be identical.</p>
        </div>
      </fieldset>
      <fieldset>
        <legend>Primary mode:</legend>
        <div className="modeButtons">
          <button className={specs.flags.a ? 'modeSelected' : ''} 
          onClick={e => {this.setFlag('a', 1);this.setFlag('k', 0)}}>Ancient Cave</button>
          <button className={specs.flags.k ? 'modeSelected' : ''} 
          onClick={e => {this.setFlag('a', 0);this.setFlag('k', 1)}}>Keysanity</button>
          <button className={!specs.flags.a && !specs.flags.k ? 'modeSelected' : ''} 
          onClick={e => {this.setFlag('a', 0);this.setFlag('k', 0)}}>Normal</button>
        </div>
        { specs.flags.a ?
          <div>
          <p><strong>Recommended.</strong> Ancient Cave mode completely changes how the game is played. Instead of proceeding through the normal storyline of EarthBound, all rooms and doors have been shuffled around into a multi-level maze. You start with all four party members, and your goal is to proceed through all 8 levels of the maze, each level guarded by a Shiny Spot, and reach and defeat Giygas. </p>
          
          { !this.state.moreInfo ? <button onClick={this.showMoreInfo}>More info...</button> :
            <div>
              <p>Enemy spawn locations grow in difficulty as you proceed deeper into the maze, as do gift box rewards (if randomize gift box contents is on, which is recommended). You will not have to move any NPC or do any storyline events, like riding the Sky Runner or beating Carpainter, to beat the game in this mode. Often, you can move an NPC or do story events to "skip" around in the cave. This may take you onto a different floor into the maze. If you take no skips, you will encounter each of the 8 shiny spots before reaching Giygas. The Exit Mouse will return you to the last sanctuary you visited.</p>
          
              <p>There is a <a href="https://github.com/pickfifteen/eb-randomizer/blob/master/ancient_cave_tips.md">document with strategies and tips</a> available.</p>

              <p>Known skips:</p>
              <ul>
              <li>Any of the Monkey Cave monkeys who want items</li>
              <li>Having a theater ticket attendant move out of the way, in either direction</li>
              <li>Removing pencil, eraser, or rabbit statues</li>
              <li>Getting abducted by ghosts in the tunnels</li>
              <li>Giving the Tiny Ruby to the museum guard, or buying the Onett house</li>
              <li>Beating Belch in his base (which requires Fly Honey)</li>
              <li>Entering Dungeon Man or the Waterfall</li>
              </ul>
            </div>
          }
          </div>
        :
        specs.flags.k ?
          <div>
          <p><strong>Experts only!</strong> Keysanity mode also radically changes how the game is played. 15 different key items have been shuffled around throughout the world; Mayor Pirkle may give you the Bicycle, while the Bike Shop guy may give you the Carrot key. To help you on this more complicated quest, however, Ness already knows PSI Teleport, and all available teleport locations are unlocked at the start of the game (including bonus teleports to South Winters and North Onett). Your goal is to beat the game as normal, but getting to all 8 Your Sanctuary locations will be more of a challenge.</p>
          { !this.state.moreInfo ? <button onClick={this.showMoreInfo}>More info...</button> :
            <div>
              <p>The list of items that have had their locations shuffled in this mode is as follows:</p>
              
              <ul>
              <li>Franklin badge</li>
              <li>Shyness book</li>
              <li>King banana</li>
              <li>Key to the shack</li>
              <li>Hawk eye</li>
              <li>Bicycle</li>
              <li>Wad of bills</li>
              <li>Diamond</li>
              <li>Signed banana</li>
              <li>Pencil eraser</li>
              <li>Key to the tower</li>
              <li>Town map</li>
              <li>Carrot key</li>
              <li>Tendakraut - but the Tendakraut has been transformed into a Jar of Fly Honey</li>
              <li>Suporma - but the Suporma has been transformed into a Meteorite piece</li>
              </ul>
              <p>Because you can get a Jar of Fly Honey through one of these 15 locations, it is not necessary to do the Jeff-alone-in-Winters part of the storyline. However, you can still do so if you wish, as the Boogey Tent will still contain a Jar of Fly Honey as well.</p>
              
              <p>Be careful with how you proceed through storyline events! If you take a very unusual order, it is possible you may lock yourself out of having a character available until you complete Magicant. Since you can teleport anywhere instantly, you can get the game into very unusual states; this is expected and encouraged to take advantage of to get a lower time.</p>
              
              <p>A few events have been made more lenient with regards to in-game triggers; notably, Venus will always give you her item right away, you can access the Pyramid without fighting Kraken (but you still must see the hieroglyphs), and Montague should always appear. It is also possible to get the game into a "spawns-off" condition. This is expected, but note if you game over in a spawns-off condition, you may softlock and have to reset the game, so be sure to save if necessary!</p>
            </div>
          }
          </div>
        :
          <p>This is the normal mode of playing EarthBound. Only the flags that you set below will be changed. Otherwise, the goal and playthrough will be similar to the vanilla game.</p>
        }
        
      </fieldset>
      <fieldset>
        <legend>Other flags:</legend>
        { !(this.state.flagDetail || this.state.debug) ? 
          <div>
            <p>We have chosen a default selection of flags that give an exciting new twist to the game (random backgrounds, enemy names, gift box contents, similar sprites, etc), while also focusing on a strong, fun, playable experience. This includes a run button, activated by holding "Y". You can customize these flags by pressing the button below to increase or decrease the type or severity of the randomization. A few flags are marked dangerous, as they may make the game glitchy or unbeatable.</p>
            <button onClick={this.showFlagDetail}>Customize flags...</button>
          </div>
        :
        this.flagDescriptions && Object.keys(this.flagDescriptions)
          .filter(f => this.state.debug || f.length === 1)
          .map( flag => {
            const flagInfo = this.flagDescriptions[flag];
            return <div className="flagContainer" key={flag}>
              <span className="flagLabel">{flag}</span>
              { [...Array(flagInfo.max + 1).keys()].map(i => { 
                return <label key={i} className={flagInfo.unsafe && flagInfo.unsafe <= i ? "unsafe" : ""}>
                  <input type="radio" checked={specs.flags[flag] === i} onChange={e => this.setFlag(flag, i)} />
                  {i}
                </label>
              })}
              <p><strong>{flagInfo.title}: </strong>{flagInfo.desc[specs.flags[flag]] || 'No randomization.'} <span className="unsafe">
              {flagInfo.unsafe && flagInfo.unsafe <= specs.flags[flag] ? 'This is unsafe and may cause errors. Not recommended.' : ''}</span></p>
            </div>
        })}
      </fieldset>
    </div>
    );

    const selectModeDirectLinkContent = (
      <div className="sectionContent">
        <p>
          You have followed a direct link to a specific seed ({this.state.specs.seed}) and settings. The ROM will be generated according to these settings.
        </p>
        <p>
          Alternatively, you may <a href="" onClick={(e) => {e.preventDefault(); this.setState({showDirectLinkInfo: false})}}>change these settings</a> or <a href="?">create a new ROM</a> instead.
        </p>
      </div>
    );

    const primarySections = (
      <div>
        <section className="step-rom">
          <h3>1) Select ROM</h3>
          <div className="sectionContent">
            <p>
              Select a ROM file that is an unaltered US version of EarthBound. We will not provide this file.
            </p>
            <p>
              <input name="romInput" id="romInput" type="file" onChange={this.fileSelect} />
              <label htmlFor="romInput" className={this.state.uploadedROM ? 'button' : 'button button-primary'}>Select ROM file</label>
              <span className="buttonInfo">File loaded: <i>{this.romStatus}</i></span>
            </p>
          </div>
        </section>
        <section className="step-modes">
          <h3>2) Select Modes</h3>
          {this.state.showDirectLinkInfo ? selectModeDirectLinkContent : selectModeNormalContent}
        </section>
        <section className="step-generate">
          <h3>3) Generate ROM</h3>
          <div className="sectionContent">
            <p>
              Press the button below to generate your ROM file. This will also generate a spoiler file you can
              use <a href="https://map.earthbound.app">here</a> to see relevant data about your seed.
            </p>
            { !this.state.newROM &&
              <p>
                <button disabled={this.state.generationStatus || !this.state.uploadedROM || !this.state.specs.seed}
                      onClick={this.generate} className={this.state.generationStatus && !this.state.errorMode ? 'loading' : 'button-primary'}>
                  Generate ROM</button>
                <span className={this.state.errorMode ? 'buttonInfo buttonInfoError' : 'buttonInfo'}>{this.romStatus === "None" ? "You must select a ROM file first." : this.state.generationStatus}</span>
              </p>
            }
            { this.state.newROM && this.state.newROM.rom &&
              <p>
                <button className="button-primary" onClick={this.downloadROM}>Download new ROM</button>
                <span className="buttonInfo">Done.</span>
              </p>
            }
            { this.state.newROM && this.state.newROM.spoiler &&
              <p><button onClick={this.downloadSpoiler}>Download Spoiler</button></p>
            }
          </div>
        </section>
      </div>
    );

    return (
      <div className="container">
        <section className="intro">
          <h1>
            <img src={logo} className="logo" alt="Loaded Dice mascot" onMouseDown={this.secret} />
            EarthBound Randomizer <a href="https://github.com/pickfifteen/eb-randomizer/blob/master/CHANGELOG.md">v{ this.state.specs.version }</a>
          </h1>
          <div className="sectionContent">
            <p>
              The EarthBound Randomizer is a program that randomizes a ROM for the Super Nintendo game EarthBound, 
              providing endless unique gameplay experiences with many distinct modes. For more information, visit
              our <a href="https://github.com/pickfifteen/eb-randomizer">GitHub page</a>. You can contact the 
              developer <a href="https://twitter.com/pickfifteen">@pickfifteen</a> on Twitter.
            </p>
          </div>
        </section>
        { this.state.compatibleVersion ? primarySections : badVersion }
      </div>
    );
  }
}

export default App;
