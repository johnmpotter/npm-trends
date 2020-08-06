import React, { Component } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';

import Package from 'services/Package';
import API from 'services/API';

import SearchForm from 'App/_search/SearchForm';
import PackageTags from 'App/_search/PackageTags';
import TrendGraphBox from 'App/_chart/TrendGraphBox';
import PackageStats from 'App/_statsTable/PackageStats';
import PopularSearches from 'App/_searchLists/PopularSearches';
import RelatedSearches from 'App/_searchLists/RelatedSearches';
import PackageComparisonHeading from './_components/PackageComparisonHeading';

const propTypes = {
  params: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

class PackageComparison extends Component {
  constructor(props) {
    super(props);
    this.state = {
      packets: [],
    };
  }

  componentDidMount() {
    this.loadPackets(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.loadPackets(nextProps);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { packets } = this.state;

    return packets !== nextState.packets;
  }

  colors = () => [
    [0, 116, 217],
    [255, 133, 27],
    [46, 204, 64],
    [255, 65, 54],
    [255, 220, 0],
    [127, 219, 255],
    [177, 13, 201],
    [57, 204, 204],
    [0, 31, 63],
    [1, 255, 112],
  ];

  loadPackets = async props => {
    const { packets } = props.params;

    if (!packets) {
      this.setPageMeta([]);
      this.setState({ packets: [] });
      return;
    }

    const packetsArr = packets.split('-vs-');

    const maxPacketsForSearch = 10;

    if (packetsArr.length > maxPacketsForSearch) {
      this.redirectToSearch(packetsArr.slice(0, maxPacketsForSearch));
      return;
    }

    const fetchedPackages = await Promise.all(
      packetsArr.map(async packageName => {
        try {
          return await Package.fetchPackageDetails(packageName);
        } catch {
          return {
            hasError: true,
            packageName,
          };
        }
      }),
    );

    const missingPackages = fetchedPackages.filter(p => p.hasError || !p.collected).map(p => p.packageName);

    if (missingPackages.length) {
      const { params, history } = this.props;
      const packetsArray = params.packets.split('-vs-');

      const remainingPackets = packetsArray.filter(packet => !missingPackages.includes(packet));

      const packetsUrl = remainingPackets.length > 1 ? remainingPackets.join('-vs-') : remainingPackets.join('');
      const url = `/${packetsUrl}`;

      history.push(url);

      return;
    }

    const formattedPackageData = fetchedPackages
      .filter(p => !p.hasError && p.collected)
      .map((packageData, i) => ({
        id: packageData.collected.metadata.name,
        name: packageData.collected.metadata.name,
        description: packageData.collected.metadata.description,
        repository: packageData.collected.metadata.repository,
        npmsData: packageData,
        color: this.colors()[i],
      }));

    this.setPageMeta(packetsArr);
    this.setState({ packets: formattedPackageData });
    this.logSearch();
  };

  setPageMeta = packetsArr => {
    if (packetsArr.length) {
      const packetsString =
        packetsArr.length > 1 ? decodeURIComponent(packetsArr.join(' vs ')) : decodeURIComponent(packetsArr[0]);
      document.title = `${packetsString} | npm trends`;
      $('meta[name=description]').attr(
        'content',
        `Compare npm package download statistics over time: ${packetsString}`,
      );
    } else {
      document.title = 'npm trends: Compare NPM package downloads';
      document.description =
        'Which NPM package should you use? Compare NPM package download stats over time. Spot trends, pick the winner.';
    }
  };

  redirectToSearch = packetNamesArray => {
    const { history } = this.props;

    const packetsUrl = packetNamesArray.join('-vs-');
    const url = `/${packetsUrl}`;

    history.push(url);
  };

  updateFromSearch = query => {
    const { params, history } = this.props;

    let newParam;
    if (params.packets) {
      const packetsArray = params.packets.split('-vs-');
      if (packetsArray.indexOf(query) < 0) {
        packetsArray.push(query);
      }
      newParam = packetsArray.join('-vs-');
    } else {
      newParam = query;
    }
    const url = `/${newParam}`;

    history.push(url);
  };

  logSearch = () => {
    const { params } = this.props;

    const packetsArray = params.packets.split('-vs-');

    API.logSearch(packetsArray, 'package_added');
  };

  packetNames = () => {
    const {
      params: { packets },
    } = this.props;
    return packets ? packets.split('-vs-') : [];
  };

  render() {
    const { params } = this.props;
    const { packets } = this.state;

    return (
      <div className="container">
        <PackageComparisonHeading packetNames={this.packetNames()} packets={packets} />
        <SearchForm onSearch={this.updateFromSearch} />
        <PackageTags packets={packets} colors={this.colors()} />
        {packets.length > 0 && (
          <div id="coreArea">
            <TrendGraphBox packets={packets} colors={this.colors()} />
            <PackageStats packets={packets} />
          </div>
        )}
        <div className="suggestions--container">
          <RelatedSearches packetsArray={params.packets ? params.packets.split('-vs-') : []} />
          <PopularSearches />
        </div>
        <div id="extra_info">
          <p>
            If you find any bugs or have a feature request, please open an issue on{' '}
            <a target="_blank" rel="noopener noreferrer" href="http://github.com/johnmpotter/npm-trends">
              github
            </a>
            !
          </p>
          <p>
            The npm package download data comes from {"npm's "}
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/npm/download-counts">
              download counts
            </a>{' '}
            api and package details come from{' '}
            <a target="_blank" rel="noopener noreferrer" href="https://api-docs.npms.io/">
              npms.io
            </a>
            .
          </p>
        </div>
      </div>
    );
  }
}

PackageComparison.propTypes = propTypes;

export default PackageComparison;
