import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';

import { colors } from 'utils/colors';
import { packetNamesToParam } from 'utils/url';

import SearchForm from 'components/_search/SearchForm';
import PackageTags from 'components/_search/PackageTags';
import TrendGraphBox from 'components/_chart/TrendGraphBox';
import PackageStats from 'components/_statsTable/PackageStats';
import PopularSearches from 'components/_searchLists/PopularSearches';
import RelatedSearches from 'components/_searchLists/RelatedSearches';
import Readme from 'components/Readme';

import PackageComparisonHeading from './_components/PackageComparisonHeading';

const propTypes = {
  packets: PropTypes.arrayOf(PropTypes.object),
  packetNames: PropTypes.arrayOf(PropTypes.string),
};

const PackageComparison = ({ packets, packetNames = [] }) => {
  const { push } = useRouter();

  const updateFromSearch = (searchQuery) => {
    let newParam = packetNamesToParam(packetNames);

    if (packetNames.indexOf(searchQuery) < 0) {
      newParam = packetNamesToParam([...packetNames, searchQuery]);
    }

    push(`/${newParam}`);
  };

  return (
    <div className="container">
      <PackageComparisonHeading packetNames={packetNames} packets={packets} />
      <SearchForm onSearch={updateFromSearch} />
      <PackageTags packetNames={packetNames} packets={packets} colors={colors} />
      {packets.length > 0 && (
        <div>
          <TrendGraphBox packets={packets} colors={colors} />
          <PackageStats packets={packets} />
        </div>
      )}
      <div className="suggestions--container">
        <RelatedSearches packetsArray={packetNames} />
        <PopularSearches />
      </div>
      <Readme packets={packets} />
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
          api and package details come from {"npm's registry "}
          <a target="_blank" rel="noopener noreferrer" href="https://www.npmjs.com/">
            npmjs.com
          </a>
          .
        </p>
      </div>
    </div>
  );
};

PackageComparison.propTypes = propTypes;

export default PackageComparison;
