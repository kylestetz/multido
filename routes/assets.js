var _ = require('lodash');

var jsAssets = require('../config/jsAssets');

module.exports = {

  getAssets: function() {
    var assetList = [];
    assetList = assetList.concat( prefixAssets(jsAssets.vendorPrefix, jsAssets.vendor) );
    assetList = assetList.concat( prefixAssets(jsAssets.sitePrefix,   jsAssets.site)   );
    return assetList;
  }

};

function prefixAssets(prefix, assets) {
  return _.map(assets, function(asset) {
    return prefix + asset;
  });
}