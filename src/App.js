import React, { Component } from "react";
import "./App.css";
import "../node_modules/react-vis/dist/style.css";
import { XYPlot, XAxis, YAxis, VerticalGridLines, HorizontalGridLines, VerticalBarSeries, VerticalBarSeriesCanvas, LabelSeries } from "react-vis";
import * as helpers from "./helpers";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const typeUrl = (fromDate, toDate, type) => `https://opengis.simcoe.ca/api/getAppStats/${fromDate}/${toDate}/${type}`;
const typesUrl = "https://opengis.simcoe.ca/api/getAppStatsTypes";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      typeItems: [],
      selectedType: { label: "STARTUP_MAP_LOAD", value: "STARTUP_MAP_LOAD" },
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date()
    };
  }

  refreshData = () => {
    const startDate = this.getSqlDate(this.state.startDate);
    const endDate = this.getSqlDate(this.state.endDate);
    const type = this.state.selectedType.value;

    const url = typeUrl(startDate, endDate, type);
    console.log(this.state.selectedType);
    console.log(url);
    //"http://localhost:8085/getAppStats/2019-09-01/2019-10-8/STARTUP_MAP_LOAD"
    helpers.getJSON(url, result => {
      console.log(result);
      this.setState({ data: result });
    });
  };

  componentDidMount() {
    helpers.getJSON(typesUrl, result => {
      this.setState({ typeItems: result }, () => {
        this.refreshData();
      });
    });
  }

  onTypeDropDownChange = type => {
    this.setState({ selectedType: type }, () => {
      this.refreshData();
    });
  };

  onStartDateChange = date => {
    this.setState(
      {
        startDate: date
      },
      () => {
        this.refreshData();
      }
    );
  };

  onEndDateChange = date => {
    this.setState(
      {
        endDate: date
      },
      () => {
        this.refreshData();
      }
    );
  };

  getSqlDate = date => {
    var month = date.getUTCMonth() + 1; //months from 1-12
    var day = date.getUTCDate();
    var year = date.getUTCFullYear();
    return year + "-" + month + "-" + day;
  };

  getYMax = () => {
    if (this.state.data.length === 0) return 1;

    let max = 0;
    this.state.data.forEach(item => {
      if (parseInt(item.y) > max) max = parseInt(item.y);
    });

    return max;
  };

  //<LineSeries data={[{ x: 1, y: 10 }, { x: 2, y: 5 }, { x: 3, y: 15 }]} />
  render() {
    const MARGIN = {
      left: 50,
      right: 10,
      bottom: 80,
      top: 20
    };

    const dropDownStyles = {
      control: provided => ({
        ...provided,
        maxHeight: "30px",
        minHeight: "30px",
        // width: "150px"
        width: "500px"
        //      borderRadius: "unset",
      }),
      indicatorsContainer: provided => ({
        ...provided
        //   height: "30px"
      }),
      clearIndicator: provided => ({
        ...provided,
        padding: "5px"
      }),
      dropdownIndicator: provided => ({
        ...provided,
        padding: "5px"
      }),
      menu: provided => ({
        ...provided
        //   width: "200px"
      }),
      container: provided => ({
        ...provided,
        width: "500px"
      })
    };
    
    const max = this.getYMax();

    return (
      <div>
        <div style={{ marginTop: "10px", marginBottom: "10px", marginLeft: "10px" }}>
          <Select styles={dropDownStyles} isSearchable={false} onChange={this.onTypeDropDownChange} options={this.state.typeItems} value={this.state.selectedType} />
          <DatePicker selected={this.state.startDate} onChange={this.onStartDateChange} />
          <DatePicker selected={this.state.endDate} onChange={this.onEndDateChange} />
        </div>

        <div className={this.state.data.length > 0 ? "Hidden" : "NoResults"}>No Result Found</div>
        <XYPlot margin={MARGIN} xType="ordinal" width={1000} height={700} yDomain={[0, max]}>
          <VerticalGridLines />
          <HorizontalGridLines />
          <XAxis tickLabelAngle={-90} />
          <YAxis />
          <VerticalBarSeries data={this.state.data} />
        </XYPlot>
      </div>
    );
  }
}

export default App;
