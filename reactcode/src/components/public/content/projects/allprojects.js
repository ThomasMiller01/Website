import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { gql } from "apollo-boost";

import "./allprojects.scss";

class AllProjects extends Component {
  constructor() {
    super();
    this.homepageApi = new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({
        uri: "https://api.thomasmiller.info/homepage",
      }),
    });
  }

  state = {
    projects: [],
  };

  componentDidMount = () => {
    this.homepageApi
      .query({
        query: gql`
          query {
            getPublicProjects {
              id
              name
              description
              images {
                thumbnail
              }
            }
          }
        `,
      })
      .then((result) => {
        this.setState({ projects: result.data.getPublicProjects });
      });
  };

  render() {
    return (
      <div style={allProjectsStyle} className="all-projects">
        <div style={projectsContainerStyle} className="projectsContainer">
          <div className="card-deck">
            {this.state.projects.map((project) => (
              <div
                key={project.id}
                className="card my-3"
                style={projectCardStyle}
              >
                <img
                  src={project.images.thumbnail}
                  className="card-img-top"
                  alt="Loading ..."
                />
                <div className="card-body">
                  <h4 className="card-title">{project.name}</h4>
                  <p
                    className="card-text"
                    dangerouslySetInnerHTML={{
                      __html: project.description,
                    }}
                  />
                  <NavLink
                    to={{
                      pathname: "/projects/" + project.name,
                    }}
                    className="btn btn-outline-primary"
                  >
                    See more
                  </NavLink>
                </div>{" "}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

const allProjectsStyle = {
  width: "100%",
  minHeight: "87vh",
  backgroundColor: "#242424",
  backgroundImage: "url('/images/all_projects_back.png')",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "scroll",
  backgroundPosition: "center",
  backgroundSize: "cover",
  padding: "15px 0 20px 0",
};

const projectsContainerStyle = { padding: "0 10px 0 10px" };

const projectCardStyle = { minWidth: "250px", border: "none" };

export default AllProjects;
