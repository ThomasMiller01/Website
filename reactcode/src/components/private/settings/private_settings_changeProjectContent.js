import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import AuthService from "../../authService";
import Other from "../../other";
import TinyEditor from "../../editor/tiny_editor";
import Prism from "prismjs";

import PrivateChangeProjectPreview from "./changeProject/preview";

class PrivateSettingsChangeProjectContent extends Component {
  constructor() {
    super();
    this.Auth = new AuthService();
    this.Other = new Other();

    this.EditorDescription = new TinyEditor({
      handleContentChange: this.getEditorDescriptionOutput
    });
    this.EditorDescriptionBig = new TinyEditor({
      handleContentChange: this.getEditorDescriptionBigOutput
    });
  }

  componentDidMount() {
    Prism.highlightAll();
  }

  getProjectTemplate = name => {
    return {
      _id: -1,
      _name: name,
      _githubRepo: "",
      _description: "",
      _description_big: "",
      _thumbnail: "",
      _headerImg: "",
      _images: [],
      _pubDate: "",
      _favourite: false,
      _private: false
    };
  };

  state = {
    allProjects: [this.getProjectTemplate("[Clear]")],
    currentProject: this.getProjectTemplate(""),
    projectStatus: "None",
    isMobile: false,
    renderPreview: false
  };

  getEditorDescriptionOutput = content => {
    let currentProject = this.state.currentProject;
    currentProject._description = content;
    this.setState({ currentProject });
  };

  getEditorDescriptionBigOutput = content => {
    let currentProject = this.state.currentProject;
    currentProject._description_big = content;
    this.setState({ currentProject });
  };

  componentWillMount() {
    if (this.Other.isMobile) {
      this.setState({ isMobile: true });
    } else {
      this.setState({ isMobile: false });
    }
    this.reloadProjects();
  }

  projectChanged = event => {
    var projectId = event.target.value;
    var currentProject = {};
    this.state.allProjects.forEach(project => {
      if (projectId === project._id.toString()) {
        currentProject = project;
      }
    });
    this.setState({ currentProject: currentProject });

    this.EditorDescription.updateContent(currentProject._description);
    this.EditorDescriptionBig.updateContent(currentProject._description_big);
  };

  fetch(url, options) {
    const headers = {
      Authorization: "Bearer " + this.Auth.getToken(),
      Accept: "application/json",
      "Content-Type": "application/json"
    };

    return fetch(url, {
      headers,
      ...options
    })
      .then(this._checkStatus)
      .then(response => response.json());
  }

  handleContentChange = e => {
    var currentProject = this.state.currentProject;
    var name = e.target.name;
    var value = e.target.value;
    if (name === "_favourite" || name === "_private") {
      currentProject[name] = e.target.checked;
    } else {
      currentProject[name] = value;
    }
    this.setState({
      currentProject: currentProject
    });
  };

  handleUpdateEvent = event => {
    event.preventDefault();
    var currentProject = this.state.currentProject;
    var images = [[]];
    var img_tmp = [];
    if (typeof currentProject["_images"] === "string") {
      var tmp = currentProject["_images"].split(",");
      for (var i = 0; i < tmp.length / 3; i++) {
        for (var j = 0; j < 3; j++) {
          img_tmp[j] = tmp[i * 3 + j];
        }
        images[i] = img_tmp;
        img_tmp = [];
      }
      currentProject["_images"] = images;
    }
    var method;
    if (currentProject["_id"] === -1) {
      method = "add";
    } else {
      method = "change/" + currentProject["_id"];
    }
    const headers = {
      Authorization: "Bearer " + this.Auth.getToken(),
      "Content-Type": "application/json"
    };
    const options = {
      method: "POST",
      body: JSON.stringify(currentProject)
    };
    fetch(
      "https://thomasmiller.info/services/homepage/api/Projects/" + method,
      {
        headers,
        ...options
      }
    ).then(() => {
      this.reloadProjects();
      this.setState({ projectStatus: "Success" });
      setTimeout(() => {
        this.setState({ projectStatus: "None" });
      }, 3000);
    });
  };

  reloadProjects() {
    const firstProject = this.state.allProjects[0];
    const headers = {
      Authorization: "Bearer " + this.Auth.getToken(),
      "Content-Type": "application/json"
    };
    fetch("https://thomasmiller.info/services/homepage/api/Projects/getAll", {
      headers
    })
      .then(results => {
        return results.json();
      })
      .then(data => {
        data.unshift(firstProject);
        this.setState({ allProjects: data });
      });
  }

  handleDeleteEvent = () => {
    var currentProject = this.state.currentProject;
    if (currentProject["_id"] !== -1) {
      const headers = {
        Authorization: "Bearer " + this.Auth.getToken(),
        "Content-Type": "application/json"
      };
      const options = { method: "DELETE" };
      fetch(
        "https://thomasmiller.info/services/homepage/api/Projects/delete/" +
          currentProject["_id"],
        {
          headers,
          ...options
        }
      ).then(() => {
        this.reloadProjects();
        this.setState({ projectStatus: "Success" });
        setTimeout(() => {
          this.setState({ projectStatus: "None" });
        }, 3000);
      });
    } else {
      this.setState({ projectStatus: "Error" });
      setTimeout(() => {
        this.setState({ projectStatus: "None" });
      }, 3000);
    }
  };

  handlePreviewEvent = () => {
    if (this.state.renderPreview) {
      this.setState({ renderPreview: false });
    } else {
      this.setState({ renderPreview: true });
    }
  };

  render() {
    return (
      <React.Fragment>
        <div style={privateSettingsStyle}>
          <center>
            <h1 className="top_text" style={privateSettingsH1Style}>
              Settings - Change Project
            </h1>
          </center>
          <NavLink
            to="/private/settings"
            className="btn btn-outline-primary"
            style={settingsBackStyle}
          >
            Back
          </NavLink>
          <div style={changeProjectContentStyle}>
            <div>
              <pre className="language-js">
                <code className="language-js">console.log("test123");</code>
              </pre>
            </div>
            <form onSubmit={this.handleUpdateEvent}>
              <center>
                <div
                  className="form-group selectProject"
                  style={FormGroupStyle}
                >
                  <select
                    className="form-control"
                    onChange={this.projectChanged}
                  >
                    {this.state.allProjects.map(project => (
                      <option key={project._id} value={project._id}>
                        {project._name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={borderBottomStyle} />
                <div className="input-group input_both" style={inputGroupStyle}>
                  <h1 style={inputGroupH1Style}>Code</h1>
                  <h2 style={inputGroupH2Style}>Name</h2>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Name"
                    style={inputGroupInputStyle}
                    value={this.state.currentProject._name}
                    name="_name"
                    onChange={this.handleContentChange}
                  />
                  <h2 style={inputGroupH2Style}>GitHub Repo</h2>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="GitHub Repo"
                    style={inputGroupInputStyle}
                    value={this.state.currentProject._githubRepo}
                    name="_githubRepo"
                    onChange={this.handleContentChange}
                  />
                  <h2 style={inputGroupH2Style}>Description</h2>
                  <div style={textDescriptionStyle}>
                    {this.EditorDescription.render()}
                  </div>
                  <h2 style={inputGroupH2Style}>Description Big</h2>
                  <div style={textDescriptionBigStyle}>
                    {this.EditorDescriptionBig.render()}
                  </div>
                  <h2 style={inputGroupH2Style}>Thumbnail</h2>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Thumbnail"
                    style={inputGroupInputStyle}
                    value={this.state.currentProject._thumbnail}
                    name="_thumbnail"
                    onChange={this.handleContentChange}
                  />
                  <h2 style={inputGroupH2Style}>Header Img</h2>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Header Img"
                    style={inputGroupInputStyle}
                    value={this.state.currentProject._headerImg}
                    name="_headerImg"
                    onChange={this.handleContentChange}
                  />
                  <h2 style={inputGroupH2Style}>Images</h2>
                  <textarea
                    className="form-control"
                    placeholder="Images"
                    style={textImagesStyle}
                    value={this.state.currentProject._images}
                    name="_images"
                    onChange={this.handleContentChange}
                  />
                  <div
                    className="custom-control custom-checkbox"
                    style={checkboxStyle}
                  >
                    <input
                      className="custom-control-input"
                      style={checkboxInputStyle}
                      type="checkbox"
                      checked={this.state.currentProject._favourite}
                      id="favourite"
                      name="_favourite"
                      onChange={this.handleContentChange}
                    />
                    <label
                      className="custom-control-label custom_checkbox"
                      htmlFor="favourite"
                    >
                      Favourite
                    </label>
                  </div>
                  <div
                    className="custom-control custom-checkbox"
                    style={checkboxStyle}
                  >
                    <input
                      className="custom-control-input"
                      style={checkboxInputStyle}
                      type="checkbox"
                      checked={this.state.currentProject._private}
                      id="private"
                      value={this.state.currentProject._private}
                      name="_private"
                      onChange={this.handleContentChange}
                    />
                    <label
                      className="custom-control-label"
                      style={checkboxInputStyle}
                      htmlFor="private"
                    >
                      Private
                    </label>
                  </div>
                </div>
                <PrivateChangeProjectPreview
                  isMobile={this.state.isMobile}
                  renderPreview={this.state.renderPreview}
                  _description={this.state.currentProject._description}
                  _description_big={this.state.currentProject._description_big}
                />
              </center>
              <div style={borderBottomStyle} />
              <GetProjectStatusMessage message={this.state.projectStatus} />
              <button
                type="submit"
                className="btn btn-outline-primary"
                style={changeProjectBtn}
              >
                Update
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                style={changeProjectBtn}
                data-toggle="modal"
                data-target="#deleteyousure"
              >
                Delete
              </button>
              <PreviewButton
                isMobile={this.state.isMobile}
                handlePreviewEvent={this.handlePreviewEvent}
              />
            </form>
          </div>
        </div>
        <div
          className="modal fade"
          id="deleteyousure"
          tabIndex="-1"
          role="dialog"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete</h5>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">Are you sure to delete it?</div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  data-dismiss="modal"
                  onClick={this.handleDeleteEvent}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const PreviewButton = props => {
  if (props.isMobile) {
    return (
      <button
        type="button"
        className="btn btn-outline-primary"
        style={changeProjectBtn}
        onClick={props.handlePreviewEvent}
      >
        Preview
      </button>
    );
  } else {
    return <span />;
  }
};

const GetProjectStatusMessage = props => {
  var status = props.message;
  if (status === "Error") {
    return (
      <div className="alert alert-danger" role="alert">
        Error while updating project!
      </div>
    );
  } else if (status === "Success") {
    return (
      <div className="alert alert-success" role="alert">
        Successfully updated project!
      </div>
    );
  } else {
    return <span />;
  }
};

// Styles
const changeProjectBtn = { margin: "5px" };

const checkboxInputStyle = { cursor: "pointer" };

const checkboxStyle = { width: "100%", textAlign: "left" };

const textImagesStyle = { minHeight: "150px", width: "100%" };

const textDescriptionBigStyle = { width: "100%" };

const textDescriptionStyle = { width: "100%" };

const inputGroupH2Style = {
  width: "100%",
  textAlign: "left",
  fontSize: "20px",
  marginBottom: "5px",
  marginTop: "5px"
};

const inputGroupH1Style = {
  width: "95%",
  textAlign: "left",
  fontSize: "30px",
  marginBottom: "10px"
};

const inputGroupInputStyle = { width: "100%" };

const inputGroupStyle = {
  marginRight: "2.5%",
  display: "inline-block",
  verticalAlign: "top"
};

const borderBottomStyle = {
  width: "95%",
  margin: "10px auto 10px auto",
  height: "2px",
  borderBottom: "solid 2px rgb(161, 161, 161)"
};

const changeProjectContentStyle = {
  width: "90%",
  padding: "15px",
  margin: "20px auto 0 auto",
  backgroundColor: "rgb(216, 216, 216)"
};

const settingsBackStyle = {
  position: "absolute",
  margin: "10px",
  top: "0",
  right: "0",
  color: "#007bff",
  backgroundColor: "transparent"
};

const privateSettingsH1Style = { margin: "0" };

const privateSettingsStyle = {
  width: "100%",
  minHeight: "93.5vh",
  backgroundColor: "rgb(230, 230, 230)",
  padding: "10px"
};

const FormGroupStyle = {
  margin: "0 0 20px 2.5%",
  textAlign: "left",
  width: "90%"
};

export default PrivateSettingsChangeProjectContent;
