// Dependancy: clusterfck [sic] library. Uses hierarchical clustering

function doClustering(t) {
  // The clustering
  var r0 = clusterfck.hcluster(t, function(t1,t2) {
      var c1 = dice(t1[0].toLowerCase().replace(/\s/gi, ''), t2[0].toLowerCase().replace(/\s/gi, ''));
      var c2 = dice(t1[1].toLowerCase().replace(/\s/gi, ''), t2[1].toLowerCase().replace(/\s/gi, ''));
      return 1.0 - ((c1 + c2) / 2.0);
  }, clusterfck.AVERAGE_LINKAGE, 0.90);
    
  // Collapse up the cluster tree into a single depth
  var r1 = [];
  for(var i = 0; i < r0.length; i++) {
    var traverseClusterTree = function(node) {
      var retval = [];
      if(node['size'] > 1) {
        retval = retval.concat(traverseClusterTree(node['left']), traverseClusterTree(node['right']));
      } else {
        retval.push(node['canonical']);
      }
      return retval;
    };
    r1.push(traverseClusterTree(r0[i]));
  }
  // Eliminate the redundant triplets
  var r = [];
  for(var i = 0; i < r1.length; i++) {
    var c = r1[i];
    r[i] = [];
    for(var j = 0; j < c.length; j++) {
      var subsume = false;
      var t1 = c[j];
      for(var k = j+1; k < c.length && !subsume; k++) {
        var t2 = c[k];
        var c1 = dice(t1[0].toLowerCase().replace(/\s/gi, ''), t2[0].toLowerCase().replace(/\s/gi, ''));
        var c2 = dice(t1[1].toLowerCase().replace(/\s/gi, ''), t2[1].toLowerCase().replace(/\s/gi, ''));
        var redundant = Math.min(1,(Math.max((c1,c2)/2)+Math.min(c1,c2)));
        if(redundant >= 0.5) {
          // Strong redundancy reading. Do we subsume j or k?
          if(t1[1].length <= t2[1].length) {
            subsume = true;
            break;
          }
        }
      }
      if(!subsume) r[i].push(c[j]);
    }
  }
  return r;
}

function dice(string1, string2) {
  var length1 = string1.length - 1;
  var length2 = string2.length - 1;
  if(length1 < 1 || length2 < 1) return 0;
  var intersection = 0;
  var bigrams2 = [];
  for(var i = 0; i < length2; i++) {
    bigrams2.push(string2.substr(i,2));
  }
  for(var i = 0; i < length1; i++) {
    var bigram1 = string1.substr(i,2);
    for(var j = 0; j < length2; j++) {
      if(bigram1 == bigrams2[j]) {
        intersection++;
        bigrams2[j] = null;
        break;
  }}}
  return (2.0 * intersection) / (length1 + length2);
}

