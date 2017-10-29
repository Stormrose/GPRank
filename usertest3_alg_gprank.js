//IDEA If the dregs are too large (>=5?) then use alt. methods on just the dregs: cluster, collab-filters

var gprankalg = (function () {
        "use strict";

        var da = {
            algname: 'GPRank',
            um: {},
            db: [],
            umneedclustering: true,
            hasdregs: -1
        };

        da.onDataSetChange = function () {
            da.um = {};
            da.umneedclustering = true;
            da.hasdregs = -1;
        };


        da.onDataSetDocChange = function (dbrawitem) {
            if (da.umneedclustering === true || da.um.length === 0) {
                da.db = doClustering(dbrawitem);
                da.umneedclustering = false;
            } else {
                da.db = da.doGroupingAndOrdering(dbrawitem);
            }
        };

        da.umRecord = function (hasmovedx) {
            var t = [];

            //IDEA rethink what we do with hasmovedx: perhaps it updates weights at a lesser amount? Or not at all?
            //if (hasmovedx) {
            if (true) {
                da.db.forEach(function (y, groupnum) {
                    y.forEach(function (z) {
                        t.push( [z[0], groupnum] );
                    });
                });

                t.forEach(function (aterm, aindex) {
                    t.forEach(function (bterm, bindex) {
                        var gprankentry;

                        // Skip if equal or aterm > bterm (alphabetical comparison)
                        if (aterm[0].toLowerCase() < bterm[0].toLowerCase()) {
                            gprankentry = da.umGet(aterm[0], bterm[0]);
                            if (gprankentry.confirmations < 1) {
                                gprankentry.confirmations = 1;
                                gprankentry.gprank = aindex < bindex ? 0.6667 : 0.3333;
                                gprankentry.group = aterm[1] === bterm[1] ? 0.6667 : 0.3333;
                            } else {
                                gprankentry.confirmations++;
                                if (aindex < bindex) {
                                    gprankentry.gprank += (1.0 - gprankentry.gprank) / 2;
                                } else {
                                    gprankentry.gprank /= 2.0;
                                }
                                if (aterm[1] === bterm[1]) {
                                    gprankentry.group += (1.0 - gprankentry.group) / 2;
                                } else {
                                    gprankentry.group /= 2;
                                }
                            }
                            da.umSet(aterm[0], bterm[0], gprankentry);
                        }
                    });
                });

                da.umneedclustering = false;
            }
        };

        da.doGroupingAndOrdering = function (t) {
            var t, insertmaxgroupa = -1, insertmaxgroupb = -1, insertmaxamount = 0.0, ig, igcount, g = [], dregs = [], d = [], safloor;

            // Copy t
            t.forEach (function (te) {
                d.push(te);
            });

            // Shuffle - this is to test that the alg works irrespective of incoming order
            d.sort (function (a, b) {
                return Math.random() < 0.5 ? -1 : 1;
            });

//TODO Simulated annealing to find best groups? (reduces jitter with GPRank) - place all groups in singleton groups. Anneal to combine.

/* MAKES NO DIFFERENCE TO ORDER FIRST BY CONFIRMATIONS ASCENDING
            // Order by confirmations ascending
            d.sort (function (a, b) {
                var ac = 0, bc = 0;

                ac = d.reduce (function (pv, cv) {
                    var r = pv, gprankentry;

                    gprankentry = da.umGet(a[0], cv[0]);
                    if (gprankentry.confirmations > 0) {
                        r += (gprankentry.confirmations / 2.0)
                    }

                    return r;
                }, 0.0);

                bc = d.reduce (function (pv, cv) {
                    var r = pv, gprankentry;

                    gprankentry = da.umGet(b[0], cv[0]);
                    if (gprankentry.confirmations > 0) {
                        r += gprankentry.confirmations;
                    }

                    return r;
                }, 0.0);

                return ac < bc ? -1 : 1;
            });*/

            // Group
            //   Create initial groups
            d.forEach (function (de, di) {
                if (da.umExists(de[0])) {
                    g.push([ de ]);
                } else {
                    dregs.push(de);
                }
            });

            //   Look for the best items to combine
            safloor = 1.0;
            while (safloor > 0.50) {
                insertmaxgroupa = -1;
                insertmaxgroupb = -1;
                insertmaxamount = 0.0;
                g.forEach (function (ge, gi) {
//                    if (ge.length === 1) {
                    if (ge.length > 0) {
                        g.forEach (function (he, hi) {
                            if (gi !== hi && he.length > 0) {
                                igcount = 0;
                                ig = he.reduce (function (pv, cv) {
                                    var r = pv, gprankentry;
                                    gprankentry = da.umGet(ge[0][0], cv[0]);
                                    if (gprankentry.group !== undefined) {
//                                        r += gprankentry.group;
//The valuing function goes in here (more confirmations means we expect more certainty)
                                        if (gprankentry.group > 0.5) {
                                            r += (0.5 + ((gprankentry.group - 0.5) / Math.min(gprankentry.confirmations, 7)));
                                        } else {
                                            r += gprankentry.group;
                                        }
                                        igcount++;
                                    }
                                    return r;
                                }, 0.0);
                                if ((igcount > 0 && ig / igcount > insertmaxamount) || (Math.abs((ig / igcount) - insertmaxamount) < 0.05 && g[gi].length < g[hi].length)) {
                                    insertmaxamount = ig / igcount;
                                    insertmaxgroupa = gi;
                                    insertmaxgroupb = hi;
                                }
                            }
                        });
                    }
                });
                if (insertmaxgroupa > -1 && insertmaxgroupb > -1 && insertmaxamount > 0.5) {
                    g[insertmaxgroupb].push(g[insertmaxgroupa].shift());
                }
                // Adjusted to always push downwards so the loop eventually exits
                safloor = Math.min(safloor - 0.005, insertmaxamount);
            }
//TODO Check that singletons shouldn`t go to the dreg pool (in UM, but no matches with this doc)

            // Close up zero member groups
            d = g;
            g = [];
            d.forEach (function (de) {
                if (de !== undefined && de.length > 0) {
                    g.push(de);
                }
            });
       

/*          // Group: le`old way
            d.forEach (function (de, di) {
                insertmaxgroup = -1;
                insertmaxamount = 0.0;
                g.forEach (function (ge, gi) {
                    igcount = 0;
                    ig = ge.reduce(function (pv, cv) {
                        var r = pv, gprankentry;
                        if (cv[0] !== de[0]) {
                            gprankentry = da.umGet(de[0], cv[0]);
                            if (gprankentry.group !== undefined) {
                                r += gprankentry.group;
                                igcount++;
                            }
                        }
                        return r;
                    }, 0.0);
                    if (igcount > 0 && ig / igcount > insertmaxamount) {
                        insertmaxamount = ig / igcount;
                        insertmaxgroup = gi;
                    }
                });
                if (insertmaxgroup > -1 && insertmaxamount > 0.6) {
                    g[insertmaxgroup].push(de);
                } else {
                    if (da.umExists(de[0])) {
                        g.push([ de ]);
                    } else {
                        dregs.push(de);
                    }
                }
            });
*/

            // Order groups (mean_of (mean_of gprankentry(a.members,b.members).gprank))
			// Chrome`s Array.sort() is not stable with 0 return values >.< sadface!
/*            d = array_bubble_sort(g, function (ga, gb) {
                var r = 0, gpranka = 0.0, gacount = 0, gprank = 0.5;

                gpranka = ga.reduce (function (apv, acv) {
                    var ra = apv, gprankb = 0.0, gbcount = 0;

                    gprankb = gb.reduce (function (bpv, bcv) {
                        var rb = bpv, gprankentry = da.umGet(acv[0], bcv[0]);

                        if (gprankentry.confirmations > 0) {
                            rb += gprankentry.gprank;
                            gbcount++;
                        }

                        return rb;
                    }, 0.0);
                    if (gbcount > 0) {
                        ra += (gprankb / gbcount);
                        gacount++;
                    }

                    return ra;
                }, 0.0);
                if (gacount > 0) {
                    gprank = gpranka / gacount;
                    if (gprank > 0.5) {
                        r = -1;
                    } else if (gprank < 0.5) {
                        r = 1;
                    } 
                }

                return r;
            });   */
            d = orderUsingMatrix(g, function (ga, gb) {
                var r = 0, gpranka = 0.0, gacount = 0, gprank = 0.5;

                gpranka = ga.reduce (function (apv, acv) {
                    var ra = apv, gprankb = 0.0, gbcount = 0;

                    gprankb = gb.reduce (function (bpv, bcv) {
                        var rb = bpv, gprankentry = da.umGet(acv[0], bcv[0]);

                        if (gprankentry.confirmations > 0) {
                            rb += gprankentry.gprank;
                            gbcount++;
                        }

                        return rb;
                    }, 0.0);
                    if (gbcount > 0) {
                        ra += (gprankb / gbcount);
                        gacount++;
                    }

                    return ra;
                }, 0.0);
                if (gacount > 0) {
                    gprank = gpranka / gacount;
                    if (gprank > 0.5) {
                        r = -1;
                    } else if (gprank < 0.5) {
                        r = 1;
                    } 
                }

                return r;
            }, function (g) {
				var r = undefined, t;

				if (g !== undefined) {
                    t = g.slice(0);
					t.sort(function (a,b) {
                        return a[0].toLowerCase() < b[0].toLowerCase() ? -1 : 1;
					});
					r = (t.map(function (i) {
						return i[0].toLowerCase();
					})).join('*').replace(/[aeiouy]|\s|\./g,'').substring(0,30);
				}

				return r;
			});
            g = d;

            // Order within groups
            d = [];
            g.forEach (function (ge, gi) {
/*                d[gi] = array_bubble_sort(ge, function (a, b) {
                    var r = 0, gprank = da.umGet(a[0],b[0]).gprank;

                    if (gprank > 0) {
                        if (gprank > 0.5) {
                            r = -1;
                        } else if (gprank < 0.5) {
                            r = 1;
                        }
                    }

                    return r;
                });   */
                d[gi] = orderUsingMatrix(ge, function (a, b) {
                    var r = 0, gprank = da.umGet(a[0],b[0]).gprank;

                    if (gprank > 0) {
                        if (gprank > 0.5) {
                            r = -1;
                        } else if (gprank < 0.5) {
                            r = 1;
                        }
                    }

                    return r;
                }, function (e) {
					return e !== undefined ? e[0].toLowerCase() : undefined;
				});
            });
            g = d;

            if (dregs.length > 0) {
                dregs.sort(function (a, b) {
                    return a[0].toLowerCase() < b[0].toLowerCase() ? -1 : 1;
                });
                g.push(dregs);
                da.hasdregs = g.length - 1;
            } else {
                da.hasdregs = -1;
            }
            return g;
        };

        da.umSet = function (a, b, gprankentry) {
            var t, r;

            a = a.toLowerCase();
            b = b.toLowerCase();

            // Copy the gprankentry
            r = {
                gprank: gprankentry.gprank,
                group: gprankentry.group,
                confirmations: gprankentry.confirmations,
            };

            // Alphabeticise
            if (a === b) {
                // a and b cannot be the same rule
                return { gprank: undefined, group: 1.0, confirmations: -1 };
            } else if (a > b) {
                t = a;
                a = b;
                b = t;
                // Predicate reversal rule
                r.gprank = 1.0 - r.gprank;
            }
            if (da.um[a] === undefined) {
                da.um[a] = { };
            }
            da.um[a][b] = r;

            return gprankentry;
        };

        da.umGet = function (a, b) {
            var t = undefined,
                r = { gprank: undefined, group: undefined, confirmations: 0 };

            // Alphabeticise
            a = a.toLowerCase();
            b = b.toLowerCase();
            if (a === b) {
                // a and b cannot be the same rule
                return { gprank: undefined, group: 1.0, confirmations: -1 };
            } else if (a > b) {
                t = a;
                a = b;
                b = t;
            }
            if (da.um[a] !== undefined && da.um[a][b] !== undefined) {
                //r = da.um[a][b];
                r.gprank = da.um[a][b].gprank;
                r.group = da.um[a][b].group;
                r.confirmations = da.um[a][b].confirmations;
                if (t !== undefined) {
                    // Predicate reversal rule (group and confirmation remain the same
                    r.gprank = 1.0 - r.gprank; 
                }
            }

            return r;
        };

        da.umExists = function (a) {
            var r = false, t = a.toLowerCase();

            if (da.um[t] !== undefined) {
                r = true;
            } else {
                for (var k in da.um) {
                    if (da.um[k][t] !== undefined) {
                        r = true;
                        break;
                    }
                }
            }

            return r;
        };

        //Return the module
        return da;
    }());

