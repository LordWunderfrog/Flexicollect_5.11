/**
 * DepartmentList component.
 * 
 * This component is used to manage the department list.
 *
 *
 */

import React, { Fragment } from "react";
import { Link } from "react-router-dom";

/* Material UI. */
import withStyles from "@material-ui/core/styles/withStyles";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import CardActions from "@material-ui/core/CardActions";

/* Icons. */
import IconButton from "@material-ui/core/IconButton";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";

/* Custom components, */
import GridItem from "components/Grid/GridItem.jsx";
import GridContainer from "components/Grid/GridContainer.jsx";
import SortedTable from "components/SortedTable/SortedTable.jsx";
import Card from "components/Card/Card.jsx";
import DepartmentCard from "components/CustomCards/DepartmentCard";
import AlertDialog from "components/AlertDialog/AlertDialog";

/* Bootstrap. */
import { Button, Form } from "react-bootstrap";

/* Scroll. */
import PerfectScrollbar from "react-perfect-scrollbar";
import InfiniteScroll from 'react-infinite-scroll-component';

/* API. */
import api2 from "../../helpers/api2";

/* CSS. */
import "./DepartmentList.css";

const styles = {
  cardCategoryWhite: {
    "&,& a,& a:hover,& a:focus": {
      color: "rgba(255,255,255,.62)",
      margin: "0",
      fontSize: "14px",
      marginTop: "0",
      marginBottom: "0"
    },
    "& a,& a:hover,& a:focus": {
      color: "#FFFFFF"
    }
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: "#777",
      fontSize: "65%",
      fontWeight: "400",
      lineHeight: "1"
    }
  },
  gridHeader: {
    width: "100%",
    marginLeft: "5%",
    marginBottom: "1%"
  },
  loadingDiv: {
    width: "100%",
    textAlign: "center"
  }
};

const pageSize = 50
class DepartmentList extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      view: "grid",
      departments: [],
      search: [],
      filteredDepartments: [],
      response: false,
      messsage: "",
      userRole: localStorage.getItem("role"),
      dialogOpen: false,
      deleteDepartmentName: "",
      deleteDepartmentId: "",
      deleteDepartmentIndex: "",
      hasMoreDepartmentData: true
    };
    //this.props.handleCollapseScreen(true);
  }

  componentDidMount() {
    this.getDepartmentList();
  }

  /* Handles the api to fetch the department list. */
  getDepartmentList() {
    var self = this;

    api2
      .get("department")
      .then(response => {
        self.setState({
          departments: response.data,
          filteredDepartments: response.data.slice(0, pageSize),
          hasMoreDepartmentData: response.data && response.data.length >= pageSize ? true : false,
          response: true
        });
      })
      .catch(error => {
        console.error(error);
        self.setState({
          response: true
        });
      });
  }

  /* Handles the event to update the view. */
  switchView(view) {
    if (view === "grid") {
      this.setState({
        view: "grid"
      });
    } else if (view === "list") {
      this.setState({
        view: "list"
      });
    }
  }

  /* Handles the event to filter the department. */
  filterDepartment = departmentFilter => {
    let filteredDepartments = this.state.departments;
    filteredDepartments = filteredDepartments.filter(department => {
      let name = department.departmentName.toLowerCase();
      let tags = department.tags.toLowerCase();
      return (
        name.indexOf(departmentFilter.toLowerCase()) !== -1 ||
        tags.indexOf(departmentFilter.toLowerCase()) !== -1
      );
    });
    this.setState({
      filteredDepartments
    });
  };

  /* Handles the event when the input value changes. */
  handleInputChange = event => {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });

    this.filterDepartment(value);
  };

  /* Handles the event when the user deletes an item. */
  deleteItem = (id, name, index) => event => {
    event.preventDefault();
    this.setState({
      dialogOpen: true,
      deleteDepartmentId: id,
      deleteDepartmentIndex: index,
      deleteDepartmentName: name
    });
  };

  /* Handles the close event of popup. */
  handleDialogClose = deleteProject => event => {
    if (deleteProject) {
      api2
        .delete("department?id=" + this.state.deleteDepartmentId)
        .then(resp => {
          this.setState({
            departments: this.state.departments.filter(
              (x, i) => i !== this.state.deleteDepartmentIndex
            ),
            filteredDepartments: this.state.filteredDepartments.filter(
              (x, i) => i !== this.state.deleteDepartmentIndex
            )
          });
          this.props.updateDepartmentList();
        });
    }
    this.setState({ dialogOpen: false });
  };

  /** pagination of data */
  fetchMoreDepartmentData = () => {
    if (this.state.filteredDepartments.length == this.state.departments.length) {
      this.setState({ hasMoreDepartmentData: false });
      return;
    }
    setTimeout(() => {
      let start = this.state.filteredDepartments.length
      let end = this.state.filteredDepartments.length + pageSize
      let spliceArray = this.state.departments.slice(start, end)
      let concatedArray = this.state.filteredDepartments.concat(spliceArray)
      this.setState({
        filteredDepartments: concatedArray
      });
    }, 500);
  };

  render() {
    const { classes } = this.props;
    function Actions(props) {
      return (
        <CardActions>
          <IconButton
            onClick={props.deleteItem(
              props.id,
              props.departmentName,
              props.index
            )}
            aria-label="Delete"
            className={classes.buttons}
          >
            <DeleteForeverIcon color="action" />
          </IconButton>
        </CardActions>
      );
    }
    const listItems = this.state.filteredDepartments.map(
      (department, index) => [
        department.departmentName,
        department.country,
        department.location,
        department.departmentOwner.name,
        department.departmentOwner.email,
        department.departmentOwner.mobile,
        department.tags,
        <Actions
          id={department.id}
          departmentName={department.departmentName}
          index={index}
          deleteItem={this.deleteItem}
        />
      ]
    );

    const listIds = this.state.filteredDepartments.map(department => [
      department.id
    ]);

    let body_class = this.props.fullWidth
      ? "body-full-expanded"
      : "body-full-collapsed";
    return (
      <div style={{ height: "90%" }} className={body_class}>
        <div className={classes.gridHeader}>
          <Grid
            container
            id="gridHeader"
            alignItems="center"
            style={{ padding: "0%", margin: "0 !important" }}
          >
            <GridItem xs={6} sm={4} md={2}>
              <Typography variant="h6">
                Departments ({this.state.departments.length})
              </Typography>
            </GridItem>

            <GridItem xs={6} sm={4} md={2}>
              <Form.Control
                type="text"
                name="search"
                value={this.state.search}
                onChange={this.handleInputChange}
                style={{ height: 33, borderRadius: "2rem" }}
                placeholder="Search"
              />
            </GridItem>

            <GridItem id="filler" xs={4} sm={4} md={4} />

            <GridItem
              gridCss={{ padding: "0px !important" }}
              xs={6}
              sm={4}
              md={2}
            >
              <Button
                onClick={() => this.switchView("grid")}
                variant={this.state.view === "grid" ? "light" : ""}
                className={"view-switch-button"}
              >
                <i className="fa fa-th" aria-hidden="true" />
              </Button>
              <Button
                onClick={() => this.switchView("list")}
                variant={this.state.view === "list" ? "light" : ""}
                className={"view-switch-button"}
              >
                <i className="fa fa-list" aria-hidden="true" />
              </Button>
            </GridItem>

            <GridItem xs={6} sm={4} md={2}>
              <Link to="/home/create-department">
                <Button
                  variant="primary"
                  style={{
                    borderRadius: "30px",
                    fontSize: "0.8rem",
                    background: "#0069d9"
                  }}
                >
                  Create Department
                </Button>
              </Link>
            </GridItem>
          </Grid>
        </div>
        {this.state.departments.length === 0 && !this.state.response ? (
          <div className={classes.loadingDiv}>
            <CircularProgress className={classes.progress} color="primary" />
          </div>
        ) : (
          <Fragment>
            {this.state.departments.length === 0 && this.state.response ? (
              <div className={classes.loadingDiv}>
                <Typography variant="h5">No Departments!</Typography>
              </div>
            ) : (
              <Fragment>
                {this.state.view === "grid" ? (
                  // <PerfectScrollbar>
                  <div id="scrollableDiv" style={{ height: "calc(100vh - 80px)", overflow: "auto" }}>
                    <InfiniteScroll
                      dataLength={this.state.filteredDepartments.length}
                      next={this.fetchMoreDepartmentData}
                      hasMore={this.state.hasMoreDepartmentData}
                      // height={800}
                      loader={
                        <h5 className="pt-4 text-center">Loading...</h5>
                      }
                      endMessage={<div></div>}
                      scrollableTarget="scrollableDiv"
                    >
                      <div className="list-box float-none">
                        <Grid container spacing={8}>
                          {this.state.filteredDepartments.map((department, i) => (
                            <Grid
                              item
                              md={4}
                              key={i}
                              style={{
                                width: this.props.isMobile ? "100%" : "auto",
                                marginLeft: this.props.isMobile ? "-1%" : "0"
                              }}
                            >
                              <DepartmentCard
                                key={department.departmentName}
                                department={department}
                                index={i}
                                deleteItem={this.deleteItem}
                                canDelete={
                                  this.state.userRole === "ADMIN" ? true : false
                                }
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </div>
                    </InfiniteScroll>
                  </div>
                  // </PerfectScrollbar>
                ) : (
                  <PerfectScrollbar>
                    <div className="list-box">
                      <GridContainer>
                        <GridItem xs={12} sm={12} md={12}>
                          <Card>
                            <SortedTable
                              linkTo="/home/create-department/"
                              listIds={listIds}
                              tableHead={[
                                "Name",
                                "Country",
                                "Location",
                                "Owner",
                                "Email",
                                "Phone",
                                "Categories",
                                "Actions"
                              ]}
                              tableData={listItems}
                            />
                          </Card>
                        </GridItem>
                      </GridContainer>
                    </div>
                  </PerfectScrollbar>
                )}
              </Fragment>
            )}
          </Fragment>
        )}

        <AlertDialog
          title={"Delete " + this.state.deleteDepartmentName}
          description="Are you sure you want to delete this department? Once deleted it cannot be retrieved"
          open={this.state.dialogOpen}
          handleDialogClose={this.handleDialogClose}
        />
      </div>
    );
  }
}

export default withStyles(styles)(DepartmentList);
